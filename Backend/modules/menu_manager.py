# modules/menu_manager.py
import json
import os
import uuid # For generating unique IDs

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE_PATH = os.path.join(BASE_DIR, 'data', 'menu_data.json')

_menu_cache = None

def load_menu_data():
    """Loads menu data from JSON file."""
    global _menu_cache
    try:
        with open(DATA_FILE_PATH, 'r', encoding='utf-8') as f:
            _menu_cache = json.load(f)
            return _menu_cache
    except FileNotFoundError:
        print(f"Error: Menu data file not found at {DATA_FILE_PATH}")
        _menu_cache = {"food": [], "drink": [], "order_info": "Menu data not available."}
        return _menu_cache
    except json.JSONDecodeError:
        print(f"Error: Failed to read JSON format from {DATA_FILE_PATH}")
        _menu_cache = {"food": [], "drink": [], "order_info": "Menu data corrupted."}
        return _menu_cache

def save_menu_data():
    """Saves menu data (from cache) to JSON file."""
    global _menu_cache
    if _menu_cache is None:
        print("No data in cache to save.")
        return False
    try:
        with open(DATA_FILE_PATH, 'w', encoding='utf-8') as f:
            json.dump(_menu_cache, f, indent=4, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error while saving menu data: {e}")
        return False

def get_menu(force_reload=False):
    """Returns entire menu, using cache when possible."""
    global _menu_cache
    if _menu_cache is None or force_reload:
        load_menu_data()
    return _menu_cache

def get_items_by_category(category_name, force_reload=False):
    menu = get_menu(force_reload)
    if category_name:
        return menu.get(category_name.lower(), [])
    return []

def get_item_by_id(item_id, force_reload=False): # New function to get item by ID
    """Finds item by its unique ID in all categories."""
    menu = get_menu(force_reload)
    if item_id:
        for category_key in menu:
            if category_key == "order_info":
                continue
            if isinstance(menu[category_key], list):
                for item in menu[category_key]:
                    if item.get("id") == item_id:
                        return item, category_key # Return item and its category
    return None, None


def get_item_by_name(item_name, force_reload=False):
    menu = get_menu(force_reload)
    if item_name:
        for category_key in menu:
            if category_key == "order_info":
                continue
            if isinstance(menu[category_key], list):
                for item in menu[category_key]:
                    if item.get("name", "").lower() == item_name.lower():
                        return item
    return None

def get_ordering_info(force_reload=False):
    menu = get_menu(force_reload)
    return menu.get("order_info", "Ordering information not available.")

# --- New CRUD Functions ---
def generate_new_id(prefix="ITEM"):
    """Generates a new unique ID."""
    return f"{prefix}_{uuid.uuid4().hex[:6].upper()}"

def add_item(category, name, price, description):
    """Adds a new item to the menu."""
    global _menu_cache
    menu = get_menu() # Ensure cache is filled

    if category.lower() not in menu:
        menu[category.lower()] = [] # Create category if it doesn't exist (though ideally "food" and "drink" should already exist)

    # Check if item with same name already exists in the category
    for item_existing in menu[category.lower()]:
        if item_existing.get("name", "").lower() == name.lower():
            return False, "An item with that name already exists in this category."

    new_item_id = generate_new_id(prefix=category[0].upper())
    new_item = {
        "id": new_item_id,
        "name": name,
        "price": int(price), # Ensure price is integer
        "description": description
    }
    menu[category.lower()].append(new_item)
    if save_menu_data():
        return True, new_item_id
    else:
        # Rollback if save fails (optional, depends on complexity)
        menu[category.lower()].pop() # Remove newly added item from cache
        return False, "Failed to save menu data."

def update_item(item_id, updated_data):
    """Updates existing item based on ID."""
    global _menu_cache
    menu = get_menu()
    item_to_update, category_key = get_item_by_id(item_id, force_reload=False) # Search in cache first

    if not item_to_update:
        return False, "Item not found."

    # Check for duplicate name if name is changed
    if "name" in updated_data and updated_data["name"].lower() != item_to_update.get("name","").lower():
        for item_existing in menu[category_key]:
            if item_existing.get("id") != item_id and item_existing.get("name", "").lower() == updated_data["name"].lower():
                return False, "Item name duplicates with another item in the same category."

    item_to_update.update(updated_data)
    if "price" in updated_data: # Ensure price is integer
        item_to_update["price"] = int(updated_data["price"])

    if save_menu_data():
        return True, "Item successfully updated."
    else:
        # For more complex rollback, we need to save item state before changes.
        # For now, we assume save succeeds or error is handled at higher level.
        return False, "Failed to save menu data after update."

def delete_item(item_id):
    """Deletes item from menu based on ID."""
    global _menu_cache
    menu = get_menu()
    item_to_delete, category_key = get_item_by_id(item_id, force_reload=False)

    if not item_to_delete:
        return False, "Item not found."

    menu[category_key].remove(item_to_delete)

    if save_menu_data():
        return True, "Item successfully deleted."
    else:
        # Rollback if save fails
        menu[category_key].append(item_to_delete) # Add back to cache
        return False, "Failed to save data after deletion."

def update_ordering_info(new_info):
    """Updates ordering information."""
    global _menu_cache
    menu = get_menu()
    menu["order_info"] = new_info
    if save_menu_data():
        return True, "Ordering info successfully updated."
    else:
        # Rollback (optional)
        # menu["order_info"] = old_info # Need to save old_info first
        return False, "Failed to save ordering info."

# Ensure load_menu_data is called once at start so _menu_cache is filled
if _menu_cache is None:
    load_menu_data()