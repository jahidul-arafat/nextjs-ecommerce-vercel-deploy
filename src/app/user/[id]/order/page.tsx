'use client'

import React, { useState, useEffect } from 'react';
import { Order } from '@/app/datastucture/order';

export default function UserOrdersPage({ params }: { params: Promise<{ id: string }> }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [transactionId, setTransactionId] = useState('');
    const resolvedParams = React.use(params);
    const userId = resolvedParams.id;

    useEffect(() => {
        fetchOrders();
    }, [userId]);

    const fetchOrders = async () => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_SITE_URL+`/api/user/${userId}/order${transactionId ? `?transactionId=${transactionId}` : ''}`);
            if (response.ok) {
                const data = await response.json();
                // Ensure that we're setting an array of orders
                setOrders(Array.isArray(data.orders) ? data.orders : []);
            } else {
                console.error('Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchOrders();
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Your Orders</h1>

            <form onSubmit={handleSearch} className="mb-4">
                <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Search by Transaction ID"
                    className="border p-2 mr-2"
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">Search</button>
            </form>

            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                orders.map((order) => (
                    <div key={order.transactionId} className="border p-4 mb-4 rounded">
                        <p><strong>Transaction ID:</strong> {order.transactionId}</p>
                        <p><strong>Total Cost:</strong> ${order.totalCost.toFixed(2)}</p>
                        <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                        <p><strong>Date:</strong> {new Date(order.dateReceived).toLocaleString()}</p>
                        <h3 className="font-bold mt-2">Items:</h3>
                        <ul>
                            {order.items.map((item) => (
                                <li key={item.productId}>
                                    Product ID: {item.productId}, Quantity: {item.quantity}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            )}
        </div>
    );
}