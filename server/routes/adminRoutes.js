const express = require("express");
const router = express.Router();

// Import middleware
const authenticate = require("../middleware/auth");
const hasRole = require("../middleware/roles");

// Import controllers
const {
  getPendingStations,
  approveStation,
  rejectStation,
  getAllUsers,
  deactivateUser,
} = require("../controllers/adminController");

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(hasRole(["admin"]));

// Station management
router.get("/stations/pending", getPendingStations);
router.put("/stations/:id/approve", approveStation);
router.put("/stations/:id/reject", rejectStation);

// User management
router.get("/users", getAllUsers);
router.delete("/users/:id", deactivateUser);

module.exports = router;
