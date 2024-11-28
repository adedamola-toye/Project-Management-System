const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const nodemailer = require('nodemailer');  // Make sure to require nodemailer

async function sendVerificationEmail(user) {
    // Generate a token for email verification
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    const verificationUrl = `http://localhost:3000/auth/verify-email?token=${token}`; //Replace with actual production domain

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,  // Your email address
            pass: process.env.EMAIL_PASS,  // Your email password
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Please verify your email address',
        text: `Click the following link to verify your email: ${verificationUrl}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
}

exports.signup = async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Please provide username, email, and password.' });
    }

    try {
        // Check if user already exists
        const userExists = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists. Email currently in use.' });
        }

     
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash, is_verified) VALUES ($1, $2, $3, $4) RETURNING id, username, email',
            [username, email, hashedPassword, false]  // Set 'is_verified' to false
        );

        // Send the verification email
        await sendVerificationEmail(newUser.rows[0]);

        res.status(201).json({
            message: 'Registration successful. Please check your email to verify your account.',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.verifyEmail = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: "No token provided." });
    }

    try {
        // Decode the token to get the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Find the user in the database
        const user = await pool.query('SELECT * FROM users WHERE id=$1', [decoded.userId]);

        if (!user.rows.length) {
            return res.status(400).json({ error: 'Invalid token or user not found.' });
        }

        if (user.rows[0].is_verified) {
            return res.status(400).json({ error: 'Email already verified.' });
        }

        // Mark the user as verified
        await pool.query('UPDATE users SET is_verified = true WHERE id = $1', [user.rows[0].id]);

        res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(400).json({ error: 'Token expired. Please request a new verification email.' });
        }

        console.error(error);
        res.status(400).json({ error: 'Invalid or expired token.' });
    }
};

exports.resendVerificationEmail = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required." });
    }

    try {
        const user = await pool.query('SELECT * FROM users WHERE email=$1', [email]);

        if (!user.rows.length) {
            return res.status(400).json({ error: 'No user found with this email.' });
        }

        if (user.rows[0].is_verified) {
            return res.status(400).json({ error: 'This email is already verified.' });
        }

        await sendVerificationEmail(user.rows[0]);

        res.status(200).json({ message: 'Verification email sent successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error.' });
    }
};



exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Please provide your email and password" });
    }

    try {
        // Find user by email
        const user = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Check if the user's email is verified
        if (!user.rows[0].is_verified) {
            return res.status(400).json({ error: "Email not verified. Please verify your email first." });
        }

        // Compare the password with the stored hashed password
        const isAMatch = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!isAMatch) {
            return res.status(400).json({ error: 'Invalid credentials (password)' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: user.rows[0].id, username: user.rows[0].username },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { userId: user.rows[0].id, username: user.rows[0].username },
            process.env.JWT_REFRESH_SECRET_KEY,
            { expiresIn: '30d' }
        );

        res.json({
            accessToken: token,
            refreshToken: refreshToken,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};