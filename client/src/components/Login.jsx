import React, { useState } from "react";
import { validateEmail } from "../utils/validators";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });

      const body = await res.json();

      if (!res.ok) {
        setError(body.message || "Login failed.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Login successful! Redirecting…");
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" value={email}
               onChange={(e) => setEmail(e.target.value)} />

        <label>Password</label>
        <input type="password" value={password}
               onChange={(e) => setPassword(e.target.value)} />

        {error && <p className="error">{error}</p>}
        {successMsg && <p className="success">{successMsg}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}