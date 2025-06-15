from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)

# Enable CORS for the entire app or specific routes
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})  # Allow requests from React frontend
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///car_rental.db'  # Using SQLite for simplicity
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Models
class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    balance = db.Column(db.Float, default=1000.0)

class Car(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    make = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(100), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    price_per_day = db.Column(db.Float, nullable=False)
    available = db.Column(db.Boolean, default=True)
    image_url = db.Column(db.String(255))  # New field for image URL

class Rental(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    car_id = db.Column(db.Integer, db.ForeignKey('car.id'), nullable=False)
    rental_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    return_date = db.Column(db.DateTime, nullable=True)  # Add return_date to track return time
    payment_status = db.Column(db.Boolean, default=False)  # False = Not Paid, True = Paid
    return_status = db.Column(db.Boolean, default=False)  # False = Not returned, True = Returned


# Create database tables
with app.app_context():
    db.create_all()

# Routes

# Signup Route for Customers
class AuthUsers:
    @app.route('/api/auth/signup', methods=['POST'])
    def signup():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'message': 'Username and password are required'}), 400

        existing_user = Customer.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({'message': 'Username already exists'}), 400

        new_customer = Customer(username=username, password=password)
        db.session.add(new_customer)
        db.session.commit()

        return jsonify({'message': 'Signup successful!'}), 201

    # Login Route for Customers and Admin
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if username == "admin" and password == "123":
            print("Admin login successful")
            return jsonify({
                'message': 'Login successful as Admin',
                'role': 'Admin'
            }), 200

        customer = Customer.query.filter_by(username=username, password=password).first()

        if customer:
            print(f"Customer login successful: {customer.id}, {customer.username}")
            return jsonify({
                'message': 'Login successful as Customer',
                'role': 'Customer',
                'userId': customer.id,
                'balance': customer.balance
            }), 200

        print("Invalid login attempt")
        return jsonify({'message': 'Invalid username or password'}), 401



# Admin Car Management Routes

# GET: /api/admin/cars - Get all cars
class CarManagementControl:
    @app.route('/api/admin/cars', methods=['GET'])
    def get_all_cars():
        cars = Car.query.filter_by(available=True).all()  # Filter to only available cars
        car_list = [
            {
                'id': car.id,
                'make': car.make,
                'model': car.model,
                'year': car.year,
                'price_per_day': car.price_per_day,
                'image_url': car.image_url  # Add the image_url field here
            }
            for car in cars
        ]
        return jsonify(car_list), 200


    # POST: /api/admin/cars - Add a new car
    @app.route('/api/admin/cars', methods=['POST'])
    def add_car():
        data = request.get_json()
        make = data.get('make')
        model = data.get('model')
        year = data.get('year')
        price_per_day = data.get('price_per_day')
        image_url = data.get('image_url')  # Accept image URL

        if not make or not model or not year or not price_per_day:
            return jsonify({'message': 'All car details are required'}), 400

        new_car = Car(make=make, model=model, year=year, price_per_day=price_per_day, image_url=image_url)
        db.session.add(new_car)
        db.session.commit()

        return jsonify({'message': 'Car added successfully'}), 201

    # delete
    @app.route('/api/admin/cars/<int:car_id>', methods=['DELETE'])
    def delete_car(car_id):
        try:
            car = Car.query.get(car_id)  # Get car by ID
            if not car:
                return jsonify({'message': 'Car not found'}), 404
            
            db.session.delete(car)  # Delete the car
            db.session.commit()  # Commit the change
            return jsonify({'message': f'Car {car_id} deleted successfully'}), 200
        except SQLAlchemyError as e:
            db.session.rollback()
            return jsonify({'message': 'Error deleting car', 'error': str(e)}), 500

    # Update
    @app.route('/api/admin/cars/<int:car_id>', methods=['PUT'])
    def update_car(car_id):
        try:
            car = Car.query.get(car_id)  # Get car by ID
            if not car:
                return jsonify({'message': 'Car not found'}), 404
            
            data = request.get_json()  # Get the request data
            
            # Update car attributes
            car.make = data.get('make', car.make)
            car.model = data.get('model', car.model)
            car.year = data.get('year', car.year)
            car.price_per_day = data.get('price_per_day', car.price_per_day)
            car.image_url = data.get('image_url', car.image_url)

            db.session.commit()  # Commit the changes
            return jsonify({'message': 'Car updated successfully', 'car': {
                'id': car.id,
                'make': car.make,
                'model': car.model,
                'year': car.year,
                'price_per_day': car.price_per_day,
                'image_url': car.image_url
            }}), 200

        except SQLAlchemyError as e:
            db.session.rollback()
            return jsonify({'message': 'Error updating car', 'error': str(e)}), 500
            
class CarAndCustomerSearchControl: 
# GET: /api/admin/customers - Get all customers
    @app.route('/api/admin/customers', methods=['GET'])
    def get_all_customers():
        customers = Customer.query.all()  # Fetch all customers from the database
        customer_list = [
            {
                'id': customer.id,
                'username': customer.username,
                'balance': customer.balance
            }
            for customer in customers
        ]
        return jsonify(customer_list), 200
    # GET: /api/admin/rented-cars - Get all rented cars

class RentalOrderControl:
    @app.route('/api/admin/rented-cars', methods=['GET'])
    def get_rented_cars():
        rented_cars = Car.query.filter(Car.available == False).all()  # Cars not available are rented
        rented_cars_list = [
            {
                'id': car.id,
                'make': car.make,
                'model': car.model,
                'year': car.year,
                'price_per_day': car.price_per_day,
                'image_url': car.image_url  # Include the image URL
            }
            for car in rented_cars
        ]
        return jsonify(rented_cars_list), 200


    # GET: /api/admin/customers-with-orders - Get customers with their orders
    @app.route('/api/admin/customers-with-orders', methods=['GET'])
    def get_customers_with_orders():
        # Explicitly specify the join paths
        customers_with_orders = (
            db.session.query(Customer, Rental, Car)
            .join(Rental, Rental.customer_id == Customer.id)  # Explicit join condition for Rental
            .join(Car, Car.id == Rental.car_id)  # Explicit join condition for Car
            .all()
        )

        # Format the results into a user-friendly structure
        result = []
        for customer, rental, car in customers_with_orders:
            result.append({
                'customer': {
                    'id': customer.id,
                    'username': customer.username,
                    'balance': customer.balance
                },
                'rental': {
                    'rental_id': rental.id,
                    'rental_date': rental.rental_date,
                    'payment_status': rental.payment_status,
                    'return_date': rental.return_date,
                    'return_status': rental.return_status  # Include the return status
                },
                'car': {
                    'id': car.id,
                    'make': car.make,
                    'model': car.model,
                    'year': car.year,
                    'price_per_day': car.price_per_day,
                    'available': car.available  # Include the availability status of the car
                }
            })

        return jsonify(result), 200


class RentalOverviewControl:
# PUT: /api/admin/orders/<int:order_id>/return - Mark the car as returned and available for rent
    @app.route('/api/admin/orders/<int:order_id>/return', methods=['PUT'])
    def return_car(order_id):
        order = Rental.query.get(order_id)
        if not order:
            return jsonify({"message": "Order not found"}), 404

        # Mark the return date for the rental
        order.return_date = db.func.current_timestamp()  # Set return date to current timestamp
        order.return_status = True  # Mark the car as returned

        # Mark the car as available again
        car = Car.query.get(order.car_id)
        if car:
            car.available = True  # Set car availability to True (available)

        db.session.commit()

        return jsonify({"message": "Car returned and confirmed. It is now available for rent again."}), 200


    @app.route('/api/admin/cars/<int:car_id>/make-available', methods=['PUT'])
    def make_car_available(car_id):
        car = Car.query.get(car_id)

        if not car:
            return jsonify({'message': 'Car not found'}), 404

        car.available = True  # Set the car as available
        db.session.commit()

        return jsonify({'message': 'Car is now available'}), 200

    @app.route('/api/admin/orders/<int:order_id>/return', methods=['PUT'])
    def returned_car(order_id):
        try:
            # Fetch the order by id
            rental = Rental.query.get(order_id)
            if rental is None:
                return jsonify({"message": "Rental not found"}), 404

            # Update the return status
            rental.return_status = True  # Or set based on request data
            db.session.commit()
            
            return jsonify({"message": "Car returned successfully"}), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "An error occurred", "error": str(e)}), 500



class CarSearchControl:
    # Customer Car Listing Route (Frontend Access)
    @app.route('/api/cars', methods=['GET'])
    def search_cars():
        make = request.args.get('make')
        model = request.args.get('model')
        year = request.args.get('year')

        query = Car.query.filter(Car.available == True)  # Filter out unavailable cars

        # Apply filters if search parameters are provided
        if make:
            query = query.filter(Car.make.ilike(f'%{make}%'))
        if model:
            query = query.filter(Car.model.ilike(f'%{model}%'))
        if year:
            query = query.filter(Car.year == int(year))

        cars = query.all()
        car_list = [
            {
                'id': car.id,
                'make': car.make,
                'model': car.model,
                'year': car.year,
                'price_per_day': car.price_per_day,
                'image_url': car.image_url  # Include the image URL
            }
            for car in cars
        ]
        
        return jsonify(car_list), 200


class CarBookingControl:    
    # GET: /api/customers/<int:customer_id> - Get a customer's details including balance
    @app.route('/api/customers/<customer_id>', methods=['GET'])
    def get_customer(customer_id):
        if not customer_id.isdigit():
            return jsonify({'message': 'Invalid customer ID'}), 400

        customer = Customer.query.get(int(customer_id))
        if customer:
            # Check for active booking (return_date=None)
            active_rental = Rental.query.filter_by(customer_id=customer.id, return_date=None).first()

            car_info = None
            if active_rental:
                # Fetch the car details for the active rental
                car = Car.query.get(active_rental.car_id)
                if car:
                    car_info = {
                        'id': car.id,
                        'make': car.make,
                        'model': car.model,
                        'year': car.year,
                        'price_per_day': car.price_per_day,
                        'image_url': car.image_url
                    }

            return jsonify({
                'id': customer.id,
                'username': customer.username,
                'balance': customer.balance,
                'has_active_booking': active_rental is not None,
                'rented_car': car_info  # Include car details if there is an active booking
            }), 200

        return jsonify({'message': 'Customer not found'}), 404


    # PUT: /api/customers/<int:customer_id> - Update a customer's balance
    @app.route('/api/customers/<int:customer_id>', methods=['PUT'])
    def update_customer_balance(customer_id):
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({'message': 'Customer not found'}), 404
        
        data = request.get_json()
        customer.balance = data.get('balance', customer.balance)
        db.session.commit()
        return jsonify({'message': 'Balance updated successfully'}), 200

    # POST: /api/bookings - Book a car
    @app.route('/api/bookings', methods=['POST'])
    def book_car():
        data = request.get_json()
        user_id = data.get('userId')
        car_id = data.get('carId')
        price = data.get('price')
        return_date_str = data.get('return_date')  # Expecting a string like '2024-12-15'

        # Parse the return_date string into a datetime object
        try:
            return_date = datetime.strptime(return_date_str, '%Y-%m-%d') if return_date_str else None
        except ValueError:
            return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD.'}), 400

        customer = Customer.query.get(user_id)
        car = Car.query.get(car_id)

        if not customer:
            return jsonify({'message': 'Customer not found'}), 404
        if not car:
            return jsonify({'message': 'Car not found'}), 404

        # Check if the car is available
        if not car.available:
            return jsonify({'message': 'Car is not available'}), 400

        # Check if the customer already has an active rental
        active_rental = Rental.query.filter_by(customer_id=user_id, return_date=None).first()
        if active_rental:
            return jsonify({'message': 'You already have an active booking'}), 400

        # Check if the customer has enough balance
        if customer.balance >= price:
            customer.balance -= price  # Deduct the balance before creating the rental
            db.session.commit()  # Commit the balance change
            car.available = False  # Mark the car as unavailable
            new_rental = Rental(customer_id=user_id, car_id=car_id, payment_status=True, return_date=return_date)
            db.session.add(new_rental)
            db.session.commit()  # Commit the rental creation
            return jsonify({'message': 'Car booked successfully!'}), 201
        else:
            return jsonify({'message': 'Insufficient balance'}), 400

if __name__ == '__main__':
    app.run(debug=True)
