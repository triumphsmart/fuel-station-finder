const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");
const hasRole = require("../middleware/roles");

const {
  leaveReview,
  getStationReviews,
} = require("../controllers/reviewController");

router.get("/:id/reviews", getStationReviews);

router.post("/:id/reviews", authenticate, hasRole(["driver"]), leaveReview);

module.exports = router;
