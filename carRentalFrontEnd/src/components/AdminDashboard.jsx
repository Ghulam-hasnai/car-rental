  import React, { useState, useEffect } from "react";
  import axios from "axios";
  import { useNavigate } from "react-router-dom";
  import "./AdminDashboard.css";

  const AdminDashboard = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [selectedCar, setSelectedCar] = useState(null);
    const [rentedCars, setRentedCars] = useState([]);
    const [activeSection, setActiveSection] = useState("available-cars"); // Track active section
    const [newCar, setNewCar] = useState({
      make: "",
      model: "",
      year: "",
      price_per_day: "",
      image_url: "", // Add image_url to the new car state
    });

    // Fetch data for cars, customers, and orders
    useEffect(() => {
      const fetchCars = async () => {
        const response = await axios.get("http://127.0.0.1:5000/api/admin/cars");
        console.log(response.data); // Log the cars to check the image_url
        setCars(response.data);
      };
      const fetchCustomers = async () => {
        const response = await axios.get(
          "http://127.0.0.1:5000/api/admin/customers"
        );
        setCustomers(response.data);
      };
      const fetchOrders = async () => {
        const response = await axios.get(
          "http://127.0.0.1:5000/api/admin/customers-with-orders"
        );
        setOrders(response.data);
        console.log(response.data);
      };
      const fetchRentedCars = async () => {
        try {
          const response = await axios.get(
            "http://127.0.0.1:5000/api/admin/rented-cars"
          );
          setRentedCars(response.data);
        } catch (error) {
          console.error("Error fetching rented cars:", error);
        }
      };

      fetchRentedCars();
      fetchCars();
      fetchCustomers();
      fetchOrders();
    }, []);

    // Handle the deletion of a car
    const handleDeleteCar = async (carId) => {
      await axios.delete(`http://127.0.0.1:5000/api/admin/cars/${carId}`);
      setCars(cars.filter((car) => car.id !== carId));
    };

    // Handle updating car information
    const handleUpdateCar = async () => {
      if (!selectedCar) return;
      await axios.put(
        `http://127.0.0.1:5000/api/admin/cars/${selectedCar.id}`,
        selectedCar
      );
      setCars(cars.map((car) => (car.id === selectedCar.id ? selectedCar : car)));
      setSelectedCar(null);
    };

    // Handle adding a new car
    const handleAddCar = async () => {
      await axios.post("http://127.0.0.1:5000/api/admin/cars", newCar);
      setNewCar({
        make: "",
        model: "",
        year: "",
        price_per_day: "",
        image_url: "", // Reset the form
      });
      setActiveSection("available-cars");
    };

    const handleMakeAvailable = async (carId) => {
      try {
        // Make the API call to mark the car as available
        await axios.put(
          `http://127.0.0.1:5000/api/admin/cars/${carId}/make-available`
        );

        // Update the rentedCars state to remove the car from rented list
        setRentedCars(rentedCars.filter((car) => car.id !== carId));

        // Optionally, you can fetch the updated list of available cars
        const updatedCarsResponse = await axios.get(
          "http://127.0.0.1:5000/api/admin/cars"
        );
        setCars(updatedCarsResponse.data);

        alert("Car is now available!");
      } catch (error) {
        console.error("Error making car available:", error);
        alert("Error updating car status.");
      }
    };

    const handleCheckboxChange = async (orderId, isChecked) => {
      try {
        // Send PUT request to the server when checkbox is checked
        await axios.put(`http://127.0.0.1:5000/api/admin/orders/${orderId}/return`, {
          returned: isChecked, // Sending 'returned' status to backend
        });
        
        // Update state or UI based on the response if necessary
        alert(isChecked ? "Car marked as returned" : "Car marked as not returned");
      } catch (error) {
        console.error("Error updating return status:", error);
        alert("Failed to update return status.");
      }
    };
    
    return (
      <div className="admin-dashboard">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-title">Admin Dashboard</div>
          <ul className="sidebar-menu">
            <li
              className={activeSection === "available-cars" ? "active" : ""}
              onClick={() => setActiveSection("available-cars")}
            >
              Available Cars
            </li>
            <li
              className={activeSection === "customers" ? "active" : ""}
              onClick={() => setActiveSection("customers")}
            >
              Manage Customers
            </li>
            <li
              className={activeSection === "orders" ? "active" : ""}
              onClick={() => setActiveSection("orders")}
            >
              Manage Orders
            </li>
            <li
              className={activeSection === "rented-cars" ? "active" : ""}
              onClick={() => setActiveSection("rented-cars")}
            >
              Rented Cars
            </li>
          </ul>
        </div>

        {/* Content */}
        <div className="content">
          {activeSection === "available-cars" && (
            <div className="card">
              <div className="card-header">Available Cars</div>
              <div className="card-body">
                {/* Add New Car */}
                <div>
                  <h5>Add New Car</h5>
                  <input
                    type="text"
                    className="form-control"
                    value={newCar.make}
                    onChange={(e) =>
                      setNewCar({ ...newCar, make: e.target.value })
                    }
                    placeholder="Make"
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={newCar.model}
                    onChange={(e) =>
                      setNewCar({ ...newCar, model: e.target.value })
                    }
                    placeholder="Model"
                  />
                  <input
                    type="number"
                    className="form-control"
                    value={newCar.year}
                    onChange={(e) =>
                      setNewCar({ ...newCar, year: e.target.value })
                    }
                    placeholder="Year"
                  />
                  <input
                    type="number"
                    className="form-control"
                    value={newCar.price_per_day}
                    onChange={(e) =>
                      setNewCar({ ...newCar, price_per_day: e.target.value })
                    }
                    placeholder="Price per Day"
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={newCar.image_url}
                    onChange={(e) =>
                      setNewCar({ ...newCar, image_url: e.target.value })
                    }
                    placeholder="Image URL"
                  />
                  <button className="btn btn-success" onClick={handleAddCar}>
                    Add Car
                  </button>
                </div>

                {/* Available Cars Displayed as Cards */}
                <div className="cars-cards my-4">
                  {cars.map((car) => (
                    <div className="car-card" key={car.id}>
                      <img
                        src={car.image_url}
                        alt={car.make}
                        className="car-image"
                      />
                      <div className="car-details">
                        <h5>
                          {car.make} {car.model}
                        </h5>
                        <p>Year: {car.year}</p>
                        <p>Price per Day: ${car.price_per_day}</p>
                      </div>
                      <div className="car-actions">
                        <button
                          className="btn btn-warning"
                          onClick={() => setSelectedCar(car)}
                        >
                          Update
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteCar(car.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Update Car Form */}
                {selectedCar && (
                  <div className="update-car-form">
                    <h5>Update Car</h5>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedCar.make}
                      onChange={(e) =>
                        setSelectedCar({ ...selectedCar, make: e.target.value })
                      }
                      placeholder="Make"
                    />
                    <input
                      type="text"
                      className="form-control"
                      value={selectedCar.model}
                      onChange={(e) =>
                        setSelectedCar({ ...selectedCar, model: e.target.value })
                      }
                      placeholder="Model"
                    />
                    <input
                      type="number"
                      className="form-control"
                      value={selectedCar.year}
                      onChange={(e) =>
                        setSelectedCar({ ...selectedCar, year: e.target.value })
                      }
                      placeholder="Year"
                    />
                    <input
                      type="number"
                      className="form-control"
                      value={selectedCar.price_per_day}
                      onChange={(e) =>
                        setSelectedCar({
                          ...selectedCar,
                          price_per_day: e.target.value,
                        })
                      }
                      placeholder="Price per Day"
                    />
                    <input
                      type="text"
                      className="form-control"
                      value={selectedCar.image_url}
                      onChange={(e) =>
                        setSelectedCar({
                          ...selectedCar,
                          image_url: e.target.value,
                        })
                      }
                      placeholder="Image URL"
                    />
                    <button className="btn btn-success" onClick={handleUpdateCar}>
                      Update Car
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "customers" && (
            <div className="card">
              <div className="card-header">Manage Customers</div>
              <div className="card-body">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Balance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length > 0 ? (
                      customers.map((customer) => (
                        <tr key={customer.id}>
                          <td>{customer.username}</td>
                          <td>{customer.balance}</td>
                          <td>
                            <button className="btn btn-info">View Orders</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3">No customers found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === "orders" && (
            <div className="card">
              <div className="card-header">Manage Orders</div>
              <div className="card-body">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Car</th>
                      <th>Payment Status</th>
                      <th>Return Status</th>
                      <th>Return Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.customer.username}</td>
                        <td>
                          {order.car.make} {order.car.model}
                        </td>
                        <td>Paid</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={order.rental.return_status}  // Bind checkbox to the current status
                            onChange={(e) => handleCheckboxChange(order.rental.rental_id, e.target.checked)}
                          />
                        </td>
                        <td>{order.rental.return_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeSection === "rented-cars" && (
            <div className="card">
              <div className="card-header">Rented Cars</div>
              <div className="card-body">
                <div className="cars-cards my-4">
                  {rentedCars.length > 0 ? (
                    rentedCars.map((car) => (
                      <div className="car-card" key={car.id}>
                        <img
                          src={car.image_url}
                          alt={car.make}
                          className="car-image"
                        />
                        <div className="car-details">
                          <h5>
                            {car.make} {car.model}
                          </h5>
                          <p>Year: {car.year}</p>
                          <p>Price per Day: ${car.price_per_day}</p>
                        </div>
                        <div className="car-actions">
                          <button
                            className="btn btn-success"
                            onClick={() => handleMakeAvailable(car.id)}
                          >
                            Make Available
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No cars are currently rented.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  export default AdminDashboard;
