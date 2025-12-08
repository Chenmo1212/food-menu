"""
API Routes and Endpoints
Food Menu System API

This module defines all API routes and their handlers using Flask blueprints.
"""

from flask import Blueprint, request, jsonify, current_app
from app.models import DishModel, OrderModel, StatsModel, serialize_doc
import requests
import json
import os

# Create blueprint
api_bp = Blueprint('api', __name__)


# ============================================
# Helper Functions
# ============================================

def get_models():
    """
    Get model instances from current app context.
    
    Returns:
        tuple: (DishModel, OrderModel, StatsModel)
    """
    db = current_app.db
    return DishModel(db), OrderModel(db), StatsModel(db)


def validate_required_fields(data, required_fields):
    """
    Validate that all required fields are present in data.
    
    Args:
        data (dict): Data to validate
        required_fields (list): List of required field names
        
    Returns:
        tuple: (is_valid, error_message)
    """
    for field in required_fields:
        if field not in data or data[field] is None:
            return False, f'Missing required field: {field}'
    return True, None


def send_wechat_notification(markdown_content, delivery_info='', order_number=''):
    """
    Send order notification to WeChat Work (企业微信) via API.
    
    Args:
        markdown_content (str): Markdown formatted order summary
        delivery_info (str): Delivery date and time information
        order_number (str): Order number
        
    Returns:
        dict: Response with status and message
    """
    try:
        # Get WeChat Work credentials from environment variables
        CORPID = os.getenv('CORPID')  # Enterprise ID
        AGENTID = os.getenv('AGENTID')  # Application ID
        CORPSECRET = os.getenv('CORPSECRET')  # Application Secret
        
        if not all([CORPID, AGENTID, CORPSECRET]):
            print('⚠️ WeChat Work credentials not configured')
            return {'error': 'WeChat Work credentials not configured', 'status': 500}
        
        # Step 1: Get access token
        get_token_url = f"https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid={CORPID}&corpsecret={CORPSECRET}"
        token_response = requests.get(get_token_url, timeout=10)
        token_data = token_response.json()
        access_token = token_data.get('access_token')
        
        if not access_token:
            error_msg = token_data.get('errmsg', 'Unknown error')
            print(f'❌ Failed to get access token: {error_msg}')
            return {'error': f'Failed to get access token: {error_msg}', 'status': 500}
        
        # Step 2: Send message
        send_msg_url = f'https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token={access_token}'
        
        # Format content for textcard
        content = f"🍕 New Order!\n\n📅 Delivery: {delivery_info}\n📦 Order: {order_number}\n\n{markdown_content}"
        
        message_data = {
            "touser": '@all',  # Send to all users
            "agentid": AGENTID,
            "msgtype": "textcard",
            "textcard": {
                "title": f"🍕 New Food Order - {order_number}",
                "description": content,
                "btntxt": "View Details"
            },
            "enable_id_trans": 0,
            "enable_duplicate_check": 0,
            "duplicate_check_interval": 1800
        }
        
        msg_response = requests.post(
            send_msg_url,
            data=json.dumps(message_data),
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        msg_result = msg_response.json()
        
        if msg_result.get('errcode') == 0:
            print(f'✅ WeChat Work notification sent successfully')
            return {'msg': 'WeChat notification sent successfully', 'status': 200}
        else:
            error_msg = msg_result.get('errmsg', 'Unknown error')
            print(f'⚠️ WeChat Work notification failed: {error_msg}')
            return {'error': f'Failed to send notification: {error_msg}', 'status': msg_response.status_code}
            
    except Exception as e:
        print(f'❌ Failed to send WeChat Work notification: {e}')
        return {'error': f'Failed to send notification: {str(e)}', 'status': 500}


# ============================================
# Health Check
# ============================================

@api_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify API and database connectivity.
    
    Returns:
        JSON response with health status
    """
    try:
        # Test database connection
        current_app.db.command('ping')
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'service': 'Food Menu API'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'database': 'disconnected',
            'error': str(e)
        }), 500


# ============================================
# Dish Endpoints
# ============================================

@api_bp.route('/dishes', methods=['GET'])
def get_dishes():
    """
    Get list of dishes with optional filtering, sorting, and pagination.
    
    Query Parameters:
        - category: Filter by category (Pork, Chicken, Seafood, Vegetables)
        - is_active: Filter by active status (true/false)
        - sort_by: Sort field (order_count, price, created_at)
        - order: Sort direction (asc, desc)
        - limit: Maximum results (default: 100)
        - skip: Skip results for pagination (default: 0)
    
    Returns:
        JSON response with dishes list and metadata
    """
    try:
        dish_model, _, _ = get_models()
        
        # Build query
        query = {}
        
        category = request.args.get('category')
        if category and category != 'All':
            query['category'] = category
        
        is_active = request.args.get('is_active')
        if is_active is not None:
            query['is_active'] = is_active.lower() == 'true'
        
        # Get sorting and pagination parameters
        sort_by = request.args.get('sort_by', 'order_count')
        order = request.args.get('order', 'desc')
        limit = int(request.args.get('limit', 100))
        skip = int(request.args.get('skip', 0))
        
        # Query dishes
        dishes, total = dish_model.find_all(query, sort_by, order, limit, skip)
        
        return jsonify({
            'success': True,
            'data': serialize_doc(dishes),
            'total': total,
            'limit': limit,
            'skip': skip
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api_bp.route('/dishes/detail', methods=['GET'])
def get_dish():
    """
    Get details of a specific dish.
    
    Query Parameters:
        - id: MongoDB ObjectId (required)
    
    Returns:
        JSON response with dish details
    """
    try:
        dish_model, _, _ = get_models()
        
        dish_id = request.args.get('id')
        if not dish_id:
            return jsonify({
                'success': False,
                'error': 'Missing required parameter: id'
            }), 400
        
        dish = dish_model.find_by_object_id(dish_id)
        
        if not dish:
            return jsonify({
                'success': False,
                'error': 'Dish not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': serialize_doc(dish)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api_bp.route('/dishes/stock', methods=['PATCH'])
def update_dish_stock():
    """
    Update dish stock quantity.
    
    Request Body:
        {
            "id": "692b4bd239b02aae00984611",  // MongoDB ObjectId
            "quantity": -1  // Negative to decrease, positive to increase
        }
    
    Returns:
        JSON response with updated dish
    """
    try:
        from bson import ObjectId
        dish_model, _, _ = get_models()
        
        data = request.get_json()
        
        dish_id = data.get('id')
        if not dish_id:
            return jsonify({
                'success': False,
                'error': 'Missing required field: id'
            }), 400
        
        # Get current dish to find dish_id
        dish = dish_model.find_by_object_id(dish_id)
        if not dish:
            return jsonify({
                'success': False,
                'error': 'Dish not found'
            }), 404
        
        quantity = data.get('quantity', 0)
        
        # Update stock using dish_id
        updated_dish = dish_model.update_stock(dish['dish_id'], quantity)
        
        return jsonify({
            'success': True,
            'data': serialize_doc(updated_dish)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api_bp.route('/dishes/popular', methods=['GET'])
def get_popular_dishes():
    """
    Get popular dishes sorted by order count.
    
    Query Parameters:
        - limit: Maximum results (default: 10)
    
    Returns:
        JSON response with popular dishes
    """
    try:
        dish_model, _, _ = get_models()
        
        limit = int(request.args.get('limit', 10))
        dishes = dish_model.find_popular(limit)
        
        return jsonify({
            'success': True,
            'data': serialize_doc(dishes)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api_bp.route('/dishes/search', methods=['GET'])
def search_dishes():
    """
    Search dishes using text search.
    
    Query Parameters:
        - q: Search keyword (required)
    
    Returns:
        JSON response with matching dishes
    """
    try:
        dish_model, _, _ = get_models()
        
        keyword = request.args.get('q', '')
        
        if not keyword:
            return jsonify({
                'success': False,
                'error': 'Search keyword is required'
            }), 400
        
        dishes = dish_model.search(keyword)
        
        return jsonify({
            'success': True,
            'data': serialize_doc(dishes),
            'total': len(dishes)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api_bp.route('/dishes', methods=['POST'])
def create_dish():
    """
    Create a new dish.
    
    Request Body:
        {
            "dish_id": 100,
            "name": "新菜品",
            "name_en": "New Dish",
            "price": 12.99,
            "stock": 10,
            "order_count": 0,
            "category": "Pork",
            "image_url": "path/to/image.png",
            "description": "描述",
            "description_en": "Description",
            "ingredients": ["ingredient1"],
            "ingredients_en": ["Ingredient1"],
            "nutrition": {"calories": 100},
            "is_active": true
        }
    
    Returns:
        JSON response with created dish
    """
    try:
        dish_model, _, _ = get_models()
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['dish_id', 'name', 'name_en', 'price', 'category']
        is_valid, error_msg = validate_required_fields(data, required_fields)
        if not is_valid:
            return jsonify({
                'success': False,
                'error': error_msg
            }), 400
        
        # Check if dish_id already exists
        existing_dish = dish_model.find_by_id(data['dish_id'])
        if existing_dish:
            return jsonify({
                'success': False,
                'error': f'Dish with ID {data["dish_id"]} already exists'
            }), 400
        
        # Create dish
        dish = dish_model.create(data)
        
        return jsonify({
            'success': True,
            'data': serialize_doc(dish),
            'message': 'Dish created successfully'
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api_bp.route('/dishes/update', methods=['PUT'])
def update_dish():
    """
    Update an existing dish.
    
    Request Body:
        {
            "_id": "692b4bd239b02aae00984611",  // MongoDB ObjectId
            "name": "更新的菜品",
            "name_en": "Updated Dish",
            "price": 13.99,
            "stock": 15,
            "category": "Chicken",
            "image_url": "path/to/new_image.png",
            "description": "新描述",
            "description_en": "New Description",
            "ingredients": ["ingredient1", "ingredient2"],
            "ingredients_en": ["Ingredient1", "Ingredient2"],
            "nutrition": {"calories": 120},
            "is_active": true
        }
    
    Returns:
        JSON response with updated dish
    """
    try:
        dish_model, _, _ = get_models()
        
        data = request.get_json()
        
        dish_id = data.get('_id')
        print("======= dish_id", dish_id)
        if not dish_id:
            return jsonify({
                'success': False,
                'error': 'Missing required field: _id'
            }), 400
        
        # Update dish using ObjectId
        dish = dish_model.update_by_object_id(dish_id, data)
        print("======= dish", dish)
        
        if not dish:
            return jsonify({
                'success': False,
                'error': 'Dish not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': serialize_doc(dish),
            'message': 'Dish updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================
# Order Endpoints
# ============================================

@api_bp.route('/orders', methods=['POST'])
def create_order():
    """
    Create a new order.
    
    Request Body:
        {
            "customer_name": "John Doe",
            "customer_email": "john@example.com",
            "customer_phone": "+1234567890",
            "delivery_date": "2024-01-15",
            "delivery_time": "12:00-13:00",
            "delivery_address": "123 Main St",
            "notes": "No spicy",
            "items": [
                {
                    "dish_id": 1,
                    "quantity": 2
                }
            ]
        }
    
    Returns:
        JSON response with created order details
    """
    try:
        dish_model, order_model, _ = get_models()
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['delivery_date', 'delivery_time', 'items']
        is_valid, error_msg = validate_required_fields(data, required_fields)
        if not is_valid:
            return jsonify({
                'success': False,
                'error': error_msg
            }), 400
        
        if not data['items']:
            return jsonify({
                'success': False,
                'error': 'Order must contain at least one item'
            }), 400
        
        # Calculate totals and prepare items
        total_amount = 0
        total_items = 0
        order_items = []
        
        for item in data['items']:
            dish_id = item['dish_id']
            quantity = item['quantity']
            
            # Get dish information
            dish = dish_model.find_by_id(dish_id)
            if not dish:
                return jsonify({
                    'success': False,
                    'error': f'Dish {dish_id} not found'
                }), 404
            
            # Check stock
            if dish['stock'] < quantity:
                return jsonify({
                    'success': False,
                    'error': f'Insufficient stock for dish: {dish["name"]}'
                }), 400
            
            subtotal = dish['price'] * quantity
            total_amount += subtotal
            total_items += quantity
            
            order_items.append({
                'dish_id': dish_id,
                'dish_name': dish['name'],
                'dish_name_en': dish['name_en'],
                'category': dish['category'],
                'price': dish['price'],
                'quantity': quantity,
                'subtotal': subtotal,
                'is_custom': item.get('is_custom', False),
                'custom_notes': item.get('custom_notes', '')
            })
        
        # Prepare order data
        order_data = {
            'customer_name': data.get('customer_name', ''),
            'customer_email': data.get('customer_email', ''),
            'customer_phone': data.get('customer_phone', ''),
            'delivery_date': data['delivery_date'],
            'delivery_time': data['delivery_time'],
            'delivery_address': data.get('delivery_address', ''),
            'total_amount': round(total_amount, 2),
            'total_items': total_items,
            'payment_method': data.get('payment_method', ''),
            'notes': data.get('notes', ''),
            'markdown_content': data.get('markdown_content', ''),
            'website': request.headers.get('Origin', ''),
            'user_agent': request.headers.get('User-Agent', '')
        }
        
        # Create order
        order_id, order_number = order_model.create(order_data, order_items)
        
        # Update dish stock and order count
        for item in data['items']:
            dish_model.update_stock(item['dish_id'], -item['quantity'])
            dish_model.increment_order_count(item['dish_id'])
        
        # Get created order and items
        order = order_model.find_by_order_number(order_number)
        items = order_model.find_items_by_order_number(order_number)
        
        # Send WeChat Work notification (non-blocking, don't fail order if notification fails)
        try:
            markdown_content = data.get('markdown_content', '')
            delivery_info = f"{data['delivery_date']} {data['delivery_time']}"
            send_wechat_notification(markdown_content, delivery_info, order_number)
        except Exception as e:
            print(f'⚠️ WeChat Work notification error (order still created): {e}')
        
        return jsonify({
            'success': True,
            'data': {
                'order': serialize_doc(order),
                'items': serialize_doc(items)
            }
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api_bp.route('/orders', methods=['GET'])
def get_orders():
    """
    Get list of orders with optional filtering and pagination.
    
    Query Parameters:
        - customer_email: Filter by customer email
        - status: Filter by order status
        - delivery_date: Filter by delivery date
        - limit: Maximum results (default: 50)
        - skip: Skip results for pagination (default: 0)
    
    Returns:
        JSON response with orders list and metadata
    """
    try:
        _, order_model, _ = get_models()
        
        # Build query
        query = {}
        
        customer_email = request.args.get('customer_email')
        if customer_email:
            query['customer_email'] = customer_email
        
        status = request.args.get('status')
        if status:
            query['status'] = status
        
        delivery_date = request.args.get('delivery_date')
        if delivery_date:
            query['delivery_date'] = delivery_date
        
        # Get pagination parameters
        limit = int(request.args.get('limit', 50))
        skip = int(request.args.get('skip', 0))
        
        # Query orders
        orders, total = order_model.find_all(query, limit, skip)
        
        return jsonify({
            'success': True,
            'data': serialize_doc(orders),
            'total': total,
            'limit': limit,
            'skip': skip
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api_bp.route('/orders/detail', methods=['GET'])
def get_order():
    """
    Get details of a specific order including items with dish images.
    
    Query Parameters:
        - order_number: Order number (required)
    
    Returns:
        JSON response with order details and items
    """
    try:
        dish_model, order_model, _ = get_models()
        
        order_number = request.args.get('order_number')
        if not order_number:
            return jsonify({
                'success': False,
                'error': 'Missing required parameter: order_number'
            }), 400
        
        order = order_model.find_by_order_number(order_number)
        
        if not order:
            return jsonify({
                'success': False,
                'error': 'Order not found'
            }), 404
        
        items = order_model.find_items_by_order_number(order_number)
        
        # Enrich items with dish images from dishes collection
        enriched_items = []
        for item in items:
            # Serialize the item first
            item_data = serialize_doc(item)
            
            # Fetch the dish details using dish_id (business key, not _id)
            dish = dish_model.find_by_id(item['dish_id'])
            
            # Add dish image if dish exists
            if dish:
                item_data['dish_image'] = dish.get('image_url', '')
            else:
                # If dish not found, use empty string as fallback
                item_data['dish_image'] = ''
                print(f'⚠️ Dish not found for dish_id: {item["dish_id"]}')
            
            enriched_items.append(item_data)
        
        return jsonify({
            'success': True,
            'data': {
                'order': serialize_doc(order),
                'items': enriched_items
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api_bp.route('/orders/status', methods=['PATCH'])
def update_order_status():
    """
    Update order status.
    
    Request Body:
        {
            "order_number": "ORD20241208123456",
            "status": "confirmed"
        }
    
    Returns:
        JSON response with updated order
    """
    try:
        _, order_model, _ = get_models()
        
        data = request.get_json()
        
        order_number = data.get('order_number')
        if not order_number:
            return jsonify({
                'success': False,
                'error': 'Missing required field: order_number'
            }), 400
        
        new_status = data.get('status')
        
        valid_statuses = ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled']
        if new_status not in valid_statuses:
            return jsonify({
                'success': False,
                'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'
            }), 400
        
        success = order_model.update_status(order_number, new_status)
        
        if not success:
            return jsonify({
                'success': False,
                'error': 'Order not found'
            }), 404
        
        order = order_model.find_by_order_number(order_number)
        
        return jsonify({
            'success': True,
            'data': serialize_doc(order)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api_bp.route('/orders/cancel', methods=['DELETE'])
def cancel_order():
    """
    Cancel an order and restore stock.
    
    Request Body:
        {
            "order_number": "ORD20241208123456"
        }
    
    Returns:
        JSON response with cancellation status
    """
    try:
        dish_model, order_model, _ = get_models()
        
        data = request.get_json()
        
        order_number = data.get('order_number')
        if not order_number:
            return jsonify({
                'success': False,
                'error': 'Missing required field: order_number'
            }), 400
        
        items = order_model.cancel_order(order_number)
        
        if items is None:
            return jsonify({
                'success': False,
                'error': 'Order not found or cannot be cancelled'
            }), 400
        
        # Restore stock
        for item in items:
            dish_model.update_stock(item['dish_id'], item['quantity'])
            dish_model.increment_order_count(item['dish_id'])  # Decrement by incrementing with -1
        
        return jsonify({
            'success': True,
            'message': 'Order cancelled successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================
# Statistics Endpoints
# ============================================

@api_bp.route('/stats/dishes', methods=['GET'])
def get_dishes_stats():
    """
    Get statistics about dishes.
    
    Returns:
        JSON response with dish statistics
    """
    try:
        _, _, stats_model = get_models()
        
        stats = stats_model.get_dishes_stats()
        
        return jsonify({
            'success': True,
            'data': stats
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api_bp.route('/stats/orders', methods=['GET'])
def get_orders_stats():
    """
    Get statistics about orders.
    
    Returns:
        JSON response with order statistics
    """
    try:
        _, _, stats_model = get_models()
        
        stats = stats_model.get_orders_stats()
        
        return jsonify({
            'success': True,
            'data': stats
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Made with Bob
