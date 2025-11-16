import React, { useState } from "react";
import { calculateStrength } from "../utils/passwordStrength";

export default function PasswordAnalyzer() {
  const [password, setPassword] = useState("");
  const [result, setResult] = useState(null);

  const handleAnalyze = () => {
    const analysis = calculateStrength(password);
    setResult(analysis);
  };

  return (
    <div>
      <h2>Password Strength Analyzer</h2>
      <input 
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleAnalyze}>Analyze</button>

      {result && (
        <div>
          <p>Strength: {result.level}</p>
          <ul>
            {result.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}