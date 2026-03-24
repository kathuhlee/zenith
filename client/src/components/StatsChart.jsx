import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import styles from "./StatsChart.module.css";

export default function StatsChart({ sessions }) {

  if (sessions.length === 0) {
    return (
      <p className={styles.empty}>
        No data yet — log some sessions to see your stats.
      </p>
    );
  }

  // Group sessions by day and sum duration
  // reduce() builds an object like: { "Mar 18": 90, "Mar 19": 45 }
  const byDay = sessions.reduce((acc, session) => {
    const day = new Date(session.created_at).toLocaleDateString("en-US", {
      month: "short",
      day:   "numeric",
    });
    acc[day] = (acc[day] || 0) + session.duration;
    return acc;
  }, {});

  // Convert to array Recharts can read: [{ day: "Mar 18", minutes: 90 }, ...]
  const chartData = Object.entries(byDay)
    .map(([day, minutes]) => ({ day, minutes }))
    .slice(-7); // last 7 days only

  // Same grouping for average focus score per day
  const focusByDay = sessions.reduce((acc, session) => {
    const day = new Date(session.created_at).toLocaleDateString("en-US", {
      month: "short",
      day:   "numeric",
    });
    if (!acc[day]) acc[day] = { total: 0, count: 0 };
    acc[day].total += session.focus_score;
    acc[day].count += 1;
    return acc;
  }, {});

  const focusData = Object.entries(focusByDay)
    .map(([day, { total, count }]) => ({
      day,
      avg: parseFloat((total / count).toFixed(1)),
    }))
    .slice(-7);

  return (
    <div className={styles.wrap}>

      <div className={styles.section}>
        <h3 className={styles.chartTitle}>Minutes worked per day</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [`${value} min`, "Duration"]}
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
            />
            <Bar dataKey="minutes" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.section}>
        <h3 className={styles.chartTitle}>Average focus score per day</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={focusData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [`${value}/10`, "Avg focus"]}
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
            />
            <Bar dataKey="avg" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
