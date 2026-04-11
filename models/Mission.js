const mongoose = require('mongoose');

/**
 * Mission Schema - Drone Delivery Mission Management
 * 
 * Unique Identifiers: missionId + operatorId (combined search)
 * Editable Fields: deliveryWindow, packagePriority
 * Business Rule: Updates allowed ONLY when status === 'Pending'
 * Non-Editable Fields: All other fields
 */
const missionSchema = new mongoose.Schema(
  {
    // ========== UNIQUE IDENTIFIERS (Non-Editable) ==========
    missionId: {
      type: String,
      required: [true, 'Mission ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    operatorId: {
      type: String,
      required: [true, 'Operator ID is required'],
      trim: true,
      uppercase: true,
    },

    // ========== NON-EDITABLE FIELDS ==========
    operatorName: {
      type: String,
      required: [true, 'Operator Name is required'],
      trim: true,
    },
    droneModel: {
      type: String,
      required: [true, 'Drone Model is required'],
      trim: true,
    },
    pickupLocation: {
      type: String,
      required: [true, 'Pickup Location is required'],
    },
    dropLocation: {
      type: String,
      required: [true, 'Drop Location is required'],
    },
    packageWeight: {
      type: Number,
      required: [true, 'Package Weight is required'],
      min: [0.1, 'Package weight must be at least 0.1 kg'],
      max: [25, 'Package weight cannot exceed 25 kg'],
    },
    assignedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    estimatedDelivery: {
      type: Date,
      required: true,
    },

    // ========== STATUS (Business Rule Controller) ==========
    status: {
      type: String,
      enum: ['Pending', 'Dispatched', 'Delivered', 'Cancelled'],
      default: 'Pending',
      required: true,
    },

    // ========== EDITABLE FIELDS (Only when status === 'Pending') ==========
    deliveryWindow: {
      type: String,
      required: [true, 'Delivery Window is required'],
      trim: true,
    },
    packagePriority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: [true, 'Package Priority is required'],
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Compound index for faster search using both unique identifiers
missionSchema.index({ missionId: 1, operatorId: 1 });

module.exports = mongoose.model('Mission', missionSchema);
