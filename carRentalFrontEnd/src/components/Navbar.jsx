import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; // Import the CSS file for styles

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('isLogin');
    setIsLoggedIn(false); // Set the login state to false
    navigate('/');
  };

  useEffect(() => {
    // Check if 'isLogin' is set in localStorage during the initial render
    const loggedInStatus = localStorage.getItem('isLogin');
    if (loggedInStatus) {
      setIsLoggedIn(true);
    }
  }, []); // Run once when the component mounts

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <Link className="navbar-brand" to="/">
          CarRental
        </Link>
        <ul className="navbar-links">
          {isLoggedIn ? (
            <li className="nav-item">
              <button className="nav-button" onClick={logout}>
                Logout
              </button>
            </li>
          ) : (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link signup-link" to="/signup">
                  Signup
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
