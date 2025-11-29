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
    
    def find_by_id(self, dish_id):
        """
        Find a dish by its dish_id.
        
        Args:
            dish_id (int): Dish ID
            
        Returns:
            dict: Dish document or None
        """
        return self.collection.find_one({'dish_id': dish_id})
    
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
        
        return self.find_by_id(dish_id)
    
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
    
    def increment_order_count(self, dish_id):
        """
        Increment the order count for a dish.
        
        Args:
            dish_id (int): Dish ID
        """
        self.collection.update_one(
            {'dish_id': dish_id},
            {
                '$inc': {'order_count': 1},
                '$set': {'updated_at': datetime.now()}
            }
        )


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
        for item in items_data:
            item['order_id'] = order_id
            item['order_number'] = order_number
            item['created_at'] = datetime.now()
        
        # Insert order items
        self.items_collection.insert_many(items_data)
        
        return order_id, order_number
    
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
    
    Args:
        doc: MongoDB document or list of documents
        
    Returns:
        dict or list: Serialized document(s)
    """
    if doc is None:
        return None
    
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    
    return doc

# Made with Bob
