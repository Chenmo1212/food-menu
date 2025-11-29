# Quick Start Guide

## Setup

### 1. Install Dependencies

```bash
cd api
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env file with your configuration
```

**For Local MongoDB:**
```bash
MONGODB_URI=mongodb://localhost:27017/
DATABASE_NAME=food_menu_db
```

**For Remote MongoDB (MongoDB Atlas):**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=food_menu_db
```

### 3. Initialize Database

```bash
# Make sure MongoDB is running (if using local)
mongosh mongodb://localhost:27017/food_menu_db < docs/mongodb-init.js

# Or for remote MongoDB
mongosh "mongodb+srv://username:password@cluster.mongodb.net/food_menu_db" < docs/mongodb-init.js
```

### 4. Run the Application

```bash
python run.py
```

The API will be available at `http://localhost:5000`

## Project Structure

```
api/
├── app/
│   ├── __init__.py      # Application factory and configuration
│   ├── models.py        # Database models and operations
│   └── routes.py        # API endpoints and route handlers
├── docs/
│   ├── DATABASE_SCHEMA.md
│   ├── MONGODB_SETUP.md
│   └── mongodb-init.js
├── run.py               # Application entry point
├── requirements.txt     # Python dependencies
├── .env.example        # Environment variables template
└── .gitignore          # Git ignore rules
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DEBUG` | Debug mode | `True` or `False` |
| `PORT` | Server port | `5000` |
| `HOST` | Server host | `0.0.0.0` |
| `SECRET_KEY` | Flask secret key | `your-secret-key` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/` |
| `DATABASE_NAME` | Database name | `food_menu_db` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `*` or `http://localhost:3000` |

## API Endpoints

### Health Check
- `GET /health` - Check API status
- `GET /api/health` - Check API and database status

### Dishes
- `GET /api/dishes` - Get all dishes
- `GET /api/dishes/:id` - Get dish by ID
- `PATCH /api/dishes/:id/stock` - Update dish stock
- `GET /api/dishes/popular` - Get popular dishes
- `GET /api/dishes/search?q=keyword` - Search dishes

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:order_number` - Get order details
- `PATCH /api/orders/:order_number/status` - Update order status
- `DELETE /api/orders/:order_number` - Cancel order

### Statistics
- `GET /api/stats/dishes` - Get dish statistics
- `GET /api/stats/orders` - Get order statistics

## Testing

```bash
# Test health endpoint
curl http://localhost:5000/health

# Get all dishes
curl http://localhost:5000/api/dishes

# Create an order
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "delivery_date": "2024-01-15",
    "delivery_time": "12:00-13:00",
    "items": [{"dish_id": 1, "quantity": 2}]
  }'
```

## Development

### Running in Development Mode

```bash
# Set DEBUG=True in .env file
DEBUG=True

# Run the application
python run.py
```

### Running with Gunicorn (Production)

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

## Troubleshooting

### Cannot connect to MongoDB
- **Local**: Ensure MongoDB is running: `mongosh --eval "db.version()"`
- **Remote**: Check your connection string and credentials
- Verify `MONGODB_URI` in `.env` file

### Port already in use
- Change `PORT` in `.env` file
- Or kill the process using the port: `lsof -ti:5000 | xargs kill`

### Import errors
- Make sure you're in the `api` directory
- Verify all dependencies are installed: `pip install -r requirements.txt`

### CORS errors
- Update `ALLOWED_ORIGINS` in `.env` file
- For development, use `ALLOWED_ORIGINS=*`
- For production, specify your frontend URL: `ALLOWED_ORIGINS=https://yourdomain.com`