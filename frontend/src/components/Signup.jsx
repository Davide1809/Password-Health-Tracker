import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Funzioni di Validazione integrate nel componente
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

const passwordRequirementsText = {
  length: "At least 8 characters long",
  upper: "Includes an uppercase letter (A-Z)",
  lower: "Includes a lowercase letter (a-z)",
  number: "Includes a number (0-9)",
  symbol: "Includes a special character (!, @, #, $ etc.)",
};

function validatePassword(password) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
}

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [passwordMeta, setPasswordMeta] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    symbol: false,
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  function handlePasswordChange(e) {
    const val = e.target.value;
    setPassword(val);
    setPasswordMeta(validatePassword(val));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // client-side checks
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    const passMeta = validatePassword(password);
    const passOk = Object.values(passMeta).every(Boolean);
    if (!passOk) {
      setError("Password does not meet security requirements.");
      return;
    }

    setLoading(true);
    try {
      // **CORREZIONE**: Aggiunta di credentials: 'include' per inviare i cookie di sessione
      const res = await fetch("/api/signup", {
        method: "POST",
        credentials: 'include', 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });

      const body = await res.json();
      console.log("Response status:", res.status);
      console.log("Response body:", body);

      if (!res.ok) {
        setError(body.message || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Successo
      setSuccessMsg("Account created successfully! Redirecting…");
      
      // piccolo ritardo per mostrare la conferma
      setTimeout(() => {
        navigate("/dashboard");
      }, 900);
    } catch (err) {
      console.error("Signup error:", err);
      setError("Network error. Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-card p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg space-y-4 m-8">
      <h2 className="text-2xl font-bold text-gray-800 text-center">Create account</h2>

      <form onSubmit={handleSubmit} className="signup-form space-y-4" noValidate>
        <label className="block">
          <span className="text-gray-700 font-medium">Email</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            aria-invalid={error && !validateEmail(email)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Password</span>
          <input
            type="password"
            name="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Create a strong password"
            required
            aria-describedby="pw-requirements"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </label>

        <div id="pw-requirements" className="pw-requirements text-sm text-gray-600 space-y-1 p-2 bg-gray-50 rounded-md">
          <p className="font-semibold">Password requirements:</p>
          <ul className="list-none p-0 m-0 space-y-0.5">
            {Object.entries(passwordRequirementsText).map(([key, text]) => (
              <li 
                key={key} 
                className={`flex items-center transition duration-150 ${passwordMeta[key] ? "text-green-600" : "text-red-500"}`}
              >
                <span className="w-4 h-4 mr-1">
                  {passwordMeta[key] ? "✓" : "•"}
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {error && <div className="p-2 text-red-700 bg-red-100 rounded-lg text-sm">{error}</div>}
        {successMsg && <div className="p-2 text-green-700 bg-green-100 rounded-lg text-sm">{successMsg}</div>}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </div>
  );
}