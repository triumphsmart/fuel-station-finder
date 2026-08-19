const pool = require("../config/database");
const {
  findStationById,
  updateStationStatus,
} = require("../models/stationModel");

// ===== STATION MANAGEMENT =====

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

// Get all stations (admin only) - with optional filters
const getAllStations = async (req, res) => {
  try {
    const { status, city, state } = req.query;

    let query = `
      SELECT 
        s.*,
        u.full_name as owner_name,
        u.email as owner_email,
        u.phone as owner_phone
      FROM stations s
      LEFT JOIN users u ON s.owner_id = u.id
      WHERE 1=1
    `;

    const values = [];
    let paramCounter = 1;

    if (status) {
      query += ` AND s.status = $${paramCounter}`;
      values.push(status);
      paramCounter++;
    }

    if (city) {
      query += ` AND s.city ILIKE $${paramCounter}`;
      values.push(`%${city}%`);
      paramCounter++;
    }

    if (state) {
      query += ` AND s.state ILIKE $${paramCounter}`;
      values.push(`%${state}%`);
      paramCounter++;
    }

    query += ` ORDER BY s.created_at DESC`;

    const result = await pool.query(query, values);

    res.json({
      count: result.rows.length,
      stations: result.rows,
    });
  } catch (error) {
    console.error("Get all stations error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
};

// Approve a station (admin only)
const approveStation = async (req, res) => {
  try {
    const { id } = req.params;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        error: "Invalid station ID format",
      });
    }

    const station = await findStationById(id);
    if (!station) {
      return res.status(404).json({
        error: "Station not found",
      });
    }

    if (station.status === "approved") {
      return res.status(400).json({
        error: "Station is already approved",
      });
    }

    const updatedStation = await updateStationStatus(id, "approved");

    res.json({
      message: "Station approved successfully!",
      station: updatedStation,
    });
  } catch (error) {
    console.error("Approve station error:", error);
    res.status(500).json({
      error: error.message || "Internal server error. Please try again.",
    });
  }
};

// Reject a station (admin only)
const rejectStation = async (req, res) => {
  try {
    const { id } = req.params;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        error: "Invalid station ID format",
      });
    }

    const station = await findStationById(id);
    if (!station) {
      return res.status(404).json({
        error: "Station not found",
      });
    }

    if (station.status === "rejected") {
      return res.status(400).json({
        error: "Station is already rejected",
      });
    }

    const updatedStation = await updateStationStatus(id, "rejected");

    res.json({
      message: "Station rejected successfully!",
      station: updatedStation,
    });
  } catch (error) {
    console.error("Reject station error:", error);
    res.status(500).json({
      error: error.message || "Internal server error. Please try again.",
    });
  }
};

// Delete a station permanently (admin only)
const adminDeleteStation = async (req, res) => {
  try {
    const { id } = req.params;

    const station = await findStationById(id);
    if (!station) {
      return res.status(404).json({
        error: "Station not found",
      });
    }

    const query = "DELETE FROM stations WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);

    res.json({
      message: "Station deleted successfully!",
      station: result.rows[0],
    });
  } catch (error) {
    console.error("Admin delete station error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
};

// ===== USER MANAGEMENT =====

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

// Get a single user by ID (admin only)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT id, full_name, email, phone, role, is_active, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
};

// Activate a user (admin only)
const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.userId) {
      return res.status(400).json({
        error: "You cannot activate your own account (you're already active)",
      });
    }

    const query = `
      UPDATE users 
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
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
      message: "User activated successfully!",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Activate user error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
};

// Deactivate a user (admin only)
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

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

// Permanently delete a user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.userId) {
      return res.status(400).json({
        error: "You cannot delete your own account",
      });
    }

    const checkQuery = "SELECT * FROM users WHERE id = $1";
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const deleteQuery =
      "DELETE FROM users WHERE id = $1 RETURNING id, full_name, email";
    const result = await pool.query(deleteQuery, [id]);

    res.json({
      message: "User deleted permanently!",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
};

module.exports = {
  getPendingStations,
  getAllStations,
  approveStation,
  rejectStation,
  adminDeleteStation,
  getAllUsers,
  getUserById,
  activateUser,
  deactivateUser,
  deleteUser,
};
