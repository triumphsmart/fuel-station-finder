require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/database");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "Fuel Finder API is running!" });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as current_time");
    res.json({
      message: "Database connected successfully!",
      time: result.rows[0].current_time,
    });
  } catch (error) {
    console.error("Database test failed:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
