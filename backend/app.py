import os, re
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from bson.objectid import ObjectId

app = Flask(__name__)
# Set a secret key from environment variables or use a default
app.secret_key = os.getenv("SECRET_KEY", "supersecretkey") 
CORS(app, supports_credentials=True)

# Login manager setup
login_manager = LoginManager()
login_manager.init_app(app)

# MongoDB connection setup
# Use the MONGO_URI environment variable set in docker-compose.yml
# The default is a placeholder URI that works if the variable is not set.
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/db_placeholder")
try:
    # Initialize the client using the correct URI
    client = MongoClient(MONGO_URI)
    client.admin.command('ping') # Test connection

    # Dynamically select the database name from the connection string
    # Assumes the URI is in the format '.../db_name'
    db_name = MONGO_URI.split('/')[-1]
    db = client[db_name]
    users = db["users"]
    print(f"Successfully connected to MongoDB database: {db_name}")
except Exception as e:
    # Log the exact error if the connection fails, which is crucial for debugging
    print(f"Error connecting to MongoDB. Check if the 'mongo' service is running and healthy: {e}")
    # For local development with Docker Compose, the app may crash here if the DB is unavailable

# User class for Flask-Login
class User(UserMixin):
    def __init__(self, user_doc):
        self.id = str(user_doc["_id"])
        self.email = user_doc["email"]

@login_manager.user_loader
def load_user(user_id):
    try:
        user_doc = users.find_one({"_id": ObjectId(user_id)})
        if user_doc:
            return User(user_doc)
    except Exception as e:
        print(f"Error loading user: {e}")
    return None


EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"

def valid_password(password):
    return (
        len(password) >= 8 and
        re.search(r"[A-Z]", password) and
        re.search(r"[a-z]", password) and
        re.search(r"\d", password) and
        re.search(r"[!@#$%^&*(),.?\":{}|<>]", password)
    )


@app.post("/api/signup")
def signup():
    data = request.get_json()

    if not data or "email" not in data or "password" not in data:
        return jsonify({"status": "error", "message": "Email and password required"}), 422

    email = data["email"].strip().lower()
    password = data["password"]

    if not re.match(EMAIL_REGEX, email):
        return jsonify({"status": "error", "message": "Invalid email format"}), 400

    if not valid_password(password):
        return jsonify({"status": "error", "message": "Password does not meet security requirements"}), 400

    if users.find_one({"email": email}):
        return jsonify({"status": "error", "message": "Email already registered"}), 400

    hashed_pw = generate_password_hash(password)
    result = users.insert_one({"email": email, "password": hashed_pw})
    # If the application uses session management, a successful signup usually logs the user in immediately
    user = User(users.find_one({"_id": result.inserted_id}))
    login_user(user)

    return jsonify({"status": "success", "message": "Account created", "userId": str(result.inserted_id)}), 201

@app.post("/api/login")
def login():
    data = request.get_json()

    if not data or "email" not in data or "password" not in data:
        return jsonify({"status": "error", "message": "Email and password required"}), 422

    email = data["email"].strip().lower()
    password = data["password"]

    user_doc = users.find_one({"email": email})
    if not user_doc or not check_password_hash(user_doc["password"], password):
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401

    user = User(user_doc)
    login_user(user)

    return jsonify({"status": "success", "message": "Login successful"}), 200


@app.post("/api/logout")
@login_required
def logout():
    logout_user()
    return jsonify({"status": "success", "message": "Logged out"}), 200

@app.get("/api/dashboard")
@login_required
def dashboard_data():
    return jsonify({"status": "success", "message": f"Welcome {current_user.email}!"}), 200

# --- SERVER STARTUP ---

if __name__ == "__main__":
    # Get the PORT environment variable, defaulting to 5001 to match docker-compose configuration
    port = int(os.environ.get("PORT", 5001)) 
    # Bind to '0.0.0.0' for accessibility within the Docker network
    app.run(host="0.0.0.0", port=port, debug=False)