import { NextRequest, NextResponse } from "next/server";
import { Order } from "@/app/lib/order";

// Mock database for orders
let mockOrders: { [userId: string]: Order[] } = {};

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const userId = resolvedParams.id;
    const order: Order = await request.json();

    if (!mockOrders[userId]) {
        mockOrders[userId] = [];
    }

    mockOrders[userId].push(order);

    return NextResponse.json({ message: "Order saved successfully" }, { status: 201 });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const userId = resolvedParams.id;
    const transactionId = request.nextUrl.searchParams.get('transactionId');

    if (!mockOrders[userId]) {
        return NextResponse.json({ orders: [] }, { status: 200 });
    }

    if (transactionId) {
        // Find the specific order with the given transactionId
        const order = mockOrders[userId].find(order => order.transactionId === transactionId);
        if (order) {
            return NextResponse.json({ orders: [order] }, { status: 200 });
        } else {
            return NextResponse.json({ message: "Order not found" }, { status: 404 });
        }
    } else {
        // Return all orders for the user
        return NextResponse.json({ orders: mockOrders[userId] }, { status: 200 });
    }
}

// DELETE request to delete an order by transaction ID
// DELETE /api/user/:id/order?transactionId=:transactionId
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const userId = resolvedParams.id;
    const transactionId = request.nextUrl.searchParams.get('transactionId');

    if (!transactionId) {
        return NextResponse.json({ message: "Transaction ID is required" }, { status: 400 });
    }

    if (!mockOrders[userId]) {
        return NextResponse.json({ message: "No orders found for this user" }, { status: 404 });
    }

    const initialLength = mockOrders[userId].length;
    mockOrders[userId] = mockOrders[userId].filter(order => order.transactionId !== transactionId);

    if (mockOrders[userId].length === initialLength) {
        return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order deleted successfully" }, { status: 200 });
}
