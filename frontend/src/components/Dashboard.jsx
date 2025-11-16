import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Funzione per gestire il logout
  const handleLogout = async () => {
    try {
      // Invia il cookie per terminare la sessione lato server
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: 'include', 
      });

      if (res.ok) {
        // Rimuove l'email locale e reindirizza
        localStorage.removeItem("userEmail");
        navigate("/login");
      } else {
        setError("Logout failed. Please try again.");
      }
    } catch (err) {
      console.error("Logout Network Error:", err);
      setError("Network error during logout.");
    }
  };


  useEffect(() => {
    // Funzione per caricare i dati protetti
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // **CORREZIONE 1**: Usare il percorso relativo /api/dashboard
        // **CORREZIONE 2**: Usare credentials: 'include' per inviare il cookie
        const res = await fetch("/api/dashboard", {
          method: "GET",
          credentials: 'include', 
        });

        if (res.status === 401) {
          // Non autorizzato (sessione scaduta o mancante). Reindirizza al login.
          console.log("Authentication failed, redirecting to login.");
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch dashboard data.");
        }

        const body = await res.json();
        setData(body.message); // Qui dovrebbe esserci "Welcome [email]!"
        
      } catch (err) {
        console.error("Dashboard data error:", err);
        setError("Failed to load dashboard data. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]); 

  // --- Rendering UI ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-indigo-600 font-semibold">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <p className="text-lg text-red-600 mb-4">{error}</p>
        <button 
            onClick={() => navigate('/login')}
            className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md"
        >
            Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
      <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-2xl space-y-6">
        <h1 className="text-3xl font-bold text-indigo-700 border-b pb-2">User Dashboard</h1>
        
        <p className="text-lg text-gray-700 font-medium">{data}</p>
        
        <p className="text-sm text-gray-500">
            This message is fetched from the protected Flask endpoint (/api/dashboard), 
            confirming that session authentication with cookies is now working correctly.
        </p>

        <button 
          onClick={handleLogout}
          className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}