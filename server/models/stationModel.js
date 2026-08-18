const pool = require("../config/database");

const createStation = async (stationData) => {
  const {
    owner_id,
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
  } = stationData;

  const query = `
        INSERT INTO stations (
            owner_id, name, address, city, state, 
            latitude, longitude, 
            petrol_price, diesel_price, kerosene_price,
            petrol_available, diesel_available, kerosene_available,
            is_open, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'pending')
        RETURNING *
    `;

  const values = [
    owner_id,
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
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const findStationById = async (id) => {
  const query = "SELECT * FROM stations WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const findStationsByOwner = async (owner_id) => {
  const query =
    "SELECT * FROM stations WHERE owner_id = $1 ORDER BY created_at DESC";
  const result = await pool.query(query, [owner_id]);
  return result.rows;
};

module.exports = {
  createStation,
  findStationById,
  findStationsByOwner,
};
