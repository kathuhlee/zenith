import { useState, useEffect } from "react";
import api from "../api/axios";
import LogSession from "../components/LogSession";
import SessionList from "../components/SessionList";
import StatsChart from "../components/StatsChart";
import styles from "./Dashboard.module.css";

export default function Dashboard({ user, onLogout }) {
  const [sessions, setSessions]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState("log"); // "log" | "history" | "stats"

  // Load sessions when dashboard first mounts
  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/sessions");
      setSessions(res.data);
    } catch (err) {
      setError("Could not load sessions");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/sessions/${id}`);
      // Remove from local state without refetching — faster UX
      setSessions(sessions.filter((s) => s.id !== id));
    } catch (err) {
      alert("Could not delete session");
    }
  }

  // Called by LogSession when a new session is saved
  // Prepends to local state so it appears immediately at the top
  function handleSessionLogged(newSession) {
    setSessions([newSession, ...sessions]);
    setActiveTab("history"); // switch to history tab so they see it
  }

  return (
    <div className={styles.page}>

      {/* ── Top nav ─────────────────────────────── */}
      <header className={styles.header}>
        <h1 className={styles.logo}>Zenith</h1>
        <div className={styles.headerRight}>
          <span className={styles.userEmail}>
            {user?.email || ""}
          </span>
          <button className={styles.logoutBtn} onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* ── Stats summary bar ───────────────────── */}
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{sessions.length}</span>
          <span className={styles.statLabel}>Total sessions</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>
            {sessions.length > 0
              ? Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / 60)
              : 0}h
          </span>
          <span className={styles.statLabel}>Total hours</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>
            {sessions.length > 0
              ? (sessions.reduce((sum, s) => sum + s.focus_score, 0) / sessions.length).toFixed(1)
              : "—"}
          </span>
          <span className={styles.statLabel}>Avg focus score</span>
        </div>
      </div>

      {/* ── Tab navigation ──────────────────────── */}
      <div className={styles.tabs}>
        {["log", "history", "stats"].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Tab content ─────────────────────────── */}
      <main className={styles.content}>
        {activeTab === "log" && (
          <LogSession onSessionLogged={handleSessionLogged} />
        )}
        {activeTab === "history" && (
          <SessionList
            sessions={sessions}
            loading={loading}
            error={error}
            onDelete={handleDelete}
          />
        )}
        {activeTab === "stats" && (
          <StatsChart sessions={sessions} />
        )}
      </main>

    </div>
  );
}
