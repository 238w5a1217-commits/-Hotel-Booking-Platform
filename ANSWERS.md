# ANSWERS.md — Ajintara Platform Owner Technical Assessment

## Part C — Written Questions

---

### 1. Production Incident: Overbooked Hotel on 31 Dec
> **Scenario:** A hotel partner calls and says, *"Your site showed my hotel as available for 31 Dec, but I had no rooms left. Two guests showed up with bookings."*
> **Question:** Step by step, how would you find the cause, fix the data, and stop it from happening again?

#### Step 1: Immediate Triage & Customer Remediation (0–30 min)
1. **Prioritize the displaced guests:** Have the customer support team immediately arrange alternate rooms in a nearby partner hotel of equal or higher tier at Ajintara's expense, or issue a full refund plus compensatory credits and arrange transport.
2. **Prevent immediate bleeding:** Temporarily set the property's availability for 31 Dec to 0 in `inventories` so no third guest can book while investigating.

#### Step 2: Root-Cause Investigation via Logs & Audit Trail
1. **Trace the Bookings:** Fetch both booking IDs created for 31 Dec. Check their `createdAt` timestamps, transaction IDs, and whether they were created concurrently (e.g., within milliseconds of each other).
2. **Inspect Database Locks / Transactions:** Check MongoDB query logs or APM traces (Datadog/New Relic) for whether read-modify-write race conditions occurred without session transactions, or if an inventory counter decrement missed an atomic check (`$inc` without `$gte` validation).
3. **Verify Partner Overrides:** Check whether the partner updated their date-specific inventory (`Inventory.availableRooms`) or if an external supplier sync overwrote room counts without taking existing bookings into account.
4. **Inspect Payment Webhooks / Duplicates:** Verify whether a duplicate webhook or retry confirmed two pending hold bookings for the same room instance.

#### Step 3: Fix Data & Correct State
1. Adjust the `Inventory` and `Booking` records for that hotel for 31 Dec so confirmed room counts accurately reflect physical capacity.
2. Mark the resolved guest's booking as re-accommodated / cancelled-with-refund in the database with an audit reason.

#### Step 4: Long-Term Prevention
1. **Enforce Atomic Reservation Transactions:** Ensure all booking reservations execute inside a MongoDB multi-document ACID transaction with `readConcern: 'majority'` and `writeConcern: 'majority'`, checking `(availableRooms - bookedRooms) >= requestedQuantity` inside the transaction.
2. **Optimistic Locking / Conditional Updates:** Use version keys (`__v` or atomic `$inc: { booked: +quantity }` with query `{ booked: { $lte: total - quantity } }`).
3. **Idempotency Keys:** Enforce idempotency keys on payment confirmation and checkout APIs to prevent duplicate confirmations from retried webhook requests.
4. **Partner Channel Manager Sync:** Provide webhook / push notifications to partner PMS whenever an inventory change occurs.

---

### 2. Slow Search: 20,000 Properties in Goa taking 6s
> **Scenario:** Search for "Goa" now takes 6 seconds because there are 20,000 properties.
> **Question:** How would you find out why, and what would you change? Mention indexes, queries, caching, or anything else you would use.

#### Diagnosis (Find out why)
1. **Run MongoDB `.explain("executionStats")`:** Inspect the query execution plan for the search pipeline. Look for `COLLSCAN` (full collection scan), high `docsExamined` vs `nReturned`, or memory-heavy in-memory sorting (`SORT` without index).
2. **Identify N+1 Queries:** Check if the backend is fetching 20,000 properties, and then making 20,000 separate DB calls to look up room types and inventory per property in a loop.
3. **APM & Query Profiling:** Check MongoDB slow query logs (`profile: 1`, queries > 100ms) and network serialization time.

#### What to Change

1. **Compound Indexes:**
   ```javascript
   // Properties collection
   db.properties.createIndex({ city: 1, status: 1 });
   // RoomTypes collection
   db.roomtypes.createIndex({ property: 1, isActive: 1, maxGuests: 1, basePrice: 1 });
   // Inventory collection
   db.inventories.createIndex({ roomType: 1, date: 1, availableRooms: 1, price: 1 });
   // Bookings collection
   db.bookings.createIndex({ roomType: 1, nights: 1, status: 1 });
   ```
2. **Server-Side Pagination & Aggregation Pipeline:**
   - Never load 20,000 hotels into memory.
   - Use a single indexed MongoDB aggregation `$facet` pipeline that filters by city, joins available rooms, calculates the minimum date price, and `$limit` / `$skip` at the DB level, returning only 10–20 documents to Node.js.
3. **Precomputed / Denormalized Min-Price Cache:**
   - Store a `startingPrice` or denormalized summary on the property document, updated via worker queues when inventory/pricing changes.
4. **Redis Caching:**
   - Cache popular city searches with short TTL (e.g. 60–120 seconds): `cache:search:goa:2026-12-24:2026-12-26:2guests`.
   - Invalidate or let expire gracefully.
5. **Full-Text / Search Engine Offload:**
   - At 20k+ properties, transition search to Elasticsearch / MongoDB Atlas Search with autocomplete, geo-distance ranking, and faceting in sub-50ms.

---

### 3. Payment Mismatch: Money Taken, Booking Shows `Pending`
> **Scenario:** A guest's money was taken, but their booking shows `pending`.
> **Question:** What could cause this, and how should the system recover automatically? Mention webhooks.

#### Causes
1. **Browser Dropped / Closed Before Redirect:** The guest completed payment on Razorpay/Stripe, but closed the tab, had a network disconnect, or the frontend crashed before calling the `/verify` API.
2. **Missed or Delayed Webhook:** The payment gateway sent a webhook event (`payment.captured` / `charge.successful`), but our server timed out, was restarting, or returned a 5xx error.
3. **Webhook Signature Verification Failure:** Misconfigured webhook secret in production causing incoming valid webhooks to be rejected with 400.
4. **Concurrency Race Condition:** Webhook arrived while the database connection pool was saturated, leaving the booking stuck in `pending`.

#### Automatic Recovery Architecture
1. **Idempotent Webhook Handler:**
   - Implement an explicit webhook listener `/api/v1/payments/webhook` listening for `payment.captured` / `order.paid`.
   - Verify signatures using gateway HMAC.
   - Look up the booking by `razorpayOrderId` / `bookingId`.
   - Inside an atomic transaction: update payment status to `completed`, booking status to `confirmed`, clear `holdExpiresAt`, and send email confirmation. If already confirmed, safely return 200 OK.
2. **Automated Reconciliation Cron Job (Polling Fallback):**
   - Run a reconciliation worker every 2–5 minutes that finds bookings in `pending` state where `createdAt < now - 5 minutes` and `holdExpiresAt > now - 15 minutes`.
   - Query the payment gateway API (`GET /orders/{order_id}/payments`):
     - **If payment status == captured:** Automatically confirm the booking and dispatch confirmation notifications.
     - **If payment status == failed:** Mark booking as `cancelled` and release holds.
     - **If hold expired and payment was captured after expiry:** Automatically trigger an automated gateway refund (`POST /payments/{id}/refund`) with audit reason `payment_captured_after_hold_expiry`, notifying the guest via SMS/email.

---

### 4. Supplier Down: External Supplier API Timing Out for 20 Minutes During Peak Hours
> **Scenario:** An external supplier's API has been timing out for 20 minutes during peak hours.
> **Question:** What should the platform do for guests, and what should it do for the team?

#### For Guests:
1. **Circuit Breaker Pattern:**
   - Trip an automated circuit breaker (e.g., using Opossum or Redis sliding window) when timeouts exceed 50% over a 1-minute window.
   - Immediately stop sending outgoing HTTP requests to the broken supplier.
2. **Graceful Degradation (Zero Search Crashes):**
   - Search results must continue serving Ajintara's own direct contract inventory immediately (sub-second response instead of waiting 20s for supplier timeout).
   - Show a subtle non-blocking UI banner: *"Showing Ajintara direct properties. Some partner partner hotels are temporarily unavailable."*
3. **Cached Inventory Fallback (Read-Only):**
   - If cache exists, show supplier hotels marked with *"Subject to availability verification"*, but verify availability before checkout.
4. **Fail-Fast on Booking:**
   - If a guest attempts to book an external supplier room that cannot be confirmed, fail cleanly with a helpful message: *"This partner hotel is temporarily unavailable for instant booking. Please choose one of our verified direct hotels or try again shortly."*

#### For the Team:
1. **Automated PagerDuty / Opsgenie Alerting:** Trigger high-priority alert (`P1/P2: External Supplier XYZ failure rate > 80% for 10m`).
2. **Health Dashboard & Telemetry:** Check gateway latency graphs, HTTP 504 gateway timeout counts, and supplier status endpoints.
3. **Escalate to Supplier Operations:** Contact supplier technical account manager with error logs, sample request IDs, and timestamps.
4. **Temporary Toggle in Admin Backoffice:** Provide a 1-click feature flag in the Admin Panel to disable the supplier without deploying code.

---

### 5. Deploying Safely: Booking/Pricing Logic Changes Without Breaking Live Bookings
> **Scenario:** How would you release a change to the booking or pricing logic without breaking live bookings?
> **Question:** Cover testing, rollback, and data migration.

#### 1. Testing & Verification
- **Automated Regression Suite:** Run unit and integration tests verifying all edge cases: GST slabs (≤7500 @ 5%, >7500 @ 18%), per-night variations, multi-room quantities, and cancellation refund percentages.
- **Shadow Traffic / Replay Testing:** Replay previous week's anonymized booking requests against the new pricing service in staging and compare outputs to ensure zero unexpected price deviations.
- **Contract Tests:** Ensure API schemas (`/search`, `/breakdown`, `/bookings`) remain backward compatible with existing frontend clients and mobile apps.

#### 2. Safe Zero-Downtime Deployment
- **Blue/Green or Rolling Deployment with Health Checks:** Deploy new pods/instances gradually behind the load balancer.
- **Feature Flags:** Wrap new pricing algorithms in a dynamic feature flag (e.g. LaunchDarkly / Unleash). Roll out to 5% → 25% → 100% of traffic, monitoring error rates.
- **Immutable Snapshots on Checkout:** The booking breakdown (`priceBreakdown`, `subtotal`, `totalGST`, `grandTotal`) is snapshotted into the booking document when the quote is created. Even if pricing logic changes mid-flight, an active booking preserves the locked quoted price.

#### 3. Data Migration
- **Expand/Contract (Parallel Run) Pattern:**
  - *Expand:* If changing schema fields, add new fields without removing old ones. The code writes to both and reads from old with fallback.
  - *Migrate:* Run background idempotent migration scripts in batches during low-traffic hours.
  - *Contract:* Point readers to new fields, deprecate and safely remove legacy fields after full validation.
- **Live Booking Protection:** Existing `pending` and `confirmed` bookings are never modified in-place by pricing changes.

#### 4. Rollback Strategy
- **Automated Canary Rollback:** Automatically abort deployment and roll back to previous stable container image if HTTP 5xx responses spike above 0.5% or booking conversion drops abruptly.
- **Backward-Compatible Schema:** Migrations are always additive and non-destructive so code can rollback instantly without database restores.

---

### 6. Trade-offs & Next 2 Weeks Plan
> **Scenario:** What did you leave out or simplify in this project, and what would you do next with 2 more weeks?

#### What was simplified or left out in this submission:
1. **Mock Payment Integration:** Used a simulated payment flow with full backend verification and hold expiration, rather than full live production Razorpay banking credentials (test mode demo configured).
2. **Distributed Locks (Redis / Redlock):** Relied on MongoDB ACID session transactions for concurrency and double-booking prevention. For very high-throughput distributed scale across multiple clusters, Redis distributed locks (`Redlock`) provide higher throughput.
3. **Advanced Channel Manager Integration:** Hourly stays and external supplier models were architected cleanly, but external PMS sync protocols (OTA XML/JSON feeds) were omitted.
4. **WebSocket Real-Time Updates:** Room availability updates on the frontend use React Query polling rather than WebSockets/SSE server pushes.

#### What I would build with 2 more weeks:
1. **Week 1 — High-Throughput & Real-Time Platform:**
   - **Redis Caching & Distributed Locks:** Implement Redis caching for search queries and distributed locking on room allocation to handle 10,000+ RPS.
   - **Real-Time Inventory Stream (WebSockets):** Push live inventory counts to users on the hotel page so they see *"Only 1 room left!"* in real-time as other users hold rooms.
   - **Production Razorpay & Cashfree Webhook Suite:** Full integration with live webhook verification and automatic refund APIs.
2. **Week 2 — Platform Owner Superpowers:**
   - **Dynamic Pricing Engine:** Machine-learning or rule-based surge pricing based on occupancy thresholds and seasonal Indian holidays (Diwali, New Year, Long Weekends).
   - **Multi-Vendor Channel Manager Integration:** 2-way sync with OTA channel managers (RateGain, STAAH) to ingest hotel inventory directly.
   - **Audit Trail & Observability Dashboard:** OpenTelemetry tracing, Prometheus/Grafana dashboards, and comprehensive audit log UI for admin backoffice.

