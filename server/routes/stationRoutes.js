const express = require("express");
const router = express.Router();

// Import middleware
const authenticate = require("../middleware/auth");
const hasRole = require("../middleware/roles");

// Import controllers
const {
  createStationHandler,
  getMyStations,
  getStationById,
  getAllStations,
  getPublicStationById,
  updateStationHandler,
  deleteStationHandler,
} = require("../controllers/stationController");

// ===== PUBLIC ROUTES (No auth required) =====
// Get all approved stations (with filters)
router.get("/", getAllStations);

// ===== SPECIFIC ROUTES FIRST (BEFORE :id routes) =====
// Get stations owned by the authenticated owner
router.get(
  "/my-stations",
  authenticate,
  hasRole(["station_owner", "admin"]),
  getMyStations,
);

// ===== PARAMETER ROUTES SECOND =====
// Get a single approved station by ID (public)
router.get("/:id", getPublicStationById);

// Get a single station by ID (owner can view their own)
router.get(
  "/owner/:id",
  authenticate,
  hasRole(["station_owner", "admin"]),
  getStationById,
);

// ===== PROTECTED ROUTES (Auth required) =====
router.use(authenticate);

// Only station owners can create stations
router.post("/", hasRole(["station_owner", "admin"]), createStationHandler);

// Owner updates their station
router.put("/:id", hasRole(["station_owner", "admin"]), updateStationHandler);

// Owner deletes their station
router.delete(
  "/:id",
  hasRole(["station_owner", "admin"]),
  deleteStationHandler,
);

module.exports = router;
