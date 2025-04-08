import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faHeadphones, faGlobe,faClipboard , faSearch, faLightbulb, faFilePdf, faQuestionCircle, faListUl } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import "animate.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-dark text-white">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-black p-3 animate__animated animate__fadeInDown">
        <div className="container">
          <a className="navbar-brand" href="#" style={{ 
            fontSize: '2rem',
            transition: 'transform 0.3s ease-in-out'
          }}>Briefly.</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <button className="btn btn-outline-light" onClick={() => navigate("/signup")}>Login / Sign Up</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="hero text-center text-white py-5 animate__animated animate__fadeInUp" style={{ background: "linear-gradient(90deg, #222, #333)" }}>
        <h1 className="display-4">Summarize YouTube Videos in Seconds!</h1>
        <p className="lead">AI-powered insights with one click. Save time, understand more.</p>
        <a href="#features" className="btn btn-primary btn-lg">Explore Features</a>
      </section>
      
      {/* Features Section */}
      <section className="features text-center py-5" id="features">
        <div className="container">
          <div className="row">
           
            <div className="col-md-7 animate__animated animate__zoomIn">
              <FontAwesomeIcon icon={faHeadphones} size="3x" className="text-warning" />
              <h3>Podcast Mode</h3>
              <p>Convert summaries into engaging audio.</p>
            </div>
            <div className="col-md-4 animate__animated animate__zoomIn">
              <FontAwesomeIcon icon={faGlobe} size="3x" className="text-warning" />
              <h3>Multilingual Support</h3>
              <p>Summarize videos in multiple languages.</p>
            </div>
          </div>
          <div className="row mt-5">
           
            <div className="col-md-7 animate__animated animate__zoomIn">
              <FontAwesomeIcon icon={faClipboard} size="3x" className="text-warning" />
              <h3>Deep diving through tests</h3>
              <p>Give tests and get your score to learn more.</p>
            </div>
            <div className="col-md-4 animate__animated animate__zoomIn">
              <FontAwesomeIcon icon={faFilePdf} size="3x" className="text-warning" />
              <h3>Download as PDF</h3>
              <p>Save summaries and generated materials in an organized PDF format.</p>
            </div>
          </div>
          <div className="row mt-5">
            <div className="col-md-7 animate__animated animate__zoomIn">
              <FontAwesomeIcon icon={faListUl} size="3x" className="text-warning" />
              <h3>Bullet Points & MCQs</h3>
              <p>Automatically generate key bullet points and multiple-choice questions.</p>
            </div>
            <div className="col-md-4 animate__animated animate__zoomIn">
              <FontAwesomeIcon icon={faQuestionCircle} size="3x" className="text-warning" />
              <h3>Short Questions</h3>
              <p>Create short answer questions for learning and revision.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="cta text-center text-white py-5 animate__animated animate__fadeInUp" style={{ background: "#111" }}>
        <h2>Start Summarizing Now!</h2>
        <p>Paste your YouTube link and get a summary in seconds.</p>
        <Link to="/signup" className="btn btn-light btn-lg">Try Now</Link>
      </section>

      {/* Footer */}
      <footer className="text-center text-white py-3 bg-black animate__animated animate__fadeIn">
        <p>&copy; 2025 YT Summarizer | Made with ❤️ for content lovers.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
