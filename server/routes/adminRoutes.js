const express = require("express");
const router = express.Router();

// Import middleware
const authenticate = require("../middleware/auth");
const hasRole = require("../middleware/roles");

// Import controllers
const {
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
} = require("../controllers/adminController");

// ===== PROTECT ALL ADMIN ROUTES =====
router.use(authenticate);
router.use(hasRole(["admin"]));

// ===== STATION ROUTES =====
// GET - list all stations (with optional filters)
router.get("/stations/all", getAllStations);

// GET - list all pending stations
router.get("/stations/pending", getPendingStations);

// PUT - approve a station
router.put("/stations/:id/approve", approveStation);

// PUT - reject a station
router.put("/stations/:id/reject", rejectStation);

// DELETE - permanently delete a station
router.delete("/stations/:id", adminDeleteStation);

// ===== USER ROUTES =====
// GET - list all users
router.get("/users", getAllUsers);

// GET - get a single user by ID
router.get("/users/:id", getUserById);

// PUT - activate a user
router.put("/users/:id/activate", activateUser);

// PUT - deactivate a user
router.put("/users/:id/deactivate", deactivateUser);

// DELETE - permanently delete a user
router.delete("/users/:id", deleteUser);

module.exports = router;
