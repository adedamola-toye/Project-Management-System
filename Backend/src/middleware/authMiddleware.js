// src/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");

// Middleware to protect routes
exports.protect = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res
      .status(401)
      .json({ error: "No token provided. Authorization denied." });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Attach user information to request object
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Access token expired" });
    }
    console.error(error);
    res.status(401).json({ error: "Invalid or expired token." });
  }
};
