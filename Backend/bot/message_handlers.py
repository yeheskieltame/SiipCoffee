"""
Module for handling various types of messages and conversation states
Separates handling logic based on state and intent
"""
import logging
from datetime import datetime, timedelta

from bot.user_context import *

# Import NLP utilities and modules
try:
    from bot.nlp_utils import recognize_intent, extract_entities_item_name, extract_quantity, preprocess_text
    from modules.menu_manager import get_ordering_info
except ImportError as e:
    print(f"Failed to import dependencies: {e}")

logger = logging.getLogger(__name__)

async def handle_quantity_input(update, user_id, user_first_name, text):
    """
    Handler for quantity input when in STATE_AWAITING_QUANTITY
    """
    order_details = get_order_details(user_id)
    item_to_add_data = order_details.get('current_item_to_add_data') if order_details else None

    if not item_to_add_data:
        logger.warning(f"User {user_id} in AWAITING_QUANTITY state but 'current_item_to_add_data' is empty.")
        set_user_state(user_id, STATE_GENERAL)
        reset_order_details(user_id)
        await update.message.reply_text("Sorry, something seems to be wrong. Could you mention the item you want to order again?")
        return

    qty = extract_quantity(text)
    if qty and qty > 0:
        if not add_item_to_current_order(user_id, qty):
             set_user_state(user_id, STATE_GENERAL)
             reset_order_details(user_id)
             await update.message.reply_text("Sorry, there was an issue processing your order. Please try again.")
             return

        order_details = get_order_details(user_id)
        current_total = order_details.get('total_price', 0)

        item_names_in_order = []
        if order_details.get('items'):
            item_names_in_order = [f"{item['quantity']} {item['item_data']['name']}" for item in order_details['items']]
        order_summary = ", ".join(item_names_in_order) if item_names_in_order else "No items yet"

        set_user_state(user_id, STATE_AWAITING_MORE_ITEMS)
        await update.message.reply_text(
            f"Okay, {qty} {item_to_add_data['name']} has been added. "
            f"Your current order: {order_summary} (Subtotal: ${current_total:,}).\n\n"
            "Would you like to add another item? Type the menu name you want to add or type 'done' to proceed to payment."
        )
    else:
        await update.message.reply_text(f"Invalid quantity, {user_first_name}. How many would you like to order for {item_to_add_data['name']}?")

async def handle_dining_option_input(update, user_id, text):
    """
    Handler for dining option input (dine-in/takeaway)
    """
    order_details = get_order_details(user_id)
    if not order_details or not order_details.get('items'):
        logger.warning(f"User {user_id} in AWAITING_DINING_OPTION state but no items in order.")
        set_user_state(user_id, STATE_GENERAL)
        reset_order_details(user_id)
        await update.message.reply_text("Sorry, there was an error with your order. Would you like to start again?")
        return

    processed_text = preprocess_text(text)
    DINE_IN_KEYWORDS = ["eat here", "dine in", "dine", "here", "dinein", "at the place", "in place", "stay"]
    TAKEAWAY_KEYWORDS = ["take away", "takeaway", "take", "to go", "carry out", "wrapped", "take out", "pickup", "delivery"]

    chosen_dining_option = None
    if any(keyword in processed_text for keyword in DINE_IN_KEYWORDS):
        chosen_dining_option = "dine_in"
    elif any(keyword in processed_text for keyword in TAKEAWAY_KEYWORDS):
        chosen_dining_option = "takeaway"

    if chosen_dining_option:
        if user_id in user_contexts:
            update_order_field(user_id, 'dining_option', chosen_dining_option)
            total_price = order_details.get('total_price', 0)

            if chosen_dining_option == "dine_in":
                set_user_state(user_id, STATE_AWAITING_PAYMENT_METHOD)
                await update.message.reply_text(
                    f"Alright, for dining in. Your total order is ${total_price:,}.\n\n"
                    "Please select payment method: E-Wallet or Cash at Counter?"
                )
            elif chosen_dining_option == "takeaway":
                set_user_state(user_id, STATE_AWAITING_TAKEOUT_TYPE)
                await update.message.reply_text(
                    f"Alright, for takeaway. Your total order is ${total_price:,}.\n\n"
                    "Would you like self-pickup or Delivery?"
                )
        else:
            set_user_state(user_id, STATE_GENERAL)
            await update.message.reply_text("Sorry, your order session was not found. Please start again.")
    else:
        await update.message.reply_text("Please choose whether you'd like to dine in or take away?")

async def handle_takeout_type_input(update, user_id, text):
    """
    Handler for takeout type input (pickup/delivery)
    """
    order_details = get_order_details(user_id)
    if not order_details or order_details.get('dining_option') != 'takeaway':
        logger.warning(f"User {user_id} in AWAITING_TAKEOUT_TYPE state but dining option is not takeaway or no order.")
        set_user_state(user_id, STATE_GENERAL)
        reset_order_details(user_id)
        await update.message.reply_text("Sorry, there was an error. Restarting the order process.")
        return

    processed_text = preprocess_text(text)
    PICKUP_KEYWORDS = ["pickup", "self pickup", "self-pickup", "collect", "i'll pick up", "take myself"]
    DELIVERY_KEYWORDS = ["delivery", "deliver", "delivered", "to deliver", "home delivery"]

    chosen_takeout_type = None
    if any(keyword in processed_text for keyword in PICKUP_KEYWORDS):
        chosen_takeout_type = "pickup"
    elif any(keyword in processed_text for keyword in DELIVERY_KEYWORDS):
        chosen_takeout_type = "delivery"

    if chosen_takeout_type:
        if user_id in user_contexts:
            update_order_field(user_id, 'takeout_type', chosen_takeout_type)

            if chosen_takeout_type == "pickup":
                set_user_state(user_id, STATE_AWAITING_PAYMENT_METHOD)
                total_price = order_details.get('total_price', 0)
                await update.message.reply_text(
                    f"Okay, the order will be picked up by yourself. The total remains ${total_price:,}.\n\n"
                    "Please select payment method: E-Wallet or Cash at Counter?"
                )
            elif chosen_takeout_type == "delivery":
                set_user_state(user_id, STATE_GENERAL)
                reset_order_details(user_id)
                await update.message.reply_text(
                    "We apologize, but we currently cannot accommodate delivery orders.\n"
                    "Your order has been cancelled. If you'd like, you can place a new order for self-pickup."
                )
        else:
            set_user_state(user_id, STATE_GENERAL)
            await update.message.reply_text("Sorry, your order session was not found. Please start again.")
    else:
        await update.message.reply_text("Please choose whether you'd like self-pickup or delivery?")

async def handle_payment_method_input(update, user_id, user_first_name, text):
    """
    Handler for payment method input and order finalization
    """
    order_details = get_order_details(user_id)
    if not order_details or not order_details.get('items'):
        logger.warning(f"User {user_id} in AWAITING_PAYMENT_METHOD state but no items in order.")
        set_user_state(user_id, STATE_GENERAL)
        reset_order_details(user_id)
        await update.message.reply_text("Sorry, there was an error with your order. Would you like to start again?")
        return

    processed_text = preprocess_text(text)
    EWALLET_KEYWORDS = ["e-wallet", "wallet", "qris", "gopay", "ovo", "dana", "linkaja", "ewallet", "digital wallet", "electronic wallet"]
    CASH_KEYWORDS = ["cash", "at counter", "tunai", "kontan", "pay at counter", "cashier"]

    chosen_payment_method = None
    if any(keyword in processed_text for keyword in EWALLET_KEYWORDS):
        chosen_payment_method = "E-Wallet"
    elif any(keyword in processed_text for keyword in CASH_KEYWORDS):
        chosen_payment_method = "Cash"

    if chosen_payment_method:
        if user_id in user_contexts:
            update_order_field(user_id, 'payment_method', chosen_payment_method)

            order_id = generate_order_id(user_id)
            update_order_field(user_id, 'order_id', order_id)

            # Generate receipt
            receipt_message = await generate_receipt(order_details, order_id, chosen_payment_method, user_first_name)
            await update.message.reply_text(receipt_message, parse_mode='Markdown')

            # Reset order after completion
            set_user_state(user_id, STATE_GENERAL)
            reset_order_details(user_id)
        else:
            set_user_state(user_id, STATE_GENERAL)
            await update.message.reply_text("Sorry, your order session was not found. Please start again.")
    else:
        await update.message.reply_text("Please select payment method: E-Wallet or Cash at Counter?")

async def generate_receipt(order_details, order_id, payment_method, user_first_name):
    """
    Generate receipt text for completed orders
    """
    total_price = order_details.get('total_price', 0)
    dining_option = order_details.get('dining_option')
    takeout_type = order_details.get('takeout_type')

    item_summary_list = [f"{item['quantity']}x {item['item_data']['name']}" for item in order_details.get('items', [])]
    item_summary_text = "\n- ".join(item_summary_list) if item_summary_list else "No items"

    receipt_text = (
        f"--- Mata Kopian Order Receipt ---\n"
        f"Order Number: *{order_id}*\n"
        f"Date: {datetime.now().strftime('%d-%m-%Y %H:%M')}\n\n"
        f"Items Ordered:\n- {item_summary_text}\n\n"
        f"Total Price: *${total_price:,}*\n"
        f"Payment Method: {payment_method}\n"
    )

    preparation_time = "according to queue"
    if dining_option == "dine_in":
        receipt_text += "Dining Option: In-Place\n"
        preparation_time = "about 15 minutes"
    elif dining_option == "takeaway" and takeout_type == "pickup":
        receipt_text += "Dining Option: Takeaway (Self-Pickup)\n"
        preparation_time = "about 20 minutes"

    if payment_method == "E-Wallet":
        receipt_text += "\nPayment Status: *PAID (Simulation)*\n"
        final_message = (
            f"Payment via {payment_method} (simulation) of ${total_price:,} successful! 👍\n\n"
            f"{receipt_text}\n"
            f"Your order will be ready in {preparation_time}. Thank you for ordering, {user_first_name}!"
        )
    elif payment_method == "Cash":
        receipt_text += "\nPayment Status: *UNPAID*\n"
        final_message = (
            f"Alright, please make a payment of ${total_price:,} at the counter by showing Order Number *{order_id}*.\n\n"
            f"{receipt_text}\n"
            f"The order will be prepared after payment and will be ready in {preparation_time}. Thank you, {user_first_name}!"
        )

    return final_message

async def handle_general_intent(update, user_id, user_first_name, text):
    """
    Handler for intents in GENERAL state (menu, price, ordering, etc.)
    """
    # Ensure user context exists
    if user_id not in user_contexts:
        set_user_state(user_id, STATE_GENERAL)

    intent, score = recognize_intent(text)
    logger.info(f"Intent detected (State GENERAL): {intent} (Score: {score})")

    if intent == "view_menu":
        from bot.commands import menu_command
        await menu_command(update, None)

    elif intent == "ask_price":
        item_data = extract_entities_item_name(text)
        if item_data:
            set_last_inquired_item(user_id, item_data)
            await update.message.reply_text(
                f"The price for {item_data['name']} is ${item_data['price']:,}, {user_first_name}."
            )
        else:
            await update.message.reply_text(
                f"For price information, please mention a more specific item name, {user_first_name}. "
                "You can also check /menu."
            )

    elif intent == "order_info":
        item_to_order = None
        explicit_item_data = extract_entities_item_name(text)

        if explicit_item_data:
            item_to_order = explicit_item_data
            logger.info(f"User {user_id} wants to order explicit item: {item_to_order['name']}")
        elif any(keyword in text.lower() for keyword in REFERENTIAL_KEYWORDS + ["order", "want that", "buy that"]):
            item_to_order = get_last_inquired_item(user_id)
            if item_to_order:
                logger.info(f"User {user_id} wants to order item from context: {item_to_order['name']}")

        if item_to_order:
            set_user_state(user_id, STATE_AWAITING_QUANTITY)
            set_current_item_to_add(user_id, item_to_order)
            await update.message.reply_text(f"Alright, {item_to_order['name']}. How many would you like to order?")
        else:
            await update.message.reply_text(
                f"What would you like to order, {user_first_name}? Please mention the item name or check /menu first. "
                f"General ordering info: {get_ordering_info(force_reload=True)}"
            )

    elif intent == "greeting":
        await update.message.reply_text(f"Hello there, {user_first_name}! How can I help you?")

    elif intent == "thank_you":
        await update.message.reply_text(f"You're welcome, {user_first_name}! Happy to help. 😊")

    elif intent == "ask_bot":
        await update.message.reply_text(
            f"I am the Mata Kopian bot, {user_first_name}. I can help you view the menu, "
            "check prices, and process orders."
        )
    elif intent == "confirm_no":
        if user_id in user_contexts and user_contexts[user_id].get('state', STATE_GENERAL) != STATE_GENERAL:
            set_user_state(user_id, STATE_GENERAL)
            reset_order_details(user_id)
            await update.message.reply_text("Alright, the current order has been cancelled. Is there anything else I can help with?")
        else:
            await update.message.reply_text(f"Okay, {user_first_name}.")

    else:
        await update.message.reply_text(
            f"Sorry {user_first_name}, I don't understand what you mean. "
            "You can try asking about the menu, item prices, or how to order. "
            "Type /menu to see the complete menu list."
        )

async def handle_invalid_state_input(update, current_user_state):
    """
    Handler for input that doesn't match the current state
    Provides reminder messages according to state
    """
    if current_user_state == STATE_AWAITING_MORE_ITEMS:
        await update.message.reply_text("Please mention the menu name you want to add or type 'done' to proceed to payment.")
    elif current_user_state == STATE_AWAITING_DINING_OPTION:
        await update.message.reply_text("Would you like to dine in or take away?")
    elif current_user_state == STATE_AWAITING_TAKEOUT_TYPE:
        await update.message.reply_text("Would you like self-pickup or delivery?")
    elif current_user_state == STATE_AWAITING_PAYMENT_METHOD:
        await update.message.reply_text("Please select payment method: E-Wallet or Cash at Counter?")
    elif current_user_state == STATE_AWAITING_QUANTITY:
        await update.message.reply_text("Please enter the quantity of items you want to order (number).")

async def handle_more_items_input(update, user_id, user_first_name, text):
    """
    Handler for input when in STATE_AWAITING_MORE_ITEMS
    User can add other items or finish to proceed to payment
    """
    processed_text = text.lower().strip()

    # Keywords to complete the order
    FINISH_KEYWORDS = ["done", "no", "not", "enough", "continue", "pay", "checkout", "finish", "complete"]

    if any(keyword in processed_text for keyword in FINISH_KEYWORDS):
        # User finished ordering, proceed to dining option
        order_details = get_order_details(user_id)
        if not order_details or not order_details.get('items'):
            set_user_state(user_id, STATE_GENERAL)
            reset_order_details(user_id)
            await update.message.reply_text("Sorry, there are no items in the order. Please start ordering again.")
            return

        current_total = order_details.get('total_price', 0)
        item_names_in_order = [f"{item['quantity']} {item['item_data']['name']}" for item in order_details['items']]
        order_summary = ", ".join(item_names_in_order)

        set_user_state(user_id, STATE_AWAITING_DINING_OPTION)
        await update.message.reply_text(
            f"Alright! Here's your order summary:\n{order_summary}\n"
            f"Total: ${current_total:,}\n\n"
            "Would you like to dine in or take away?"
        )
        return

    # User wants to add another item - try to extract item name
    item_data = extract_entities_item_name(text)
    if item_data:
        set_user_state(user_id, STATE_AWAITING_QUANTITY)
        set_current_item_to_add(user_id, item_data)
        await update.message.reply_text(f"How many {item_data['name']} would you like to order?")
    else:
        # Item not found, request more specific input
        await update.message.reply_text(
            f"Sorry {user_first_name}, I couldn't find the menu item '{text}'. "
            "Try mentioning a more specific menu name, check /menu, or type 'done' if you're finished."
        )
