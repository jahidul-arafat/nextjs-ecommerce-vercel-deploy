"use client"

// Import necessary dependencies
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product, products } from "@/app/data/product-data";
import {useRouter} from "next/navigation";

// Define the FavoritePage component
export default function FavoritePage({ params }: { params: { id: string } }) {
    // State to store favorite products
    // Initialize as an empty array of Product type
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
    const [favoriteChange, setFavoriteChange] = useState(0); // will be used in the useEffect() dependency array
                                    // because favorite items will not only be changed inside from the react component, but by the API too
    const userId = params.id;
    const router = useRouter();

    // useEffect hook to fetch and set favorite products when the component mounts
    // useEffect hook to fetch and set favorite products when the component mounts
    useEffect(() => {
        console.log(`favorite useEffect() triggered for ${favoriteChange} times. Reloading from localStorage('favorite')`);
        // Attempt to retrieve favorite items from localStorage
        const storedFavorites = localStorage.getItem(`${userId}_favorite`);

        // If favorites exist in localStorage
        if (storedFavorites) {
            // Parse the JSON string back into an array of products
            const parsedFavorites = JSON.parse(storedFavorites);

            // Filter the parsed favorites to ensure only valid products are included
            // This prevents issues if a product in favorites no longer exists in the main product list
            const validFavorites = parsedFavorites.filter((item: Product) =>
                products.some(p => p.id === item.id)
            );

            // Update the state with the valid favorite products
            setFavoriteProducts(validFavorites);
        }
        // The empty dependency array [] ensures this effect runs only once when the component mounts
        // In this specific case, using [] is the correct choice because we only need to load the favorites from localStorage once when the component mounts.
        // The favorites in localStorage won't change unless our component changes them, so there's no need to re-run this effect on every render.
    }, [favoriteChange,userId]); // no need to reread from the localstorage

    // Function to remove a product from favorites
    const removeFavorite = (id: string) => {
        // Filter out the product with the given id
        const updatedFavorites = favoriteProducts.filter(product => product.id !== id);

        // Update the state with the new favorites list
        //setFavoriteProducts(updatedFavorites); // becomes redundent since useEffect() will be always trigger everytime a changes in the favorite item list using setFavoriteChange()

        // Update localStorage to persist the changes
        localStorage.setItem(`${userId}_favorite`, JSON.stringify(updatedFavorites));

        // trigger the effect to refresh from localstorage

        setFavoriteChange(prev=>prev+1);

        if (updatedFavorites.length === 0) {
            console.log("No items left in favorites. Redirecting to the /products page");
            router.push("/products");
        }
    };

    // Render the component
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Your Favorites</h1>
            {/* Conditional rendering based on whether there are favorite products */}
            {favoriteProducts.length === 0 ? (
                <p>You haven&#39;t added any favorites yet.</p>
            ) : (
                // Grid layout for favorite products
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Map through each favorite product and render a card */}
                    {favoriteProducts.map(product => (
                        <div key={product.id} className="border rounded-lg p-4 shadow-md">
                            {/* Link to the product's detail page */}
                            <Link href={`/products/${product.id}`}>
                                <img
                                    src={`/${product.imageUrl}`}
                                    alt={product.name}
                                    className="w-full h-48 object-cover mb-4 rounded"
                                />
                                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                            </Link>
                            <p className="text-gray-600 mb-2">${product.price.toFixed(2)}</p>
                            {/* Button to remove the product from favorites */}
                            <button
                                onClick={() => removeFavorite(product.id)}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                            >
                                Remove from Favorites
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}