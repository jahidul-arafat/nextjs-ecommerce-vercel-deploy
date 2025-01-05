"use client"

import React, {useState, useEffect} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {Product} from "@/app/lib/product-data";
import Link from 'next/link';
import {fetchAllProducts} from "@/app/lib/utils";

export const dynamic='force-dynamic';

// Mock api implementation details
// step-1: define an interface for payment data
interface PaymentData {
    items: Product[];
    email: string;
    paymentMethod: string;
    totalPrice: number;
}

// Mock function to simulate payment processing
const mockProcessPayment = async (paymentData: PaymentData): Promise<{ success: boolean, transactionId: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate a successful payment 90% of the time
    if (Math.random() < 0.9) {
        return {
            success: true,
            transactionId: 'mock-' + paymentData.email.split("@")[0] + "-" + Math.random().toString(36).substr(2, 9)
        };
    } else {
        console.error('Payment failed');
        return {
            success: false,
            transactionId: 'XXXX'
        };
    }
};

// Checkout component
export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
    const searchParams = useSearchParams();
    console.log("Search Param: ", searchParams.get('items'));
    const resolvedParams = React.use(params);
    const userId = resolvedParams.id;

    const router=useRouter();

    // 3x useState hooks to observer the current state of the react components
    /*
    * Note- we not gonna use useEffect() for email and payment method state changes
    * why?
    * The reason we didn't use useEffect() for the email and paymentMethod states is that these are form input fields that don't depend on external data or side effects.
    * Let me explain:
    * 1. cartItems: We use useEffect() for this because it depends on the URL parameters (external data).
    * We need to parse the URL, find the corresponding products, and
    * update the state when the component mounts or when the URL changes.
    *
    * 2. email and paymentMethod: These are controlled form inputs.
    * Their values are meant to be changed directly by user interaction (typing in the email field or selecting a payment method).
    * They don't need to be initialized from any external source or updated based on side effects.
    * */
    const [cartItems, setCartItems] = useState<Product[]>([]); // current state of the component i.e. current cart items and changes in the cart items; default null
    const [email, setEmail] = useState('jahidapon@gmail.com');
    const [paymentMethod, setPaymentMethod] = useState('');

    // execute only when there is a change in the cart items
    // http://localhost:3000/checkout?items=123,345 if the items changes here, only then execute this sideEffect function
    // useEffect(() => {
    //     const cartItemIds = searchParams.get('items')?.split(',') || []; // http://localhost:3000/checkout?items=123,345
    //     const items = cartItemIds
    //         .map(id => products.find(p => p.id === id))
    //         .filter((product) => product !== undefined);
    //     setCartItems(items);
    // }, [searchParams]);


    // useEffect(() => {
    //     // Fetch cart items from localStorage
    //     const storedCart = localStorage.getItem('cart');
    //     if (storedCart) {
    //         const parsedCart = JSON.parse(storedCart);
    //         // Filter to ensure only valid products are included
    //         const validCartItems = parsedCart.filter((item: Product) =>
    //             products.some(p => p.id === item.id)
    //         );
    //         setCartItems(validCartItems);
    //     }
    // }, []);

    // Side effect
    // Will be executed whenever there are changes in the http://localhost:3000/checkout?items=123,345 and the router
    // useEffect(()=>{
    //     const cartItemIds = searchParams.get('items')?.split(',')||[]; // http://localhost:3000/checkout?items=123,345
    //
    //     // if there are no items in the URL, redirect to the cart page
    //     if (cartItemIds.length===0){
    //         console.log("No items in the checkout. Redirecting to /cart");
    //         router.push("/cart");
    //         return;
    //     }
    //
    //     // validate the items against the 'products'
    //     const validItems: Product[]= cartItemIds
    //         .map(id=>products.find(p=>p.id===id))
    //         .filter((product):product is Product => product!==undefined);
    //
    //     // list the invalid items
    //     console.log("Invalid Items: ", cartItemIds.filter(id=>!products.some(p=>p.id===id)));
    //
    //     if (validItems.length===0){
    //         // if no valid items were found, redirect to the cart page
    //         console.log("No valid items found in the checkout. Redirecting to /cart");
    //         router.push("/cart");
    //         return;
    //     }else{
    //         setCartItems(validItems)
    //     }
    //
    // },[searchParams, router]);

    useEffect(() => {
        const fetchProductsAndUpdateCart = async () => {
            try {
                const cartItemIds = searchParams.get('items')?.split(',') || [];

                if (cartItemIds.length === 0) {
                    console.log("No items in the checkout. Redirecting to /cart");
                    router.push(`/user/${userId}/cart`);
                    return;
                }

                // Fetch all products, including newly added ones
                const allProducts = await fetchAllProducts();

                // Validate the items against all products
                const validItems: Product[] = cartItemIds
                    .map(id => allProducts.find(p => p.id === id))
                    .filter((product): product is Product => product !== undefined);

                console.log("Invalid Items: ", cartItemIds.filter(id => !allProducts.some(p => p.id === id)));

                if (validItems.length === 0) {
                    console.log("No valid items found in the checkout. Redirecting to /cart");
                    router.push(`/user/${userId}/cart`);
                } else {
                    setCartItems(validItems);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                router.push(`/user/${userId}/cart`);
            }
        };

        fetchProductsAndUpdateCart()
            .catch((error)=>{
                console.error("Error handling checkout:", error);
                // Redirect to cart page in case of any error
                router.push(`/user/${userId}/cart`);
            });
    }, [searchParams, router,userId]);



    // New function to group cart items
    const groupCartItems = (items: Product[]) => {
        // Signature: array.reduce((accumulator, currentValue, index, array)
        const groupedItems = items.reduce((acc, item) => {
            /*
            acc = {
                "1": { id: "1", name: "Apple", price: 1, quantity: 2 },
                "2": { id: "2", name: "Orange", price: 2, quantity: 1 }
            };
             */
            if (!acc[item.id]) {
                acc[item.id] = { ...item, quantity: 0 };
            }
            acc[item.id].quantity += 1;
            return acc;
        }, {} as { [key: string]: Product & { quantity: number } });
        /*
        // casting
        // {} as { [key: string]: Product & { quantity: number } }
        {
            "1": { id: "1", name: "Apple", price: 1, quantity: 2 },
            "2": { id: "2", name: "Orange", price: 2, quantity: 1 }
        }
         */

        return Object.values(groupedItems);
    };

    // Group the cart items
    const groupedCartItems = groupCartItems(cartItems);

    // Calculate the total price
    const totalPrice = groupedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // calculate the total cost of all cart items
    //const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
    console.log("Total Price: ", totalPrice);

    // upon successful payment, an alert will appear in the browser that the payment is done
    /*
    1. (e: React.FormEvent) => { ... }: This is the function definition. It takes an event (e) of type React.FormEvent as its parameter. This event is automatically passed when the form is submitted.
    2. .preventDefault();: This prevents the default form submission behavior, which would cause the page to reload. Instead, we want to handle the submission in JavaScript.
     Normally, when a form is submitted, the browser will reload the page or navigate to a new URL. This is the default behavior that event.preventDefault() is meant to stop.
     */
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        // simulating the necessity of event.preventDefault(), when where your checkout process involves sending data to a backend API and waiting for a response before proceeding.
        // In this case, using event.preventDefault() becomes crucial.

        /*
        1.  event.preventDefault() is crucial because:
            - It prevents the form from submitting and reloading the page while we're waiting for the API response.
            - It allows us to handle the asynchronous operation (API call) without interruption.
        2. We're making an asynchronous call to a hypothetical /api/process-payment endpoint.
        3. We're waiting for the response from the server before proceeding.
        4. If the payment is successful, we show an alert with the transaction details.
        5.  If there's an error, we catch it and show an error message to the user.
         */
        // Simulate sending data to backend and waiting for response
        // const response = await fetch('/api/process-payment', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         items: cartItems,
        //         email: email,
        //         paymentMethod: paymentMethod,
        //         totalPrice: totalPrice
        //     }),
        // });
        //
        // if (!response.ok) {
        //     throw new Error('Payment failed');
        // }

        // const result = await response.json();

        // clear cart when the checkout is successful
        // const clearCart=()=>{
        //     localStorage.removeItem(`${userId}_cart`);
        //     setCartItems([]);
        // }
        const clearCart = async () => {
            try {
                const response = await fetch(`/api/user/${userId}/cart`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productIds: cartItems.map(item => item.id) }),
                });

                if (!response.ok) {
                    console.error('Failed to clear cart');
                    return;
                }

                const result = await response.json();

                console.log('Cart cleared:', result);

                // Update local state
                setCartItems([]);

                // Clear local storage
                localStorage.removeItem(`${userId}_cart`);

            } catch (error) {
                console.error('Error clearing cart:', error);
                alert('Failed to clear cart. Please try again.');
            }
        };

        // Check if the total price is 0
        if (cartItems.length === 0 || totalPrice === 0) {
            alert("Invalid order: The total price is $0. Please add items to your cart before checking out.");
            return; // Exit the function early
        }
        if (!email || !paymentMethod) {
            alert('Please fill in all fields');
            return;
        }

        const paymentData: PaymentData = {
            items: cartItems,
            email,
            paymentMethod,
            totalPrice: totalPrice,
        };

        try {
            // Use the mock payment process instead of actual fetch
            const result = await mockProcessPayment(paymentData);

            if (!result.success) {
                console.error("Payment processing failed");
                alert('There was an error processing your payment. Please try again.');
                return; // Exit the function early
            }

            // Handle successful payment
            const date = new Date().toLocaleDateString();
            const itemNames = cartItems.map(item => item.name).join(', ');

            alert(`Payment for items ${itemNames} is done on ${date} for $${totalPrice.toFixed(2)}. Transaction ID: ${result.transactionId}. An email confirmation has been sent to ${email}.`);
            // You might want to clear the cart or redirect the user here

            // Clear the cart in localStorage
            await clearCart();

            // Optionally, you might want to redirect the user to a confirmation page
            // window.location.href = '/confirmation';
            console.log("Checkout Successfully Completed.");
            router.push(`/user/${userId}/cart`);

        } catch (error) {
            console.error("Error during payment processing:", error);
            alert('An unexpected error occurred. Please try again later.');
        }

    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
                    {groupedCartItems.map((item,index) => (
                        <div key={`${item.id}-${index}`} className="flex justify-between items-center mb-2">
                            <span>{item.name} ({item.quantity}x)</span>
                            <span>${(item.price*item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between items-center font-bold">
                            <span>Total</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-4">Payment Details</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block mb-1">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>
                        <div>
                            <label htmlFor="payment" className="block mb-1">Payment Method</label>
                            <select
                                id="payment"
                                value={paymentMethod}
                                onChange={(event) => setPaymentMethod(event.target.value)}
                                required
                                className="w-full px-3 py-2 border rounded"
                            >
                                <option value="">Select a payment method</option>
                                <option value="credit">Credit Card</option>
                                <option value="paypal">PayPal</option>
                                <option value="debit">Debit Card</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className={`w-full py-2 px-4 rounded ${
                                cartItems.length === 0 || totalPrice === 0
                                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                            disabled={cartItems.length === 0 || totalPrice === 0}
                        >
                            Complete Purchase
                        </button>
                    </form>
                </div>
            </div>

            <div className="mt-8">
                <Link href={`/user/${userId}/cart`} className="text-blue-600 hover:underline">
                    ← Back to Cart
                </Link>
            </div>
        </div>
    );
}