from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
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
    """Main chat endpoint that processes user messages"""
    try:
        # Process the message using NLP utils
        nlp_response = process_message(request.message)

        # Extract response data
        response_text = nlp_response.get("response", "I'm not sure how to respond to that.")
        intent = nlp_response.get("intent", "unknown")
        suggested_items = nlp_response.get("suggested_items", [])

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

    except Exception as e:
        print(f"Chat processing error: {e}")
        return ChatResponse(
            response="I'm having trouble processing your request right now. Please try again.",
            intent="error",
            suggested_items=[],
            menu_data=None
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