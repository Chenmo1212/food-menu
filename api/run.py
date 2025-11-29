"""
Application Entry Point
Food Menu System API

This is the main entry point for running the Flask application.
"""

import os
from app import create_app

if __name__ == '__main__':
    # Create Flask application instance
    app = create_app()
    
    # Get configuration from environment
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    
    print("=" * 60)
    print("🚀 Starting Food Menu API")
    print("=" * 60)
    print(f"📍 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"🔧 Debug: {debug}")
    print(f"📊 Database: {app.config['DATABASE_NAME']}")
    print("=" * 60)
    print(f"\n✅ API is running at http://{host}:{port}")
    print(f"📖 Health check: http://{host}:{port}/health")
    print(f"📖 API endpoints: http://{host}:{port}/api/\n")
    
    # Run the application
    app.run(host=host, port=port, debug=debug)

# Made with Bob
