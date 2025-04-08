import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './components/Homepage';
import Signup from './components/Signup';
import Resetpwd from './components/Resetpwd';
import Landingpage from './components/Landingpage';
import  axios from 'axios';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Initialize to null
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await axios.get("http://127.0.0.1:8000/api/token/verify/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsAuthenticated(true);
          console.log('App: isAuthenticated set to true');
        } catch (error) {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          console.log('App: isAuthenticated set to false');
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();

    const handleStorageChange = () => {
      checkAuth(); // Re-check on storage changes
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landingpage />} />
        <Route
          path="/signup"
          element={
            isAuthenticated === false ? (
              <Signup isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
            ) : (
              <Navigate to="/homepage" />
            )
          }
        />
       <Route path="/reset-password/:uid/:token" element={<Resetpwd />} />
        {/* Protected route - Homepage requires authentication */}
        <Route
          path="/homepage"
          element={
            isAuthenticated === true ? <Homepage /> : <Navigate to="/signup" />
          }
        />
        {/* Catch all other routes and redirect appropriately */}
        <Route
          path="*"
          element={isAuthenticated === true ? <Navigate to="/" /> : <Navigate to="/signup" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;