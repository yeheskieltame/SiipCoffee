"""
Main Telegram Bot File
Entry point to run the Kafe Cerita chatbot
Organizes handlers and message routing based on state
"""
import logging
import sys
import os

# Setup path for module imports
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.append(project_root)

from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# Import configuration
try:
    from config import TELEGRAM_BOT_TOKEN
except ImportError as e:
    print(f"Failed to import config: {e}")
    print("Make sure config.py file is available and contains TELEGRAM_BOT_TOKEN")
    sys.exit(1)

# Import bot modules
from bot.user_context import (
    get_user_state, set_user_state, STATE_GENERAL, STATE_AWAITING_QUANTITY,
    STATE_AWAITING_MORE_ITEMS, STATE_AWAITING_DINING_OPTION, STATE_AWAITING_TAKEOUT_TYPE, 
    STATE_AWAITING_PAYMENT_METHOD, user_contexts
)
from bot.commands import start_command, menu_command
from bot.message_handlers import (
    handle_quantity_input, handle_dining_option_input, handle_takeout_type_input,
    handle_payment_method_input, handle_general_intent, handle_invalid_state_input,
    handle_more_items_input  # New handler for multiple items
)

# Setup logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", 
    level=logging.INFO
)
logger = logging.getLogger(__name__)

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Main message handler - router for all text messages
    Routes to appropriate handler based on user state
    """
    text = update.message.text
    user_id = update.effective_user.id
    user_first_name = update.effective_user.first_name
    
    # Get current user state
    current_user_state = get_user_state(user_id)

    # Initialize context if not exists (for new users or expired context)
    if user_id not in user_contexts:
        set_user_state(user_id, STATE_GENERAL)
        current_user_state = STATE_GENERAL

    logger.info(f"Message from {user_first_name} (ID: {user_id}, State: {current_user_state}): {text}")

    # Route to appropriate handler based on state
    try:
        if current_user_state == STATE_AWAITING_QUANTITY:
            await handle_quantity_input(update, user_id, user_first_name, text)
            
        elif current_user_state == STATE_AWAITING_MORE_ITEMS:
            await handle_more_items_input(update, user_id, user_first_name, text)
            
        elif current_user_state == STATE_AWAITING_DINING_OPTION:
            await handle_dining_option_input(update, user_id, text)
            
        elif current_user_state == STATE_AWAITING_TAKEOUT_TYPE:
            await handle_takeout_type_input(update, user_id, text)
            
        elif current_user_state == STATE_AWAITING_PAYMENT_METHOD:
            await handle_payment_method_input(update, user_id, user_first_name, text)
            
        elif current_user_state == STATE_GENERAL:
            await handle_general_intent(update, user_id, user_first_name, text)
            
        else:
            # Unknown state or input doesn't match state
            logger.warning(f"User {user_id} in state {current_user_state}, input doesn't match: '{text}'")
            await handle_invalid_state_input(update, current_user_state)

    except Exception as e:
        logger.error(f"Error handling message for user {user_id}: {e}")
        await update.message.reply_text(
            "Sorry, a system error occurred. Please try again or use /start to restart."
        )

def main() -> None:
    """
    Main function to run the bot
    Setup handlers and start polling
    """
    # Validate token
    if not TELEGRAM_BOT_TOKEN or TELEGRAM_BOT_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN":
        logger.error("Telegram token not found or not set in config.py!")
        sys.exit("Please set TELEGRAM_BOT_TOKEN in config.py")

    logger.info("Starting Mata Kopian Telegram Bot...")

    # Build application with token
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    # Register command handlers
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("menu", menu_command))
    
    # Register message handler for all text (not commands)
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    logger.info("Bot ready and starting polling. Press Ctrl-C to stop.")

    # Start polling to receive messages
    application.run_polling()

if __name__ == "__main__":
    main()