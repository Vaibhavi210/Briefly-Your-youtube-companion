import React, { useState, useEffect } from 'react';
import { Spinner, Card } from "react-bootstrap";
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';  
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ContentGenerator from './ContentGenerator'; 
import './style.css';
export default function Homepage() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [audioUrl, setAudioUrl] = useState(null);
  const [language, setLanguage] = useState("en");
  const [podcastLoading, setPodcastLoading] = useState(false);
  const [showContentGenerator, setShowContentGenerator] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  // Animation effect on load
  useEffect(() => {
    setFadeIn(true);
  }, []);

  // Animation when summary is generated
  useEffect(() => {
    if (summary) {
      const timer = setTimeout(() => {
        const element = document.getElementById('summary-card');
        if (element) {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [summary]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event('storage'));
    navigate("/signup");
  };

  const getSummary = async () => {
    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    
    
      const response = await fetch(`${backendUrl}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, language }),
      });
      const data = await response.json();
      if (data.summary) {
        setSummary(data.summary);
        setShowContentGenerator(false); // Reset content generator view when new summary is generated
      }
      else alert("Error: " + data.error);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        alert('Too many requests. Please wait a moment before trying again.');
    }else{
      console.error("Error fetching summary:", error);}
    }
    setLoading(false);
  };

  const convertToAudio = async () => {
    if (!summary.trim()) {
      alert("Please summarize a video first!");
      return;
    }
    setPodcastLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/text-to-speech`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: summary }),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const audioBlob = await response.blob();
      setAudioUrl(URL.createObjectURL(audioBlob));
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate podcast. Check console for details.");
    } finally {
      setPodcastLoading(false);
    }
  };

  const toggleContentGenerator = () => {
    setShowContentGenerator(!showContentGenerator);
  };

  // CSS for animations
  const fadeInStyle = {
    opacity: fadeIn ? 1 : 0,
    transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out'
  };

  const pulseAnimation = {
    animation: 'pulse 2s infinite',
  };

  return (
    <div className="dark-theme" style={{ 
      backgroundColor: '#1a2639', 
      minHeight: '100vh',
      color: '#e0e0e0'
    }}>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideInRight {
            from { transform: translateX(50px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          .btn-hover {
            transition: all 0.3s ease;
          }
          
          .btn-hover:hover {
            transform: translateY(-3px);
            box-shadow: 0 7px 14px rgba(0, 0, 0, 0.25);
          }
          
          .input-focus {
            transition: all 0.3s ease-in-out;
          }
          
          .input-focus:focus {
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
            transform: scale(1.01);
          }
        `}
      </style>
      
      {/* Enhanced Navbar with gradient */}
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top" style={{ 
        background: 'linear-gradient(to right,rgb(54, 103, 135),rgb(27, 57, 67),rgb(10, 65, 89))',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        animation: 'gradientShift 15s ease infinite',
        backgroundSize: '200% 200%'
      }}>
        <div className="container d-flex justify-content-between">
          <Link className="navbar-brand fw-bold" to="/" style={{ 
            fontSize: '2rem',
            transition: 'transform 0.3s ease-in-out'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <i className="bi bi-youtube me-2" style={{ color: '#ff0000' }}></i>
            Briefly.
          </Link>
          <button 
            onClick={handleLogout} 
            className="btn btn-outline-danger btn-hover" 
            style={{ 
              borderRadius: '20px', 
              padding: '6px 18px',
              transition: 'all 0.3s ease'
            }}
          >
            <i className="bi bi-box-arrow-right me-1"></i> Logout
          </button>
        </div>
      </nav>

      <div className="container mt-5 pt-5 d-flex justify-content-center align-items-center min-vh-100">
        <div className="row w-100">
          <div className="col-md-8 mx-auto" style={fadeInStyle}>
            <div className="p-4 rounded shadow-lg" style={{ 
              maxHeight: '85vh', 
              overflowY: 'auto',
              background: 'linear-gradient(145deg, #223a5e, #143055)',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <h1 className="text-center mb-3 text-white" style={{ 
                fontWeight: '600',
                animation: 'fadeIn 1s ease-out'
              }}>
                <span style={{ color: '#64ffda' }}>Summarize</span> Your Videos
              </h1>
              <p className="text-center text-light opacity-75" style={{
                animation: 'fadeIn 1.2s ease-out'
              }}>Enter a YouTube video URL and select a language</p>
              
              <div className="input-group mb-3 shadow" style={{
                animation: 'fadeIn 1.4s ease-out'
              }}>
                <span className="input-group-text" style={{
                  background: 'rgba(168, 200, 247, 0.8)',
                  color: '#64ffda',
                  border: 'none'
                }}>
                  <i className="bi bi-link-45deg"></i>
                </span>
                <input 
                  className="form-control  input-focus white-placeholder" 
                  placeholder="Enter YouTube URL" 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)}
                  style={{ 
                    background: 'rgba(168, 200, 247, 0.8)', 
                    color: 'white', 
                    border: 'none' ,
                    '::placeholder': { color: 'white' } // This won't work in inline styles
                    
                  }}
                />
              </div>
              
              <div className="d-flex justify-content-between gap-2 mb-4" style={{
                animation: 'fadeIn 1.6s ease-out'
              }}>
                
                <select
  className="form-select input-focus"
  value={language}
  onChange={(e) => setLanguage(e.target.value)}
  style={{
    background: 'rgba(106, 156, 231, 0.6)',
    color: 'white',
    borderRadius: '6px',
    border: 'none',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
    width: 'auto',  // This makes the width fit the content
    minWidth: '100px'  // Optional: ensures a minimum width
  }}
>
  <option value="en" style={{ backgroundColor: '#1e3a5c', color: 'white' }}>English</option>
  <option value="es" style={{ backgroundColor: '#1e3a5c', color: 'white' }}>Spanish</option>
  <option value="fr" style={{ backgroundColor: '#1e3a5c', color: 'white' }}>French</option>
  <option value="hi" style={{ backgroundColor: '#1e3a5c', color: 'white' }}>Hindi</option>
  <option value="de" style={{ backgroundColor: '#1e3a5c', color: 'white' }}>German</option>
</select>
                <button 
                  className="btn btn-hover" 
                  onClick={getSummary} 
                  disabled={loading}
                  style={{ 
                    background: 'linear-gradient(to right, #00b894, #00cec9)',
                    color: 'white',
                    borderRadius: '6px',
                    padding: '8px 22px',
                    fontWeight: '500',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    minWidth: '120px',
                    border: 'none'
                  }}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : "Summarize"}
                </button>
              </div>
              
              {summary && (
                <Card 
                  id="summary-card"
                  className="mt-4 text-white shadow" 
                  style={{ 
                    background: 'rgba(30, 50, 80, 0.7)',
                    border: 'none',
                    borderRadius: '10px',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                    opacity: 0,
                    transform: 'translateY(20px)',
                    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
                  }}
                >
                  <Card.Header style={{ 
                    background: 'rgba(40, 70, 100, 0.5)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '12px 16px',
                    borderRadius: '10px 10px 0 0'
                  }}>
                    <h5 className="mb-0">
                      <i className="bi bi-file-text me-2"></i>
                      Summary in {language.toUpperCase()}
                    </h5>
                  </Card.Header>
                  <Card.Body style={{ 
                    background: 'rgba(25, 45, 70, 0.7)'
                  }}>
                    <Card.Text style={{ 
                      maxHeight: '200px', 
                      overflowY: 'auto',
                      lineHeight: '1.6',
                      fontSize: '1.05rem',
                      padding: '6px'
                    }}>{summary}</Card.Text>
                  </Card.Body>
                </Card>
              )}
              
              {summary && (
                <div 
                  className="d-flex gap-3 mt-4" 
                  style={{
                    animation: 'slideInRight 0.5s ease-out forwards',
                    opacity: 0,
                    animationDelay: '0.3s'
                  }}
                >
                  <button 
                    className="btn flex-grow-1 btn-hover" 
                    onClick={convertToAudio} 
                    disabled={podcastLoading}
                    style={{ 
                      background: 'linear-gradient(to right, #00b894, #20bf6b)',
                      color: 'white',
                      borderRadius: '6px',
                      padding: '10px',
                      fontWeight: '500',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                      border: 'none'
                    }}
                  >
                    {podcastLoading ? 
                      <><Spinner animation="border" size="sm" className="me-2" /> Generating...</> : 
                      <>🎙️ Convert to Podcast</>
                    }
                  </button>
                  <button 
                    className="btn flex-grow-1 btn-hover" 
                    onClick={toggleContentGenerator}
                    style={{ 
                      background: 'linear-gradient(to right, #f39c12, #f1c40f)',
                      color: 'white',
                      borderRadius: '6px',
                      padding: '10px',
                      fontWeight: '500',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                      border: 'none'
                    }}
                  >
                    📚 {showContentGenerator ? "Hide Content Generator" : "Learning Materials"}
                  </button>
                </div>
              )}
              
              {audioUrl && (
                <div 
                  className="mt-4 p-3" 
                  style={{ 
                    background: 'rgba(30, 50, 80, 0.6)', 
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    animation: 'fadeIn 0.5s ease-out'
                  }}
                >
                  <h5 className="d-flex align-items-center text-white mb-3">
                    <span className="me-2" style={{ 
                      fontSize: '1.4rem',
                      animation: 'pulse 2s infinite'
                    }}>🎧</span> 
                    Podcast Mode
                  </h5>
                  <audio 
                    controls 
                    className="w-100" 
                    style={{ 
                      borderRadius: '8px',
                      backgroundColor: 'rgba(25, 40, 70, 0.5)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <source src={audioUrl} type="audio/mp3" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              
              {summary && showContentGenerator && (
                <div 
                  className="mt-4 p-3" 
                  style={{ 
                    background: 'rgba(30, 50, 80, 0.6)', 
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    animation: 'fadeIn 0.5s ease-out'
                  }}
                >
                  <ContentGenerator summary={summary} language={language}/>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}