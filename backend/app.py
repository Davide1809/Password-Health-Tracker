import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from bson.objectid import ObjectId

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "supersecretkey")
CORS(app, supports_credentials=True)

# ----------------------------
# Login Manager Setup
# ----------------------------
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# ----------------------------
# MongoDB Connection
# ----------------------------
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["myapp"]
users = db["users"]

# ----------------------------
# User Class
# ----------------------------
class User(UserMixin):
    def __init__(self, user_doc):
        self.id = str(user_doc["_id"])
        self.email = user_doc["email"]

@login_manager.user_loader
def load_user(user_id):
    user_doc = users.find_one({"_id": ObjectId(user_id)})
    if user_doc:
        return User(user_doc)
    return None

# ----------------------------
# Validation
# ----------------------------
EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"

def valid_password(password):
    return (
        len(password) >= 8 and
        re.search(r"[A-Z]", password) and
        re.search(r"[a-z]", password) and
        re.search(r"\d", password) and
        re.search(r"[!@#$%^&*(),.?\":{}|<>]", password)
    )

# ----------------------------
# Signup Route
# ----------------------------
@app.post("/api/signup")
def signup():
    data = request.get_json()

    if not data or "email" not in data or "password" not in data:
        return jsonify({"status": "error", "message": "Email and password are required"}), 422

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

    return jsonify({"status": "success", "message": "Account created successfully", "userId": str(result.inserted_id)}), 201

# ----------------------------
# Login Route
# ----------------------------
@app.post("/api/login")
def login():
    data = request.get_json()

    if not data or "email" not in data or "password" not in data:
        return jsonify({"status": "error", "message": "Email and password are required"}), 422

    email = data["email"].strip().lower()
    password = data["password"]

    user_doc = users.find_one({"email": email})
    if not user_doc or not check_password_hash(user_doc["password"], password):
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401

    user = User(user_doc)
    login_user(user)

    return jsonify({"status": "success", "message": "Login successful"}), 200

# ----------------------------
# Logout Route
# ----------------------------
@app.post("/api/logout")
@login_required
def logout():
    logout_user()
    return jsonify({"status": "success", "message": "Logged out successfully"}), 200

# ----------------------------
# Protected Dashboard Route
# ----------------------------
@app.get("/api/dashboard")
@login_required
def dashboard():
    return jsonify({"status": "success", "message": f"Welcome {current_user.email}!"}), 200

if __name__ == "__main__":
    app.run(debug=True, port=5001)