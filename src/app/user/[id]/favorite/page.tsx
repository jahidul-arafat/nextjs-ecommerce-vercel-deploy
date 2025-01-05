"use client"

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Product } from "@/app/lib/product-data";
import { useRouter } from 'next/navigation';
import { fetchAllProducts } from "@/app/lib/utils";

export const dynamic='force-dynamic';

export default function FavoritePage({ params }: { params: Promise<{ id: string }> }) {
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
    const [favoriteChange, setFavoriteChange] = useState(0);
    const router = useRouter();
    const resolvedParams = React.use(params);
    const userId = resolvedParams.id;

    useEffect(() => {
        const fetchProductsAndUpdateFavorites = async () => {
            try {
                const allProducts = await fetchAllProducts();
                const storedFavorites = localStorage.getItem(`${userId}_favorite`);

                if (storedFavorites) {
                    const parsedFavorites = JSON.parse(storedFavorites);
                    const validFavorites = parsedFavorites.filter((item: Product) =>
                        allProducts.some(p => p.id === item.id)
                    );

                    setFavoriteProducts(validFavorites);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProductsAndUpdateFavorites().catch((error) => {
            console.error("Error handling favorites:", error);
        });
    }, [favoriteChange, userId]);

    const removeFavorite = (id: string) => {
        const updatedFavorites = favoriteProducts.filter(product => product.id !== id);
        localStorage.setItem(`${userId}_favorite`, JSON.stringify(updatedFavorites));
        setFavoriteChange(prev => prev + 1);
    };

    const handleAddToFavorites = () => {
        router.push("/products");
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Your Favorites</h1>
            {favoriteProducts.length === 0 ? (
                <div className="text-center">
                    <p className="mb-4">You haven&#39;t added any favorites yet.</p>
                    <button
                        onClick={handleAddToFavorites}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    >
                        Add Items to Favorites
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteProducts.map(product => (
                        <div key={product.id} className="border rounded-lg p-4 shadow-md">
                            <Link href={`/products/${product.id}`}>
                                <img
                                    src={`/${product.imageUrl}`}
                                    alt={product.name}
                                    className="w-full h-48 object-cover mb-4 rounded"
                                />
                                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                            </Link>
                            <p className="text-gray-600 mb-2">${product.price.toFixed(2)}</p>
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
            <div className="mt-8">
                <Link href="/products" className="text-blue-600 hover:underline">
                    ← Back to Products
                </Link>
            </div>
        </div>
    );
}