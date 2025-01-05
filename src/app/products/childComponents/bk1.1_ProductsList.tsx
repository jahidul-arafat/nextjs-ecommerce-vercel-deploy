"use client" // beacuse we used 'useState' for filtering products by price

import Image from "next/image";
import Link from "next/link";
import {Product} from "@/app/lib/product-data";
import {useState} from "react"; // importing the interface Product{}
import {FaHeart, FaShoppingCart} from 'react-icons/fa';
import {addToCart, addToFavorite} from "@/app/lib/utils"; // Import icons
// create a simple product list component
/*

The function expects a single object as its argument.
This object should have a property named products.
The type of the products property is an array of Product objects (Product[]).
The curly braces {} in the parameter list are used for object destructuring, allowing you to directly access the products property of the passed object.

- When you use this component, you would call it like this: <ProductsList products={someArrayOfProducts} />

: {products: Product[]}: This part explicitly defines the type of the entire parameter object. It's saying that the function expects an object with a products property that is an array of Product objects.
 */

/*
Glimpse of the Product
{
        id: '123',
        name: 'Hat',
        imageUrl: 'hat.jpg',
        description: 'Cheer the team on in style with our unstructured, low crown, six-panel baseball cap made of 100% organic cotton twill. Featuring our original Big Star Collectibles artwork, screen-printed with PVC- and phthalate-free inks. Complete with matching sewn ventilation eyelets, and adjustable fabric closure.',
        price: 29,
}
 */

// function renderAProduct(product: Product,index:number) {
//     return (
//         <div
//             className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
//             <Link key={`${product.id}-${index}`} href={"/products/" + product.id}>
//                 <div className="p-4">
//                     <Image className="w-full h-48 object-cover mb-4" src={'/' + product.imageUrl} alt={product.name}
//                            width={150} height={150}/>
//                     <h2 className="text-sm text-gray-600 mb-2">{`Product ID: ${product.id}`}</h2>
//                     <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
//                     <p className="text-blue-600 font-bold">${product.price}</p>
//                 </div>
//             </Link>
//         </div>
//     );
// }

async function renderAProduct(product: Product, index: number) {
    const handleAddToCart = async (product: Product) => {
        try {
            await addToCart(product);
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

    async function productIsInCart(product: Product): Promise<boolean> {
        try {
            // Assuming we have a way to get the current user's ID
            const userId = 'user2'; // Replace this with actual user ID retrieval logic
            // const user = localStorage.getItem('user');
            // if (!user) {
            //     alert("Please log in to add items to your cart.");
            //     return;
            // }
            //
            // // Fetch the cart items from the API
            const response = await fetch(`/api/user/${userId}/cart`);
            //
            // if (!response.ok) {
            //     throw new Error('Failed to fetch cart items');
            // }

            const cartItems: Product[] = await response.json();

            // Check if the product exists in the cart
            return cartItems.some(item => item.id === product.id);
        } catch (error) {
            console.error('Error checking if product is in cart:', error);
            return false; // Assume product is not in cart if there's an error
        }
    }

    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 relative">
            <Link key={`${product.id}-${index}`} href={"/products/" + product.id}>
                <div className="p-4">
                    <Image
                        className="w-full h-48 object-cover mb-4"
                        src={'/' + product.imageUrl}
                        alt={product.name}
                        width={150}
                        height={150}
                    />
                    <h2 className="text-sm text-gray-600 mb-2">{`Product ID: ${product.id}`}</h2>
                    <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
                    <p className="text-blue-600 font-bold">${product.price}</p>
                </div>
            </Link>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white bg-opacity-100">
                <div className="flex justify-between">
                    {await productIsInCart(product) ? (
                        <button
                            onClick={(e) => {
                                e.preventDefault(); // prevent the browser from following the link
                                console.log('Removing from cart');
                                alert("removing from cart");
                            }}
                            className="bg-yellow-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center"
                        >
                            <FaShoppingCart className="mr-2"/> Remove from Cart
                        </button>

                    ) : (
                        <button
                            onClick={(e) => {
                                e.preventDefault(); // prevent the browser from following the link
                                handleAddToCart(product);
                            }}
                            className="bg-yellow-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center"
                        >
                            <FaShoppingCart className="mr-2"/> Add to Cart
                        </button>
                    )}

                    <button
                        onClick={(e) => {
                            e.preventDefault(); // prevent the browser from following the link
                            // In React, events bubble up the component tree.
                            // The preventDefault() stops the click event from propagating up to the <Link> component, which would otherwise interpret the click as a navigation action.
                            handleAddToFavorite(product);
                        }}
                        className="bg-gray-50 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center"
                    >
                        <FaHeart className="mr-2"/>
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
                    <div key={`${product.id}-${index}`}>
                        {renderAProduct(product, index)}
                    </div>
                ))}
            </div>
        </div>
    )
}