const {
  createStation,
  findStationsByOwner,
  findStationById,
  getApprovedStations,
  getApprovedStationById,
  getFilteredStations,
  updateStation,
  updateStationStatus,
} = require("../models/stationModel");

const pool = require("../config/database"); // Import the database connection

const createStationHandler = async (req, res) => {
  try {
    const owner_id = req.user.userId;

    const {
      name,
      address,
      city,
      state,
      latitude,
      longitude,
      petrol_price,
      diesel_price,
      kerosene_price,
      petrol_available,
      diesel_available,
      kerosene_available,
      is_open,
    } = req.body;

    if (!name || !address || !city || !state || !latitude || !longitude) {
      return res.status(400).json({
        error:
          "Missing required fields: name, address, city, state, latitude, longitude",
      });
    }

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        error: "Latitude and longitude must be valid numbers",
      });
    }

    const stationData = {
      owner_id,
      name,
      address,
      city,
      state,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      petrol_price: petrol_price ? parseFloat(petrol_price) : null,
      diesel_price: diesel_price ? parseFloat(diesel_price) : null,
      kerosene_price: kerosene_price ? parseFloat(kerosene_price) : null,
      petrol_available: petrol_available || false,
      diesel_available: diesel_available || false,
      kerosene_available: kerosene_available || false,
      is_open: is_open !== undefined ? is_open : true,
    };

    const newStation = await createStation(stationData);

    res.status(201).json({
      message: "Station registered successfully! Waiting for admin approval.",
      station: newStation,
    });
  } catch (error) {
    console.error("Create station error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
};

const getMyStations = async (req, res) => {
  try {
    const owner_id = req.user.userId;
    const stations = await findStationsByOwner(owner_id);

    res.json({
      count: stations.length,
      stations: stations,
    });
  } catch (error) {
    console.error("Get my stations error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
};

const getStationById = async (req, res) => {
  try {
    const { id } = req.params;
    const station = await findStationById(id);

    if (!station) {
      return res.status(404).json({
        error: "Station not found",
      });
    }

    if (station.owner_id !== req.user.userId) {
      return res.status(403).json({
        error: "You do not have permission to view this station",
      });
    }

    res.json({ station });
  } catch (error) {
    console.error("Get station error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
};

const getAllStations = async (req, res) => {
  try {
    const filters = {
      city: req.query.city,
      state: req.query.state,
      fuel_type: req.query.fuel_type,
      is_open:
        req.query.is_open !== undefined
          ? req.query.is_open === "true"
          : undefined,
      max_price: req.query.max_price,
    };

    Object.keys(filters).forEach(
      (key) => filters[key] === undefined && delete filters[key],
    );

    const stations = await getFilteredStations(filters);

    res.json({
      count: stations.length,
      stations: stations,
    });
  } catch (error) {
    console.error("Get all stations error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
};

const getPublicStationById = async (req, res) => {
  try {
    const { id } = req.params;
    const station = await getApprovedStationById(id);

    if (!station) {
      return res.status(404).json({
        error: "Station not found or not yet approved",
      });
    }

    const reviewsQuery = `
            SELECT 
                r.*,
                u.full_name as reviewer_name
            FROM reviews r
            LEFT JOIN users u ON r.driver_id = u.id
            WHERE r.station_id = $1
            ORDER BY r.created_at DESC
        `;
    const reviewsResult = await pool.query(reviewsQuery, [id]);

    const avgRatingQuery = `
            SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews
            FROM reviews
            WHERE station_id = $1
        `;
    const avgResult = await pool.query(avgRatingQuery, [id]);

    res.json({
      station: station,
      reviews: reviewsResult.rows,
      average_rating: parseFloat(avgResult.rows[0].average_rating) || 0,
      total_reviews: parseInt(avgResult.rows[0].total_reviews) || 0,
    });
  } catch (error) {
    console.error("Get public station error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
};

const updateStationHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user.userId;

    const existingStation = await findStationById(id);
    if (!existingStation) {
      return res.status(404).json({
        error: "Station not found",
      });
    }

    if (existingStation.owner_id !== owner_id) {
      return res.status(403).json({
        error: "You do not have permission to update this station",
      });
    }

    const { status, ...updateData } = req.body;

    delete updateData.owner_id;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: "No fields to update",
      });
    }

    if (updateData.latitude !== undefined && isNaN(updateData.latitude)) {
      return res.status(400).json({
        error: "Latitude must be a valid number",
      });
    }
    if (updateData.longitude !== undefined && isNaN(updateData.longitude)) {
      return res.status(400).json({
        error: "Longitude must be a valid number",
      });
    }

    if (updateData.latitude)
      updateData.latitude = parseFloat(updateData.latitude);
    if (updateData.longitude)
      updateData.longitude = parseFloat(updateData.longitude);
    if (updateData.petrol_price)
      updateData.petrol_price = parseFloat(updateData.petrol_price);
    if (updateData.diesel_price)
      updateData.diesel_price = parseFloat(updateData.diesel_price);
    if (updateData.kerosene_price)
      updateData.kerosene_price = parseFloat(updateData.kerosene_price);

    const updatedStation = await updateStation(id, owner_id, updateData);

    if (!updatedStation) {
      return res.status(404).json({
        error: "Station not found or you do not own it",
      });
    }

    res.json({
      message: "Station updated successfully!",
      station: updatedStation,
    });
  } catch (error) {
    console.error("Update station error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
};

// Delete a station (owner or admin)
const deleteStationHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const isAdmin = req.user.role === "admin";

    // Check if station exists
    const station = await findStationById(id);
    if (!station) {
      return res.status(404).json({
        error: "Station not found",
      });
    }

    // Check permissions
    if (!isAdmin && station.owner_id !== userId) {
      return res.status(403).json({
        error: "You do not have permission to delete this station",
      });
    }

    // Delete the station
    const deletedStation = await deleteStation(id, userId, isAdmin);

    if (!deletedStation) {
      return res.status(404).json({
        error: "Station not found or you do not have permission",
      });
    }

    res.json({
      message: "Station deleted successfully!",
      station: deletedStation,
    });
  } catch (error) {
    console.error("Delete station error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
};

module.exports = {
  createStationHandler,
  getMyStations,
  getStationById,
  getAllStations,
  getPublicStationById,
  updateStationHandler,
  deleteStationHandler,
};
