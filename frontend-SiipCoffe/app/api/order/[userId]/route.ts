import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  try {

    const response = await fetch(`${BACKEND_URL}/api/order/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    console.log('Order status fetched successfully:', data);

    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error('Order API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to connect to order service'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const body = await request.json();
    const { paymentMethod = 'cash' } = body;

    const response = await fetch(`${BACKEND_URL}/api/order/${userId}/complete?payment_method=${paymentMethod}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    console.log('Order completed successfully:', data);

    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error('Order Completion API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to complete order'
      },
      { status: 500 }
    );
  }
}