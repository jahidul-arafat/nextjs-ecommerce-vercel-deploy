'use client'

import React, {useEffect, useState} from "react";
import Link from "next/link";
import {Product} from "@/app/data/product-data";
import NotFoundPage from "@/app/not-found";
import {addToCart, addToFavorite} from "@/app/utils/utils";
import {useUser} from "@/app/componenets/UserContext";

export const dynamic='force-dynamic';

export default function ProductDetailsPage({params}: { params: Promise<{ id: string }> }) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const resolvedParams = React.use(params);
    const {user} = useUser(); // a central context to tag the user status

    useEffect(() => {
        async function loadProduct() {
            setLoading(true);
            try {
                const response = await fetch(`/api/products?id=${resolvedParams.id}`);
                if (!response.ok) {
                    console.error('Product not found');
                    return;
                }
                const productData = await response.json();
                setProduct(productData);
            } catch (error) {
                console.error("Error fetching product:", error);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        }

        loadProduct();
    }, [resolvedParams.id]);

    // const handleAddToCart = async () => {
    //     if (!product) return;
    //
    //     if (quantity <= 0) {
    //         alert("Please set the quantity to at least 1 before adding to cart.");
    //         return;
    //     }
    //
    //     try {
    //         for (let i = 0; i < quantity; i++) {
    //             await addToCart(product);
    //         }
    //         alert(`${quantity} ${quantity === 1 ? 'item' : 'items'} of ${product.name} added to cart.`);
    //     } catch (error) {
    //         alert(error instanceof Error ? error.message : 'An error occurred');
    //     }
    // };

    // improved handleAddToCart function with user status check
    const handleAddToCart = async () => {
        if (!product) return;

        if (quantity <= 0) {
            alert("Please set the quantity to at least 1 before adding to cart.");
            return;
        }

        if (!user) {
            alert("Please log in to add items to your cart.");
            return;
        }

        try {
            // if the quantity is greater than 1, add multiple items to the cart
            if (quantity >= 1) {
                for (let i = 0; i < quantity; i++) {
                    await addToCart(product,quantity);
                }
                alert(`${quantity} ${quantity === 1? 'item' : 'items'} of ${product.name} added to cart.`);
                return;
            }
            //await addToCart(product,quantity);
            //alert(`${quantity} ${quantity === 1 ? 'item' : 'items'} of ${product.name} added to cart.`);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'An error occurred');
        }
    };

    const handleAddToFavorite = (product: Product) => {
        try {
            addToFavorite(product);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'An error occurred');
        }
    };

    if (loading) {
        return <div className="text-center mt-8">Loading...</div>;
    }

    if (!product) {
        return <NotFoundPage/>;
    }

    return (
        <div className="container mx-auto p-8">
            <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 mb-4 md:mb-0 md:mr-8">
                    <img className="w-full h-auto rounded-lg shadow-md" src={'/' + product.imageUrl}
                         alt={product.name}/>
                </div>
                <div className="md:w-1/2">
                    <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                    <p className="text-2xl text-gray-600 mb-6">${product.price}</p>
                    <p className="text-gray-700 mb-6">{product.description}</p>
                    <div className="flex items-center space-x-4 mb-6">
                        <label htmlFor="quantity" className="text-gray-700">Quantity:</label>
                        <input
                            type="number"
                            id="quantity"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                            className="border rounded px-2 py-1 w-16 text-center"
                        />
                    </div>
                    <div className="flex space-x-4 mb-6">
                        <button onClick={handleAddToCart}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Add to Cart
                        </button>
                        <button onClick={(e) => {
                            e.preventDefault();
                            handleAddToFavorite(product)
                        }}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                            Add to Favorites
                        </button>
                    </div>
                    <Link href="/products" className="text-blue-500 hover:text-blue-700">
                        ← Back to Products
                    </Link>
                </div>
            </div>
        </div>
    );
}