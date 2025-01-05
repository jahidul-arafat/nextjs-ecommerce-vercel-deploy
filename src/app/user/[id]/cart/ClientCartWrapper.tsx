"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ShoppingCartList from "./ShoppingCartList";
import { Product } from "@/app/lib/product-data";
import { deleteProductFromCart } from "@/app/lib/utils";

const ClientCartWrapper = ({ initialCartProducts, userId }: { initialCartProducts: Product[], userId: string }) => {
    const [cartProducts, setCartProducts] = useState<Product[]>(initialCartProducts);
    const [cartUpdated, setCartUpdated] = useState(false); // New flag to track cart updates
    const router = useRouter();

    const clearCartAndRedirect = () => {
        console.log("Clearing cart and redirecting to the /products page");
        setCartProducts([]);
    };

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const response = await fetch(`/api/user/${userId}/cart`);
                console.log("fetchCartItems response:", response);
                if (!response.ok) {
                    console.error("Failed to fetch cart items");
                    return;
                }

                const data = await response.json();
                console.log("API Response:", data);

                const validCartProducts = data.cartItems || [];
                console.log("Valid cart items:", validCartProducts);

                setCartProducts(validCartProducts);

                if (validCartProducts.length === 0) {
                    console.log("No valid items found in the cart. Redirecting to the /products page");
                    clearCartAndRedirect();
                }
            } catch (error) {
                console.error("Error fetching cart items:", error);
            }
        };

        fetchCartItems();
    }, [userId, cartUpdated]); // Include cartUpdated to reload when it changes

    const deleteProduct = async (id: string) => {
        try {
            console.log(`Attempting to delete product with id: ${id}`);
            const response = await deleteProductFromCart(userId, id);

            if (response && typeof response === "object" && "updatedCart" in response) {
                console.log("Response from deleteProductFromCart:", response);

                // Update the cart directly and trigger a refresh
                setCartProducts((prevProducts) =>
                    prevProducts.filter((product, index) => {
                        const firstIndex = response.updatedCart.findIndex(
                            (item) => item === product.id
                        );
                        return firstIndex !== -1 && index !== firstIndex;
                    })
                );
                setCartUpdated((prev) => !prev); // Toggle cartUpdated to refresh the cart
            } else {
                console.error("Unexpected response format from deleteProductFromCart:", response);
            }
        } catch (error) {
            console.error("Error in deleteProduct:", error);
        }
    };

    const totalPrice = cartProducts
        ? cartProducts.reduce((sum, product) => sum + product.price, 0)
        : 0;

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
