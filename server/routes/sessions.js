const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

// Every route in this file is protected —
// authenticateToken runs before every handler below
router.use(authenticateToken);

// ─── GET ALL SESSIONS ─────────────────────────────────────
// GET /sessions
// Returns all sessions for the logged-in user, newest first
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM sessions WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── CREATE A SESSION ─────────────────────────────────────
// POST /sessions
// Body: { task, duration, focus_score, notes }
router.post("/", async (req, res) => {
  const { task, duration, focus_score, notes } = req.body;

  if (!task || !duration || !focus_score) {
    return res.status(400).json({ error: "task, duration and focus_score are required" });
  }

  if (focus_score < 1 || focus_score > 10) {
    return res.status(400).json({ error: "focus_score must be between 1 and 10" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO sessions (user_id, task, duration, focus_score, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.userId, task, duration, focus_score, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── DELETE A SESSION ─────────────────────────────────────
// DELETE /sessions/:id
// Can only delete your own sessions
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM sessions WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.userId]
    );

    // If nothing was deleted, either it doesn't exist or belongs to someone else
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({ message: "Session deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
