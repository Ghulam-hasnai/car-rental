import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css'; // Add a separate CSS file for styling

function LandingPage() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Drive Your Dream Car</h1>
          <p className="hero-subtitle">
            Explore a wide range of premium cars. Rent easily, drive happily!
          </p>
          <div className="hero-buttons" style={{display : 'flex'}}>
            <Link to="/login" className="btn btn-primary">Get Started</Link>
            <Link to="/signup" className="btn btn-secondary">Sign Up</Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Us?</h2>
        <div className="features">
          <div className="feature-card">
            <img src="https://via.placeholder.com/100" alt="Affordable" />
            <h3>Affordable Prices</h3>
            <p>Rent cars at unbeatable prices, tailored for your budget.</p>
          </div>
          <div className="feature-card">
            <img src="https://via.placeholder.com/100" alt="Luxury" />
            <h3>Luxury Cars</h3>
            <p>Choose from a wide range of luxury and sports cars.</p>
          </div>
          <div className="feature-card">
            <img src="https://via.placeholder.com/100" alt="Easy Booking" />
            <h3>Easy Booking</h3>
            <p>Enjoy a seamless booking experience in just a few clicks.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>What Our Customers Say</h2>
        <div className="testimonials">
          <div className="testimonial-card">
            <p>
              “The booking process was effortless, and the car was in perfect
              condition. Highly recommend!”
            </p>
            <h4>- Sarah J.</h4>
          </div>
          <div className="testimonial-card">
            <p>
              “Best car rental experience ever! Great prices and amazing customer
              service.”
            </p>
            <h4>- David L.</h4>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer-section">
        <p>&copy; 2024 Car Rental. All rights reserved.</p>
        <div className="footer-links">
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
