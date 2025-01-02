// server-side component
// server-side rendering
// no hooks are used

import React from "react";
import { Product } from "@/app/data/product-data";
import Link from "next/link";
import Image from "next/image";

const renderCartItems = (cartProducts: Product[], onDelete: (id: string) => void) => {
    return cartProducts.map((product, index) => (
        <div key={`${product.id}-${index}`} className="flex items-center border-b border-gray-200 py-4">
            <Link href={"/products/" + product.id} className="flex items-center w-full">
                <div className="w-24 h-24 mr-4 relative">
                    <Image
                        src={'/' + product.imageUrl}
                        alt={product.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                    />
                </div>
                <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-600">Product ID: {product.id}</p>
                    <p className="text-lg font-bold text-blue-600">
                        {typeof product.price === 'number' && !isNaN(product.price)
                            ? `$${product.price.toFixed(2)}`
                            : 'Price unavailable'}
                    </p>
                </div>
            </Link>
            <button
                onClick={() => onDelete(product.id)}
                className="ml-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
                Delete
            </button>
        </div>
    ));
};

const ShoppingCartList = ({cartProducts, totalPrice, deleteProduct, userId}: {
    cartProducts: Product[],
    totalPrice: number,
    deleteProduct: (id: string) => void,
    userId: string
}) => {
    // Calculate total price here to ensure it's always up-to-date
    const calculatedTotalPrice = cartProducts.reduce((total, product) =>
        total + (typeof product.price === 'number' && !isNaN(product.price) ? product.price : 0), 0);

    console.log('Cart Products:', cartProducts); // Add this line for debugging

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Shopping Cart</h1>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {cartProducts.length > 0 ? (
                    <>
                        <div className="p-4">
                            {renderCartItems(cartProducts, deleteProduct)}
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-gray-900">Total:</span>
                                <span className="text-2xl font-bold text-blue-600">${calculatedTotalPrice.toFixed(2)}</span>
                            </div>
                            <Link href={`/user/${userId}/checkout?items=${cartProducts.map(p => p.id).join(',')}`}
                                  className="block mt-4 w-full">
                                <button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
                                    Proceed to Checkout
                                </button>
                            </Link>
                        </div>
                    </>
                ) : (
                    <p className="p-4 text-gray-600">Your cart is empty.</p>
                )}
            </div>
            <div className="mt-6">
                <Link href="/products" className="text-blue-600 hover:text-blue-800">
                    ← Continue Shopping
                </Link>
            </div>
        </div>
    );
};

export default ShoppingCartList;