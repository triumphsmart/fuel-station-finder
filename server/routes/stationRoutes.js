const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");
const hasRole = require("../middleware/roles");

const {
  createStationHandler,
  getMyStations,
  getStationById,
  getAllStations,
  getPublicStationById,
  updateStationHandler,
} = require("../controllers/stationController");

router.get("/", getAllStations); // Public route to get all approved stations
router.get("/:id", getPublicStationById); // Public route to get a single approved station by ID

router.use(authenticate);

router.post("/", hasRole(["station_owner", "admin"]), createStationHandler);

router.get("/my-stations", hasRole(["station_owner", "admin"]), getMyStations);

router.get("/:id", hasRole(["station_owner", "admin"]), getStationById);

router.put("/:id", hasRole(["station_owner", "admin"]), updateStationHandler);

module.exports = router;
