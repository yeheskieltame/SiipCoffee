# bot/nlp_utils.py
import re
import sys 
import os 

try:
    from modules.menu_manager import get_menu
except ImportError:
    current_script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root_dir = os.path.dirname(current_script_dir) 
    if project_root_dir not in sys.path:
        sys.path.append(project_root_dir)
    from modules.menu_manager import get_menu


# --- Intent Keyword Definitions ---
INTENT_KEYWORDS = {
    "view_menu": [
        "menu", "food menu", "drink menu", "list of food", "list of drinks",
        "what do you have", "what's available", "show menu", "display menu", "menu please",
        "today's menu", "what's on the menu", "show me the menu", "can I see the menu",
        "can I see menu", "show me menu", "what food do you have", "what drinks do you have",
        "what's on the menu", "what items are on the menu", "what menu items do you have",
        "show me menu", "tell me the menu", "menu please", "show me the menu",
        "show menu", "display menu list", "see menu list", "what menu items"
    ],
    "ask_price": [
        "price", "how much", "cost", "how much is", "how much does", "what's the price",
        "how much money", "what's the price", "how much is it", "how much does it cost", "how many rupiah",
        "rate", "fee", "how much", "cost", "how much is the price", "what's the price",
        "how much is it", "what does it cost"
    ],
    "order_info": [
        "order", "buy", "purchase", "how to order", "how do I order", "want to order", "want to buy",
        "purchase", "I want", "can order", "can buy", "order please", "order for me", "can purchase",
        "order now", "booking", "want to buy", "I want to", "let's order", "can book",
        "I want to order please", "I want to buy please", "I want to order", "I want to purchase", "order for me please"
    ],
    "greeting": [
        "hello", "hi", "hey", "good morning", "good afternoon", "good evening", "good night",
        "morning", "afternoon", "evening", "night", "hey", "heyy", "heyyo", "morning", "afternoon",
        "evening", "night", "hello", "hey", "hi", "hello hello", "hi hi", "hey hey"
    ],
    "thank_you": [
        "thanks", "thank you", "thx", "ty", "thanks a lot", "thank you very much",
        "thank you so much", "much appreciated", "grateful", "thank u", "tq", "tqvm",
        "thx a lot", "thanks so much", "thank you lots", "tyvm", "many thanks", "thanks again"
    ],
    "ask_bot": [
        "who are you", "what are you", "what bot is this", "what can you do",
        "who are you", "who are you", "what kind of bot", "what can you do", "what's your purpose",
        "what can this bot do", "introduce yourself", "what's your function"
    ],
    "confirm_yes": [ # Useful for confirmation in state flow
        "yes", "yeah", "right", "correct", "ok", "okay", "alright", "sure", "agree", "continue", "want to",
        "yup", "yep", "yes", "absolutely", "definitely", "alright then", "can", "lets go", "go ahead",
        "let's do it", "come on", "let's go", "okay ready", "yes", "yeah sure", "okay then",
        "okay", "okay let's go", "okay go ahead", "okay let's do it", "okay come on", "okay let's go",
        "can we", "sure let's go", "yay"
    ],
    "confirm_no": [ # Useful for confirmation in state flow
        "no", "not", "don't", "nope", "not really", "cancel", "not doing it", "changed my mind",
        "not going to", "never mind", "skip", "don't bother", "no thanks", "maybe later",
        "not now", "later", "not happening", "not right now", "skip for now",
        "maybe next time", "not today", "not doing it", "just skip", "some other time",
        "don't want to", "cancel that", "maybe next time", "not right now"
    ]
}

def preprocess_text(text):
    """Cleans and normalizes text."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = text.strip()
    return text

def recognize_intent(text):
    """Recognizes user intent based on keywords."""
    processed_text = preprocess_text(text)
    if not processed_text:
        return None, 0

    intent_scores = {intent: 0 for intent in INTENT_KEYWORDS}
    best_intent = None
    highest_score = 0

    for intent, keywords in INTENT_KEYWORDS.items():
        score = 0
        for keyword in keywords:
            if re.search(r'\b' + re.escape(keyword) + r'\b', processed_text):
                score += 2
            elif keyword in processed_text:
                score += 1

        if score > highest_score:
            highest_score = score
            best_intent = intent
        elif score == highest_score and score > 0: # If scores are equal, can take the first or other
            pass

    if highest_score < 1: # Minimum score threshold to be considered as intent
        return None, 0

    return best_intent, highest_score


def extract_entities_item_name(text):
    """Extracts menu item name from text."""
    processed_text = preprocess_text(text)
    menu = get_menu(force_reload=False)

    # Fix: Get all items from all available categories
    all_items = []

    # List of categories matching menu structure
    categories = ["iced_coffee", "non_coffee", "espresso_based", "refreshment", "others", "pastry"]

    for category in categories:
        if menu.get(category):
            all_items.extend(menu[category])

    found_items_data = []
    sorted_items_by_name_len = sorted(all_items, key=lambda x: len(x.get("name","")), reverse=True)

    for item_data in sorted_items_by_name_len:
        item_name_processed = preprocess_text(item_data.get("name", ""))
        if item_name_processed and item_name_processed in processed_text:
            is_substring_of_found = False
            for fi_data in found_items_data:
                if item_name_processed in preprocess_text(fi_data.get("name","")):
                    is_substring_of_found = True
                    break
            if not is_substring_of_found:
                found_items_data.append(item_data)

    if not found_items_data:
        return None

    return found_items_data[0]

NUMBER_WORDS_TO_INT = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
}

def extract_quantity(text):
    """Extracts quantity (number) from text."""
    processed_text = preprocess_text(text)
    if not processed_text:
        return None

    match_digit = re.search(r'\b\d+\b', processed_text)
    if not match_digit:
        match_digit = re.search(r'\d+', processed_text)

    if match_digit:
        try:
            return int(match_digit.group(0))
        except ValueError:
            pass

    words_in_text = processed_text.split()
    for word, number in NUMBER_WORDS_TO_INT.items():
        if word in words_in_text:
            return number

    return None

def process_message(message: str) -> dict:
    """Main function to process user messages and return appropriate responses"""
    try:
        if not message or not message.strip():
            return {
                "response": "Hello! I'm your AI Barista. How can I help you today? You can ask me about our menu or get recommendations!",
                "intent": "greeting",
                "suggested_items": []
            }

        # Preprocess the message
        processed_text = preprocess_text(message)

        # Recognize intent
        intent_result = recognize_intent(processed_text)
        intent = intent_result[0] if intent_result and len(intent_result) > 0 else None

        # Handle different intents
        if intent == "greeting":
            return {
                "response": "☕ Hello! Welcome to SiipCoffe! I'm your AI Barista. What can I help you with today? You can ask me about our menu, get recommendations, or place an order!",
                "intent": "greeting",
                "suggested_items": []
            }

        elif intent == "thank_you":
            return {
                "response": "You're welcome! 😊 Is there anything else I can help you with? More coffee perhaps?",
                "intent": "thank_you",
                "suggested_items": []
            }

        elif intent == "view_menu":
            menu = get_menu()
            sample_items = []
            # Get sample items from each category
            for category, items in menu.items():
                if isinstance(items, list) and items:
                    sample_items.extend(items[:2])  # Take first 2 items from each category
                    if len(sample_items) >= 6:  # Limit to 6 items
                        break

            return {
                "response": "Here's our menu! 📋 I've organized it by categories for you. You can tap on any item to add it to your cart, or just tell me what you're in the mood for!",
                "intent": "view_menu",
                "suggested_items": sample_items
            }

        elif intent == "ask_price":
            menu = get_menu()
            # Get some popular items with prices
            popular_items = []
            for category, items in menu.items():
                if isinstance(items, list) and items:
                    popular_items.extend(items[:1])
                    if len(popular_items) >= 4:
                        break

            return {
                "response": "Our prices range from IDR 12,000 to IDR 26,000. Here are some popular options with their prices:",
                "intent": "ask_price",
                "suggested_items": popular_items
            }

        elif intent == "order_info":
            return {
                "response": "To place an order, you can simply tell me what you'd like! For example: 'I'd like an iced coffee' or 'Show me your pastries'. I'll help you find the perfect item! 🛒",
                "intent": "order_info",
                "suggested_items": []
            }

        # Handle category-specific requests
        message_lower = message.lower()
        menu = get_menu()

        # Check for specific categories
        category_keywords = {
            "iced_coffee": ["iced coffee", "cold coffee", "ice coffee", "cold brew"],
            "espresso_based": ["espresso", "latte", "cappuccino", "americano", "hot coffee"],
            "non_coffee": ["chocolate", "matcha", "tea", "non coffee"],
            "pastry": ["pastry", "croissant", "food", "snack", "cake"],
            "refreshment": ["refreshment", "sparkling", "soda", "cold drink"]
        }

        for category, keywords in category_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                items = menu.get(category, [])
                if items:
                    return {
                        "response": f"Great choice! Here are our {category.replace('_', ' ')} options. Which one catches your eye? 😊",
                        "intent": "category_recommendation",
                        "suggested_items": items[:6]  # Show up to 6 items
                    }

        # Handle specific item requests
        item_name = extract_entities_item_name(message)
        if item_name:
            for category, items in menu.items():
                if isinstance(items, list):
                    for item in items:
                        if item_name.lower() in item.get('name', '').lower():
                            return {
                                "response": f"Excellent choice! {item.get('name', '')} is {item.get('description', '')}. Would you like to add it to your order? 💫",
                                "intent": "item_recommendation",
                                "suggested_items": [item]
                            }

        # Default response
        return {
            "response": "I'd be happy to help you! 😊 You can ask me about:\n\n• 'Show me the menu'\n• 'I want iced coffee'\n• 'What's popular?'\n• 'Tell me about pastries'\n• 'How much is an espresso?'\n\nOr just tell me what you're in the mood for and I'll make some recommendations! ☕",
            "intent": "general",
            "suggested_items": []
        }

    except Exception as e:
        print(f"Error processing message: {e}")
        return {
            "response": "I'm having trouble processing your request right now. Please try again or ask me about our menu! ☕",
            "intent": "error",
            "suggested_items": []
        }

if __name__ == '__main__':
    print("--- NLP Utils Testing ---")
    # ... (testing block can be uncommented if you want to run this file independently) ...
    pass