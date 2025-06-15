import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css';

function Signup() {
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/api/auth/signup', formData);
      alert('Signup successful! Please log in.');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Something went wrong.'));
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="signup-title">Create an Account</h2>
        <p className="signup-subtitle">Join our car rental service today</p>
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Confirm password"
            />
          </div>
          <button type="submit" className="btn btn-primary">Signup</button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
