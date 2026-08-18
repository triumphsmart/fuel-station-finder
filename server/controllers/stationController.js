const {
  createStation,
  findStationsByOwner,
  findStationById,
} = require("../models/stationModel");

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

module.exports = {
  createStationHandler,
  getMyStations,
  getStationById,
};
