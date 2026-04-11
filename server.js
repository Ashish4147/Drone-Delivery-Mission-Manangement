const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const errorMiddleware = require('./middleware/errorMiddleware');

// ============================================================
// DRONE DELIVERY MISSION MANAGEMENT - Express Server
// Technology: Node.js + ExpressJS + Sessions + Cookies
// Supports: MongoDB (if installed) OR in-memory Mock DB
// ============================================================

const app = express();
const PORT = process.env.PORT || 5000;
const USE_MOCK_DB = process.env.USE_MOCK || 'true'; // Set to 'false' to use MongoDB

// ─── DB Mode Selection ────────────────────────────────────────
if (USE_MOCK_DB === 'false') {
  const connectDB = require('./config/db');
  connectDB();
  console.log('📦 Using MongoDB Database');
} else {
  console.log('📦 Using In-Memory Mock Database (no MongoDB required)');
}

// ─── Core Middleware ──────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ─── Cookie Parser (Integration: Cookies) ─────────────────────
app.use(cookieParser());

// ─── Session Middleware (Integration: Sessions) ────────────────
app.use(
  session({
    secret: 'drone-delivery-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// ─── Serve Static Frontend Files ──────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── API Routes ───────────────────────────────────────────────
const missionRoutes = require('./routes/missions');
app.use('/api/missions', missionRoutes);

// ─── Session Info Route ────────────────────────────────────────
app.get('/api/session-info', (req, res) => {
  res.json({
    sessionId: req.sessionID,
    currentMission: req.session.currentMission || null,
    lastSearched: req.session.searchedMissionId || null,
    lastUpdated: req.session.lastUpdated || null,
    cookies: req.cookies,
    dbMode: USE_MOCK_DB === 'false' ? 'MongoDB' : 'In-Memory Mock DB',
  });
});

// ─── Catch-All ────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorMiddleware);

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('🚁 ═══════════════════════════════════════════════════');
  console.log('🚁  DRONE DELIVERY MISSION MANAGEMENT SYSTEM');
  console.log('🚁 ═══════════════════════════════════════════════════');
  console.log(`🚀  Server: http://localhost:${PORT}`);
  console.log(`🔑  Sessions & Cookies: Enabled`);
  console.log(`📡  API: http://localhost:${PORT}/api/missions`);
  console.log('🚁 ═══════════════════════════════════════════════════');
  console.log('');
  console.log('📌 API Endpoints:');
  console.log(`   GET  /api/missions/search?missionId=MSN001&operatorId=OPR101`);
  console.log(`   PUT  /api/missions/update`);
  console.log(`   GET  /api/missions/all`);
  console.log('');
  console.log('💡 Open: http://localhost:5000');
  console.log('');
});
