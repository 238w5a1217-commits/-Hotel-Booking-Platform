require('dotenv').config();
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch (e) {}

const connectDB  = require('../config/db');
const User       = require('../features/auth/user.model');
const Property   = require('../features/properties/property.model');
const RoomType   = require('../features/rooms/room.model');
const Inventory  = require('../features/inventory/inventory.model');
const Booking    = require('../features/bookings/booking.model');

const seed = async () => {
  await connectDB();
  console.log('🌱 Clearing existing collections...');
  await Promise.all([
    User.deleteMany(),
    Property.deleteMany(),
    RoomType.deleteMany(),
    Inventory.deleteMany(),
    Booking.deleteMany(),
  ]);

  console.log('👤 Creating role accounts (Guest, Partner, Admin)...');
  const [admin, partner, guest] = await Promise.all([
    User.create({ name: 'Admin User',    email: 'admin@ajintara.com',   password: 'Admin@123',   role: 'admin'   }),
    User.create({ name: 'Hotel Partner', email: 'partner@ajintara.com', password: 'Partner@123', role: 'partner' }),
    User.create({ name: 'Guest User',    email: 'guest@ajintara.com',   password: 'Guest@123',   role: 'guest'   }),
  ]);

  console.log('🏨 Seeding 10 properties across 5+ Indian cities...');
  const propData = [
    { name: 'The Grand Mumbai',       city: 'mumbai',    address: 'Nariman Point, Mumbai 400021',     description: 'Luxury 5-star hotel in south Mumbai.',         amenities: ['WiFi','Pool','Gym','Spa','Restaurant'], images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'], starRating: 5 },
    { name: 'Goa Beach Resort',       city: 'goa',       address: 'Calangute Beach, Goa 403516',      description: 'Charming beachfront resort in North Goa.',     amenities: ['WiFi','Beach Access','Pool','Bar'],      images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'], starRating: 4 },
    { name: 'Delhi Heritage Palace',  city: 'delhi',     address: 'Connaught Place, New Delhi 110001',description: 'Colonial heritage hotel near Connaught Place.',amenities: ['WiFi','Restaurant','Business Lounge'],   images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'], starRating: 4 },
    { name: 'Bangalore Tech Stay',    city: 'bangalore', address: 'Koramangala, Bangalore 560034',    description: 'Modern smart hotel in Bangalore IT corridor.', amenities: ['WiFi','Gym','Restaurant','Co-working'],  images: ['https://images.unsplash.com/photo-1543968996-ee822b8176ba?w=800'], starRating: 3 },
    { name: 'Jaipur Royal Haveli',    city: 'jaipur',    address: 'City Palace Road, Jaipur 302001',  description: 'Authentic Rajasthani royal haveli stay.',      amenities: ['WiFi','Pool','Spa','Restaurant'],        images: ['https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800'], starRating: 5 },
    { name: 'Mumbai Express Inn',     city: 'mumbai',    address: 'Andheri West, Mumbai 400058',      description: 'Convenient transit hotel near Mumbai airport.',amenities: ['WiFi','AC','TV'],                        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'], starRating: 2 },
    { name: 'Goa Boutique Villas',    city: 'goa',       address: 'Anjuna Beach, Goa 403509',         description: 'Private villas with swimming pool.',           amenities: ['WiFi','Private Pool','Kitchen','Garden'],images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'], starRating: 4 },
    { name: 'Delhi City Center Stay', city: 'delhi',     address: 'Karol Bagh, New Delhi 110005',     description: 'Value-for-money hotel in central Delhi.',      amenities: ['WiFi','AC','Breakfast'],                 images: ['https://images.unsplash.com/photo-1529290130-4ca3753253ae?w=800'], starRating: 2 },
    { name: 'Chennai Bay View',       city: 'chennai',   address: 'Marina Beach Road, Chennai 600001',description: 'Coastal hotel facing the Bay of Bengal.',     amenities: ['WiFi','Sea View','Restaurant'],          images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'], starRating: 3 },
    { name: 'Hyderabad Pearl Hotel',  city: 'hyderabad', address: 'Banjara Hills, Hyderabad 500034',  description: 'Upscale hotel located in Banjara Hills.',       amenities: ['WiFi','Pool','Spa','Restaurant','Gym'], images: ['https://images.unsplash.com/photo-1455587734955-081b22074882?w=800'], starRating: 4 },
  ];

  const properties = await Property.insertMany(propData.map((p) => ({ ...p, partner: partner._id, status: 'approved' })));

  console.log('🛏️ Seeding room types for each property...');
  const roomTypesToCreate = [
    { name: 'Standard Room', basePrice: 3500, totalRooms: 8, maxGuests: 2 },
    { name: 'Deluxe Room',   basePrice: 6500, totalRooms: 5, maxGuests: 3 },
    { name: 'Luxury Suite',  basePrice: 12000, totalRooms: 3, maxGuests: 4 },
  ];

  const allRooms = [];
  for (const prop of properties) {
    for (const rt of roomTypesToCreate) {
      const room = await RoomType.create({
        property: prop._id,
        ...rt,
        description: `${rt.name} at ${prop.name}`,
        amenities: ['AC', 'WiFi', 'Smart TV', 'Private Bathroom'],
      });
      allRooms.push(room);
    }
  }

  console.log('📅 Adding date-specific pricing overrides (24-26 Dec)...');
  const deluxeMumbai = allRooms.find((r) => r.name === 'Deluxe Room' && r.property.toString() === properties[0]._id.toString());
  if (deluxeMumbai) {
    await Inventory.insertMany([
      { roomType: deluxeMumbai._id, property: properties[0]._id, date: '2026-12-24', price: 9000, availableRooms: 3 },
      { roomType: deluxeMumbai._id, property: properties[0]._id, date: '2026-12-25', price: 9500, availableRooms: 3 },
      { roomType: deluxeMumbai._id, property: properties[0]._id, date: '2026-12-26', price: 7500, availableRooms: 3 },
    ]);
  }

  console.log('\n======================================================');
  console.log('✅ DATABASE SEED COMPLETE!');
  console.log('------------------------------------------------------');
  console.log('👤 Admin:   admin@ajintara.com   / Admin@123');
  console.log('👤 Partner: partner@ajintara.com / Partner@123');
  console.log('👤 Guest:   guest@ajintara.com   / Guest@123');
  console.log(`🏨 Seeded ${properties.length} approved properties with ${allRooms.length} rooms`);
  console.log('======================================================\n');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
