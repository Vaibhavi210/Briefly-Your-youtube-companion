import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import  axios from 'axios';

export default function Signup({ isAuthenticated, setIsAuthenticated }) {
  // State to track active tab
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const[username,setName]=useState('');
  const[password,setPassword]=useState('');
  const navigate=useNavigate();
  const[error,setError]=useState('');
  const [loading, setLoading] = useState(false);

const handleLogin = async (e) => {
  e.preventDefault();
  console.log('handleLogin called');
  try {
    setLoading(true);
    setError('');
    console.log('Attempting login with:', { email, password });
    // Check password strength (optional)
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
  }

    const response = await axios.post('http://127.0.0.1:8000/api/token/login/', { email, password });
    console.log('Login successful, response:', response.data);

    localStorage.setItem('token', response.data.access);
    console.log('Token stored in localStorage:', localStorage.getItem('token'));

    setIsAuthenticated(true); // Update the central state
    console.log('isAuthenticated set to:', isAuthenticated); // Check the value *before* navigation
    navigate('/homepage');
    console.log('Navigated to /homepage');

  } catch (err) {
    console.error("Login error:", err);
    setError('Invalid Credentials');
    setIsAuthenticated(false);
    console.log('isAuthenticated set to false due to error');
  } finally {
    setLoading(false);
    console.log('Loading set to false');
  }
};

  const handleSignup= async (e)=>{
    e.preventDefault();
    try{
      setLoading(true);
      // Check password strength (optional)
      if (password.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
    }
      const response= await axios.post('http://127.0.0.1:8000/signup/',{username,email,password});
      alert("You have successfully registered");
    }catch(error){
   
      if (error.response.data.email) {
        
        alert(error.response.data.email[0]);}
    else {
        // Other network errors
        alert("Something went wrong. Please check your internet connection.");
    }
    }finally{
      setLoading(false);
    }

  }
  const handleForgotPassword = () => {
    alert(`Password reset link sent to: ${email}`);
    // Close modal after submitting
  };

  const handlePasswordReset= async (e)=>{
    e.preventDefault()
    console.log("Sending email:", email);
    try{
      const response=await axios.post('http://127.0.0.1:8000/password-reset/',{email})
      setError('If your email exists in our system, you will receive a password reset link.')
      setShowForgotPassword(false);

    }catch (error){
      setError('Something went wrong.Please try again')
    }
        
  };

  const handleLoginUsingProviders = (provider) => {
    window.location.href = `http://127.0.0.1:8000/accounts/${provider}/login/`;
};

  

  return (
    <div className="container mt-5 pt-5 d-flex justify-content-center">
      <div className="col-md-6 col-lg-5 shadow-lg p-4 rounded bg-light">
        {/* Pills navs */}
        <ul className="nav nav-pills nav-justified mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "login" ? "active" : ""}`}
              onClick={() => setActiveTab("login")}
            >
              Already a member? Login
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "register" ? "active" : ""}`}
              onClick={() => setActiveTab("register")}
            >
               Sign Up
            </button>
          </li>
        </ul>

        {/* Pills content */}
        <div className="tab-content">
          {/* Login Form */}
          {activeTab === "login" && (
            <div className="tab-pane fade show active">
              <form onSubmit={handleLogin}>
                <div className="text-center mb-3">
                  <p className="fw-bold">Sign in with:</p>
                  <div className="d-flex justify-content-center gap-2">
                   
                    <button className="btn btn-outline-dark" onClick={() => handleLoginUsingProviders("google")}><i className="fab fa-google"></i></button>
                    
                    <button className="btn btn-outline-dark" onClick={() => handleLoginUsingProviders("github")}><i className="fab fa-github"></i></button>
                  </div>
                </div>
                <p className="text-center">or:</p>

                {/* Email input */}
                <div className="form-outline mb-3">
                <label className="form-label" htmlFor="loginName">Email</label>
                  <input type="email" id="loginName" value={email} onChange={(e)=>{setEmail(e.target.value)}}  placeholder="Email" 
          required className="form-control" />
                  
                </div>

                {/* Password input */}
                <div className="form-outline mb-3">
                <label className="form-label" htmlFor="loginPassword">Password</label>
                  <input type="password" id="loginPassword" value={password} onChange={(e)=>{setPassword(e.target.value)}}  placeholder="password" 
          required className="form-control" />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="row mb-4">
                  
                  <div className="col-md-6 text-md-end">
                  Forgot password?<button type="button" className="btn btn-link p-0" onClick={() => setShowForgotPassword(true)}>Click here</button>
                  </div>
                </div>

                {/* Sign in button */}
                <button type="submit" className="btn btn-primary btn-block w-100 mb-3"disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

                
              </form>
              {error && <p>{error}</p>}
            </div>
          )}
          {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reset Password</h5>
                <button className="btn-close" onClick={() => setShowForgotPassword(false)}></button>
              </div>
              <div className="modal-body">
                <p>Enter your email to receive a password reset link:</p>
                <input
                  type="email"
                  className="form-control mb-3"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button className="btn btn-primary w-100" onClick={handlePasswordReset}>
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

          {/* Register Form */}
          {activeTab === "register" && (
            <div className="tab-pane fade show active">
              <form onSubmit={handleSignup}>
                <div className="text-center mb-3">
                  <p className="fw-bold">Sign up with:</p>
                  <div className="d-flex justify-content-center gap-2">
                   
                    <button className="btn btn-outline-dark" onClick={() => handleLoginUsingProviders("google")}><i className="fab fa-google"></i></button>
                    
                    <button className="btn btn-outline-dark" onClick={() => handleLoginUsingProviders("github")}><i className="fab fa-github"></i></button>
                  </div>
                </div>
                <p className="text-center">or:</p>

                

                {/* Username */}
                <div className="form-outline mb-3">
                <label className="form-label" htmlFor="registerUsername">Username</label>
                <input type="text" id="registerName" className="form-control" required value={username} placeholder='Your name' onChange={(e)=>{setName(e.target.value)}}/>
                  
                </div>

                {/* Email */}
                <div className="form-outline mb-3">
                <label className="form-label" htmlFor="registerEmail">Email</label>
                  <input type="email" id="registerEmail" className="form-control" placeholder='Email' value={email} required onChange={(e)=>{setEmail(e.target.value)}} />
                  
                </div>

                {/* Password */}
                <div className="form-outline mb-3">
                <label className="form-label" htmlFor="registerPassword">Password</label>
                  <input type="password" id="registerPassword" className="form-control" placeholder='Password' required value={password} onChange={(e)=>{setPassword(e.target.value)}} />
                  
                </div>


               
                {/* Register Button */}
                <button type="submit" className="btn btn-primary btn-block w-100 mb-3"disabled={loading}>
          {loading ? "Signing up..." : "Sign up"}
        </button>


              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
