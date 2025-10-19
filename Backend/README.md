# Mata Kopian - NLP Chatbot

A Telegram Chatbot application with NLP (Natural Language Processing) features for "Mata Kopian" that allows users to order food and drinks through chat. Equipped with an admin dashboard for menu management.

## Contributors

Created by:
- Yeheskiel Yunus Tame - 71220903
- P. Harimurti Adi Bagaskara - 71220918
- Nahason Christian Ade Herlambang - 71220888

## Key Features

### 1. Telegram Chatbot
- View food and drink menus
- Order items with natural language detection
- Complete ordering process simulation (quantity selection, dining options, and payment methods)
- Order confirmation with digital receipt

### 2. Admin Dashboard
- Add new menu items (food/drinks)
- Edit existing menu items
- Delete menu items
- Update ordering information
- Responsive and user-friendly interface

### 3. NLP (Natural Language Processing)
- User intent detection (price inquiries, ordering, greetings, etc.)
- Entity extraction (item names, quantities)
- Continuous conversation context
- Reference recognition (e.g., "order that" for recently mentioned items)

## Project Structure

```
ChatbotNLP/
├── config.py                # Application configuration (bot token)
├── requirements.txt         # Python dependencies
├── README.md                # Project documentation
├── admin_dashboard/
│   └── app.py               # Streamlit application for admin dashboard
├── bot/
│   ├── telegram_bot.py      # Telegram bot implementation
│   └── nlp_utils.py         # NLP utilities for natural language processing
├── data/
│   └── menu_data.json       # Menu data in JSON format
└── modules/
    └── menu_manager.py      # Menu data management (CRUD)
```

## How to Use

### 1. Initial Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/yeheskieltame/ChatbotNLP.git
   cd ChatbotNLP
   ```

2. Install all required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Make sure the Telegram bot token is configured in `config.py`:
   ```python
   # config.py
   TELEGRAM_BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN"
   ```

### 2. Running the Admin Dashboard

The admin dashboard is used to manage the café menu:

```bash
streamlit run admin_dashboard/app.py
```

The dashboard will open in your browser (usually at http://localhost:8501).

#### Admin Dashboard Features:
- **Add Item & Order Info Tab**: Add new menu items and edit ordering information
- **Food Tab**: View, edit, or delete food items
- **Drinks Tab**: View, edit, or delete drink items

### 3. Running the Telegram Bot

The Telegram bot allows customers to order through chat:

```bash
python bot/telegram_bot.py
```

#### How to Use the Bot:
1. Start a conversation by sending `/start`
2. View the menu by sending `/menu`
3. Ask about prices by sending "How much is [item name]?"
4. Order food/drinks by sending "I want to order [item name]"
5. Follow the chatbot instructions to complete your order

#### Example Ordering Flow:
1. "I want to order Nasi Goreng Mata Kopian"
2. Bot will ask for quantity: "How many would you like to order?"
3. Answer with a number: "2"
4. Bot will ask for dining option: "Would you like to dine in or take away?"
5. Choose: "Dine in"
6. Bot will ask for payment method: "Please select payment method: E-Wallet or Cash at Counter?"
7. Choose: "E-Wallet"
8. Bot will provide an order receipt with payment details

## NLP Methods Explanation

This application uses several rule-based NLP methods to understand and process user natural language:

### 1. Intent Recognition
- **Method:** Rule-based keyword matching
- **Explanation:**
  - Each intent (e.g., view_menu, ask_price, order_info, greeting, etc.) has a list of keywords.
  - Score is given if keywords are found in user messages:
    - Score 2 if keyword matches as a whole word
    - Score 1 if keyword only matches as a substring
  - Intent with the highest score is selected as the result.
- **Formula:**
  ```python
  score(intent) = number of intent keywords matching in message
  selected_intent = intent with highest score (score > 0)
  ```

### 2. Entity Extraction
- **Method:** String matching and regular expression
- **Explanation:**
  - Item names are extracted by matching menu names in user messages.
  - Quantities are extracted with number regex or number words ("one", "two", etc.).
- **Formula:**
  ```python
  quantity = int(first_number_found)
  # or
  quantity = word_to_number_mapping[first_number_word_found]
  item = menu_item if menu_item_name in user_message
  ```

### 3. Text Preprocessing
- **Method:** Lowercasing, punctuation removal, whitespace trimming
- **Explanation:**
  - All user text is processed with: lowercase, punctuation removal, and excess spacing.

### 4. Context Management
- **Method:** State machine & context dictionary per user
- **Explanation:**
  - Each user has a state (e.g., GENERAL, AWAITING_QUANTITY, etc.)
  - Context such as last mentioned item, temporary orders, etc., are stored in `user_contexts` dictionary
  - Bot can recognize references like "that", "the previous item" by looking at previous context

> **Note:** All NLP processes in this application use rule-based methods (keyword-based), without machine learning/statistical models.

## Troubleshooting

- **Bot not responding**: Make sure `TELEGRAM_BOT_TOKEN` is valid and bot is running
- **Menu data not appearing**: Check `data/menu_data.json` file and ensure format is correct
- **Dashboard cannot update menu**: Check file write permissions in `data/` directory

## Future Development

- Integration with real payment systems
- Functional delivery features
- Machine learning implementation for better language understanding
- Order history and customer management
- Automatic notifications and promotions
