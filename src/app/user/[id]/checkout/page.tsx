"use client"

import React, {useState, useEffect} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {Product} from "@/app/data/product-data";
import Link from 'next/link';
import {fetchAllProducts} from "@/app/utils/utils";
import {Order, OrderItem} from "@/app/datastucture/order";
import CheckoutInteractionMap from '@/app/utils/CheckoutInteractionMap';

export const dynamic = 'force-dynamic';

// Mock api implementation details
// step-1: define an interface for payment data
interface PaymentData {
    items: Product[];
    email: string;
    paymentMethod: string;
    totalPrice: number;
}

// Add CORS headers
const headers = {
    'Access-Control-Allow-Origin': '*', // Replace '*' with your frontend domain if necessary
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
};

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
export default function CheckoutPage({params}: { params: Promise<{ id: string }> }) {
    const searchParams = useSearchParams();
    console.log("Search Param: ", searchParams.get('items'));
    const resolvedParams = React.use(params);
    const userId = resolvedParams.id;

    const router = useRouter();
    // Create a state for the countdown
    const [countdown, setCountdown] = useState(30);

    const [cartItems, setCartItems] = useState<Product[]>([]); // current state of the component i.e. current cart items and changes in the cart items; default null
    const [email, setEmail] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');

    // For D3 Mapping
    const [interactionData, setInteractionData] = useState<{ nodes: any[], links: any[] }>({
        nodes: [
            {id: "Products", group: 1},
            {id: "Cart", group: 2},
            {id: "Checkout", group: 3},
            {id: "CheckoutSuccess", group: 4},
            {id: "CheckoutFailure", group: 4},
        ],
        links: []
    });

    const [checkoutComplete, setCheckoutComplete] = useState(false);


    useEffect(() => {
        // Track interaction when component mounts (coming from Cart to Checkout)
        setInteractionData(prev => ({
            ...prev,
            links: [
                ...prev.links,
                {source: "Cart", target: "Checkout", value: 1}
            ]
        }));

        // Cleanup function to track when user leaves Checkout page
        return () => {
            setInteractionData(prev => ({
                ...prev,
                links: [
                    ...prev.links,
                    {source: "Checkout", target: "Cart", value: 1} // Assuming they go back to Cart if they leave
                ]
            }));
        };
    }, []);
    // ---- For D3 Mapping ----

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
            .catch((error) => {
                console.error("Error handling checkout:", error);
                // Redirect to cart page in case of any error
                router.push(`/user/${userId}/cart`);
            });
    }, [searchParams, router, userId]);


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
                acc[item.id] = {...item, quantity: 0};
            }
            acc[item.id].quantity += 1;
            return acc;
        }, {} as { [key: string]: Product & { quantity: number } });
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

        const paymentData: PaymentData = {
            items: groupedCartItems,
            email,
            paymentMethod,
            totalPrice
        };

        try {
            const paymentResult = await mockProcessPayment(paymentData);

            if (paymentResult.success) {
                // Create order object
                const order: Order = {
                    userId,
                    items: groupedCartItems.map(item => ({
                        productId: item.id,
                        quantity: item.quantity
                    })),
                    transactionId: paymentResult.transactionId,
                    totalCost: totalPrice,
                    paymentMethod,
                    dateReceived: new Date().toISOString()
                };

                // Save order
                const orderResponse = await fetch(`/api/user/${userId}/order`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...headers
                    },
                    body: JSON.stringify(order),
                });

                if (!orderResponse.ok) {
                    throw new Error('Failed to save order');
                }

                // Delete cart items
                const deleteResponse = await fetch(`/api/user/${userId}/cart`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        ...headers
                    },
                    body: JSON.stringify({
                        productIds: cartItems.map(item => item.id)
                    }),
                });

                if (!deleteResponse.ok) {
                    throw new Error('Failed to clear cart');
                }

                // Update interaction data for D3 mapping
                const updatedNodes = [
                    ...interactionData.nodes,
                    ...groupedCartItems.map(item => ({
                        id: `Product_${item.id}`,
                        group: 5,
                        name: `${item.name} (${item.quantity}x)`,
                        quantity: item.quantity
                    })),
                    {id: `Transaction_${paymentResult.transactionId}`, group: 6},
                    {id: `Email_${email}`, group: 7}
                ];

                const updatedLinks = [
                    ...interactionData.links,
                    {source: "Checkout", target: "CheckoutSuccess", quantity: 1},
                    {source: "CheckoutSuccess", target: "Cart", quantity: 1},
                    ...groupedCartItems.map(item => ({
                        source: "Checkout",
                        target: `Product_${item.id}`,
                        quantity: item.quantity
                    })),
                    {source: "CheckoutSuccess", target: `Transaction_${paymentResult.transactionId}`, value: 1},
                    {source: "CheckoutSuccess", target: `Email_${email}`, value: 1}
                ];

                setInteractionData({
                    nodes: updatedNodes,
                    links: updatedLinks
                });

                // alert(`Payment successful! Transaction ID: ${paymentResult.transactionId}`);
                // // Wait for 30 seconds before redirecting
                // setTimeout(() => {
                //     router.push(`/user/${userId}/cart`);
                // }, 30000);

                // Clear cart items and set checkout as complete
                setCartItems([]);
                setCheckoutComplete(true);

                alert(`Payment successful! Transaction ID: ${paymentResult.transactionId}`);

                // Start countdown
                let secondsLeft = 30;
                const countdownInterval = setInterval(() => {
                    setCountdown(secondsLeft);
                    secondsLeft--;

                    if (secondsLeft < 0) {
                        clearInterval(countdownInterval);
                        router.push(`/user/${userId}/cart`);
                    }
                }, 1000);

                // Wait for 30 seconds before redirecting
                setTimeout(() => {
                    clearInterval(countdownInterval);
                    router.push(`/user/${userId}/cart`);
                }, 30000);

            } else {
                // Update interaction data for failed payment
                // setInteractionData(prev => ({
                //     ...prev,
                //     links: [
                //         ...prev.links,
                //         {source: "Checkout", target: "CheckoutFailure", value: 1},
                //         {source: "CheckoutFailure", target: "Checkout", value: 1} // As it stays on Checkout page
                //     ]
                // }));

                alert('Payment failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during checkout:', error);

            // Update interaction data for error
            // setInteractionData(prev => ({
            //     ...prev,
            //     links: [
            //         ...prev.links,
            //         {source: "Checkout", target: "CheckoutFailure", value: 1},
            //         {source: "CheckoutFailure", target: "Checkout", value: 1} // As it stays on Checkout page
            //     ]
            // }));

            alert('An error occurred during checkout. Please try again.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
                    {groupedCartItems.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="flex justify-between items-center mb-2 cart-item">
                            <span>{item.name} ({item.quantity}x)</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
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
                                name="email"
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
                                name="payment"
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
                            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                checkoutComplete ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={checkoutComplete}
                        >
                            {checkoutComplete ? 'Checkout Complete' : 'Checkout'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Checkout Interaction Map Section */}
            <div className="mt-16 -mx-4 sm:-mx-6 lg:-mx-8">
                <h2 className="text-2xl font-semibold mb-4 px-4 sm:px-6 lg:px-8">Checkout Interaction Map [ZOOM it] </h2>
                <div className="w-full overflow-hidden">
                    <CheckoutInteractionMap data={interactionData}/>
                </div>
            </div>

            {/* Back to Cart Link */}
            <div className="mt-8 px-4 sm:px-6 lg:px-8">
                <Link href={`/user/${userId}/cart`} className="text-blue-600 hover:underline">
                    ← Back to Test Cart
                </Link>
            </div>

            {/* Countdown message */}
            {checkoutComplete && countdown !== null && (
                <div className="mt-4 text-center">
                    <p>Redirecting to cart in {countdown} seconds; Enjoy the graph [ZOOM it]...</p>
                </div>
            )}
        </div>
    );
}