from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime
import sys
import os
import uvicorn

# Add project root to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

# Import backend modules
try:
    from bot.nlp_utils import process_message
    from modules.menu_manager import get_menu, get_items_by_category
    from bot.user_context import (
        get_order_details, get_user_state, set_user_state,
        get_last_inquired_item, set_last_inquired_item,
        set_current_item_to_add, add_item_to_current_order,
        reset_order_details,
        STATE_GENERAL, STATE_AWAITING_QUANTITY, STATE_AWAITING_MORE_ITEMS,
        STATE_AWAITING_DINING_OPTION, STATE_AWAITING_PAYMENT_METHOD
    )
except ImportError as e:
    print(f"Import error: {e}")
    print("Please ensure you're running this from the Backend directory")
    sys.exit(1)

app = FastAPI(title="SiipCoffe API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    user_id: str = None

class ChatResponse(BaseModel):
    response: str
    intent: str
    suggested_items: list = []
    menu_data: dict | None = None

@app.get("/")
async def root():
    return {"message": "SiipCoffe API Server is running", "status": "active"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "backend": "connected"}

@app.get("/api/menu")
async def get_menu_api():
    """Get complete menu data"""
    try:
        menu_data = get_menu()
        return {
            "success": True,
            "data": menu_data,
            "message": "Menu data retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get menu: {str(e)}")

@app.get("/api/menu/{category}")
async def get_menu_by_category(category: str):
    """Get menu items by category"""
    try:
        items = get_items_by_category(category)
        return {
            "success": True,
            "data": items,
            "category": category,
            "message": f"Retrieved {len(items)} items from {category}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get category {category}: {str(e)}")

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """Main chat endpoint with state management like Telegram"""
    try:
        user_id = request.user_id or "default_user"
        message = request.message.strip()

        # Get current user state
        current_state = get_user_state(user_id)

        print(f"Processing message for user {user_id}, state: {current_state}, message: {message}")

        # Handle different states
        if current_state == STATE_AWAITING_QUANTITY:
            return await handle_quantity_state(user_id, message)
        elif current_state == STATE_AWAITING_MORE_ITEMS:
            return await handle_more_items_state(user_id, message)
        elif current_state == STATE_AWAITING_DINING_OPTION:
            return await handle_dining_option_state(user_id, message)
        elif current_state == STATE_AWAITING_PAYMENT_METHOD:
            return await handle_payment_method_state(user_id, message)
        else:
            # General state - use NLP processing
            return await handle_general_state(user_id, message)

    except Exception as e:
        print(f"Chat processing error: {e}")
        return ChatResponse(
            response="I'm having trouble processing your request right now. Please try again.",
            intent="error",
            suggested_items=[],
            menu_data=None
        )

async def handle_quantity_state(user_id: str, message: str):
    """Handle quantity input state - using exact Telegram logic"""
    from bot.nlp_utils import extract_quantity

    order_details = get_order_details(user_id)
    item_to_add_data = order_details.get('current_item_to_add_data') if order_details else None

    if not item_to_add_data:
        set_user_state(user_id, STATE_GENERAL)
        return ChatResponse(
            response="Sorry, something seems to be wrong. Could you mention the item you want to order again?",
            intent="error",
            suggested_items=[]
        )

    qty = extract_quantity(message)
    if qty and qty > 0:
        if add_item_to_current_order(user_id, qty):
            order_details = get_order_details(user_id)
            current_total = order_details.get('total_price', 0)

            item_names_in_order = []
            if order_details.get('items'):
                item_names_in_order = [f"{item['quantity']} {item['item_data']['name']}" for item in order_details['items']]
            order_summary = ", ".join(item_names_in_order) if item_names_in_order else "No items yet"

            set_user_state(user_id, STATE_AWAITING_MORE_ITEMS)

            return ChatResponse(
                response=f"Okay, {qty} {item_to_add_data['name']} has been added. "
                       f"Your current order: {order_summary} (Subtotal: ${current_total:,}).\n\n"
                       "Would you like to add another item? Type the menu name you want to add or type 'done' to proceed to payment.",
                intent="order_update",
                suggested_items=[]
            )
        else:
            set_user_state(user_id, STATE_GENERAL)
            return ChatResponse(
                response="Sorry, there was an issue processing your order. Please try again.",
                intent="error",
                suggested_items=[]
            )
    else:
        return ChatResponse(
            response=f"Invalid quantity. How many would you like to order for {item_to_add_data['name']}?",
            intent="quantity_request",
            suggested_items=[]
        )

async def handle_more_items_state(user_id: str, message: str):
    """Handle more items input state - using exact Telegram logic"""
    from bot.nlp_utils import extract_entities_item_name

    processed_text = message.lower().strip()

    # Keywords to complete the order
    FINISH_KEYWORDS = ["done", "no", "not", "enough", "continue", "pay", "checkout", "finish", "complete"]

    if any(keyword in processed_text for keyword in FINISH_KEYWORDS):
        # User finished ordering, proceed to dining option
        order_details = get_order_details(user_id)
        if not order_details or not order_details.get('items'):
            set_user_state(user_id, STATE_GENERAL)
            reset_order_details(user_id)
            return ChatResponse(
                response="Sorry, there are no items in the order. Please start ordering again.",
                intent="order_empty",
                suggested_items=[]
            )

        current_total = order_details.get('total_price', 0)
        item_names_in_order = [f"{item['quantity']} {item['item_data']['name']}" for item in order_details['items']]
        order_summary = ", ".join(item_names_in_order)

        set_user_state(user_id, STATE_AWAITING_DINING_OPTION)

        return ChatResponse(
            response=f"Alright! Here's your order summary:\n{order_summary}\n"
                   f"Total: ${current_total:,}\n\n"
                   "Would you like to dine in or take away?",
            intent="dining_option_request",
            suggested_items=[]
        )

    # User wants to add another item - try to extract item name
    item_data = extract_entities_item_name(message)
    if item_data:
        set_user_state(user_id, STATE_AWAITING_QUANTITY)
        set_current_item_to_add(user_id, item_data)
        return ChatResponse(
            response=f"How many {item_data['name']} would you like to order?",
            intent="quantity_request",
            suggested_items=[]
        )
    else:
        # Item not found, request more specific input
        return ChatResponse(
            response=f"Sorry, I couldn't find the menu item '{message}'. "
                   "Try mentioning a more specific menu name, check the menu, or type 'done' if you're finished.",
            intent="item_not_found",
            suggested_items=[]
        )

async def handle_dining_option_state(user_id: str, message: str):
    """Handle dining option input state - using exact Telegram logic"""
    processed_text = message.lower().strip()

    if any(keyword in processed_text for keyword in ["dine in", "dine", "here", "eat here"]):
        order_details = get_order_details(user_id)
        if order_details:
            order_details['dining_option'] = "dine_in"

        set_user_state(user_id, STATE_AWAITING_PAYMENT_METHOD)
        return ChatResponse(
            response="Perfect! You've chosen to dine in.\n\nPlease select payment method: E-Wallet or Cash at Counter?",
            intent="payment_method_request",
            suggested_items=[]
        )
    elif any(keyword in processed_text for keyword in ["take away", "takeaway", "take out", "to go"]):
        order_details = get_order_details(user_id)
        if order_details:
            order_details['dining_option'] = "takeaway"

        set_user_state(user_id, STATE_AWAITING_PAYMENT_METHOD)
        return ChatResponse(
            response="Great! You've chosen take away.\n\nPlease select payment method: E-Wallet or Cash at Counter?",
            intent="payment_method_request",
            suggested_items=[]
        )
    else:
        return ChatResponse(
            response="Please choose: Dine in or Take away?",
            intent="dining_option_request",
            suggested_items=[]
        )

async def handle_payment_method_state(user_id: str, message: str):
    """Handle payment method input state"""
    processed_text = message.lower().strip()

    print(f"Payment processing - User: {user_id}, Message: '{message}', Processed: '{processed_text}'")

    if any(keyword in processed_text for keyword in ["e-wallet", "ewallet", "wallet", "digital", "online"]):
        print("Selected E-Wallet payment")
        return await complete_order(user_id, "E-Wallet")
    elif any(keyword in processed_text for keyword in ["cash", "counter", "at counter"]):
        print("Selected Cash payment")
        return await complete_order(user_id, "Cash")
    else:
        print(f"Payment method not recognized. Keywords matched: {[kw for kw in ['e-wallet', 'ewallet', 'wallet', 'digital', 'online', 'cash', 'counter', 'at counter'] if kw in processed_text]}")
        return ChatResponse(
            response="Please select payment method: E-Wallet or Cash at Counter?",
            intent="payment_method_request",
            suggested_items=[]
        )

async def complete_order(user_id: str, payment_method: str):
    """Complete order and generate receipt"""
    order_details = get_order_details(user_id)

    if not order_details or not order_details.get('items'):
        set_user_state(user_id, STATE_GENERAL)
        reset_order_details(user_id)
        return ChatResponse(
            response="No items in your order. Please start ordering again.",
            intent="order_empty",
            suggested_items=[]
        )

    total_price = order_details.get('total_price', 0)
    items = order_details.get('items', [])
    item_summary = [f"{item['quantity']}x {item['item_data']['name']}" for item in items]

    # Generate receipt
    order_id = f"ORD-{user_id[:8]}-{int(datetime.now().timestamp())}"
    receipt_message = (
        f"📋 **ORDER RECEIPT**\n\n"
        f"Order Number: {order_id}\n"
        f"Date: {datetime.now().strftime('%d-%m-%Y %H:%M')}\n\n"
        f"Items:\n"
    )

    for item in items:
        item_total = item['quantity'] * item['item_data']['price']
        receipt_message += f"• {item['quantity']}x {item['item_data']['name']} = ${item_total:,}\n"

    receipt_message += f"\n**Total: ${total_price:,}**\n"
    receipt_message += f"Payment Method: {payment_method}\n"
    receipt_message += f"Status: {'✅ PAID' if payment_method == 'E-Wallet' else '💳 UNPAID (Pay at counter)'}\n\n"
    receipt_message += "Thank you for your order! ☕"

    # Reset order
    set_user_state(user_id, STATE_GENERAL)
    reset_order_details(user_id)

    return ChatResponse(
        response=receipt_message,
        intent="order_completed",
        suggested_items=[]
    )

async def handle_general_state(user_id: str, message: str):
    """Handle general state with NLP processing"""
    from bot.nlp_utils import recognize_intent, extract_entities_item_name

    nlp_response = process_message(message)
    intent = nlp_response.get("intent", "unknown")
    response_text = nlp_response.get("response", "I'm not sure how to respond.")
    suggested_items = nlp_response.get("suggested_items", [])

    # Handle order intent in general state
    if intent == "order_info":
        item_name = extract_entities_item_name(message)
        if item_name:
            set_user_state(user_id, STATE_AWAITING_QUANTITY)
            set_current_item_to_add(user_id, item_name)
            set_last_inquired_item(user_id, item_name)
            response_text = f"Excellent choice! {item_name['name']} is {item_name['description']}. How many would you like to order?"
            suggested_items = []
        elif any(keyword in message.lower() for keyword in ["that", "that item", "the item", "order", "want that", "buy that"]):
            # Referential ordering
            last_item = get_last_inquired_item(user_id)
            if last_item:
                set_user_state(user_id, STATE_AWAITING_QUANTITY)
                set_current_item_to_add(user_id, last_item)
                response_text = f"Great choice! {last_item['name']}. How many would you like to order?"
                suggested_items = []
            else:
                response_text = "What would you like to order? Please mention the item name or check the menu first."
        else:
            response_text = "What would you like to order? Please mention the item name from the menu."

    # Get menu data if needed
    menu_data = None
    if intent in ["view_menu", "category_recommendation"]:
        menu_data = get_menu()

    return ChatResponse(
        response=response_text,
        intent=intent,
        suggested_items=suggested_items,
        menu_data=menu_data if menu_data else None
    )

@app.post("/api/chat/simple")
async def simple_chat_endpoint(message: str):
    """Simple chat endpoint for basic testing"""
    try:
        nlp_response = process_message(message)
        return {
            "response": nlp_response.get("response", "I'm not sure how to respond."),
            "intent": nlp_response.get("intent", "unknown"),
            "suggested_items": nlp_response.get("suggested_items", [])
        }
    except Exception as e:
        return {
            "response": "I'm experiencing technical difficulties. Please try again.",
            "intent": "error",
            "suggested_items": []
        }

@app.get("/api/order/{user_id}")
async def get_order_status(user_id: str):
    """Get current order details for a user"""
    try:
        order_details = get_order_details(user_id)
        user_state = get_user_state(user_id)

        if not order_details or not order_details.get('items'):
            return {
                "success": True,
                "has_order": False,
                "message": "No active order found",
                "state": user_state
            }

        total_price = order_details.get('total_price', 0)
        items = order_details.get('items', [])

        return {
            "success": True,
            "has_order": True,
            "order_details": {
                "items": items,
                "total_price": total_price,
                "dining_option": order_details.get('dining_option'),
                "state": user_state
            }
        }
    except Exception as e:
        print(f"Error getting order status: {e}")
        return {
            "success": False,
            "error": "Failed to get order status"
        }

@app.post("/api/order/{user_id}/complete")
async def complete_order(user_id: str, payment_method: str = "cash"):
    """Complete current order and generate receipt"""
    try:
        order_details = get_order_details(user_id)

        if not order_details or not order_details.get('items'):
            return {
                "success": False,
                "error": "No active order to complete"
            }

        # Generate simple receipt
        total_price = order_details.get('total_price', 0)
        items = order_details.get('items', [])
        item_summary = [f"{item['quantity']}x {item['item_data']['name']}" for item in items]

        receipt = {
            "order_id": f"ORD-{user_id[:8]}-{int(datetime.now().timestamp())}",
            "items": item_summary,
            "total_price": total_price,
            "payment_method": payment_method,
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "message": f"Order completed! Total: ${total_price:,}. Payment method: {payment_method}"
        }

        # Reset order after completion
        set_user_state(user_id, STATE_GENERAL)

        return {
            "success": True,
            "receipt": receipt
        }
    except Exception as e:
        print(f"Error completing order: {e}")
        return {
            "success": False,
            "error": "Failed to complete order"
        }

if __name__ == "__main__":
    print("🚀 Starting SiipCoffe API Server...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("☕ Connecting to backend NLP system...")

    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )