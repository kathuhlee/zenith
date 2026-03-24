const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

// ─── REGISTER ────────────────────────────────────────────
// POST /auth/register
// Body: { email, password }
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  // Basic validation — never trust what the client sends
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    // Hash the password — never store plain text
    // 10 is the "salt rounds" — how many times bcrypt scrambles it
    // More rounds = more secure but slower. 10 is the industry standard
    const password_hash = await bcrypt.hash(password, 10);

    // Insert the new user and return their id and email
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, password_hash]
    );

    const user = result.rows[0];

    // Sign a JWT — this is what the client stores and sends with future requests
    const token = jwt.sign(
      { userId: user.id, email: user.email },  // payload — data baked into the token
      process.env.JWT_SECRET,                   // secret — used to verify it later
      { expiresIn: "7d" }                       // token expires in 7 days
    );

    res.status(201).json({ token, user });

  } catch (err) {
    // Postgres error code 23505 = unique constraint violation = email already exists
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already in use" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── LOGIN ───────────────────────────────────────────────
// POST /auth/login
// Body: { email, password }
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Look up the user by email
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    // Don't tell them specifically whether email OR password was wrong —
    // that gives attackers information. Always say "invalid credentials"
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // bcrypt.compare hashes the attempt and compares it to the stored hash
    // You can never "unhash" — you can only compare
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Valid login — sign and return a fresh token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: { id: user.id, email: user.email } });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

