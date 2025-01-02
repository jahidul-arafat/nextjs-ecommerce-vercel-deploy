"use client"

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import ShoppingCartList from './ShoppingCartList';
import {Product} from "@/app/data/product-data";
import {deleteProductFromCart} from "@/app/utils/utils";

const ClientCartWrapper = ({initialCartProducts, userId}: { initialCartProducts: Product[], userId: string }) => {
    const [cartProducts, setCartProducts] = useState<Product[]>(initialCartProducts);
    const router = useRouter();

    const clearCartAndRedirect = () => {
        console.log("Clearing cart and redirecting to the /products page");
        setCartProducts([]);
        router.push("/products");
    };

    // hook
    // trigger when changes in UserId, i.e. new user is logged in; show the userID specific cart
    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/user/${userId}/cart`);
                if (!response.ok) {
                    console.error('Failed to fetch cart items');
                    return;
                }
                const validCartProducts = await response.json();
                console.log("Valid cart items from Cart API': ", validCartProducts);
                setCartProducts(validCartProducts);

                if (validCartProducts.length === 0) {
                    console.log("No valid items found in the cart. Redirecting to the /products page");
                    clearCartAndRedirect();
                }
            } catch (error) {
                console.error("Error fetching cart items:", error);
                clearCartAndRedirect();
                // Handle error (e.g., show error message)
            }
        };

        fetchCartItems();
    }, [userId]);


    const deleteProduct = async (id: string) => {
        try {
            console.log(`Attempting to delete product with id: ${id}`);
            const response = await deleteProductFromCart(userId, id);
            console.log("Response from deleteProductFromCart:", response);

            if (response && typeof response === 'object' && 'updatedCart' in response) {
                const updatedCart = response.updatedCart;
                console.log(`Updated cart has ${updatedCart.length} items`);

                // Fetch the full details of the remaining products
                const fullUpdatedCart = await Promise.all(updatedCart.map(async (item: Product) => {
                    const productResponse = await fetch(`http://localhost:3000/api/products/${item.id}`);
                    if (productResponse.ok) {
                        return await productResponse.json();
                    }
                    return item; // If fetch fails, keep the original item
                }));

                console.log("Full updated cart:", fullUpdatedCart);
                setCartProducts(fullUpdatedCart);

                if (fullUpdatedCart.length === 0) {
                    console.log("Cart is now empty, redirecting...");
                    clearCartAndRedirect();
                } else {
                    console.log("Cart still has items, staying on page");
                }
            } else {
                console.error("Unexpected response format from deleteProductFromCart:", response);
                // Handle unexpected response format
            }
        } catch (error) {
            console.error("Error in deleteProduct:", error);
            // Handle error (e.g., show error message to user)
        }
    };

    // const deleteProduct = async (id: string) => {
    //     try {
    //         const deleteResponse = await fetch(`http://localhost:3000/api/user/${userId}/cart`, {
    //             method: 'DELETE',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({productId: id}),
    //         });
    //
    //         if (!deleteResponse.ok) {
    //             console.error('Failed to delete product');
    //             return;
    //         }
    //
    //         const deleteResult = await deleteResponse.json();
    //         console.log("Delete response:", deleteResult);
    //
    //         // Fetch the updated cart
    //         const cartResponse = await fetch(`http://localhost:3000/api/user/${userId}/cart`);
    //         if (!cartResponse.ok) {
    //             console.error('Failed to fetch updated cart');
    //             return;
    //         }
    //
    //         const updatedCart = await cartResponse.json();
    //         setCartProducts(updatedCart);
    //         console.log("[Delete] Updated cart items: ", updatedCart);
    //
    //         if (updatedCart.length === 0) {
    //             clearCartAndRedirect();
    //         }
    //
    //     } catch (error) {
    //         console.error("Error deleting product:", error);
    //         // Handle error (e.g., show error message)
    //     }
    // };

    const totalPrice = cartProducts? cartProducts.reduce((sum, product) => sum + product.price, 0):0;

    return (
        <ShoppingCartList
            cartProducts={cartProducts}
            totalPrice={totalPrice}
            deleteProduct={deleteProduct}
            userId={userId}
        />
    );
};

export default ClientCartWrapper;