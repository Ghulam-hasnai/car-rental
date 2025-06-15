import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login({ setIsLoggedIn }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/auth/login', formData);
      const { role } = response.data;

      if (role === 'Admin') {
        navigate('/admin-dashboard');
      } else {
        alert('Customer logged in successfully!');
        navigate('/book-car');
        localStorage.setItem('userId', response.data.userId);
        console.log(response.data.userId);
      }

      // Update localStorage and isLoggedIn state
      localStorage.setItem('isLogin', 'true');
      setIsLoggedIn(true);

    } catch (error) {
      alert('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Please login to your account</p>
        <form onSubmit={handleLogin}>
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
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
