// update the cart page to use the dynamic cart
"use client"

import React, {useEffect, useState} from "react";
import { Product } from "@/app/data/product-data";
import Link from "next/link";
import Image from "next/image";
import {useRouter} from "next/navigation";
// import {fetchAllProducts} from "@/app/utils/utils";
// import {validate} from "json-schema";

const renderCartItems = (cartProducts: Product[], onDelete:(id:string)=>void) => {
    return cartProducts.map((product,index) => (
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
                    <p className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</p>
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

// render the cart page
const renderCart = (cartProducts: Product[], totalPrice: number, deleteProduct: (id: string) => void, userId: string) => {
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
                                <span className="text-2xl font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
                            </div>
                            <Link href={`/user/${userId}/checkout?items=${cartProducts.map(p => p.id).join(',')}`} className="block mt-4 w-full">
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
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

export function CartPage({ params }: { params: Promise<{ id: string }> }) {
    const [cartProducts, setCartProducts] = useState<Product[]>([]);
    //const [allProducts, setAllProducts] = useState<Product[]>([]);
    const router = useRouter();
    const resolvedParams = React.use(params); // whats the difference between React.use() and await?
    const userId = resolvedParams.id;
    /*
    - React.use() is the recommended approach for client components in Next.js 13 and later. It allows you to unwrap the params promise within the component's render cycle.
    - await would be used in server components or in getServerSideProps (for older versions of Next.js), where asynchronous operations are more naturally supported.
     */

    const clearCartAndRedirect = () => {
        console.log("Clearing cart and redirecting to the /products page");
        localStorage.removeItem(`cart_${userId}`);
        setCartProducts([]);
        router.push("/products");
    };

    useEffect(() => {
        const fetchProductsAndUpdateCart = async () => {
            try {
                //const fetchedProducts = await fetchAllProducts();
                //setAllProducts(fetchedProducts);

                //const cartItems = JSON.parse(localStorage.getItem(`${userId}_cart`) || '[]');
                const cartItems= await fetch(process.env.NEXT_PUBLIC_SITE_URL +'/api/user/' + userId + '/cart');

                // const validCartProducts: Product[] = cartItems.filter((item: Product) =>
                //     fetchedProducts.some(p => p.id === item.id)
                // );
                //const validCartProducts = [...cartItems];
                const validCartProducts = await cartItems.json();
                console.log("Valid cart items from Cart API': ", validCartProducts);

                setCartProducts(validCartProducts);

                if (validCartProducts.length === 0) {
                    console.log("No valid items found in the cart. Redirecting to the /products page");
                    clearCartAndRedirect();
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                clearCartAndRedirect();
            }
        };

        fetchProductsAndUpdateCart().catch((error) => {
            console.error("Error fetching products and updating cart:", error);
            clearCartAndRedirect();
        });
    }, [userId]);

    const deleteProduct = (id: string) => {
        const indexToRemove = cartProducts.findIndex(product => product.id === id);
        if (indexToRemove !== -1) {
            const updatedCart = [...cartProducts];
            updatedCart.splice(indexToRemove, 1);
            setCartProducts(updatedCart);
            localStorage.setItem(`${userId}_cart`, JSON.stringify(updatedCart));

            if (updatedCart.length === 0) {
                console.log("Cart becomes empty after item deletions. Redirecting to the /products page");
                clearCartAndRedirect();
            }
        }
    };

    console.log("Products in cart: ", cartProducts.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price
    })));

    const totalPrice = cartProducts.reduce((sum, product) => sum + product.price, 0);

    console.log(`Total Cost of all items in the cart: ${totalPrice}`);

    return renderCart(cartProducts, totalPrice, deleteProduct, userId);
}