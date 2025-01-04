import {NextRequest, NextResponse} from "next/server";
import {connectToDb} from "@/app/api/db";

// GET http://localhost:3000/api/user/[id]/cart
// GET /api/user/{id}/cart
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const userId = resolvedParams.id;

        // Connect to MongoDB
        const { db } = await connectToDb();

        // Fetch the user's cart
        const userCart = await db.collection("carts").findOne({ userId });

        if (!userCart) {
            // If no cart exists, return an empty cart
            await db.collection("carts").insertOne({ userId, cartIds: [] });
            return NextResponse.json(
                { message: `Cart created for user ${userId}`, cartItems: [] },
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        }

        // Parse `cartIds` safely
        let cartItemIDs: string[] = [];
        try {
            cartItemIDs = Array.isArray(userCart.cartIds)
                ? userCart.cartIds
                : JSON.parse(userCart.cartIds || "[]");
        } catch (error) {
            console.error("Failed to parse cartIds:", error);
            return NextResponse.json(
                { error: "Invalid cart format" },
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        if (cartItemIDs.length === 0) {
            return NextResponse.json(
                { message: `Cart is empty for user ${userId}`, cartItems: [] },
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        }

        // Fetch product details for all IDs in `cartIds`
        const productsCursor = await db
            .collection("products")
            .find({ id: { $in: cartItemIDs } });
        const allProducts = await productsCursor.toArray();

        // Map `cartItemIDs` to the corresponding product details
        const cartItems = cartItemIDs.map((id) => {
            const product = allProducts.find((p) => p.id === id);
            return product || { id, error: "Product not found" }; // Handle missing products gracefully
        });

        return NextResponse.json(
            {
                message: `Cart items for user ${userId}`,
                cartItems,
            },
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error fetching cart items:", error);
        return NextResponse.json(
            { error: "Failed to fetch cart items" },
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}





// POST http://localhost:3000/api/user/[id]/cart
/*

It can handle a single product addition: { "productId": "123" }
It can handle multiple product additions: { "productIds": ["123", "456", "789"] }
considering the edge cases, it's better to treat 'productId' and 'productIds' separately and handle them accordingly.'
 */

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const userId = resolvedParams.id;
        const body = await request.json();

        // Get product IDs from the request body
        const productIds = Array.isArray(body.productIds)
            ? body.productIds
            : body.productId
                ? [body.productId]
                : [];

        if (productIds.length === 0) {
            return NextResponse.json(
                { error: "Invalid input. Provide valid product IDs." },
                { status: 400 }
            );
        }

        const { db } = await connectToDb();

        // Fetch the user's cart or create a new one
        let userCart = await db.collection("carts").findOne({ userId });
        if (!userCart) {
            console.log(`Creating a new cart for user ${userId}.`);
            const insertResult = await db
                .collection("carts")
                .insertOne({ userId, cartIds: [] });
            userCart = { _id: insertResult.insertedId, userId, cartIds: [] };
        }

        // Validate product IDs
        const validProducts = await db
            .collection("products")
            .find({ id: { $in: productIds } })
            .toArray();
        const validProductIds = validProducts.map((p) => p.id);

        // Append all valid product IDs to the cart
        const updatedCartIds = [...userCart.cartIds, ...validProductIds];

        await db
            .collection("carts")
            .updateOne({ userId }, { $set: { cartIds: updatedCartIds } });

        return NextResponse.json(
            {
                addedProducts: validProductIds,
                updatedCart: updatedCartIds,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error updating cart:", error);
        return NextResponse.json(
            { error: "Failed to update cart" },
            { status: 500 }
        );
    }
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const userId = resolvedParams.id;
        const body = await request.json();

        const productIds = Array.isArray(body.productIds)
            ? body.productIds
            : body.productId
                ? [body.productId]
                : [];

        if (productIds.length === 0) {
            return NextResponse.json(
                { error: "Invalid input. Provide valid product IDs." },
                { status: 400 }
            );
        }

        const { db } = await connectToDb();

        const userCart = await db.collection("carts").findOne({ userId });
        if (!userCart) {
            return NextResponse.json(
                { error: "Cart not found" },
                { status: 404 }
            );
        }

        // Parse `cartIds` from the user's cart
        const currentCartIds = [...userCart.cartIds]; // Clone to avoid mutating the original
        const updatedCartIds = [...currentCartIds];

        // Remove only the specified number of instances of each product ID
        productIds.forEach((productId: string) => {
            const index = updatedCartIds.indexOf(productId);
            if (index !== -1) {
                updatedCartIds.splice(index, 1); // Remove the first occurrence of this product ID
            }
        });

        await db
            .collection("carts")
            .updateOne({ userId }, { $set: { cartIds: updatedCartIds } });

        return NextResponse.json(
            { updatedCart: updatedCartIds },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting cart items:", error);
        return NextResponse.json(
            { error: "Failed to delete cart items" },
            { status: 500 }
        );
    }
}



// PUT http://localhost:3000/api/user/[id]/cart
/*
PUT method implementation for updating the cart items in MongoDB.
This method allows adding new product IDs or replacing the entire cart contents for a specific user,
ensuring that only products present in the products collection can be added to the cart.
 */

type UpdateCartBody = {
    productIds?: string[]; // Array of product IDs to add or replace in the cart
    replaceCart?: boolean; // If true, replaces the cart; otherwise, adds to it
};

// PUT http://localhost:3000/api/user/[id]/cart
/*
Example Usage
Request: Add Products to Cart
Input:
{
    "productIds": ["123", "456"],
    "replaceCart": false
}

Response:
{
    "message": "Cart updated for user user1",
    "addedProducts": ["123", "456"],
    "invalidProducts": [],
    "updatedCart": ["111", "123", "456"]
}

Request: Replace Cart
Input:
{
    "productIds": ["789", "101"],
    "replaceCart": true
}

Response:
{
    "message": "Cart replaced for user user1",
    "addedProducts": ["789", "101"],
    "invalidProducts": [],
    "updatedCart": ["789", "101"]
}


Request: Invalid Products
Input:
{
    "productIds": ["999", "888"],
    "replaceCart": false
}

Response:
{
    "message": "Cart updated for user user1",
    "addedProducts": [],
    "invalidProducts": ["999", "888"],
    "updatedCart": ["111", "123"]
}

 */

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const userId = resolvedParams.id;
        const body: UpdateCartBody = await request.json();

        // Validate `productIds`
        if (!body.productIds || !Array.isArray(body.productIds) || body.productIds.length === 0) {
            return NextResponse.json(
                { error: "Invalid input. Provide 'productIds' as a non-empty array." },
                { status: 400 }
            );
        }

        const productIds = body.productIds;
        const replaceCart = body.replaceCart || false;

        // Connect to MongoDB
        const { db } = await connectToDb();

        // Validate product IDs against the `products` collection
        const validProductsCursor = await db.collection("products").find({ id: { $in: productIds } });
        const validProducts = await validProductsCursor.toArray();
        const validProductIds = validProducts.map((product) => product.id);

        // Identify invalid product IDs
        const invalidProducts = productIds.filter((id) => !validProductIds.includes(id));

        // Fetch or initialize the user's cart
        const userCart = await db.collection("carts").findOne({ userId });
        let currentCartIds: string[] = userCart?.cartIds || [];

        // Update cart logic
        if (replaceCart) {
            // Replace the entire cart with valid product IDs
            currentCartIds = [...validProductIds];
        } else {
            // Add valid product IDs, avoiding duplicates
            currentCartIds = [...currentCartIds, ...validProductIds];
        }

        // Update or insert the cart in the database
        await db.collection("carts").updateOne(
            { userId },
            { $set: { cartIds: currentCartIds } },
            { upsert: true }
        );

        // Prepare and send the response
        const response = {
            message: replaceCart
                ? `Cart replaced for user ${userId}`
                : `Cart updated for user ${userId}`,
            addedProducts: validProductIds,
            invalidProducts,
            updatedCart: currentCartIds,
        };

        const status = invalidProducts.length > 0 ? 207 : 200; // 207 if some product IDs are invalid
        return NextResponse.json(response, { status });
    } catch (error) {
        console.error("Error updating cart:", error);
        return NextResponse.json(
            { error: "Failed to update cart." },
            { status: 500 }
        );
    }
}




