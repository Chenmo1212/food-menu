"""
Database Models and Helper Functions
Food Menu System API

This module contains database model definitions and helper functions
for interacting with MongoDB collections.
"""

from datetime import datetime
from bson import ObjectId
import random


class DishModel:
    """Model for dish-related database operations"""
    
    def __init__(self, db):
        """
        Initialize DishModel with database connection.
        
        Args:
            db: MongoDB database instance
        """
        self.collection = db['dishes']
    
    def find_all(self, query=None, sort_by='order_count', order='desc', limit=100, skip=0):
        """
        Find all dishes matching the query.
        
        Args:
            query (dict): MongoDB query filter
            sort_by (str): Field to sort by
            order (str): Sort order ('asc' or 'desc')
            limit (int): Maximum number of results
            skip (int): Number of results to skip
            
        Returns:
            tuple: (list of dishes, total count)
        """
        if query is None:
            query = {}
        
        sort_direction = -1 if order == 'desc' else 1
        
        dishes = list(self.collection.find(query)
                     .sort(sort_by, sort_direction)
                     .skip(skip)
                     .limit(limit))
        
        total = self.collection.count_documents(query)
        
        return dishes, total
    
    def find_by_object_id(self, object_id):
        """
        Find a dish by its MongoDB _id (ObjectId).
        
        Args:
            object_id (str or ObjectId): MongoDB ObjectId
            
        Returns:
            dict: Dish document or None
        """
        try:
            if isinstance(object_id, str):
                object_id = ObjectId(object_id)
            result = self.collection.find_one({'_id': object_id})
            return result
        except Exception as e:
            import traceback
            traceback.print_exc()
            return None
    
    def update_stock(self, dish_id, quantity):
        """
        Update dish stock by adding/subtracting quantity.
        
        Args:
            dish_id (int): Dish ID
            quantity (int): Quantity to add (positive) or subtract (negative)
            
        Returns:
            dict: Updated dish document or None
        """
        result = self.collection.update_one(
            {'dish_id': dish_id},
            {
                '$inc': {'stock': quantity},
                '$set': {'updated_at': datetime.now()}
            }
        )
        
        if result.matched_count == 0:
            return None
        
        return self.find_by_object_id(dish_id)
    
    def find_popular(self, limit=10):
        """
        Find popular dishes sorted by order count.
        
        Args:
            limit (int): Maximum number of results
            
        Returns:
            list: List of popular dishes
        """
        return list(self.collection.find({'is_active': True})
                   .sort('order_count', -1)
                   .limit(limit))
    
    def search(self, keyword):
        """
        Search dishes using text search.
        
        Args:
            keyword (str): Search keyword
            
        Returns:
            list: List of matching dishes
        """
        return list(self.collection.find(
            {'$text': {'$search': keyword}},
            {'score': {'$meta': 'textScore'}}
        ).sort([('score', {'$meta': 'textScore'})]))
    
    def increment_order_count(self, dish_id, count=1):
        """
        Increment or decrement the order count for a dish.
        
        Args:
            dish_id (int or ObjectId): Dish ID or MongoDB ObjectId
            count (int): Amount to increment (positive) or decrement (negative). Default is 1.
        """
        # Handle both dish_id (int) and ObjectId
        if isinstance(dish_id, str):
            query = {'_id': ObjectId(dish_id)}
        else:
            query = {'_id': dish_id}
        
        self.collection.update_one(
            query,
            {
                '$inc': {'order_count': count},
                '$set': {'updated_at': datetime.now()}
            }
        )
    
    def create(self, dish_data):
        """
        Create a new dish.
        
        Args:
            dish_data (dict): Dish information
            
        Returns:
            dict: Created dish document
        """
        # Prepare dish document
        dish_doc = {
            'name': dish_data['name'],
            'name_en': dish_data['name_en'],
            'price': dish_data['price'],
            'stock': dish_data.get('stock', 0),
            'order_count': dish_data.get('order_count', 0),
            'category': dish_data['category'],
            'image_url': dish_data.get('image_url', ''),
            'description': dish_data.get('description', ''),
            'description_en': dish_data.get('description_en', ''),
            'ingredients': dish_data.get('ingredients', []),
            'ingredients_en': dish_data.get('ingredients_en', []),
            'nutrition': dish_data.get('nutrition', {}),
            'is_active': dish_data.get('is_active', True),
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        # Insert dish (MongoDB will auto-generate _id)
        result = self.collection.insert_one(dish_doc)
        
        # Return created dish
        return self.collection.find_one({'_id': result.inserted_id})
    
    def update(self, dish_id, dish_data):
        """
        Update an existing dish.
        
        Args:
            dish_id (int): Dish ID
            dish_data (dict): Updated dish information
            
        Returns:
            dict: Updated dish document or None
        """
        # Prepare update data
        update_doc = {
            'name': dish_data['name'],
            'name_en': dish_data['name_en'],
            'price': dish_data['price'],
            'category': dish_data['category'],
            'updated_at': datetime.now()
        }
        
        # Add optional fields if provided
        optional_fields = [
            'stock', 'order_count', 'image_url', 'description',
            'description_en', 'ingredients', 'ingredients_en',
            'nutrition', 'is_active'
        ]
        
        for field in optional_fields:
            if field in dish_data:
                update_doc[field] = dish_data[field]
        
        # Update dish
        result = self.collection.update_one(
            {'dish_id': dish_id},
            {'$set': update_doc}
        )
        
        if result.matched_count == 0:
            return None
        
        return self.find_by_object_id(dish_id)
    
    def update_by_object_id(self, object_id, dish_data):
        """
        Update an existing dish by MongoDB _id.
        
        Args:
            object_id (str or ObjectId): MongoDB ObjectId
            dish_data (dict): Updated dish information
            
        Returns:
            dict: Updated dish document or None
        """
        try:
            if isinstance(object_id, str):
                object_id = ObjectId(object_id)
            
            # Prepare update data
            update_doc = {
                'updated_at': datetime.now()
            }
            
            # Add all fields from dish_data except _id, created_at, and updated_at
            # These datetime fields should not be overwritten with string values
            skip_fields = ['_id', 'created_at', 'updated_at']
            
            for key, value in dish_data.items():
                if key not in skip_fields:
                    update_doc[key] = value
            result = self.collection.update_one(
                {'_id': object_id},
                {'$set': update_doc}
            )
            if result.matched_count == 0:
                return None
            
            return self.find_by_object_id(object_id)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return None


class OrderModel:
    """Model for order-related database operations"""
    
    def __init__(self, db):
        """
        Initialize OrderModel with database connection.
        
        Args:
            db: MongoDB database instance
        """
        self.collection = db['orders']
        self.items_collection = db['order_items']
    
    def generate_order_number(self):
        """
        Generate a unique order number.
        
        Returns:
            str: Order number in format ORD{timestamp}{random}
        """
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        random_num = random.randint(1000, 9999)
        return f"ORD{timestamp}{random_num}"
    
    def create(self, order_data, items_data):
        """
        Create a new order with items.
        
        Args:
            order_data (dict): Order information
            items_data (list): List of order items
            
        Returns:
            tuple: (order_id, order_number)
        """
        # Generate order number
        order_number = self.generate_order_number()
        
        # Prepare order document
        order_doc = {
            'order_number': order_number,
            'customer_name': order_data.get('customer_name', ''),
            'customer_email': order_data.get('customer_email', ''),
            'customer_phone': order_data.get('customer_phone', ''),
            'delivery_date': order_data['delivery_date'],
            'delivery_time': order_data['delivery_time'],
            'delivery_address': order_data.get('delivery_address', ''),
            'total_amount': order_data['total_amount'],
            'total_items': order_data['total_items'],
            'status': 'pending',
            'payment_status': 'unpaid',
            'payment_method': order_data.get('payment_method', ''),
            'notes': order_data.get('notes', ''),
            'markdown_content': order_data.get('markdown_content', ''),
            'website': order_data.get('website', ''),
            'user_agent': order_data.get('user_agent', ''),
            'notification_sent': False,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        # Insert order
        order_result = self.collection.insert_one(order_doc)
        order_id = order_result.inserted_id
        
        # Prepare order items
        self.insert_order_items(order_id, order_number, items_data)
        
        return order_id, order_number

    def insert_order_items(self, order_id, order_number, items_data):
        """
        Insert order items into the database.
        """
        # Prepare order items
        for item in items_data:
            item['order_id'] = order_id
            item['order_number'] = order_number
            item['created_at'] = datetime.now()
            if isinstance(item['dish_id'], str):
                item['dish_id'] = ObjectId(item['dish_id'])
        
        # Insert order items
        self.items_collection.insert_many(items_data)
    
    def find_all(self, query=None, limit=50, skip=0):
        """
        Find all orders matching the query.
        
        Args:
            query (dict): MongoDB query filter
            limit (int): Maximum number of results
            skip (int): Number of results to skip
            
        Returns:
            tuple: (list of orders, total count)
        """
        if query is None:
            query = {}
        
        orders = list(self.collection.find(query)
                     .sort('created_at', -1)
                     .skip(skip)
                     .limit(limit))
        
        total = self.collection.count_documents(query)
        
        return orders, total
    
    def find_by_order_number(self, order_number):
        """
        Find an order by its order number.
        
        Args:
            order_number (str): Order number
            
        Returns:
            dict: Order document or None
        """
        return self.collection.find_one({'order_number': order_number})
    
    def find_items_by_order_number(self, order_number):
        """
        Find all items for an order.
        
        Args:
            order_number (str): Order number
            
        Returns:
            list: List of order items
        """
        return list(self.items_collection.find({'order_number': order_number}))
    
    def update_status(self, order_number, new_status):
        """
        Update order status.
        
        Args:
            order_number (str): Order number
            new_status (str): New status value
            
        Returns:
            bool: True if updated, False if not found
        """
        result = self.collection.update_one(
            {'order_number': order_number},
            {
                '$set': {
                    'status': new_status,
                    'updated_at': datetime.now()
                }
            }
        )
        
        return result.matched_count > 0
    
    def update_order(self, order_number, update_data):
        """
        Update order fields.
        
        Args:
            order_number (str): Order number
            update_data (dict): Fields to update
            
        Returns:
            dict: Updated order document or None
        """
        # Prepare update document
        update_doc = {
            'updated_at': datetime.now()
        }
        
        # Add all fields from update_data except protected fields
        skip_fields = ['_id', 'order_number', 'created_at', 'updated_at']
        
        for key, value in update_data.items():
            if key not in skip_fields:
                update_doc[key] = value
        
        # Update order
        result = self.collection.update_one(
            {'order_number': order_number},
            {'$set': update_doc}
        )
        
        if result.matched_count == 0:
            return None
        
        return self.find_by_order_number(order_number)
    
    def cancel_order(self, order_number):
        """
        Cancel an order and return items for stock restoration.
        
        Args:
            order_number (str): Order number
            
        Returns:
            list: List of items to restore stock, or None if order not found/cannot be cancelled
        """
        order = self.find_by_order_number(order_number)
        
        if not order:
            return None
        
        if order['status'] in ['completed', 'cancelled']:
            return None
        
        # Get order items
        items = self.find_items_by_order_number(order_number)
        
        # Update order status
        self.update_status(order_number, 'cancelled')
        
        return items


class StatsModel:
    """Model for statistics-related database operations"""
    
    def __init__(self, db):
        """
        Initialize StatsModel with database connection.
        
        Args:
            db: MongoDB database instance
        """
        self.dishes_collection = db['dishes']
        self.orders_collection = db['orders']
    
    def get_dishes_stats(self):
        """
        Get statistics about dishes.
        
        Returns:
            dict: Statistics including total dishes, stock, and category breakdown
        """
        # Category statistics
        category_stats = list(self.dishes_collection.aggregate([
            {'$match': {'is_active': True}},
            {
                '$group': {
                    '_id': '$category',
                    'count': {'$sum': 1},
                    'avg_price': {'$avg': '$price'},
                    'total_stock': {'$sum': '$stock'},
                    'total_orders': {'$sum': '$order_count'}
                }
            },
            {'$sort': {'count': -1}}
        ]))
        
        # Total statistics
        total_dishes = self.dishes_collection.count_documents({'is_active': True})
        
        total_stock_result = list(self.dishes_collection.aggregate([
            {'$match': {'is_active': True}},
            {'$group': {'_id': None, 'total': {'$sum': '$stock'}}}
        ]))
        total_stock = total_stock_result[0]['total'] if total_stock_result else 0
        
        return {
            'total_dishes': total_dishes,
            'total_stock': total_stock,
            'by_category': category_stats
        }
    
    def get_orders_stats(self):
        """
        Get statistics about orders.
        
        Returns:
            dict: Statistics including total orders, revenue, and status breakdown
        """
        # Status statistics
        status_stats = list(self.orders_collection.aggregate([
            {
                '$group': {
                    '_id': '$status',
                    'count': {'$sum': 1},
                    'total_amount': {'$sum': '$total_amount'}
                }
            }
        ]))
        
        # Total statistics
        total_orders = self.orders_collection.count_documents({})
        
        total_revenue_result = list(self.orders_collection.aggregate([
            {'$group': {'_id': None, 'total': {'$sum': '$total_amount'}}}
        ]))
        total_revenue = total_revenue_result[0]['total'] if total_revenue_result else 0
        
        return {
            'total_orders': total_orders,
            'total_revenue': round(total_revenue, 2),
            'by_status': status_stats
        }


def serialize_doc(doc):
    """
    Serialize MongoDB document to JSON-compatible format.
    Converts all ObjectId instances to strings and handles datetime objects.
    
    Args:
        doc: MongoDB document or list of documents
        
    Returns:
        dict or list: Serialized document(s)
    """
    if doc is None:
        return None
    
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    
    if not isinstance(doc, dict):
        return doc
    
    # Create a copy to avoid modifying the original
    serialized = {}
    
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            # Convert ObjectId to string
            serialized[key] = str(value)
        elif isinstance(value, datetime):
            # Convert datetime to ISO format string
            serialized[key] = value.isoformat()
        elif isinstance(value, dict):
            # Recursively serialize nested dictionaries
            serialized[key] = serialize_doc(value)
        elif isinstance(value, list):
            # Recursively serialize lists
            serialized[key] = [serialize_doc(item) if isinstance(item, (dict, ObjectId)) else item for item in value]
        else:
            serialized[key] = value
    
    return serialized

# Made with Bob
