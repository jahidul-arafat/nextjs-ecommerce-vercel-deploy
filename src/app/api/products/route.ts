import {Product, products} from "@/app/data/product-data";
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

// GET request, return a Response()
// http://localhost:3000/api/products (all products)
// http://localhost:3000/api/products?id=<product_id> (single product)
export async function GET(request: Request) {
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
    console.log("POST request received at /api/products: ", request);
    try {
        // Parse the request body
        const body = await request.json();
        console.log("Parsed request body: ", body);

        // Check if it's a single product or an array of products
        const newProducts = Array.isArray(body) ? body : [body];

        const addedProducts: Product[] = [];
        const skippedProducts: { id: string, reason: string }[] = [];

        for (const newProduct of newProducts) {
            // Validate the new product
            if (!newProduct.id || !newProduct.name || !newProduct.imageUrl || !newProduct.description || !newProduct.price) {
                skippedProducts.push({ id: newProduct.id || 'unknown', reason: 'Invalid product data' });
                console.log(`Invalid product data: ${JSON.stringify(newProduct)}`);
                continue;
            }

            // Check if product with the same ID already exists
            if (products.some(p => p.id === newProduct.id)) {
                skippedProducts.push({ id: newProduct.id, reason: 'Product with this ID already exists' });
                console.log(`Product with ID ${newProduct.id} already exists`);
                continue;
            }

            // Add the new product
            console.log(`Adding new product: ${newProduct.name} (ID: ${newProduct.id})`);
            products.push(newProduct);
            addedProducts.push(newProduct);
        }

        // Prepare the response
        const response = {
            addedProducts,
            skippedProducts,
            message: `Added ${addedProducts.length} product(s), skipped ${skippedProducts.length} product(s).`
        };

        // Return the response
        return new Response(
            JSON.stringify(response),
            {
                headers: {'Content-Type': 'application/json'},
                status: 201,
            }
        );
    } catch (error) {
        console.error("Error adding new product(s): ", error);
        return new Response(
            JSON.stringify({error: 'Internal Server Error'}),
            {
                headers: {'Content-Type': 'application/json'},
                status: 500,
            });
    }
}

// DELETE request, return a Response()
// http://localhost:3000/api/products?id=<product_id>
export async function DELETE(request: Request) {
    try {
        // Parse the product ID from the request URL
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new Response(
                JSON.stringify({error: 'Product ID is required'}),
                {
                    headers: {'Content-Type': 'application/json'},
                    status: 400,
                }
            );
        }

        // Find the index of the product with the given ID
        const productIndex = products.findIndex(p => p.id === id);

        if (productIndex === -1) { // means product not found
            return new Response(
                JSON.stringify({error: 'Product not found'}),
                {
                    headers: {'Content-Type': 'application/json'},
                    status: 404,
                }
            );
        }

        // Remove the product from the array
        const deletedProduct = products.splice(productIndex, 1)[0];

        // Return the deleted product
        return new Response(
            JSON.stringify(deletedProduct),
            {
                headers: {'Content-Type': 'application/json'},
                status: 200,
            }
        );
    } catch (error) {
        console.error("Error deleting product: ", error);
        return new Response(
            JSON.stringify({error: 'Internal Server Error'}),
            {
                headers: {'Content-Type': 'application/json'},
                status: 500,
            }
        );
    }
}

// PUT method to modify a product
// http://localhost:3000/api/products?id=<product_id>
export async function PUT(request: Request) {
    try {
        // Parse the product ID from the request URL
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new Response(
                JSON.stringify({error: 'Product ID is required'}),
                {
                    headers: {'Content-Type': 'application/json'},
                    status: 400,
                }
            );
        }

        // Parse the updated product data from the request body
        /*
        With Partial<Product>, a valid update request could look like this:
        {
            "price": 29.99,
            "description": "Updated description"
        }
         */
        const updatedProduct: Partial<Product> = await request.json();

        // Find the index of the product with the given ID
        const productIndex = products.findIndex(p => p.id === id);

        if (productIndex === -1) { // means product not found
            return new Response(
                JSON.stringify({error: 'Product not found'}),
                {
                    headers: {'Content-Type': 'application/json'},
                    status: 404,
                }
            );
        }

        // Update the product
        /*
        This line is using the spread operator (...) to create a new object that updates the existing product with the new data. Here's what's happening:
        1. ...products[productIndex]: This spreads all the properties of the existing product into the new object. It's like creating a copy of the original product.
        2. ...updatedProduct: This spreads all the properties from the updatedProduct object (which contains the updates sent in the PUT request) into the new object. If there are any properties in updatedProduct that also exist in the original product, they will overwrite the original values.
        3. id: id: This explicitly sets the id property to the original id. This is done to ensure that even if the updatedProduct included an id field, it won't change the product's ID.
         */
        products[productIndex] = {
            ...products[productIndex],
            ...updatedProduct,
            id: id // Ensure the ID doesn't change
        };

        // Return the updated product
        return new Response(
            JSON.stringify(products[productIndex]),
            {
                headers: {'Content-Type': 'application/json'},
                status: 200,
            }
        );
    } catch (error) {
        console.error("Error updating product: ", error);
        return new Response(
            JSON.stringify({error: 'Internal Server Error'}),
            {
                headers: {'Content-Type': 'application/json'},
                status: 500,
            }
        );
    }
}

