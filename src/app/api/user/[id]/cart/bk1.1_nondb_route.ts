import {NextRequest, NextResponse} from "next/server";
import {Product, products} from "@/app/data/product-data";

// The code is trying to use localStorage, which is not available in a server-side environment like a Next.js API route.
// localStorage is a browser-specific API and cannot be accessed on the server.
// Mock cart data
type ShoppingCart = Record<string, string[]>;

// creating an in-memory shopping cart for demonstration purposes
const mockCarts: ShoppingCart = {
    'user1': ['111', '123'],
    'user2': ['345', '456'],
    'user3': ['345', '45610'],
};

type Params = {
    id: string,
}

// const headers = {
//     'Access-Control-Allow-Origin': '*', // Replace '*' with your frontend domain if necessary
//     'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//     'Access-Control-Allow-Headers': 'Authorization, Content-Type',
// };

// For server side logging to get the current state of mockCarts which is useful for debugging and testing.
// mockCarts updated are stored in server's in-memory state.
function logMockCarts() {
    console.log('Current state of mockCarts:', JSON.stringify(mockCarts, null, 2));
}

// why GET signature for API route is async?
// Consistency with Next.js API Routes: Next.js recommends using async functions for API routes. This ensures compatibility with Next.js's handling of API requests and allows for easier integration of asynchronous operations in the future.
// TypeScript often expects API route handlers to be async functions, especially when used with frameworks like Next.js.
// GET http://localhost:3000/api/user/[id]/cart
export async function GET(request: NextRequest, {params}: { params: Promise<Params> }) {

    const resolvedParams = await params;
    const userId = resolvedParams.id;

    // get the current state of mockCarts
    logMockCarts();

    // check if user exists in mock data
    if (!mockCarts[userId]) {
        return NextResponse.json({error: "User not found"}, {
            status: 404,
            headers: {'Content-Type': 'application/json'},
        });
    }

    // Log the request and the user's ID
    console.log(`GET request received at /api/user/${userId}/cart`);

    try {
        // Fetch cart items from mock data
        const cartItemIDs = mockCarts[userId] || [];

        // Fetch all products from the /api/products endpoint
        const productsResponse = await fetch(process.env.NEXT_PUBLIC_SITE_URL+'/api/products');
        if (!productsResponse.ok) {
            console.error('Failed to fetch products');
            return;
        }
        const allProducts = await productsResponse.json();

        // Find the corresponding products
        const validCartProducts: Product[] = cartItemIDs.map((id: string) =>
            allProducts.find((product: { id: string; }) => product.id === id)
        ).filter(Boolean);

        // check if cartItems is empty
        // if (cartItems.length === 0) {
        //     return NextResponse.json({message: "Cart is empty"}, {
        //         status: 404,
        //         headers: {'Content-Type': 'application/json'},
        //     });
        // }
        //
        // const validCartProducts = await Promise.all(
        //     cartItems.map(async (productId: string) => {
        //         const productResponse = await fetch(`http://localhost:3000/api/products?id=${productId}`);
        //         if (productResponse.ok) {
        //             return await productResponse.json();
        //         }
        //         console.error(`Failed to fetch details for product ${productId}`);
        //         return null;
        //     })
        // );

        // Return the cart products
        return NextResponse.json(validCartProducts, {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });
    } catch (error) {
        console.error("Error fetching cart items:", error);
        return NextResponse.json({error: "Failed to fetch cart items"}, {
            status: 500,
            headers: {'Content-Type': 'application/json'},
        });
    }
}

type CartBody = {
    productId?: string, // '?' means to make productId optional in the request body.
    productIds?: string[], // '?' means to make productIds optional in the request body.
}

// POST http://localhost:3000/api/user/[id]/cart
/*

It can handle a single product addition: { "productId": "123" }
It can handle multiple product additions: { "productIds": ["123", "456", "789"] }
considering the edge cases, it's better to treat 'productId' and 'productIds' separately and handle them accordingly.'
 */

// POST http://localhost:3000/api/user/[id]/cart
export async function POST(request: NextRequest, {params}: { params: Promise<Params> }) {
    const resolvedParams = await params;
    const userId = resolvedParams.id;
    const body: CartBody = await request.json();

    let productIds: string[];

    // get the current state of mockCarts
    logMockCarts();

    if (body.productId !== undefined) {
        if (Array.isArray(body.productId)) {
            // Handle case where productId is incorrectly sent as an array
            productIds = body.productId;
            console.warn("Warning: 'productId' was sent as an array. Treating it as 'productIds'.");
        } else {
            productIds = [body.productId];
        }
    } else if (body.productIds !== undefined) {
        if (Array.isArray(body.productIds)) {
            productIds = body.productIds;
        } else {
            // Handle case where productIds is incorrectly sent as a single string
            productIds = [body.productIds];
            console.warn("Warning: 'productIds' was sent as a single string. Treating it as a single product ID.");
        }
    } else {
        return NextResponse.json({error: "Invalid input. Provide either 'productId' or 'productIds'"}, {
            status: 400,
            headers: {'Content-Type': 'application/json'},
        });
    }

    if (productIds.length === 0) {
        return NextResponse.json({error: "Empty product list"}, {
            status: 400,
            headers: {'Content-Type': 'application/json'},
        });
    }

    // Log the request and the user's ID
    console.log(`POST request received at /api/user/${userId}/cart with product IDs: ${productIds.join(', ')}`);

    const addedProducts: string[] = [];
    const notFoundProducts: string[] = [];

    // Check if products exist and add them to the cart
    productIds.forEach(productId => {
        const product = products.find(product => product.id === productId);
        if (product) {
            addedProducts.push(productId);
        } else {
            notFoundProducts.push(productId);
        }
    });

    // Update the user's cart with the found products
    if (addedProducts.length > 0) {
        mockCarts[userId] = [...(mockCarts[userId] || []), ...addedProducts];
        console.log(`Added products ${addedProducts.join(', ')} to user ${userId}'s cart`);
    }

    // Prepare the response
    const response = {
        addedProducts,
        notFoundProducts,
        updatedCart: mockCarts[userId] || []
    };

    // Determine the appropriate status code
    const status = notFoundProducts.length > 0 ? 207 : 201; // 207 Multi-Status if some products were not found

    // Return the response
    return NextResponse.json(response, {
        status,
        headers: {'Content-Type': 'application/json'}
    });
}

// DELETE http://localhost:3000/api/user/[id]/cart
/*
This DELETE method:

1. Accepts both single product deletion (productId) and multiple product deletions (productIds).
2. Handles edge cases where productId is sent as an array or productIds is sent as a single string.
3. Checks if the user exists in the mock data.
4. Removes the specified products from the user's cart.
5. Keeps track of successfully deleted products and products that were not found in the cart.
6. Returns a response with the deleted products, not found products, and the updated cart.
7. Uses appropriate status codes (200 for success, 207 for partial success, 400 for bad request, 404 for user not found).

To use this DELETE method, you can send a request like this:

For a single product:
{
  "productId": "123"
}

For multiple products:
{
  "productIds": ["123", "456", "789"]
}
*/

// Add this type definition at the top of your file if not already present
type DeleteCartBody = {
    productId?: string, // '?' means to make productId optional in the request body.
    productIds?: string[], // '?' means to make productIds optional in the request body.
}

// DELETE http://localhost:3000/api/user/[id]/cart
export async function DELETE(request: NextRequest, { params }: { params: Promise<Params> }) {
    const resolvedParams = await params;
    const userId = resolvedParams.id;
    const body: DeleteCartBody = await request.json();

    // Log the cart contents before deletion
    console.log(`Cart contents for user ${userId} before deletion:`, mockCarts[userId]);

    if (!body.productIds || !Array.isArray(body.productIds) || body.productIds.length === 0) {
        return NextResponse.json({ error: "Invalid input. Provide 'productIds' as a non-empty array" }, {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Check if user exists in mock data
    if (!mockCarts[userId]) {
        return NextResponse.json({ error: "User not found" }, {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const deletedProducts: string[] = [];
    const notFoundProducts: string[] = [];

    // Remove products from the cart
    body.productIds.forEach(productId => {
        const index = mockCarts[userId].indexOf(productId);
        if (index !== -1) {
            mockCarts[userId].splice(index, 1);
            deletedProducts.push(productId);
        } else {
            notFoundProducts.push(productId);
        }
    });

    // Log the cart contents after deletion
    console.log(`Cart contents for user ${userId} after deletion:`, mockCarts[userId]);

    // Prepare the response
    const response = {
        deletedProducts,
        notFoundProducts,
        updatedCart: mockCarts[userId]
    };

    // Determine the appropriate status code
    const status = notFoundProducts.length > 0 ? 207 : 200; // 207 Multi-Status if some products were not found

    // Return the response
    return NextResponse.json(response, {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

// export async function DELETE(request: NextRequest, {params}: { params: Promise<Params> }) {
//     const resolvedParams = await params;
//     const userId = resolvedParams.id;
//     const body: DeleteCartBody = await request.json();
//
//     let productIds: string[];
//
//     // get the current state of mockCarts
//     logMockCarts();
//
//     // Log the cart contents before deletion
//     console.log(`Cart contents for user ${userId} before deletion:`, mockCarts[userId]);
//
//
//     if (body.productId !== undefined) {
//         if (Array.isArray(body.productId)) {
//             productIds = body.productId;
//             console.warn("Warning: 'productId' was sent as an array. Treating it as 'productIds'.");
//         } else {
//             productIds = [body.productId];
//         }
//     } else if (body.productIds !== undefined) {
//         if (Array.isArray(body.productIds)) {
//             productIds = body.productIds;
//         } else {
//             productIds = [body.productIds];
//             console.warn("Warning: 'productIds' was sent as a single string. Treating it as a single product ID.");
//         }
//     } else {
//         return NextResponse.json({error: "Invalid input. Provide either 'productId' or 'productIds'"}, {
//             status: 400,
//             headers: {'Content-Type': 'application/json'},
//         });
//     }
//
//     if (productIds.length === 0) {
//         return NextResponse.json({error: "Empty product list"}, {
//             status: 400,
//             headers: {'Content-Type': 'application/json'},
//         });
//     }
//
//     // Log the request and the user's ID
//     console.log(`DELETE request received at /api/user/${userId}/cart with product IDs: ${productIds.join(', ')}`);
//
//     // Check if user exists in mock data
//     if (!mockCarts[userId]) {
//         return NextResponse.json({error: "User not found"}, {
//             status: 404,
//             headers: {'Content-Type': 'application/json'},
//         });
//     }
//
//     const deletedProducts: string[] = [];
//     const notFoundProducts: string[] = [];
//
//     // Remove products from the cart
//     productIds.forEach(productId => {
//         const index = mockCarts[userId].indexOf(productId);
//         if (index !== -1) { // If the product exists in the cart, remove it and add it to the deletedProducts array
//             mockCarts[userId].splice(index, 1); // Remove the product; explain 'index, 1' means remove one element at the specified index
//             deletedProducts.push(productId); // Add the product to the deletedProducts array
//         } else {
//             notFoundProducts.push(productId); // Add the product to the notFoundProducts array
//         }
//     });
//
//     // Prepare the response
//     const response = {
//         deletedProducts,
//         notFoundProducts,
//         updatedCart: mockCarts[userId]
//     };
//
//     // Determine the appropriate status code
//     const status = notFoundProducts.length > 0 ? 207 : 200; // 207 Multi-Status if some products were not found
//
//     // Log the result
//     console.log(`Deleted products ${deletedProducts.join(', ')} from user ${userId}'s cart`);
//
//     // After processing the deletion, log the updated cart contents
//     console.log(`Cart contents for user ${userId} after deletion:`, mockCarts[userId]);
//
//     // Return the response
//     return NextResponse.json(response, {
//         status,
//         headers: {'Content-Type': 'application/json'}
//     });
// }
