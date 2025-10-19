"""
Module for command handlers (/start, /menu, etc.)
Separates command logic from message handling
"""
import logging
from telegram import Update
from telegram.ext import ContextTypes

from bot.user_context import set_user_state, reset_order_details, STATE_GENERAL

# Import required modules
try:
    from modules.menu_manager import get_menu, get_ordering_info
except ImportError as e:
    print(f"Failed to import modules: {e}")

logger = logging.getLogger(__name__)

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Handler for /start command
    Initializes user context and greeting message
    """
    user_id = update.effective_user.id
    user = update.effective_user

    # Reset state and order details for new/restart user
    set_user_state(user_id, STATE_GENERAL)
    reset_order_details(user_id)

    await update.message.reply_html(
        rf"Hello {user.mention_html()}! Welcome to Mata Kopian Bot. How can I help you? "
        "You can ask about menu, prices, or ordering process.",
    )
    logger.info(f"User {user_id} ({user.first_name}) started the bot with /start")

async def menu_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Handler for /menu command
    Displays complete menu list with categorization
    """
    user_id = update.effective_user.id
    logger.info(f"User {user_id} requested menu with /menu")

    menu = get_menu(force_reload=True)
    response = "☕ *Mata Kopian Menu* ☕\n\n"

    # Mapping categories with emoji and user-friendly names
    categories = {
        "iced_coffee": {"name": "Iced Coffee", "emoji": "☕"},
        "non_coffee": {"name": "Non Coffee", "emoji": "🍵"},
        "espresso_based": {"name": "Espresso Based", "emoji": "🫕"},
        "refreshment": {"name": "Refreshment", "emoji": "🍸"},
        "others": {"name": "Others", "emoji": "🥤"},
        "pastry": {"name": "Pastry", "emoji": "🥐"}
    }

    # Display each category
    for category_key, category_info in categories.items():
        items = menu.get(category_key, [])
        response += f"*{category_info['name']}* {category_info['emoji']}:\n"

        if items:
            for item in items:
                name = item.get('name', 'N/A')
                price = item.get('price', 0)
                description = item.get('description', '')

                # Format item with price
                response += f"• {name}: ${price:,}"

                # Add description if available (for complete information)
                if description:
                    response += f"\n  _{description}_"
                response += "\n"
        else:
            response += f"_No {category_info['name'].lower()} menu available yet._\n"

        response += "\n"

    # Add ordering information at the end
    response += f"*Ordering Information* ℹ️:\n{get_ordering_info(force_reload=True)}"

    await update.message.reply_text(response, parse_mode='Markdown')
