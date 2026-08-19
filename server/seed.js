const pool = require("./config/database");
const bcrypt = require("bcryptjs");

const seedAdmin = async () => {
  try {
    console.log("Checking if admin exists...");

    // Check if admin already exists
    const checkQuery = "SELECT * FROM users WHERE email = $1";
    const checkResult = await pool.query(checkQuery, ["admin@gofuel.com"]);

    if (checkResult.rows.length > 0) {
      console.log("Admin already exists.");
      console.log("Email: admin@gofuel.com");
      console.log("Password: admin123");
      pool.end();
      return;
    }

    console.log("👤 Creating admin account...");

    // Hash the password
    const password_hash = await bcrypt.hash("admin123", 10);

    // Insert admin
    const query = `
            INSERT INTO users (full_name, email, phone, password_hash, role, is_active)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, full_name, email, role
        `;

    const result = await pool.query(query, [
      "GoFuel Admin",
      "admin@gofuel.com",
      "08012345678",
      password_hash,
      "admin",
      true,
    ]);

    console.log("Admin created successfully!");
    console.log("Email: admin@gofuel.com");
    console.log("Password: admin123");
    console.log("User:", result.rows[0]);
  } catch (error) {
    console.error("Seed error:", error.message);
  } finally {
    pool.end();
  }
};

// Run the seed
seedAdmin();
