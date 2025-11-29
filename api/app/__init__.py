"""
Flask Application Factory
Food Menu System API

This module initializes the Flask application with all necessary configurations,
extensions, and blueprints.
"""

from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB client (will be initialized in create_app)
mongo_client = None
db = None


def create_app():
    """
    Application factory pattern for creating Flask app instances.
    
    Returns:
        Flask: Configured Flask application instance
    """
    app = Flask(__name__)
    
    # Load configuration from environment variables
    app.config['MONGODB_URI'] = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
    app.config['DATABASE_NAME'] = os.getenv('DATABASE_NAME', 'food_menu_db')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['DEBUG'] = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # Initialize CORS
    allowed_origins = os.getenv('ALLOWED_ORIGINS', '*')
    origins = allowed_origins.split(',') if allowed_origins != '*' else '*'
    
    CORS(app, resources={
        r"/api/*": {
            "origins": origins,
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Initialize MongoDB connection
    global mongo_client, db
    try:
        mongo_client = MongoClient(app.config['MONGODB_URI'])
        db = mongo_client[app.config['DATABASE_NAME']]
        
        # Test connection
        mongo_client.admin.command('ping')
        print(f"✅ Connected to MongoDB: {app.config['DATABASE_NAME']}")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        raise
    
    # Store db in app context for easy access
    app.db = db
    
    # Register blueprints
    from app.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Register error handlers
    register_error_handlers(app)
    
    # Health check endpoint
    @app.route('/health')
    def health():
        """Basic health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'service': 'Food Menu API'
        }), 200
    
    return app


def register_error_handlers(app):
    """
    Register global error handlers for the application.
    
    Args:
        app (Flask): Flask application instance
    """
    
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 Not Found errors"""
        return jsonify({
            'success': False,
            'error': 'Endpoint not found',
            'status_code': 404
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 Internal Server errors"""
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'status_code': 500
        }), 500
    
    @app.errorhandler(400)
    def bad_request(error):
        """Handle 400 Bad Request errors"""
        return jsonify({
            'success': False,
            'error': 'Bad request',
            'status_code': 400
        }), 400

# Made with Bob
