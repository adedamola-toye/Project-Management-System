const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const nodemailer = require("nodemailer"); // Make sure to require nodemailer

async function sendVerificationEmail(user) {
  try {
    // Generate a token for email verification
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    // Construct the verification URL
    const verificationUrl = `${process.env.BACKEND_BASE_URL}/auth/verify-email?token=${token}`;

    // Set up the transporter to send the email via Gmail (or another service if you wish)
    const transporter = nodemailer.createTransport({
      service: "gmail", // You can replace this with another service like SendGrid, SES, etc.
      auth: {
        user: process.env.EMAIL_USER, // Your email address (Gmail address)
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Please verify your email address",
      text: `Click the following link to verify your email: ${verificationUrl}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error(
      "Could not send verification email. Please try again later."
    );
  }
}

module.exports.signup = async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ error: "Please provide username, email, and password." });
  }

  try {
    // Check if user already exists
    const userExists = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User already exists. Email currently in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password_hash, created_at, updated_at, updated_by, is_verified) VALUES ($1, $2, $3, $4) RETURNING id, username, email",
      [username, email, hashedPassword,new Date(), new Date(), username, false] // Set 'is_verified' to false
    );

    // Send the verification email
    await sendVerificationEmail(newUser.rows[0]);

    res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
      user: newUser.rows[0]
   });
   
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "No token provided." });
  }

  try {
    // Decode the token to get the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Find the user in the database
    const user = await pool.query("SELECT * FROM users WHERE id=$1", [
      decoded.userId,
    ]);

    if (!user.rows.length) {
      return res
        .status(400)
        .json({ error: "Invalid token or user not found." });
    }

    if (user.rows[0].is_verified) {
      return res.status(400).json({ error: "Email already verified." });
    }

    // Mark the user as verified
    await pool.query("UPDATE users SET is_verified = true WHERE id = $1", [
      user.rows[0].id,
    ]);

    res
      .status(200)
      .json({ message: "Email verified successfully! You can now log in." });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(400)
        .json({
          error: "Token expired. Please request a new verification email.",
        });
    }

    console.error(error);
    res.status(400).json({ error: "Invalid or expired token." });
  }
};

module.exports.resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    if (!user.rows.length) {
      return res.status(400).json({ error: "No user found with this email." });
    }

    if (user.rows[0].is_verified) {
      return res.status(400).json({ error: "This email is already verified." });
    }

    await sendVerificationEmail(user.rows[0]);

    res.status(200).json({ message: "Verification email sent successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
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
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check if the user's email is verified
    if (!user.rows[0].is_verified) {
      return res
        .status(400)
        .json({ error: "Email not verified. Please verify your email first." });
    }

    // Compare the password with the stored hashed password
    const isAMatch = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isAMatch) {
      return res.status(400).json({ error: "Invalid credentials (password)" });
    }

    // Generate a JWT token
    const token = jwt.sign(
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
      accessToken: token,
      refreshToken: refreshToken,
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
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_KEY
    );
    const user = await pool.query("SELECT * FROM users WHERE id=$1", [
      decoded.userId,
    ]);

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
    res.status(400).json({ error: "Invalid or expired refresh token." });
  }
};
