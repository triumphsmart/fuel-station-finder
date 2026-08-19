const {
  createReview,
  getReviewsForStation,
  getAverageRating,
} = require("../models/reviewModel");
const { findStationById } = require("../models/stationModel");

// Leave a review (driver only)
const leaveReview = async (req, res) => {
  try {
    const { id: station_id } = req.params;
    const driver_id = req.user.userId;
    const { rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Rating must be between 1 and 5",
      });
    }

    // Check if station exists and is approved
    const station = await findStationById(station_id);
    if (!station) {
      return res.status(404).json({
        error: "Station not found",
      });
    }
    if (station.status !== "approved") {
      return res.status(403).json({
        error: "Cannot review a station that is not yet approved",
      });
    }

    // Check if user is a driver
    if (req.user.role !== "driver") {
      return res.status(403).json({
        error: "Only drivers can leave reviews",
      });
    }

    // Create or update review
    const review = await createReview(
      station_id,
      driver_id,
      rating,
      comment || null,
    );

    // Get updated average rating
    const stats = await getAverageRating(station_id);

    res.status(201).json({
      message: "Review submitted successfully!",
      review: review,
      average_rating: stats.average_rating,
      total_reviews: stats.total_reviews,
    });
  } catch (error) {
    console.error("Leave review error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
};

// Get reviews for a station (public)
const getStationReviews = async (req, res) => {
  try {
    const { id: station_id } = req.params;

    // Check if station exists and is approved
    const station = await findStationById(station_id);
    if (!station || station.status !== "approved") {
      return res.status(404).json({
        error: "Station not found or not yet approved",
      });
    }

    const reviews = await getReviewsForStation(station_id);
    const stats = await getAverageRating(station_id);

    res.json({
      reviews: reviews,
      average_rating: stats.average_rating,
      total_reviews: stats.total_reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
};

module.exports = {
  leaveReview,
  getStationReviews,
};
