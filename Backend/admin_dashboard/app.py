# admin_dashboard/app.py
import streamlit as st
import sys
import os

# Add project root path to sys.path to enable imports from modules
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.append(project_root)

try:
    from modules.menu_manager import (
        get_menu,
        get_ordering_info,
        add_item,
        update_ordering_info,
        update_item,  # New function to import
        delete_item,  # New function to import
        get_item_by_id # New function to import
    )
except ImportError as e:
    st.error(f"Failed to import menu_manager: {e}. Make sure directory structure is correct and modules/menu_manager.py file exists.")
    st.stop()

# Streamlit Page Configuration
st.set_page_config(
    page_title="Admin Dashboard - Mata Kopian",
    page_icon="☕",
    layout="wide"
)

# Initialize session state if it doesn't exist
if 'editing_item_id' not in st.session_state:
    st.session_state.editing_item_id = None
if 'editing_item_data' not in st.session_state:
    st.session_state.editing_item_data = None # To store data of the item being edited
if 'confirming_delete_id' not in st.session_state:
    st.session_state.confirming_delete_id = None


st.title("☕ Admin Dashboard Mata Kopian")
st.markdown("Manage your menu and cafe information here.")

# Button to reload menu data
if st.button("🔄 Reload Menu Data from File", key="reload_main_data"):
    st.cache_data.clear()
    # Reset edit/delete state if active
    st.session_state.editing_item_id = None
    st.session_state.editing_item_data = None
    st.session_state.confirming_delete_id = None
    st.success("Menu data will be reloaded.")
    st.rerun()

# Load menu data (using Streamlit cache)
@st.cache_data
def load_display_menu():
    return get_menu(force_reload=True)

menu_data = load_display_menu()

# --- SIDEBAR FOR EDITING ITEM ---
if st.session_state.editing_item_id:
    item_to_edit, category_of_item = get_item_by_id(st.session_state.editing_item_id)
    if item_to_edit:
        st.sidebar.header(f"📝 Edit Item: {item_to_edit.get('name')}")
        with st.sidebar.form("edit_item_form"):
            # If st.session_state.editing_item_data is not filled, fill with initial data
            if st.session_state.editing_item_data is None or st.session_state.editing_item_data.get('id') != item_to_edit.get('id'):
                st.session_state.editing_item_data = item_to_edit.copy()

            edit_nama = st.text_input("Item Name:", value=st.session_state.editing_item_data.get('name', ''), key="edit_nama_sidebar")
            edit_harga = st.number_input("Price ($):", value=st.session_state.editing_item_data.get('price', 0), min_value=0, step=1000, key="edit_harga_sidebar")
            edit_deskripsi = st.text_area("Item Description:", value=st.session_state.editing_item_data.get('description', ''), key="edit_desk_sidebar")

            # Update st.session_state.editing_item_data live when input changes
            st.session_state.editing_item_data['name'] = edit_nama
            st.session_state.editing_item_data['price'] = edit_harga
            st.session_state.editing_item_data['description'] = edit_deskripsi

            col1_edit, col2_edit = st.columns(2)
            with col1_edit:
                if st.form_submit_button("Save Changes"):
                    if not edit_nama:
                        st.sidebar.warning("Item name cannot be empty.")
                    elif edit_harga <= 0:
                        st.sidebar.warning("Item price must be greater than 0.")
                    else:
                        updated_data = {
                            "name": edit_nama,
                            "price": int(edit_harga),
                            "description": edit_deskripsi
                        }
                        success, message = update_item(st.session_state.editing_item_id, updated_data)
                        if success:
                            st.sidebar.success(message)
                            st.cache_data.clear()
                            st.session_state.editing_item_id = None # Edit complete
                            st.session_state.editing_item_data = None
                            st.rerun()
                        else:
                            st.sidebar.error(f"Failed to update: {message}")
            with col2_edit:
                if st.form_submit_button("Cancel"):
                    st.session_state.editing_item_id = None
                    st.session_state.editing_item_data = None
                    st.rerun()
    else:
        # If item is not found again (e.g., already deleted by another process)
        st.sidebar.warning("The item to be edited is no longer found.")
        st.session_state.editing_item_id = None
        st.session_state.editing_item_data = None
        st.rerun()


# --- TABS FOR MANAGING MENU AND INFO ---
tab1, tab2, tab3, tab4, tab5, tab6, tab7 = st.tabs(["➕ Add Item & ℹ️ Order Info", "☕ Iced Coffee", "🍵 Non Coffee", "🫕 Espresso Based", "🍸 Refreshment", "🥤 Others", "🥐 Pastry"])

with tab1:
    st.header("➕ Add New Menu Item")
    with st.form("add_item_form", clear_on_submit=True):
        add_kategori = st.selectbox("Select Category:", ["iced_coffee", "non_coffee", "espresso_based", "refreshment", "others", "pastry"], key="add_cat_main")
        add_nama = st.text_input("Item Name:", key="add_nama_main")
        add_harga = st.number_input("Price ($):", min_value=0, step=1000, key="add_harga_main")
        add_deskripsi = st.text_area("Item Description:", key="add_desc_main")

        submitted_add = st.form_submit_button("Add Item")

        if submitted_add:
            if not add_nama:
                st.warning("Item name cannot be empty.")
            elif add_harga <= 0:
                st.warning("Item price must be greater than 0.")
            else:
                success, message_or_id = add_item(
                    category=add_kategori,
                    name=add_nama,
                    price=add_harga,
                    description=add_deskripsi
                )
                if success:
                    st.success(f"Item '{add_nama}' successfully added with ID {message_or_id}!")
                    st.cache_data.clear()
                    st.rerun()
                else:
                    st.error(f"Failed to add item: {message_or_id}")
    st.divider()

    st.header("✍️ Edit Order Information")
    current_info_pemesanan = get_ordering_info(force_reload=True)

    with st.form("edit_info_form"):
        new_info_text = st.text_area("Order Information Text:", value=current_info_pemesanan, height=100, key="edit_info_text_main")
        submitted_edit_info = st.form_submit_button("Save Order Information")

        if submitted_edit_info:
            if new_info_text.strip() == "":
                st.warning("Order information cannot be empty.")
            elif new_info_text == current_info_pemesanan:
                st.info("No changes to order information.")
            else:
                success, message = update_ordering_info(new_info_text)
                if success:
                    st.success(message)
                    st.cache_data.clear()
                    st.rerun()
                else:
                    st.error(message)

def display_menu_items(category_name, items_list):
    """Function to display menu items with Edit and Delete buttons."""
    if items_list:
        for item in items_list:
            item_id = item.get('id', '')
            with st.container(border=True): # Adding border to container
                col_info1, col_info2, col_actions = st.columns([4, 2, 2]) # Adjust column ratio

                with col_info1:
                    st.markdown(f"**{item.get('name', 'N/A')}**")
                    st.caption(f"ID: {item_id}")
                    st.write(item.get('description', ''))

                with col_info2:
                    st.markdown(f"**${item.get('price', 0):,}**")

                with col_actions:
                    # Edit Button
                    if st.button("✏️ Edit", key=f"edit_{item_id}"):
                        st.session_state.editing_item_id = item_id
                        st.session_state.editing_item_data = None # Reset edit data to be refilled
                        st.session_state.confirming_delete_id = None # Ensure not in delete confirmation mode
                        st.rerun()

                    # Delete Logic with Confirmation
                    if st.session_state.confirming_delete_id == item_id:
                        st.warning(f"Delete '{item.get('name')}'?")
                        col_confirm, col_cancel = st.columns(2)
                        with col_confirm:
                            if st.button("✔️ Yes, Delete", key=f"confirm_delete_{item_id}", type="primary"):
                                success, message = delete_item(item_id)
                                if success:
                                    st.success(message)
                                else:
                                    st.error(message)
                                st.session_state.confirming_delete_id = None
                                st.cache_data.clear()
                                st.rerun()
                        with col_cancel:
                            if st.button("Cancel", key=f"cancel_delete_{item_id}"):
                                st.session_state.confirming_delete_id = None
                                st.rerun()
                    else:
                        if st.button("🗑️ Delete", key=f"delete_{item_id}"):
                            st.session_state.confirming_delete_id = item_id
                            st.session_state.editing_item_id = None # Ensure not in edit mode
                            st.rerun()
            st.markdown("---") # Clearer separator between items
    else:
        st.info(f"No {category_name.lower()} data yet.")


with tab2:
    st.header("☕ Iced Coffee")
    if not menu_data or "iced_coffee" not in menu_data:
        st.warning("Drink data cannot be loaded or is empty.")
    else:
        display_menu_items("Iced Coffee", menu_data.get("iced_coffee", []))

with tab3:
    st.header("🍵 Non Coffee")
    if not menu_data or "non_coffee" not in menu_data:
        st.warning("Drink data cannot be loaded or is empty.")
    else:
        display_menu_items("Non Coffee", menu_data.get("non_coffee", []))

with tab4:
    st.header("🫕 Espresso Based")
    if not menu_data or "espresso_based" not in menu_data:
        st.warning("Drink data cannot be loaded or is empty.")
    else:
        display_menu_items("Espresso Based", menu_data.get("espresso_based", []))

with tab5:
    st.header("🍸 Refreshment")
    if not menu_data or "refreshment" not in menu_data:
        st.warning("Drink data cannot be loaded or is empty.")
    else:
        display_menu_items("Refreshment", menu_data.get("refreshment", []))

with tab6:
    st.header("🥤 Others")
    if not menu_data or "others" not in menu_data:
        st.warning("Drink data cannot be loaded or is empty.")
    else:
        display_menu_items("Other", menu_data.get("others", []))

with tab7:
    st.header("🥐 Pastry")
    if not menu_data or "pastry" not in menu_data:
        st.warning("Pastry data cannot be loaded or is empty.")
    else:
        display_menu_items("Pastry", menu_data.get("pastry", []))

st.sidebar.divider()
st.sidebar.markdown("---")
st.sidebar.caption("Mata Kopian Admin Dashboard v0.2")