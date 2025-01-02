// create a GET method for localhost:3000/api/products/123
import {NextRequest} from "next/server";
import {products} from "@/app/data/product-data";

type Params = {
    id: string
}

// http://localhost:3000/api/products/[id]
/*
In Next.js 13+, for dynamic API routes (like [id]), the params are provided as a Promise.
params (when the Promise is resolved) will be an object that looks like this: { id: "111" }

In the first case (what we used), context is an object with a property params that is a Promise.
 */

/*
Why used NextRequest instead of Request?
-----
The use of NextRequest instead of Request is specific to Next.js and offers some additional functionality. Let's break this down:

1. NextRequest is an extension of the standard Request interface.
2. It's provided by Next.js through the next/server module.
3. NextRequest offers additional methods and properties that are useful in the Next.js context.
 */

// GET http://localhost:3000/api/products
// GET http://localhost:3000/api/products/111
// GET http://localhost:3000/api/products/111,222
// using route handler to use route parameters as a request body to return the requested product(s)
export async function GET(request: NextRequest, {params}: { params: Promise<Params> }) {
    console.log("GET request received at /api/products: ", request);
    console.log("GET Url: ", request.url);
    console.log("Params: ", params);

    try {
        const resolvedParams = await params;
        const ids = resolvedParams.id.split(',');
        console.log("IDs: ", ids);

        if (ids.length === 0 || (ids.length === 1 && ids[0] === '')) {
            // Return all products if no ID is provided
            console.log("Returning all products");
            return new Response(
                JSON.stringify(products),
                {
                    headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    status: 200,
                }
            );
        } else if (ids.length === 1) {
            // Single product
            const product = products.find(p => p.id === ids[0]);
            if (product) {
                console.log(`Returning ${ids.length}x product`);
                return new Response(
                    JSON.stringify(product),
                    {
                        headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        status: 200,
                    }
                );
            } else {
                return new Response(
                    JSON.stringify({error: 'Product not found'}),
                    {
                        headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        status: 404,
                    }
                );
            }
        } else {
            // Multiple products
            const foundProducts = products.filter(p => ids.includes(p.id));
            if (foundProducts.length > 0) {
                console.log(`Returning ${foundProducts.length}x products`);
                return new Response(
                    JSON.stringify(foundProducts),
                    {
                        headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        status: 200,
                    }
                );
            } else {
                return new Response(
                    JSON.stringify({error: 'No products found'}),
                    {
                        headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        status: 404,
                    }
                );
            }
        }
    } catch (error) {
        console.error("Error processing request:", error);
        return new Response(
            JSON.stringify({error: 'Internal Server Error'}),
            {
                headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                status: 500,
            }
        );
    }
}