// server-side component
import React from "react";
import {Product} from "@/app/data/product-data";
import ClientCartWrapper from "@/app/user/[id]/cart/ClientCartWrapper";

export const dynamic='force-dynamic';

async function fetchCartItems(userId: string): Promise<Product[]> {
    const response = await fetch(`http://localhost:3000/api/user/${userId}/cart`);
    if (!response.ok) {
        throw new Error('Failed to fetch cart items');
    }
    return response.json(); // return a Promise of an array of Product objects
}

export default async function CartPage({params}: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params; // resolving the Promise to get the id parameter from the URL path
    const userId = resolvedParams.id;
    let initialCartProducts: Product[] = [];

    try {
        initialCartProducts = await fetchCartItems(userId); // resolving the Promise to get the array of Product objects
    } catch (error) {
        console.error("Error fetching initial cart items:", error);
        // You might want to handle this error, perhaps by showing an error message
    }

    return <ClientCartWrapper
        initialCartProducts={initialCartProducts}
        userId={userId}
    />;
}