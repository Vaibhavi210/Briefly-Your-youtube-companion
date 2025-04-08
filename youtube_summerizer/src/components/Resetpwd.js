import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Resetpwd() {
    const [password, setPassword] = useState('');
    const [confirmpwd, setConfirmpwd] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { uid, token } = useParams();
    const navigate = useNavigate();

    const handlePwdConfirm = async (e) => {
        e.preventDefault();
        
        // Check if passwords match
        if (password !== confirmpwd) {
            setError('Passwords do not match');
            return;
        }

        // Check password strength (optional)
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/password-reset-confirm/', {
                token: `${uid}/${token}`,
                password
            });
            setMessage('Password successfully reset!');
            setTimeout(() => navigate('/Signup'), 3000);
        } catch (error) {
            console.error('Reset error:', error);
            setError(error.response?.data?.error || 'Invalid or expired token. Please request a new password reset.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Set New Password</h2>
                            
                            {message && <div className="alert alert-success">{message}</div>}
                            {error && <div className="alert alert-danger">{error}</div>}
                            
                            <form onSubmit={handlePwdConfirm}>
                                {/* Password input */}
                                <div className="form-outline mb-3">
                                    <label className="form-label" htmlFor="newPassword">Password</label>
                                    <input 
                                        type="password" 
                                        id="newPassword" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)}  
                                        placeholder="Enter new password" 
                                        required 
                                        className="form-control" 
                                    />
                                </div>

                                {/* Confirm Password input */}
                                <div className="form-outline mb-3">
                                    <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                                    <input 
                                        type="password" 
                                        id="confirmPassword" 
                                        value={confirmpwd} 
                                        onChange={(e) => setConfirmpwd(e.target.value)}  
                                        placeholder="Confirm new password" 
                                        required 
                                        className="form-control" 
                                    />
                                </div>
                                
                                {/* Submit button */}
                                <button type="submit" className="btn btn-primary w-100">
                                    Reset Password
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}