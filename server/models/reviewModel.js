const pool = require("../config/database");

// Create a new review
const createReview = async (station_id, driver_id, rating, comment) => {
  // Check if user already reviewed this station
  const checkQuery =
    "SELECT id FROM reviews WHERE station_id = $1 AND driver_id = $2";
  const checkResult = await pool.query(checkQuery, [station_id, driver_id]);

  if (checkResult.rows.length > 0) {
    // Update existing review
    const updateQuery = `
            UPDATE reviews 
            SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
            WHERE station_id = $3 AND driver_id = $4
            RETURNING *
        `;
    const result = await pool.query(updateQuery, [
      rating,
      comment,
      station_id,
      driver_id,
    ]);
    return result.rows[0];
  } else {
    // Create new review
    const insertQuery = `
            INSERT INTO reviews (station_id, driver_id, rating, comment)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
    const result = await pool.query(insertQuery, [
      station_id,
      driver_id,
      rating,
      comment,
    ]);
    return result.rows[0];
  }
};

// Get reviews for a station
const getReviewsForStation = async (station_id) => {
  const query = `
        SELECT 
            r.*,
            u.full_name as reviewer_name
        FROM reviews r
        LEFT JOIN users u ON r.driver_id = u.id
        WHERE r.station_id = $1
        ORDER BY r.created_at DESC
    `;
  const result = await pool.query(query, [station_id]);
  return result.rows;
};

// Get average rating for a station
const getAverageRating = async (station_id) => {
  const query = `
        SELECT 
            COALESCE(AVG(rating), 0) as average_rating,
            COUNT(*) as total_reviews
        FROM reviews
        WHERE station_id = $1
    `;
  const result = await pool.query(query, [station_id]);
  return {
    average_rating: parseFloat(result.rows[0].average_rating) || 0,
    total_reviews: parseInt(result.rows[0].total_reviews) || 0,
  };
};

module.exports = {
  createReview,
  getReviewsForStation,
  getAverageRating,
};
