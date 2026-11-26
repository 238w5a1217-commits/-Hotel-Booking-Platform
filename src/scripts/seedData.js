const User       = require('../features/auth/user.model');
const Property   = require('../features/properties/property.model');
const RoomType   = require('../features/rooms/room.model');
const Inventory  = require('../features/inventory/inventory.model');
const Booking    = require('../features/bookings/booking.model');

const propData = [
  // --- HYDERABAD ---
  {
    name: 'Hyderabad Pearl Hotel',
    city: 'hyderabad',
    address: 'Road No. 1, Banjara Hills, Hyderabad 500034',
    description: 'Upscale 5-star hotel in Banjara Hills with rooftop infinity pool, fine dining, and full-service spa.',
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Valet Parking'],
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    ],
    starRating: 5,
    rooms: [
      { name: 'Deluxe Pearl Room', basePrice: 7800, totalRooms: 8, maxGuests: 2 },
      { name: 'Executive Banjara Suite', basePrice: 12500, totalRooms: 5, maxGuests: 3 },
      { name: 'Royal Nizam Presidential Suite', basePrice: 22000, totalRooms: 2, maxGuests: 4 },
    ],
  },
  {
    name: 'HITEC City Business Suites',
    city: 'hyderabad',
    address: 'Madhapur Cyber Towers, Hyderabad 500081',
    description: 'Contemporary tech-focused hotel next to Cyber Towers with ergonomic workstations and express breakfast.',
    amenities: ['WiFi', 'Gym', 'Restaurant', 'Co-working', 'Airport Shuttle'],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
    ],
    starRating: 4,
    rooms: [
      { name: 'Business Studio', basePrice: 4800, totalRooms: 10, maxGuests: 2 },
      { name: 'Cyber Executive Club', basePrice: 6900, totalRooms: 6, maxGuests: 3 },
      { name: 'Tech Premier Suite', basePrice: 9500, totalRooms: 3, maxGuests: 3 },
    ],
  },
  {
    name: 'Golconda Heritage Resort',
    city: 'hyderabad',
    address: 'Gandipet Lake Road, Hyderabad 500075',
    description: 'Tranquil lakeside resort spread over 12 acres of lush manicured greenery and historic Nizam architecture.',
    amenities: ['WiFi', 'Pool', 'Spa', 'Garden', 'Restaurant', 'Bar'],
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    ],
    starRating: 5,
    rooms: [
      { name: 'Heritage Garden Villa', basePrice: 9200, totalRooms: 6, maxGuests: 2 },
      { name: 'Lakeside Luxury Cottage', basePrice: 14800, totalRooms: 4, maxGuests: 3 },
      { name: 'Presidential Lake Suite', basePrice: 26000, totalRooms: 2, maxGuests: 4 },
    ],
  },
  {
    name: 'Gachibowli Express Inn',
    city: 'hyderabad',
    address: 'Financial District, Gachibowli, Hyderabad 500032',
    description: 'Smart budget-friendly hotel for business travelers with fast check-in and 24/7 cafe.',
    amenities: ['WiFi', 'AC', 'TV', 'Breakfast'],
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
    ],
    starRating: 3,
    rooms: [
      { name: 'Standard Comfort', basePrice: 1850, totalRooms: 12, maxGuests: 2 },
      { name: 'Executive Double', basePrice: 2450, totalRooms: 8, maxGuests: 2 },
    ],
  },

  // --- BANGALORE ---
  {
    name: 'Bangalore Tech Stay',
    city: 'bangalore',
    address: '100 Feet Road, Koramangala, Bangalore 560034',
    description: 'Modern smart hotel in Bangalore IT corridor with high-speed fiber and rooftop craft brewery.',
    amenities: ['WiFi', 'Gym', 'Restaurant', 'Co-working', 'Bar'],
    images: [
      'https://images.unsplash.com/photo-1543968996-ee822b8176ba?w=1200&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
    ],
    starRating: 4,
    rooms: [
      { name: 'Techie Solo / Double', basePrice: 3800, totalRooms: 10, maxGuests: 2 },
      { name: 'Smart Club Room', basePrice: 5200, totalRooms: 6, maxGuests: 3 },
    ],
  },
  {
    name: 'Whitefield Silicon Suites',
    city: 'bangalore',
    address: 'ITPL Main Road, Whitefield, Bangalore 560066',
    description: 'Premium serviced suites tailored for tech professionals and long-stay business executives.',
    amenities: ['WiFi', 'Pool', 'Kitchenette', 'Gym', 'Meeting Rooms'],
    images: [
      'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=1200&q=80',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80',
    ],
    starRating: 4,
    rooms: [
      { name: 'Studio Suite', basePrice: 4600, totalRooms: 8, maxGuests: 2 },
      { name: '1-BHK Executive Suite', basePrice: 6500, totalRooms: 5, maxGuests: 3 },
    ],
  },
  {
    name: 'Indiranagar Urban Loft',
    city: 'bangalore',
    address: '12th Main, Indiranagar, Bangalore 560038',
    description: 'Boutique design hotel nestled in Indiranagar near famous cafes and fashion boutiques.',
    amenities: ['WiFi', 'Cafe', 'AC', 'Room Service'],
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&q=80',
      'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80',
    ],
    starRating: 3,
    rooms: [
      { name: 'Urban Queen Room', basePrice: 3200, totalRooms: 9, maxGuests: 2 },
      { name: 'Loft Terrace Suite', basePrice: 4800, totalRooms: 4, maxGuests: 2 },
    ],
  },
  {
    name: 'The Palace Road Luxury Hotel',
    city: 'bangalore',
    address: 'Palace Road, High Grounds, Bangalore 560001',
    description: 'Grand 5-star heritage luxury hotel surrounded by lush gardens near Bangalore Golf Club.',
    amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Valet Parking'],
    images: [
      'https://images.unsplash.com/photo-1549294413-26f195200c16?w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
    ],
    starRating: 5,
    rooms: [
      { name: 'Heritage Royal Deluxe', basePrice: 11500, totalRooms: 6, maxGuests: 2 },
      { name: 'Governor Suite', basePrice: 19000, totalRooms: 3, maxGuests: 3 },
      { name: 'Imperial Presidential Villa', basePrice: 32000, totalRooms: 2, maxGuests: 4 },
    ],
  },

  // --- MUMBAI ---
  {
    name: 'The Grand Mumbai',
    city: 'mumbai',
    address: 'Marine Drive, Nariman Point, Mumbai 400021',
    description: 'Luxury 5-star hotel in south Mumbai overlooking the Arabian Sea and Marine Drive promenade.',
    amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Sea View'],
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
    ],
    starRating: 5,
    rooms: [
      { name: 'Marine View Premier', basePrice: 13500, totalRooms: 6, maxGuests: 2 },
      { name: 'Arabian Sea Club Room', basePrice: 18000, totalRooms: 4, maxGuests: 3 },
      { name: 'Grand Presidential Suite', basePrice: 38000, totalRooms: 2, maxGuests: 4 },
    ],
  },
  {
    name: 'Mumbai Express Inn',
    city: 'mumbai',
    address: 'Sahar Airport Road, Andheri East, Mumbai 400059',
    description: 'Convenient transit hotel near Mumbai International Airport with 24/7 dining and soundproof rooms.',
    amenities: ['WiFi', 'AC', 'TV', 'Airport Shuttle'],
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
    ],
    starRating: 3,
    rooms: [
      { name: 'Transit Saver Single', basePrice: 2200, totalRooms: 12, maxGuests: 1 },
      { name: 'Deluxe Airport Double', basePrice: 3100, totalRooms: 10, maxGuests: 2 },
    ],
  },
  {
    name: 'Juhu Beachfront Haven',
    city: 'mumbai',
    address: 'Juhu Tara Road, Juhu Beach, Mumbai 400049',
    description: 'Relaxing coastal stay directly overlooking Juhu Beach with sunset sea-facing balconies.',
    amenities: ['WiFi', 'Beach Access', 'Pool', 'Restaurant', 'Bar'],
    images: [
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80',
    ],
    starRating: 4,
    rooms: [
      { name: 'Coastal Deluxe', basePrice: 6400, totalRooms: 8, maxGuests: 2 },
      { name: 'Beach Balcony Room', basePrice: 8900, totalRooms: 5, maxGuests: 3 },
      { name: 'Ocean Sunset Suite', basePrice: 13500, totalRooms: 3, maxGuests: 3 },
    ],
  },
  {
    name: 'Bandra Bandstand Boutique',
    city: 'mumbai',
    address: 'BJ Road, Bandra West, Mumbai 400050',
    description: 'Chic sea-facing boutique hotel located steps away from Bandstand promenade and cafes.',
    amenities: ['WiFi', 'AC', 'Sea View', 'Restaurant'],
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&q=80',
    ],
    starRating: 4,
    rooms: [
      { name: 'Boutique Queen Studio', basePrice: 5600, totalRooms: 6, maxGuests: 2 },
      { name: 'Sea Breeze Corner Suite', basePrice: 7800, totalRooms: 4, maxGuests: 2 },
    ],
  },

  // --- DELHI ---
  {
    name: 'Delhi Heritage Palace',
    city: 'delhi',
    address: 'Barakhamba Road, Connaught Place, New Delhi 110001',
    description: 'Colonial heritage hotel near Connaught Place with grand courtyards and classical Indian architecture.',
    amenities: ['WiFi', 'Restaurant', 'Business Lounge', 'Spa'],
    images: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
    ],
    starRating: 4,
    rooms: [
      { name: 'Colonial Deluxe Room', basePrice: 6200, totalRooms: 9, maxGuests: 2 },
      { name: 'Viceroy Heritage Suite', basePrice: 10500, totalRooms: 4, maxGuests: 3 },
    ],
  },
  {
    name: 'Delhi City Center Stay',
    city: 'delhi',
    address: 'Arya Samaj Road, Karol Bagh, New Delhi 110005',
    description: 'Value-for-money hotel in central Delhi with easy metro connectivity and shopping access.',
    amenities: ['WiFi', 'AC', 'Breakfast', 'Room Service'],
    images: [
      'https://images.unsplash.com/photo-1529290130-4ca3753253ae?w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
    ],
    starRating: 2,
    rooms: [
      { name: 'Standard Non-AC Room', basePrice: 1450, totalRooms: 10, maxGuests: 2 },
      { name: 'Deluxe AC Room', basePrice: 1950, totalRooms: 8, maxGuests: 2 },
    ],
  },
  {
    name: 'Aerocity International Suites',
    city: 'delhi',
    address: 'Hospitality District, Aerocity, New Delhi 110037',
    description: 'Premium modern luxury hotel in Delhi Aerocity, 5 minutes from IGI Terminal 3.',
    amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Airport Shuttle', 'Bar'],
    images: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    ],
    starRating: 5,
    rooms: [
      { name: 'Premier Runway View', basePrice: 9800, totalRooms: 7, maxGuests: 2 },
      { name: 'Diplomatic Luxury Suite', basePrice: 16500, totalRooms: 4, maxGuests: 3 },
    ],
  },
  {
    name: 'South Extension Boutique Hotel',
    city: 'delhi',
    address: 'Ring Road, South Extension Part 2, New Delhi 110049',
    description: 'Stylish urban hotel in South Delhi with modern interiors and rooftop multi-cuisine restaurant.',
    amenities: ['WiFi', 'AC', 'Restaurant', 'Gym'],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80',
    ],
    starRating: 3,
    rooms: [
      { name: 'Modern Superior Room', basePrice: 3100, totalRooms: 8, maxGuests: 2 },
      { name: 'Rooftop Terrace Room', basePrice: 4400, totalRooms: 5, maxGuests: 2 },
    ],
  },

  // --- GOA ---
  {
    name: 'Goa Beach Resort',
    city: 'goa',
    address: 'Calangute Beach Road, Goa 403516',
    description: 'Charming beachfront resort in North Goa with direct sea access, private sundeck, and beach shack.',
    amenities: ['WiFi', 'Beach Access', 'Pool', 'Bar', 'Restaurant'],
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    ],
    starRating: 4,
    rooms: [
      { name: 'Deluxe Beach Cottage', basePrice: 5500, totalRooms: 8, maxGuests: 2 },
      { name: 'Sea-Facing Chalet', basePrice: 8200, totalRooms: 5, maxGuests: 3 },
    ],
  },
  {
    name: 'Goa Boutique Villas',
    city: 'goa',
    address: 'De Mello Vaddo, Anjuna Beach, Goa 403509',
    description: 'Private luxury villas with personal plunge pools and tropical coconut grove gardens.',
    amenities: ['WiFi', 'Private Pool', 'Kitchen', 'Garden', 'Barbecue'],
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    ],
    starRating: 5,
    rooms: [
      { name: '1-Bedroom Private Pool Villa', basePrice: 14500, totalRooms: 4, maxGuests: 2 },
      { name: '2-Bedroom Heritage Estate', basePrice: 24000, totalRooms: 2, maxGuests: 4 },
    ],
  },
  {
    name: 'Candolim Sunset Cove',
    city: 'goa',
    address: 'Fort Aguada Road, Candolim, Goa 403515',
    description: 'Serene getaway in peaceful Candolim with open-air dining and outdoor cocktail lounge.',
    amenities: ['WiFi', 'Pool', 'Restaurant', 'Bar', 'Spa'],
    images: [
      'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    ],
    starRating: 4,
    rooms: [
      { name: 'Garden View Deluxe', basePrice: 4600, totalRooms: 8, maxGuests: 2 },
      { name: 'Pool Access Cabana', basePrice: 7100, totalRooms: 4, maxGuests: 3 },
    ],
  },
  {
    name: 'Panjim Latin Quarter Inn',
    city: 'goa',
    address: 'Fontainhas, Panaji, Goa 403001',
    description: 'Heritage Portuguese villa in historic Fontainhas with hand-painted azulejo tiles.',
    amenities: ['WiFi', 'AC', 'Breakfast', 'Cafe'],
    images: [
      'https://images.unsplash.com/photo-1519643381401-22c77e60520e?w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
    ],
    starRating: 3,
    rooms: [
      { name: 'Heritage Classic Room', basePrice: 2600, totalRooms: 7, maxGuests: 2 },
      { name: 'Portuguese Balcony Suite', basePrice: 3900, totalRooms: 3, maxGuests: 2 },
    ],
  },

  // --- JAIPUR ---
  {
    name: 'Jaipur Royal Haveli',
    city: 'jaipur',
    address: 'City Palace Road, Pink City, Jaipur 302001',
    description: 'Authentic Rajasthani royal haveli stay featuring traditional jharokhas and folk music evenings.',
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Cultural Shows'],
    images: [
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    ],
    starRating: 5,
    rooms: [
      { name: 'Royal Haveli Chamber', basePrice: 8900, totalRooms: 6, maxGuests: 2 },
      { name: 'Maharaja Palace Suite', basePrice: 17500, totalRooms: 3, maxGuests: 3 },
    ],
  },
  {
    name: 'Amber Fort View Palace',
    city: 'jaipur',
    address: 'Amer Road, Jaipur 302028',
    description: 'Breathtaking palace hotel overlooking the historic Amber Fort hills and Maota lake.',
    amenities: ['WiFi', 'Pool', 'Restaurant', 'Garden', 'Spa'],
    images: [
      'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    ],
    starRating: 4,
    rooms: [
      { name: 'Fort View Deluxe', basePrice: 5400, totalRooms: 8, maxGuests: 2 },
      { name: 'Rajputana Terrace Suite', basePrice: 8600, totalRooms: 4, maxGuests: 3 },
    ],
  },
  {
    name: 'Pink City Heritage Inn',
    city: 'jaipur',
    address: 'MI Road, Jaipur 302001',
    description: 'Charming traditional hotel near famous bazaars and handicraft markets of Jaipur.',
    amenities: ['WiFi', 'AC', 'Breakfast', 'Restaurant'],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
    ],
    starRating: 3,
    rooms: [
      { name: 'Heritage Standard', basePrice: 2100, totalRooms: 10, maxGuests: 2 },
      { name: 'Deluxe Rajasthani Room', basePrice: 2900, totalRooms: 6, maxGuests: 2 },
    ],
  },

  // --- CHENNAI ---
  {
    name: 'Chennai Bay View',
    city: 'chennai',
    address: 'Marina Beach Road, Santhome, Chennai 600004',
    description: 'Coastal hotel facing the Bay of Bengal with fresh sea breeze and coastal seafood restaurant.',
    amenities: ['WiFi', 'Sea View', 'Restaurant', 'Gym'],
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    ],
    starRating: 4,
    rooms: [
      { name: 'Coastal Deluxe', basePrice: 4500, totalRooms: 8, maxGuests: 2 },
      { name: 'Marina Sea View Premier', basePrice: 6800, totalRooms: 5, maxGuests: 3 },
    ],
  },
  {
    name: 'OMR IT Corridor Hotel',
    city: 'chennai',
    address: 'Old Mahabalipuram Road, Sholinganallur, Chennai 600119',
    description: 'Contemporary tech corridor hotel with fast check-in and modern business workstations.',
    amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Meeting Rooms'],
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
    ],
    starRating: 3,
    rooms: [
      { name: 'Tech Saver Single', basePrice: 2800, totalRooms: 10, maxGuests: 2 },
      { name: 'Executive Workspace Room', basePrice: 3900, totalRooms: 6, maxGuests: 2 },
    ],
  },
  {
    name: 'Adyar Greens Grand',
    city: 'chennai',
    address: 'Sardar Patel Road, Adyar, Chennai 600020',
    description: 'Peaceful luxury hotel surrounded by the Adyar river eco-park with authentic South Indian cuisine.',
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Valet Parking'],
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
    ],
    starRating: 5,
    rooms: [
      { name: 'Garden Pavilion Deluxe', basePrice: 8400, totalRooms: 7, maxGuests: 2 },
      { name: 'Eco Riverview Suite', basePrice: 13800, totalRooms: 4, maxGuests: 3 },
      { name: 'Presidential Green Villa', basePrice: 25000, totalRooms: 2, maxGuests: 4 },
    ],
  },
];

const seedDatabase = async (force = false) => {
  const existingCount = await Property.countDocuments({ status: 'approved' });
  if (!force && existingCount >= 20) {
    return { skipped: true, propertiesCount: existingCount };
  }

  // Clear existing if force or empty
  if (force) {
    await Promise.all([
      User.deleteMany(),
      Property.deleteMany(),
      RoomType.deleteMany(),
      Inventory.deleteMany(),
      Booking.deleteMany(),
    ]);
  }

  // Ensure role accounts exist
  let partner = await User.findOne({ email: 'partner@ajintara.com' });
  if (!partner) {
    partner = await User.create({ name: 'Hotel Partner', email: 'partner@ajintara.com', password: 'Partner@123', role: 'partner' });
  }
  let admin = await User.findOne({ email: 'admin@ajintara.com' });
  if (!admin) {
    admin = await User.create({ name: 'Admin User', email: 'admin@ajintara.com', password: 'Admin@123', role: 'admin' });
  }
  let guest = await User.findOne({ email: 'guest@ajintara.com' });
  if (!guest) {
    guest = await User.create({ name: 'Guest User', email: 'guest@ajintara.com', password: 'Guest@123', role: 'guest' });
  }

  // Insert properties
  const createdProperties = [];
  const allRooms = [];

  for (const item of propData) {
    const { rooms, ...propInfo } = item;
    let prop = await Property.findOne({ name: propInfo.name });
    if (!prop) {
      prop = await Property.create({
        ...propInfo,
        partner: partner._id,
        status: 'approved',
      });
    }
    createdProperties.push(prop);

    const roomDefs = rooms || [
      { name: 'Standard Room', basePrice: 3500, totalRooms: 8, maxGuests: 2 },
      { name: 'Deluxe Room', basePrice: 6500, totalRooms: 5, maxGuests: 3 },
    ];

    for (const rt of roomDefs) {
      let room = await RoomType.findOne({ property: prop._id, name: rt.name });
      if (!room) {
        room = await RoomType.create({
          property: prop._id,
          name: rt.name,
          basePrice: rt.basePrice,
          totalRooms: rt.totalRooms,
          maxGuests: rt.maxGuests,
          description: `${rt.name} at ${prop.name}`,
          amenities: ['AC', 'WiFi', 'Smart TV', 'Private Bathroom'],
        });
      }
      allRooms.push(room);
    }
  }

  // Add pending and rejected properties for moderation test
  const testProps = [
    {
      name: 'Udaipur Lake Palace Resort',
      city: 'udaipur',
      address: 'Pichola Lake Road, Udaipur 313001',
      description: 'Stunning white marble palace surrounded by the serene waters of Lake Pichola with private boat jetty.',
      amenities: ['WiFi', 'Pool', 'Spa', 'Lake View', 'Boating', 'Fine Dining'],
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80',
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
      ],
      starRating: 5,
      status: 'pending',
      partner: partner._id,
    },
    {
      name: 'Manali Snow Pine Resort',
      city: 'manali',
      address: 'Old Manali Road, Manali 175131',
      description: 'Charming mountain wooden lodge surrounded by apple orchards and pine forests overlooking Himalayan peaks.',
      amenities: ['WiFi', 'Heater', 'Fireplace', 'Mountain View', 'Restaurant'],
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
      ],
      starRating: 4,
      status: 'pending',
      partner: partner._id,
    },
    {
      name: 'Goa Backpacker Shack',
      city: 'goa',
      address: 'Arambol Beach, Goa 403524',
      description: 'Rustic budget beach huts on North Goa cliffs with sea breeze.',
      amenities: ['WiFi', 'AC'],
      images: ['https://images.unsplash.com/photo-1529290130-4ca3753253ae?w=1200&q=80'],
      starRating: 1,
      status: 'rejected',
      rejectionReason: 'Missing statutory municipal commercial lodging license and fire safety NOC certificate.',
      partner: partner._id,
    },
  ];

  for (const tp of testProps) {
    const exists = await Property.findOne({ name: tp.name });
    if (!exists) {
      const p = await Property.create(tp);
      await RoomType.create({
        property: p._id,
        name: 'Deluxe Suite',
        basePrice: p.starRating >= 5 ? 8500 : 4200,
        totalRooms: 6,
        maxGuests: 2,
        description: `Deluxe Suite at ${p.name}`,
        amenities: ['AC', 'WiFi', 'Smart TV', 'Private Bathroom'],
      });
    }
  }

  return {
    success: true,
    propertiesCount: createdProperties.length,
    roomsCount: allRooms.length,
  };
};

module.exports = { seedDatabase, propData };
