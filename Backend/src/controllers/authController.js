const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

module.exports.signup = async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ error: "Please provide username, email, and password." });
  }

  try {
    // Check if user already exists
    const userExists = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User already exists. Email currently in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password_hash, created_at, updated_at, updated_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email",
      [username, email, hashedPassword, new Date(), new Date(), username]
    );

    
    const accessToken = jwt.sign(
      { userId: newUser.rows[0].id, username: newUser.rows[0].username },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { userId: newUser.rows[0].id, username: newUser.rows[0].username },
      process.env.JWT_REFRESH_SECRET_KEY,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      message: "Registration successful",
      user: newUser.rows[0],
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Please provide your email and password" });
  }

  try {
    // Find user by email
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }


    const isAMatch = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isAMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.rows[0].id, username: user.rows[0].username },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { userId: user.rows[0].id, username: user.rows[0].username },
      process.env.JWT_REFRESH_SECRET_KEY,
      { expiresIn: "30d" }
    );

    res.json({
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
    const user = await pool.query("SELECT * FROM users WHERE id=$1", [decoded.userId]);

    if (!user.rows.length) {
      return res.status(400).json({ error: "User not found" });
    }

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { userId: user.rows[0].id, username: user.rows[0].username },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Invalid or expired refresh token" });
  }
};