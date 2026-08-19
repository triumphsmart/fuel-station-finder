const pool = require("../config/database");
const {
  findStationById,
  updateStationStatus,
} = require("../models/stationModel");

// Get all pending stations (admin only)
const getPendingStations = async (req, res) => {
  try {
    const query = `
            SELECT 
                s.*,
                u.full_name as owner_name,
                u.email as owner_email,
                u.phone as owner_phone
            FROM stations s
            LEFT JOIN users u ON s.owner_id = u.id
            WHERE s.status = 'pending'
            ORDER BY s.created_at ASC
        `;
    const result = await pool.query(query);

    res.json({
      count: result.rows.length,
      stations: result.rows,
    });
  } catch (error) {
    console.error("Get pending stations error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
};

// Approve a station (admin only)
const approveStation = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if station exists
    const station = await findStationById(id);
    if (!station) {
      return res.status(404).json({
        error: "Station not found",
      });
    }

    // Check if already approved
    if (station.status === "approved") {
      return res.status(400).json({
        error: "Station is already approved",
      });
    }

    // Update status to approved
    const updatedStation = await updateStationStatus(id, "approved");

    res.json({
      message: "Station approved successfully!",
      station: updatedStation,
    });
  } catch (error) {
    console.error("Approve station error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
};

// Reject a station (admin only)
const rejectStation = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if station exists
    const station = await findStationById(id);
    if (!station) {
      return res.status(404).json({
        error: "Station not found",
      });
    }

    // Check if already rejected
    if (station.status === "rejected") {
      return res.status(400).json({
        error: "Station is already rejected",
      });
    }

    // Update status to rejected
    const updatedStation = await updateStationStatus(id, "rejected");

    res.json({
      message: "Station rejected successfully!",
      station: updatedStation,
    });
  } catch (error) {
    console.error("Reject station error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const query = `
            SELECT id, full_name, email, phone, role, is_active, created_at
            FROM users
            ORDER BY created_at DESC
        `;
    const result = await pool.query(query);

    res.json({
      count: result.rows.length,
      users: result.rows,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
};

// Deactivate a user (admin only)
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deactivating themselves
    if (id === req.user.userId) {
      return res.status(400).json({
        error: "You cannot deactivate your own account",
      });
    }

    const query = `
            UPDATE users 
            SET is_active = false, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id, full_name, email, is_active
        `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      message: "User deactivated successfully!",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Deactivate user error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
};

module.exports = {
  getPendingStations,
  approveStation,
  rejectStation,
  getAllUsers,
  deactivateUser,
};
