export default function Dashboard({ user, onLogout }) {
  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}
