"""
Module for managing user context and state
Handles session management, order details, and state transitions
"""
import logging
from datetime import datetime, timedelta
import os

logger = logging.getLogger(__name__)

# --- State Constants ---
STATE_GENERAL = "GENERAL"
STATE_AWAITING_QUANTITY = "AWAITING_QUANTITY"
STATE_AWAITING_MORE_ITEMS = "AWAITING_MORE_ITEMS"  # New state for multiple items
STATE_AWAITING_DINING_OPTION = "AWAITING_DINING_OPTION"
STATE_AWAITING_TAKEOUT_TYPE = "AWAITING_TAKEOUT_TYPE"
STATE_AWAITING_PAYMENT_METHOD = "AWAITING_PAYMENT_METHOD"

# --- Context Configuration ---
CONTEXT_EXPIRY_MINUTES = 30
REFERENTIAL_KEYWORDS = ["that", "that item", "the item", "the previous one", "the recent one", "this"]

# --- Global Context Storage ---
user_contexts = {}

def get_user_state(user_id):
    """
    Gets current user state with expiry validation
    Returns: STATE_GENERAL if expired or not found
    """
    if user_id in user_contexts:
        context_data = user_contexts[user_id]
        if 'timestamp' in context_data and \
           (datetime.now() - context_data['timestamp'] < timedelta(minutes=CONTEXT_EXPIRY_MINUTES)):
            return context_data.get('state', STATE_GENERAL)
        else:
            logger.info(f"Context for user {user_id} expired. Deleted.")
            if user_id in user_contexts:
                del user_contexts[user_id]
            return STATE_GENERAL
    return STATE_GENERAL

def set_user_state(user_id, state):
    """
    Sets user state and initializes context data structure
    """
    now = datetime.now()
    if user_id not in user_contexts or \
       (now - user_contexts[user_id].get('timestamp', datetime.min) >= timedelta(minutes=CONTEXT_EXPIRY_MINUTES)):
        # Initialize new context
        user_contexts[user_id] = {
            'state': state,
            'order_details': {
                'items': [],
                'current_item_to_add_data': None,
                'dining_option': None,
                'takeout_type': None,
                'payment_method': None,
                'total_price': 0,
                'order_id': None
            },
            'last_inquired_item_data': None,
            'timestamp': now
        }
        logger.info(f"New context initialized for user {user_id}. State: {state}")
    else:
        # Update state existing context
        user_contexts[user_id]['state'] = state
        user_contexts[user_id]['timestamp'] = now

    logger.info(f"State for user {user_id} set to {state}.")

def get_order_details(user_id):
    """
    Gets user order details with validation
    Returns: dict order_details or {} if invalid
    """
    if user_id in user_contexts and get_user_state(user_id) != STATE_GENERAL:
        # Initialize order_details if not exists (safety check)
        if 'order_details' not in user_contexts[user_id]:
             user_contexts[user_id]['order_details'] = {
                'items': [], 'current_item_to_add_data': None, 'dining_option': None,
                'takeout_type': None, 'payment_method': None, 'total_price': 0, 'order_id': None
            }
        return user_contexts[user_id].get('order_details', {})
    return {}

def set_current_item_to_add(user_id, item_data):
    """
    Stores item to be added to order (waiting for quantity input)
    """
    if user_id in user_contexts:
        # Ensure order_details exists
        if 'order_details' not in user_contexts[user_id]:
             user_contexts[user_id]['order_details'] = {
                'items': [], 'current_item_to_add_data': None, 'dining_option': None,
                'takeout_type': None, 'payment_method': None, 'total_price': 0, 'order_id': None
            }
        user_contexts[user_id]['order_details']['current_item_to_add_data'] = item_data
        user_contexts[user_id]['timestamp'] = datetime.now()
        logger.info(f"User {user_id}: Item '{item_data['name']}' prepared for quantity addition.")

def add_item_to_current_order(user_id, quantity):
    """
    Adds item with quantity to current order
    Returns: True if successful, False if failed
    """
    if user_id not in user_contexts:
        logger.warning(f"User {user_id} has no context when trying to add item.")
        return False

    order_details = user_contexts[user_id].get('order_details')
    if not order_details:
        logger.error(f"User {user_id}: 'order_details' not found in context during add_item_to_current_order.")
        return False

    item_to_add_data = order_details.get('current_item_to_add_data')
    if not item_to_add_data:
        logger.warning(f"User {user_id}: No 'current_item_to_add_data' when adding quantity.")
        return False

    # Check if item already exists in order, if so add quantity
    found = False
    if 'items' not in order_details:
        order_details['items'] = []

    for item_in_order in order_details['items']:
        if item_in_order['item_data']['id'] == item_to_add_data['id']:
            item_in_order['quantity'] += int(quantity)
            found = True
            break

    if not found:
        order_details['items'].append({'item_data': item_to_add_data, 'quantity': int(quantity)})

    # Reset current_item_to_add after successful addition
    order_details['current_item_to_add_data'] = None
    user_contexts[user_id]['timestamp'] = datetime.now()
    calculate_total_price(user_id)
    logger.info(f"User {user_id}: Item '{item_to_add_data['name']}' x{quantity} successfully added/updated to order.")
    return True

def calculate_total_price(user_id):
    """
    Calculates total order price and stores it in context
    Returns: total price or 0 if no items
    """
    order_details = get_order_details(user_id)
    if order_details and order_details.get('items'):
        total = sum(item['item_data']['price'] * item['quantity'] for item in order_details['items'])
        if user_id in user_contexts and 'order_details' in user_contexts[user_id]:
            user_contexts[user_id]['order_details']['total_price'] = total
            logger.info(f"User {user_id}: Total order price calculated ${total:,}")
            return total
    return 0

def generate_order_id(user_id):
    """
    Generate unique ID for order
    Format: KC[YYMMDD]-[4digit_user][2hex_random]
    """
    now = datetime.now()
    user_part = str(user_id)[-4:]
    random_part = str(os.urandom(2).hex().upper())
    return f"KC{now.strftime('%y%m%d')}-{user_part}{random_part}"

def reset_order_details(user_id):
    """
    Clears order details after completion or cancellation
    """
    if user_id in user_contexts and 'order_details' in user_contexts[user_id]:
        user_contexts[user_id]['order_details'] = {
            'items': [],
            'current_item_to_add_data': None,
            'dining_option': None,
            'takeout_type': None,
            'payment_method': None,
            'total_price': 0,
            'order_id': None
        }
        logger.info(f"Order details for user {user_id} have been reset.")

def set_last_inquired_item(user_id, item_data):
    """
    Stores last item asked by user (for references like 'that', 'the previous one', etc.)
    """
    if user_id in user_contexts:
        user_contexts[user_id]['last_inquired_item_data'] = item_data
        user_contexts[user_id]['timestamp'] = datetime.now()
        logger.info(f"User {user_id}: Last inquired item set to '{item_data['name']}'")

def get_last_inquired_item(user_id):
    """
    Gets last item asked by user with expiry validation
    """
    if user_id in user_contexts and user_contexts[user_id].get('last_inquired_item_data'):
        if (datetime.now() - user_contexts[user_id].get('timestamp', datetime.min) < timedelta(minutes=CONTEXT_EXPIRY_MINUTES)):
            return user_contexts[user_id]['last_inquired_item_data']
    return None

def update_order_field(user_id, field_name, value):
    """
    Updates specific field in order_details
    """
    if user_id in user_contexts and 'order_details' in user_contexts[user_id]:
        user_contexts[user_id]['order_details'][field_name] = value
        user_contexts[user_id]['timestamp'] = datetime.now()
        logger.info(f"User {user_id}: Order field '{field_name}' updated to '{value}'")
