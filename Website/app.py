from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
import bcrypt
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='.')
CORS(app)

# Configure Flask app
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///website.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    profile_data = db.Column(db.JSON, default={})
    saves = db.Column(db.JSON, default=[])

# Create database tables
with app.app_context():
    db.create_all()

# Serve static files
@app.route('/')
def serve_index():
    return send_from_directory('.', 'loginpage.html')

@app.route('/<path:path>')
def serve_static(path):
    # First try to serve from the current directory
    try:
        return send_from_directory('.', path)
    except:
        # If not found, try to serve from the parent's Data directory
        if path.startswith('Data/'):
            return send_from_directory('..', path)
        return send_from_directory('.', path)

# Authentication routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not all(key in data for key in ['username', 'email', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    
    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=password_hash.decode('utf-8'),
        profile_data={},
        saves=[]
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not all(key in data for key in ['username', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), 
                                     user.password_hash.encode('utf-8')):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    access_token = create_access_token(identity=user.username)
    return jsonify({
        'token': access_token,
        'username': user.username,
        'email': user.email
    }), 200

# Profile routes
@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'username': user.username,
        'email': user.email,
        'profile_data': user.profile_data
    }), 200

@app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    if 'profile_data' in data:
        user.profile_data.update(data['profile_data'])
        db.session.commit()
    
    return jsonify({'message': 'Profile updated successfully'}), 200

# Saves routes
@app.route('/api/saves', methods=['GET'])
@jwt_required()
def get_saves():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'saves': user.saves}), 200

@app.route('/api/saves', methods=['POST'])
@jwt_required()
def add_save():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    if 'item' not in data:
        return jsonify({'error': 'No item provided'}), 400
    
    if not isinstance(user.saves, list):
        user.saves = []
    
    user.saves.append(data['item'])
    db.session.commit()
    
    return jsonify({'message': 'Item saved successfully'}), 201

@app.route('/api/saves/<int:index>', methods=['DELETE'])
@jwt_required()
def remove_save(index):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if not isinstance(user.saves, list):
        return jsonify({'error': 'No saves found'}), 404
    
    if index < 0 or index >= len(user.saves):
        return jsonify({'error': 'Invalid save index'}), 400
    
    user.saves.pop(index)
    db.session.commit()
    
    return jsonify({'message': 'Item removed successfully'}), 200

# Explore route (you can customize this based on your needs)
@app.route('/api/explore', methods=['GET'])
def explore():
    # This is a placeholder - implement your explore logic here
    return jsonify({
        'items': [
            # Add your explore items here
        ]
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000) 