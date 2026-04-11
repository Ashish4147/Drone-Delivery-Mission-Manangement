const MockDB = require('../config/mockDB');

// ── Determine which DB to use ─────────────────────────────────
// If MongoDB is connected use Mission model, otherwise use MockDB
let Mission;
try {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 1) {
    Mission = require('../models/Mission');
    console.log('Using MongoDB Mission model');
  } else {
    Mission = null;
  }
} catch (e) {
  Mission = null;
}

// ── DB Adapter: Unifies MockDB and Mongoose API ───────────────
const DB = {
  async findOne(missionId, operatorId) {
    if (Mission) {
      return await Mission.findOne({ missionId, operatorId });
    }
    return await MockDB.findOne({ missionId, operatorId });
  },
  async findAll() {
    if (Mission) {
      return await Mission.find().sort({ createdAt: -1 });
    }
    return await MockDB.findAll();
  },
  async updateOne(missionId, operatorId, updateFields) {
    if (Mission) {
      return await Mission.findOneAndUpdate(
        { missionId, operatorId },
        { $set: updateFields },
        { new: true, runValidators: true }
      );
    }
    return await MockDB.updateOne({ missionId, operatorId }, updateFields);
  },
};

/**
 * =============================================================
 * MISSION CONTROLLER - Service Layer with Exception Handling
 * =============================================================
 */

// ─── Search Mission ──────────────────────────────────────────
// @route   GET /api/missions/search?missionId=MSN001&operatorId=OPR101
const searchMission = async (req, res, next) => {
  try {
    const { missionId, operatorId } = req.query;

    // Server-side validation
    if (!missionId || !operatorId) {
      const error = new Error('Both Mission ID and Operator ID are required.');
      error.statusCode = 400;
      throw error;
    }

    const normalizedMissionId  = missionId.trim().toUpperCase();
    const normalizedOperatorId = operatorId.trim().toUpperCase();

    // Format validation
    if (!/^MSN\d{3}$/.test(normalizedMissionId)) {
      const error = new Error('Invalid Mission ID format. Expected: MSN001');
      error.statusCode = 400;
      throw error;
    }
    if (!/^OPR\d{3}$/.test(normalizedOperatorId)) {
      const error = new Error('Invalid Operator ID format. Expected: OPR101');
      error.statusCode = 400;
      throw error;
    }

    // DB query
    const mission = await DB.findOne(normalizedMissionId, normalizedOperatorId);

    if (!mission) {
      const error = new Error(
        `No mission found with Mission ID: ${normalizedMissionId} and Operator ID: ${normalizedOperatorId}`
      );
      error.statusCode = 404;
      throw error;
    }

    // Save in session (Integration: Sessions)
    req.session.currentMission    = mission._id ? mission._id.toString() : mission.missionId;
    req.session.searchedMissionId = normalizedMissionId;

    // Set cookie (Integration: Cookies)
    res.cookie('lastSearchedMission', normalizedMissionId, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'Mission found successfully',
      data: mission,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Mission ──────────────────────────────────────────
// @route   PUT /api/missions/update
const updateMission = async (req, res, next) => {
  try {
    const { missionId, operatorId, deliveryWindow, packagePriority } = req.body;

    // Server-side validation
    if (!missionId || !operatorId) {
      const error = new Error('Mission ID and Operator ID are required.');
      error.statusCode = 400;
      throw error;
    }

    if (!deliveryWindow && !packagePriority) {
      const error = new Error('At least one field must be provided for update.');
      error.statusCode = 400;
      throw error;
    }

    // Validate delivery window format
    if (deliveryWindow) {
      if (!/^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/.test(deliveryWindow.trim())) {
        const error = new Error('Invalid Delivery Window format. Expected: HH:MM - HH:MM');
        error.statusCode = 400;
        throw error;
      }
    }

    // Validate package priority
    if (packagePriority && !['Low', 'Medium', 'High', 'Critical'].includes(packagePriority)) {
      const error = new Error('Invalid Package Priority. Must be: Low, Medium, High, or Critical');
      error.statusCode = 400;
      throw error;
    }

    const normalizedMissionId  = missionId.trim().toUpperCase();
    const normalizedOperatorId = operatorId.trim().toUpperCase();

    // Find mission
    const mission = await DB.findOne(normalizedMissionId, normalizedOperatorId);

    if (!mission) {
      const error = new Error(`Mission not found: ${normalizedMissionId}`);
      error.statusCode = 404;
      throw error;
    }

    // ===== BUSINESS RULE: Only Pending missions can be updated =====
    if (mission.status !== 'Pending') {
      const error = new Error(
        `Update not permitted. Mission status is '${mission.status}'. Only Pending missions can be updated.`
      );
      error.statusCode = 403;
      error.businessRule  = true;
      error.currentStatus = mission.status;
      throw error;
    }

    // Build update object
    const updateFields = {};
    if (deliveryWindow)  updateFields.deliveryWindow  = deliveryWindow.trim();
    if (packagePriority) updateFields.packagePriority = packagePriority;

    // Perform update
    const updatedMission = await DB.updateOne(normalizedMissionId, normalizedOperatorId, updateFields);

    // Update session
    req.session.lastUpdated = new Date().toISOString();

    res.status(200).json({
      success: true,
      message: 'Mission updated successfully!',
      data: updatedMission,
      updatedFields: Object.keys(updateFields),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Missions ─────────────────────────────────────────
// @route   GET /api/missions/all
const getAllMissions = async (req, res, next) => {
  try {
    const missions = await DB.findAll();
    res.status(200).json({
      success: true,
      count: missions.length,
      data: missions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { searchMission, updateMission, getAllMissions };
