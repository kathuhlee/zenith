import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // On first load — check if a token already exists in localStorage
  // so the user doesn't have to log in again after a refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Token exists — treat as logged in
      // In a production app you'd verify it with the server
      // For now we trust it and let the API reject it if expired
      setUser({ token });
    }
    setChecking(false);
  }, []);

  function handleLogin(userData) {
    setUser(userData);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  // Don't flash the login screen while checking localStorage
  if (checking) return null;

  return user
    ? <Dashboard user={user} onLogout={handleLogout} />
    : <Login onLogin={handleLogin} />;
}
