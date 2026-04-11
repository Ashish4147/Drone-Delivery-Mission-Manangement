/**
 * Mock Data Store - Replaces MongoDB for demo/testing
 * This is an in-memory JSON store that simulates a database.
 * Perfect for running without MongoDB installed.
 * 
 * To switch to real MongoDB, replace the db import in server.js
 */

const missionStore = [
  {
    _id: 'mock_id_001',
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
    assignedDate: new Date('2025-04-10').toISOString(),
    estimatedDelivery: new Date('2025-04-10').toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mock_id_002',
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
    assignedDate: new Date('2025-04-09').toISOString(),
    estimatedDelivery: new Date('2025-04-09').toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mock_id_003',
    missionId: 'MSN003',
    operatorId: 'OPR103',
    operatorName: 'Aakash Verma',
    droneModel: 'Skydio 2+ Pro',
    deliveryWindow: '11:00 - 13:00',
    packagePriority: 'Medium',
    pickupLocation: 'Warehouse B, Electronic City, Bengaluru',
    dropLocation: 'Whitefield Tech Park, Bengaluru',
    packageWeight: 3.7,
    status: 'Pending',
    assignedDate: new Date('2025-04-11').toISOString(),
    estimatedDelivery: new Date('2025-04-11').toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mock_id_004',
    missionId: 'MSN004',
    operatorId: 'OPR104',
    operatorName: 'Sneha Patel',
    droneModel: 'Autel EVO II Pro',
    deliveryWindow: '16:00 - 18:00',
    packagePriority: 'Low',
    pickupLocation: 'Logistics Center, Gachibowli, Hyderabad',
    dropLocation: 'Jubilee Hills, Hyderabad',
    packageWeight: 0.8,
    status: 'Delivered',
    assignedDate: new Date('2025-04-08').toISOString(),
    estimatedDelivery: new Date('2025-04-08').toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mock_id_005',
    missionId: 'MSN005',
    operatorId: 'OPR105',
    operatorName: 'Vikram Singh',
    droneModel: 'DJI Phantom 4 RTK',
    deliveryWindow: '08:00 - 10:00',
    packagePriority: 'High',
    pickupLocation: 'Warehouse C, Okhla, Delhi',
    dropLocation: 'Connaught Place, Central Delhi',
    packageWeight: 1.5,
    status: 'Cancelled',
    assignedDate: new Date('2025-04-07').toISOString(),
    estimatedDelivery: new Date('2025-04-07').toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ── DB-like Methods ──────────────────────────────────────────

const MockDB = {
  findOne({ missionId, operatorId }) {
    return Promise.resolve(
      missionStore.find(
        (m) => m.missionId === missionId && m.operatorId === operatorId
      ) || null
    );
  },

  findAll() {
    return Promise.resolve([...missionStore]);
  },

  updateOne({ missionId, operatorId }, updateFields) {
    const index = missionStore.findIndex(
      (m) => m.missionId === missionId && m.operatorId === operatorId
    );
    if (index === -1) return Promise.resolve(null);

    missionStore[index] = {
      ...missionStore[index],
      ...updateFields,
      updatedAt: new Date().toISOString(),
    };
    return Promise.resolve({ ...missionStore[index] });
  },
};

module.exports = MockDB;
