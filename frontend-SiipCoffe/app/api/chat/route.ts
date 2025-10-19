import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Call the actual backend NLP service
async function callNLPBackend(message: string, userId: string) {
  console.log(`Sending message to backend: ${BACKEND_URL}/api/chat`);

  const response = await fetch(`${BACKEND_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      message,
      user_id: userId
    }),
  });

  if (!response.ok) {
    console.error('Backend responded with:', response.status, response.statusText);
    throw new Error(`Backend error: ${response.status}`);
  }

  const data = await response.json();
  console.log('Backend response received:', { intent: data.intent, hasSuggestions: !!data.suggestedItems?.length });
  return data;
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

    // Use persistent user ID for context management
    const userId = 'web_user_session'; // In production, use proper auth/user ID

    // Call the NLP backend with persistent user ID
    const nlpResponse = await callNLPBackend(message, userId);

    return NextResponse.json(nlpResponse);

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process message"
      },
      { status: 500 }
    );
  }
}