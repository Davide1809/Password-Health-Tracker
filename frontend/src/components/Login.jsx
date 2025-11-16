import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Funzione di validazione dell'email (definita internamente per risolvere l'errore di importazione)
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

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
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      // **CORREZIONE**: Aggiunta di credentials: 'include' per inviare i cookie di sessione
      const res = await fetch("/api/login", {
        method: "POST",
        credentials: 'include', 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = await res.json();
      if (!res.ok) {
        setError(body.message || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // ✅ Only access localStorage in the browser
      if (typeof window !== "undefined") {
        localStorage.setItem("userEmail", email);
      }

      setSuccessMsg("Login successful! Redirecting…");
      setTimeout(() => {
        navigate("/dashboard");
      }, 900);
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-card p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg space-y-4 m-8">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Login</h2>
      <form onSubmit={handleSubmit} className="login-form space-y-4" noValidate>
        <label className="block">
          <span className="text-gray-700 font-medium">Email</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Password</span>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </label>

        {error && <div className="p-2 text-red-700 bg-red-100 rounded-lg text-sm">{error}</div>}
        {successMsg && <div className="p-2 text-green-700 bg-green-100 rounded-lg text-sm">{successMsg}</div>}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </div>
  );
}