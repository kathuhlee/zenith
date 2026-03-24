import styles from "./SessionList.module.css";

export default function SessionList({ sessions, loading, error, onDelete }) {

  // Early returns handle each special case cleanly
  if (loading) return <p className={styles.message}>Loading sessions...</p>;
  if (error)   return <p className={styles.messageError}>{error}</p>;
  if (sessions.length === 0) return (
    <p className={styles.message}>
      No sessions yet — log your first one in the Log tab.
    </p>
  );

  return (
    <div className={styles.list}>
      {sessions.map((session) => (
        <div key={session.id} className={styles.card}>

          <div className={styles.cardTop}>
            <span className={styles.task}>{session.task}</span>
            <button
              className={styles.deleteBtn}
              onClick={() => onDelete(session.id)}
              title="Delete session"
            >
              ✕
            </button>
          </div>

          <div className={styles.meta}>
            <span className={styles.pill}>{session.duration} min</span>
            <span className={styles.pill}>
              Focus: {session.focus_score}/10
            </span>
            <span className={styles.date}>
              {new Date(session.created_at).toLocaleDateString("en-US", {
                month: "short",
                day:   "numeric",
                year:  "numeric",
              })}
            </span>
          </div>

          {session.notes && (
            <p className={styles.notes}>{session.notes}</p>
          )}

        </div>
      ))}
    </div>
  );
}
