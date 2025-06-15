import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BookCar.css';

function BookCar() {
  const [cars, setCars] = useState([]);
  const [searchModel, setSearchModel] = useState('');
  const [walletBalance, setWalletBalance] = useState(1000); // Starting with 1000 as the wallet balance
  const [selectedCar, setSelectedCar] = useState(null);
  const [returnDate, setReturnDate] = useState('');

  useEffect(() => {
    // Fetch cars from the backend
    const fetchCars = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/cars');
        setCars(response.data);
      } catch (error) {
        console.error('Error fetching cars:', error);
      }
    };

    // Fetch wallet balance from the backend using the logged-in user's id
    const fetchWalletBalance = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          console.error('No user ID found in localStorage');
          return;
        }
        const response = await axios.get(`http://127.0.0.1:5000/api/customers/${userId}`);
        setWalletBalance(response.data.balance);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      }
    };

    fetchCars();
    fetchWalletBalance();
  }, []);

  const handleBookCar = async () => {
    if (!selectedCar) {
      alert('Please select a car first');
      return;
    }

    if (!returnDate) {
      alert('Please select a return date');
      return;
    }

    try {
      if (walletBalance >= selectedCar.price_per_day) {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          alert('No user ID found. Please log in.');
          return;
        }

        // Book the car with the return date first
        await axios.post('http://127.0.0.1:5000/api/bookings', {
          userId: userId,
          carId: selectedCar.id,
          price: selectedCar.price_per_day,
          return_date: returnDate,
        });
        console.log(returnDate);

        // Deduct wallet balance after successful booking
        const newBalance = walletBalance - selectedCar.price_per_day;
        setWalletBalance(newBalance);

        // Update wallet balance on the backend
        await axios.put(`http://127.0.0.1:5000/api/customers/${userId}`, { balance: newBalance });

        // Mark the car as unavailable in the local state
        setCars(cars.filter((item) => item.id !== selectedCar.id));

        alert('Car booked successfully!');
      } else {
        alert('Insufficient balance');
      }
    } catch (error) {
      console.error('Error booking the car:', error);
      alert('Error booking the car: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCarSelection = (car) => {
    // Toggle the selected car state: if the same car is clicked again, unselect it
    if (selectedCar && selectedCar.id === car.id) {
      setSelectedCar(null); // Deselect the car
    } else {
      setSelectedCar(car); // Select the car
    }
  };

  return (
    <div className="book-car-container">
      <h2 className="page-title">Available Cars for Rent</h2>
      <p className="wallet-balance">Your Wallet Balance: ${walletBalance}</p>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by car model"
          className="search-input"
          value={searchModel}
          onChange={(e) => setSearchModel(e.target.value)}
        />
      </div>

      <div className="car-list">
        {cars.length === 0 ? (
          <p>Loading cars...</p>
        ) : (
          cars
            .filter(car => car.model.toLowerCase().includes(searchModel.toLowerCase()))
            .map((car) => (
              <div className="car-card" key={car.id}>
                <img src={car.image_url} alt={car.make} className="car-image" />
                <div className="car-details">
                  <h3>{car.make} {car.model}</h3>
                  <p>Year: {car.year}</p>
                  <p>Price per day: ${car.price_per_day}</p>
                  <button className="btn-book" onClick={() => handleCarSelection(car)}>
                    {selectedCar && selectedCar.id === car.id ? 'Deselect Car' : 'Select Car'}
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {selectedCar && (
        <div className="booking-form">
          <h3>Book {selectedCar.make} {selectedCar.model}</h3>
          
          <div>
            <label htmlFor="returnDate">Return Date:</label>
            <input
              type="date"
              id="returnDate"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              required
            />
          </div>

          <button className="btn-book" onClick={handleBookCar}>
            Confirm Booking
          </button>
        </div>
      )}
    </div>
  );
}

export default BookCar;
