import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Call the actual backend NLP service
async function callNLPBackend(message: string) {
  try {
    // Try to connect to the Python backend first
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Backend response:', data);
      return data;
    } else {
      console.error('Backend responded with:', response.status, response.statusText);
      throw new Error(`Backend error: ${response.status}`);
    }
  } catch (error) {
    console.error('Backend connection failed:', error);
    // Only return error if backend is not available
    return {
      intent: 'error',
      response: "⚠️ I'm currently unable to connect to our system. Please try again in a moment or contact our staff directly.",
      suggestedItems: [],
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Call the NLP backend
    const nlpResponse = await callNLPBackend(message);

    // TODO: In the future, you might want to:
    // 1. Add user context tracking
    // 2. Implement order state management
    // 3. Connect to your Python backend directly
    // 4. Add multi-language support

    return NextResponse.json(nlpResponse);

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process message",
        response: "I'm experiencing some technical difficulties. Please try again in a moment.",
        suggestedItems: [],
      },
      { status: 500 }
    );
  }
}