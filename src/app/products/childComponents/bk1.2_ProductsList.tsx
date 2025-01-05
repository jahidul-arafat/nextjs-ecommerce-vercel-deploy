"use client" // beacuse we used 'useState' for filtering products by price

import Image from "next/image";
import Link from "next/link";
import {Product} from "@/app/lib/product-data";
import {useEffect, useState} from "react"; // importing the interface Product{}
import {FaHeart, FaShoppingCart} from 'react-icons/fa';
import {addToCart, addToFavorite, deleteProductFromCart} from "@/app/lib/utils"; // Import icons
// create a simple product list component

function ProductItem({ product, index }: { product: Product; index: number }) {
    const [isInCart, setIsInCart] = useState(false);

    useEffect(() => {
        async function checkCartStatus() {
            try {
                //const userId = 'user2'; // Replace this with actual user ID retrieval logic
                const userId = localStorage.getItem('user');
                if (!userId) {
                    alert("Please log in to add items to your cart.");
                    return;
                }
                const response = await fetch(`/api/user/${userId}/cart`);
                if (!response.ok) {
                    console.error('Failed to fetch cart items');
                    return;
                }
                const cartItems: Product[] = await response.json();
                setIsInCart(cartItems.some(item => item.id === product.id));
            } catch (error) {
                console.error('Error checking if product is in cart:', error);
                setIsInCart(false);
            }
        }

        checkCartStatus();
    }, [product.id]);

    const handleAddToCart = async () => {
        try {
            await addToCart(product);
            setIsInCart(true);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'An error occurred');
        }
    };

    // const handleRemoveFromCart = async () => {
    //     try {
    //         // Implement remove from cart logic here
    //         console.log('Removing from cart');
    //         alert("Removing from cart");
    //         setIsInCart(false);
    //     } catch (error) {
    //         alert(error instanceof Error ? error.message : 'An error occurred');
    //     }
    // };
    const handleRemoveFromCart = async () => {
        try {
            //const userId = 'user2'; // Replace this with actual user ID retrieval logic
            const userId = localStorage.getItem('user');
            if (!userId) {
                alert("Please log in to add items to your favorites.");
                return;
            }
            await deleteProductFromCart(userId, product.id);
            setIsInCart(false);
        } catch (error) {
            console.error('Error removing product from cart:', error);
            alert(error instanceof Error ? error.message : 'An error occurred while removing from cart');
        }
    };

    const handleAddToFavorite = () => {
        try {
            addToFavorite(product);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'An error occurred');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:scale-105 relative h-64">
            <Link key={`${product.id}-${index}`} href={"/products/" + product.id}>
                <div className="p-3">
                    <Image
                        className="w-full h-32 object-cover mb-2"
                        src={'/' + product.imageUrl}
                        alt={product.name}
                        width={100}
                        height={100}
                    />
                    <h2 className="text-xs text-gray-500">{`ID: ${product.id}`}</h2>
                    <p className="text-xs text-orange-400 truncate">{product.genre.join(", ")}</p>
                    <h2 className="text-sm font-semibold truncate">{product.name}</h2>
                    <p className="text-sm text-blue-600 font-bold">${product.price}</p>
                </div>
            </Link>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-white bg-opacity-100">
                <div className="flex justify-between">
                    {isInCart ? (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleRemoveFromCart();
                            }}
                            className="bg-yellow-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center"
                        >
                            <FaShoppingCart className="mr-1 text-xs"/> Remove
                        </button>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleAddToCart();
                            }}
                            className="bg-yellow-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center"
                        >
                            <FaShoppingCart className="mr-1 text-xs"/> Add
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            handleAddToFavorite();
                        }}
                        className="bg-gray-50 hover:bg-red-600 text-gray-600 hover:text-white px-2 py-1 rounded text-xs flex items-center"
                    >
                        <FaHeart className="mr-1 text-xs"/>
                    </button>
                </div>
            </div>
        </div>
    );
}


/*
Why key in Div where each Div is a child component of the Parent component ProductsList
------
Here's why this is important:

1. Uniqueness: Each key should be unique among siblings. In this case, product.id is a good choice because it's likely unique for each product.
2. Stability: The key should be consistent across re-renders. Using product.id is good because it's tied to the data and won't change unless the product itself changes.
3. Performance: React uses these keys to optimize rendering. It can quickly determine which items in a list have changed, been added, or been removed.
4. State Preservation: If your list items have state or are controlled inputs, proper keys help React maintain the correct state for each item.
5. Avoiding Warnings: React will give you a warning in the console if you don't provide keys for list items.
 */
export default function ProductsList({products}: { products: Product[] }) {
    const [priceFilter, setPriceFilter] = useState<string>('all');

    const filterProducts = (products: Product[]) => {
        switch (priceFilter) {
            case 'under100':
                return products.filter(product => product.price < 100);
            case '100to500':
                return products.filter(product => product.price >= 100 && product.price <= 500);
            case 'over500':
                return products.filter(product => product.price > 500);
            default:
                return products;
        }
    }
    const filteredProducts = filterProducts(products);


    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Filter by Price</h2>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setPriceFilter('all')}
                        className={`px-4 py-2 rounded ${priceFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-orange-300'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setPriceFilter('under100')}
                        className={`px-4 py-2 rounded ${priceFilter === 'under100' ? 'bg-blue-500 text-white' : 'bg-orange-300'}`}
                    >
                        Under $100
                    </button>
                    <button
                        onClick={() => setPriceFilter('100to500')}
                        className={`px-4 py-2 rounded ${priceFilter === '100to500' ? 'bg-blue-500 text-white' : 'bg-orange-300'}`}
                    >
                        $100 - $500
                    </button>
                    <button
                        onClick={() => setPriceFilter('over500')}
                        className={`px-4 py-2 rounded ${priceFilter === 'over500' ? 'bg-blue-500 text-white' : 'bg-orange-300'}`}
                    >
                        Over $500
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                    <ProductItem key={`${product.id}-${index}`} product={product} index={index}/>
                ))}
            </div>
        </div>
    )
}