//import {Product, products} from "@/app/data/product-data";
import {Product} from "@/app/lib/product-data";
import {connectToDb} from "@/app/api/db";


const MONGODB_COLLECTION = 'products';
// Define function for different HTTP methods
// This will not send back to cleint any react component, instead data just like API
// thats why we named it route.ts, not route.tsx

/*
Note:
1. In-Memory Storage:
The products array imported from /data/products-data is being used as in-memory storage. When the server is running, any modifications (additions, deletions, updates) to this array are kept in the server's memory.
2. POST Method:
When you add new products using the POST method, these products are pushed into the products array in memory. The line products.push(newProduct); is adding the new product to this in-memory array.
3. GET Method:
When you make a GET request, you're retrieving the current state of the products array from memory, which includes both the original products and any new ones added via POST requests.
4. Persistence Issue:
The /data/products-data file itself is not being updated. This means that when you restart the server, all the changes made during the server's runtime (including new products added via POST) will be lost, and you'll start again with the original data from the file.
5. Temporary Nature:
This behavior is typical for development environments or when working with in-memory data stores. It allows for quick testing and development without constantly writing to files or databases.
 */

// Add CORS headers
// const headers = {
//     'Access-Control-Allow-Origin': '*', // Replace '*' with your frontend domain if necessary
//     'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//     'Access-Control-Allow-Headers': 'Authorization, Content-Type',
// };

// GET request, return a Response()
// http://localhost:3000/api/products (all products)
// http://localhost:3000/api/products?id=<product_id> (single product)
export async function GET(request: Request) {
    // Connect to MongoDB
    const {db} = await connectToDb();
    const products = await db.collection(`${MONGODB_COLLECTION}`).find({}).toArray();

    console.log("GET request received at /api/products.. ");
    try {
        const url = new URL(request.url);
        console.log("GET Url: ", request.url);
        console.log("Search params: ", url.searchParams);
        const id = url.searchParams.get('id');

        if (id) {
            // Search for a specific product
            const product = products.find(p => p.id === id);
            if (product) {
                return new Response(
                    JSON.stringify(product),
                    {
                        headers: {'Content-Type': 'application/json'}, // what this string will be returned to the client when received at the client end
                        status: 200,
                    }
                );
            } else {
                return new Response(
                    JSON.stringify({error: 'Product not found'}),
                    {
                        headers: {'Content-Type': 'application/json'},
                        status: 404,
                    }
                );
            }
        } else {
            // Return all products
            return new Response(
                JSON.stringify(products),
                {
                    headers: {'Content-Type': 'application/json'},
                    status: 200,
                }
            );
        }
    } catch (error) {
        console.error("Error fetching products: ", error);
        return new Response(
            JSON.stringify({error: 'Internal Server Error'}),
            {
                headers: {'Content-Type': 'application/json'},
                status: 500,
            }
        );
    }
}

// POST method to handle both single product and bulk product additions, while also checking for existing product IDs.
export async function POST(request: Request) {
    // Connect to MongoDB
    const { db } = await connectToDb();

    console.log("POST request received at /api/products");

    try {
        // Parse the request body
        const body = await request.json();
        console.log("Parsed request body: ", body);

        // Ensure the request is either a single product or an array of products
        const newProducts = Array.isArray(body) ? body : [body];

        const addedProducts: Product[] = [];
        const skippedProducts: { id: string; reason: string }[] = [];

        for (const newProduct of newProducts) {
            // Validate the new product
            const requiredFields = [
                "id",
                "name",
                "imageUrl",
                "description",
                "price",
                "supplier",
                "genre",
                "countryOfOrigin",
                "material",
                "inStock",
            ];

            // find the missing fields in the new product
            const missingFields = requiredFields.filter(
                (field) => !(field in newProduct)
            );

            if (missingFields.length > 0) {
                skippedProducts.push({
                    id: newProduct.id || "unknown",
                    reason: `Missing required fields: ${missingFields.join(", ")}`,
                });
                console.log(`Invalid product data: ${JSON.stringify(newProduct)}`);
                continue;
            }

            // Check if a product with the same ID already exists in the database
            const existingProduct = await db
                .collection(`${MONGODB_COLLECTION}`)
                .findOne({ id: newProduct.id });

            if (existingProduct) {
                skippedProducts.push({
                    id: newProduct.id,
                    reason: "Product with this ID already exists",
                });
                console.log(`Product with ID ${newProduct.id} already exists`);
                continue;
            }

            // Add the new product to the database
            const result = await db.collection(`${MONGODB_COLLECTION}`).insertOne(newProduct);
            if (result.acknowledged) {
                addedProducts.push(newProduct);
                console.log(`Added new product: ${newProduct.name} (ID: ${newProduct.id})`);
            } else {
                console.error(`Failed to insert product: ${newProduct.id}`);
            }
        }

        // Prepare the response
        const response = {
            addedProducts,
            skippedProducts,
            message: `Added ${addedProducts.length} product(s), skipped ${skippedProducts.length} product(s).`,
        };

        // Return the response
        return new Response(JSON.stringify(response), {
            headers: { "Content-Type": "application/json" },
            status: 201,
        });
    } catch (error) {
        console.error("Error adding new product(s): ", error);
        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            {
                headers: { "Content-Type": "application/json" },
                status: 500,
            }
        );
    }
}


// DELETE request, return a Response()
// http://localhost:3000/api/products?id=<product_id>
export async function DELETE(request: Request) {
    // Connect to MongoDB
    const { db } = await connectToDb();

    console.log("DELETE request received at /api/products");

    try {
        // Parse the product ID from the request URL
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new Response(
                JSON.stringify({ error: 'Product ID is required' }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    status: 400,
                }
            );
        }

        // Check if the product exists in the database
        const existingProduct = await db.collection(`${MONGODB_COLLECTION}`).findOne({ id });

        if (!existingProduct) {
            return new Response(
                JSON.stringify({ error: 'Product not found' }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    status: 404,
                }
            );
        }

        // Delete the product from the database
        const deleteResult = await db.collection(`${MONGODB_COLLECTION}`).deleteOne({ id });

        if (deleteResult.deletedCount === 1) {
            console.log(`Product with ID ${id} deleted successfully`);
            return new Response(
                JSON.stringify({
                    message: `Product with ID ${id} deleted successfully`,
                    deletedProduct: existingProduct,
                }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    status: 200,
                }
            );
        } else {
            console.error(`Failed to delete product with ID ${id}`);
            return new Response(
                JSON.stringify({ error: 'Failed to delete the product' }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    status: 500,
                }
            );
        }
    } catch (error) {
        console.error("Error deleting product: ", error);
        return new Response(
            JSON.stringify({ error: 'Internal Server Error' }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            }
        );
    }
}


// PUT method to modify a product
// http://localhost:3000/api/products?id=<product_id>
// PUT method to modify a product
// http://localhost:3000/api/products?id=<product_id>
/*
Testing Scenarios
1. Valid Update: Send a PUT request with a valid id and valid fields to update
(e.g., /api/products?id=345 with body { "price": 30, "description": "Updated description" }). V
erify the product is updated in MongoDB and the updated details are returned.

2. Invalid ID: Send a PUT request without an id or with an id that doesn't exist.
Verify it returns the correct error message and status code (400 or 404).

3. No Fields Provided: Send a PUT request with a valid id but an empty body. Verify it returns a 400 status with an appropriate error message.

4. Database Error: Simulate a database connectivity issue and ensure the method returns a 500 status with an appropriate error message.
This ensures the PUT method is robust and interacts effectively with the MongoDB collection to update products.
 */

export async function PUT(request: Request) {
    // Connect to MongoDB
    const { db } = await connectToDb();

    console.log("PUT request received at /api/products");

    try {
        // Parse the product ID from the request URL
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new Response(
                JSON.stringify({ error: 'Product ID is required' }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    status: 400,
                }
            );
        }

        // Parse the updated product data from the request body
        const updatedProduct: Partial<Product> = await request.json();
        console.log("Updated product data:", updatedProduct);

        // Validate that at least one field is provided for the update
        if (Object.keys(updatedProduct).length === 0) {
            return new Response(
                JSON.stringify({ error: 'No fields provided for update' }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    status: 400,
                }
            );
        }

        // Check if the product exists
        const existingProduct = await db.collection(`${MONGODB_COLLECTION}`).findOne({ id });
        if (!existingProduct) {
            return new Response(
                JSON.stringify({ error: 'Product not found' }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    status: 404,
                }
            );
        }

        // Update the product in the database
        const updateResult = await db.collection(`${MONGODB_COLLECTION}`).updateOne(
            { id },
            { $set: updatedProduct }
        );

        if (updateResult.modifiedCount === 1) {
            console.log(`Product with ID ${id} updated successfully`);
            // Return the updated product
            const updatedProductDetails = await db.collection(`${MONGODB_COLLECTION}`).findOne({ id });
            return new Response(
                JSON.stringify(updatedProductDetails),
                {
                    headers: { 'Content-Type': 'application/json' },
                    status: 200,
                }
            );
        } else {
            console.error(`Failed to update product with ID ${id}`);
            return new Response(
                JSON.stringify({ error: 'Failed to update the product' }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    status: 500,
                }
            );
        }
    } catch (error) {
        console.error("Error updating product:", error);
        return new Response(
            JSON.stringify({ error: 'Internal Server Error' }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            }
        );
    }
}



