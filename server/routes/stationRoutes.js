const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");
const hasRole = require("../middleware/roles");

const {
  createStationHandler,
  getMyStations,
  getStationById,
} = require("../controllers/stationController");

router.use(authenticate);

router.post("/", hasRole(["station_owner", "admin"]), createStationHandler);

router.get("/my-stations", hasRole(["station_owner", "admin"]), getMyStations);

router.get("/:id", hasRole(["station_owner", "admin"]), getStationById);

module.exports = router;
