import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminDashboard from './components/AdminDashboard';
import LandingPage from './components/LandingPage';
import BookCar from './components/BookCar';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/book-car" element={<BookCar />} />
      </Routes>
    </div>
  );
}

export default App;
