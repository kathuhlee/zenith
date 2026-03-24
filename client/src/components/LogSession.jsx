import { useState } from "react";
import api from "../api/axios";
import styles from "./LogSession.module.css";

export default function LogSession({ onSessionLogged }) {
  const [form, setForm] = useState({
    task: "",
    duration: "",
    focus_score: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    // [e.target.name] is computed property syntax —
    // it uses the input's name attribute as the key
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await api.post("/sessions", {
        task:        form.task,
        duration:    parseInt(form.duration),     // convert string to number
        focus_score: parseInt(form.focus_score),  // convert string to number
        notes:       form.notes || null,
      });

      onSessionLogged(res.data);  // pass new session up to Dashboard

      // Reset form
      setForm({ task: "", duration: "", focus_score: "", notes: "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      setError(err.response?.data?.error || "Could not save session");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.heading}>Log a session</h2>
      <p className={styles.sub}>What did you work on?</p>

      <form onSubmit={handleSubmit} className={styles.form}>

        <div className={styles.field}>
          <label className={styles.label}>Task</label>
          <input
            name="task"
            type="text"
            className={styles.input}
            value={form.task}
            onChange={handleChange}
            placeholder="e.g. Built the sessions API"
            required
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Duration (minutes)</label>
            <input
              name="duration"
              type="number"
              className={styles.input}
              value={form.duration}
              onChange={handleChange}
              placeholder="45"
              min="1"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Focus score (1–10)</label>
            <input
              name="focus_score"
              type="number"
              className={styles.input}
              value={form.focus_score}
              onChange={handleChange}
              placeholder="8"
              min="1"
              max="10"
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Notes (optional)</label>
          <textarea
            name="notes"
            className={styles.textarea}
            value={form.notes}
            onChange={handleChange}
            placeholder="Any reflections on the session..."
            rows={3}
          />
        </div>

        {error   && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.successMsg}>Session logged!</p>}

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
        >
          {loading ? "Saving..." : "Log session"}
        </button>

      </form>
    </div>
  );
}
