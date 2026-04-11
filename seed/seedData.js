/**
 * Seed Script - Sample Data for Drone Delivery Mission Management
 * 
 * Run: node seed/seedData.js
 * 
 * Sample Records:
 * ┌────────┬──────────┬────────────┬──────────────────────┐
 * │ MSN001 │ OPR101   │ Pending    │ CAN UPDATE ✅        │
 * │ MSN002 │ OPR102   │ Dispatched │ CANNOT UPDATE ❌     │
 * │ MSN003 │ OPR103   │ Pending    │ CAN UPDATE ✅        │
 * │ MSN004 │ OPR104   │ Delivered  │ CANNOT UPDATE ❌     │
 * │ MSN005 │ OPR105   │ Cancelled  │ CANNOT UPDATE ❌     │
 * └────────┴──────────┴────────────┴──────────────────────┘
 */

const mongoose = require('mongoose');
const Mission = require('../models/Mission');

const connectDB = async () => {
  await mongoose.connect('mongodb://localhost:27017/droneDeliveryMgmt', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('✅ MongoDB Connected for Seeding');
};

const sampleMissions = [
  {
    missionId: 'MSN001',
    operatorId: 'OPR101',
    operatorName: 'Rajesh Kumar',
    droneModel: 'DJI Matrice 300 RTK',
    deliveryWindow: '09:00 - 11:00',
    packagePriority: 'High',
    pickupLocation: 'Warehouse A, Sector 5, Mumbai',
    dropLocation: 'Block C, Andheri East, Mumbai',
    packageWeight: 2.5,
    status: 'Pending',
    assignedDate: new Date('2025-04-10'),
    estimatedDelivery: new Date('2025-04-10'),
  },
  {
    missionId: 'MSN002',
    operatorId: 'OPR102',
    operatorName: 'Priya Sharma',
    droneModel: 'DJI Matrice 600 Pro',
    deliveryWindow: '14:00 - 16:00',
    packagePriority: 'Critical',
    pickupLocation: 'Distribution Hub, Kharadi, Pune',
    dropLocation: 'Koregaon Park, Pune',
    packageWeight: 1.2,
    status: 'Dispatched',
    assignedDate: new Date('2025-04-09'),
    estimatedDelivery: new Date('2025-04-09'),
  },
  {
    missionId: 'MSN003',
    operatorId: 'OPR103',
    operatorName: 'Ashish Patil',
    droneModel: 'Skydio 2+ Pro',
    deliveryWindow: '11:00 - 13:00',
    packagePriority: 'Medium',
    pickupLocation: 'Warehouse B, Electronic City, Bengaluru',
    dropLocation: 'Whitefield Tech Park, Bengaluru',
    packageWeight: 3.7,
    status: 'Pending',
    assignedDate: new Date('2025-04-11'),
    estimatedDelivery: new Date('2025-04-11'),
  },
  {
    missionId: 'MSN004',
    operatorId: 'OPR104',
    operatorName: 'Shivam Tiwari',
    droneModel: 'Autel EVO II Pro',
    deliveryWindow: '16:00 - 18:00',
    packagePriority: 'Low',
    pickupLocation: 'Logistics Center, Gachibowli, Hyderabad',
    dropLocation: 'Jubilee Hills, Hyderabad',
    packageWeight: 0.8,
    status: 'Delivered',
    assignedDate: new Date('2025-04-08'),
    estimatedDelivery: new Date('2025-04-08'),
  },
  {
    missionId: 'MSN005',
    operatorId: 'OPR105',
    operatorName: 'Rahul Kumar',
    droneModel: 'DJI Phantom 4 RTK',
    deliveryWindow: '08:00 - 10:00',
    packagePriority: 'High',
    pickupLocation: 'Warehouse C, Okhla, Delhi',
    dropLocation: 'Connaught Place, Central Delhi',
    packageWeight: 1.5,
    status: 'Cancelled',
    assignedDate: new Date('2025-04-07'),
    estimatedDelivery: new Date('2025-04-07'),
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Mission.deleteMany({});
    console.log('🗑️  Cleared existing mission records');

    // Insert sample records
    const inserted = await Mission.insertMany(sampleMissions);
    console.log(`\n✅ Successfully seeded ${inserted.length} mission records:\n`);

    inserted.forEach((m, i) => {
      const canUpdate = m.status === 'Pending' ? '✅ CAN UPDATE' : '❌ CANNOT UPDATE';
      console.log(`  ${i + 1}. ${m.missionId} | ${m.operatorId} | Status: ${m.status.padEnd(12)} | ${canUpdate}`);
    });

    console.log('\n📝 Search Instructions:');
    console.log('   Use: Mission ID + Operator ID together to search');
    console.log('   Example: MSN001 + OPR101 (Pending - Can Update)');
    console.log('   Example: MSN002 + OPR102 (Dispatched - Cannot Update)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
