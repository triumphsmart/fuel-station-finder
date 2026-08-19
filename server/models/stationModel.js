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

const getApprovedStations = async () => {
  const query = `
        SELECT 
            s.*,
            u.full_name as owner_name,
            u.email as owner_email
        FROM stations s
        LEFT JOIN users u ON s.owner_id = u.id
        WHERE s.status = 'approved'
        ORDER BY s.created_at DESC
    `;
  const result = await pool.query(query);
  return result.rows;
};

const getApprovedStationById = async (id) => {
  const query = `
        SELECT 
            s.*,
            u.full_name as owner_name,
            u.email as owner_email
        FROM stations s
        LEFT JOIN users u ON s.owner_id = u.id
        WHERE s.id = $1 AND s.status = 'approved'
    `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const getFilteredStations = async (filters) => {
  let query = `
        SELECT 
            s.*,
            u.full_name as owner_name,
            u.email as owner_email
        FROM stations s
        LEFT JOIN users u ON s.owner_id = u.id
        WHERE s.status = 'approved'
    `;

  const values = [];
  let paramCounter = 1;

  if (filters.city) {
    query += ` AND s.city ILIKE $${paramCounter}`;
    values.push(`%${filters.city}%`);
    paramCounter++;
  }

  if (filters.state) {
    query += ` AND s.state ILIKE $${paramCounter}`;
    values.push(`%${filters.state}%`);
    paramCounter++;
  }

  if (filters.fuel_type) {
    if (filters.fuel_type === "petrol") {
      query += ` AND s.petrol_available = true`;
    } else if (filters.fuel_type === "diesel") {
      query += ` AND s.diesel_available = true`;
    } else if (filters.fuel_type === "kerosene") {
      query += ` AND s.kerosene_available = true`;
    }
  }

  if (filters.is_open !== undefined) {
    query += ` AND s.is_open = $${paramCounter}`;
    values.push(filters.is_open);
    paramCounter++;
  }

  if (filters.max_price) {
    query += ` AND (s.petrol_price <= $${paramCounter} OR s.diesel_price <= $${paramCounter} OR s.kerosene_price <= $${paramCounter})`;
    values.push(parseFloat(filters.max_price));
    paramCounter++;
  }

  query += ` ORDER BY s.created_at DESC`;

  const result = await pool.query(query, values);
  return result.rows;
};

const updateStation = async (id, owner_id, updateData) => {
  const fields = [];
  const values = [];
  let paramCounter = 1;

  const fieldMap = {
    name: "name",
    address: "address",
    city: "city",
    state: "state",
    latitude: "latitude",
    longitude: "longitude",
    petrol_price: "petrol_price",
    diesel_price: "diesel_price",
    kerosene_price: "kerosene_price",
    petrol_available: "petrol_available",
    diesel_available: "diesel_available",
    kerosene_available: "kerosene_available",
    is_open: "is_open",
  };

  for (const [key, dbField] of Object.entries(fieldMap)) {
    if (updateData[key] !== undefined) {
      fields.push(`${dbField} = $${paramCounter}`);
      values.push(updateData[key]);
      paramCounter++;
    }
  }

  fields.push(`price_last_updated = CURRENT_TIMESTAMP`);
  fields.push(`updated_at = CURRENT_TIMESTAMP`);

  values.push(id);
  values.push(owner_id);

  const query = `
        UPDATE stations 
        SET ${fields.join(", ")}
        WHERE id = $${paramCounter} AND owner_id = $${paramCounter + 1}
        RETURNING *
    `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

const updateStationStatus = async (id, owner_id, status) => {
  const query = `
    UPDATE stations
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 AND owner_id = $3 
    RETURNING *
  `;
  const result = await pool.query(query, [status, id, owner_id]);
  return result.rows[0];
};

module.exports = {
  createStation,
  findStationById,
  findStationsByOwner,
  updateStation,
  updateStationStatus,
  getApprovedStations,
  getApprovedStationById,
  getFilteredStations,
};
