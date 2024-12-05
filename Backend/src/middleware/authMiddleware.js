const jwt = require("jsonwebtoken");
const pool = require("../config/db");

exports.protect = async (req, res, next) => {
  try {
    // 1. Get token from header
    if (!req.headers.authorization?.startsWith('Bearer')) {
      return res.status(401).json({ 
        error: "Please provide a valid Bearer token in the Authorization header" 
      });
    }

    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ 
        error: "No token provided. Authorization denied." 
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 3. Check if user still exists in database
    const currentUser = await pool.query(
      "SELECT id, username, email FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (currentUser.rows.length === 0) {
      return res.status(401).json({ 
        error: "The user belonging to this token no longer exists." 
      });
    }

    // 4. Attach user information to request object
    req.user = {
      ...decoded,
      ...currentUser.rows[0],
      username: currentUser.rows[0].username, 
      email: currentUser.rows[0].email,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        error: "Access token expired. Please refresh your token." 
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        error: "Invalid token. Please log in again." 
      });
    }
    console.error("Auth middleware error:", error);
    res.status(401).json({ 
      error: "Authentication failed. Please try again." 
    });
  }
};

// Optional: Middleware to validate refresh token
exports.validateRefreshToken = (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        error: "Refresh token is required" 
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        error: "Refresh token expired. Please log in again." 
      });
    }
    console.error("Refresh token validation error:", error);
    res.status(401).json({ 
      error: "Invalid refresh token. Please log in again." 
    });
  }
};