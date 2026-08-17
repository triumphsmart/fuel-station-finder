const bcrypt = require("bcryptjs");
const { createUser, findUserByEmail } = require("../models/userModel");

const register = async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({
        error: "Missing required fields: full_name, email, password, role",
      });
    }

    const validRoles = ["driver", "station_owner", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: "Invalid role. Must be: driver, station_owner, or admin",
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: "Email already registered. Please login.",
      });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const newUser = await createUser(
      full_name,
      email,
      phone,
      password_hash,
      role,
    );

    res.status(201).json({
      message: "User registered successfully!",
      user: newUser,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Internal server error. Please try again.",
    });
  }
};

module.exports = {
  register,
};
