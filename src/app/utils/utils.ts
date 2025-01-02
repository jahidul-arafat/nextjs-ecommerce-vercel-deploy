import {Product} from "@/app/data/product-data";

export async function fetchAllProducts() {
    // Fetch products from the API route
    const response = await fetch(process.env.NEXT_PUBLIC_SITE_URL +'/api/products', {
        method: 'GET',
        cache: 'no-store', // means "revalidate the cached response with the server before using it."
        headers: {
            'Content-Type': 'application/json'
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }
    const products: Product[] = await response.json();

    return products;
}

export async function addToCart(product: Product, quantity: number = 1) {
    const user = localStorage.getItem('user');
    if (!user) {
        alert("[Util: addToCart]>> Please log in to add items to your cart.");
        return;
    }

    try {
        // First, validate the user and get current cart items
        // const cartResponse = await fetch(`/api/user/${user}/cart`, {cache: 'no-cache'});
        // if (!cartResponse.ok) {
        //     console.error('Failed to fetch cart');
        //     return;
        // }

        // Add the new product to the cart
        const addResponse = await fetch(`/api/user/${user}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({productId: product.id, quantity}),
        });

        if (!addResponse.ok) {
            console.error('Failed to add item to cart');
            return;
        }

        const result = await addResponse.json();
        console.log('[Product]>> Cart updated:', result);
        //alert(`${product.name} has been added to your cart.`);
    } catch (error) {
        console.error('Error updating cart:', error);
        //alert('Failed to add item to cart. Please try again.');
    }
}

export function addToFavorite(product: Product) {
    const user = localStorage.getItem('user');
    if (!user) {
        alert("Util [addToFavorite]>> Please log in to add items to your favorites.");
        return;
    }

    const favoriteKey = `${user}_favorite`;
    const favorites = JSON.parse(localStorage.getItem(favoriteKey) || '[]');

    // Only add the product to favorites if it's not already in there.'
    if (!favorites.some((item: Product) => item.id === product.id)) {
        favorites.push(product);
        localStorage.setItem(favoriteKey, JSON.stringify(favorites));
        alert(`${product.name} has been added to your favorites.`);
    } else {
        alert(`${product.name} is already in favorites.`);
    }
}

// Function to delete a product from the user's cart
export async function deleteProductFromCart(userId: string, productId: string) {
    // Delete the product
    const deleteResponse = await fetch(`/api/user/${userId}/cart`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds: [productId] }),
    });

    if (!deleteResponse.ok) {
        throw new Error('Failed to delete product');
    }

    // Fetch the updated cart
    const cartResponse = await fetch(`/api/user/${userId}/cart`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'no-store', // Ensure we're getting the latest data
    });

    if (!cartResponse.ok) {
        throw new Error('Failed to fetch updated cart');
    }

    const updatedCart = await cartResponse.json();

    // Fetch full details for each product in the cart
    const fullUpdatedCart = await Promise.all(updatedCart.map(async (item: Product) => {
        const productResponse = await fetch(`/api/products/${item.id}`);
        if (productResponse.ok) {
            return await productResponse.json();
        }
        return item; // If fetch fails, keep the original item
    }));

    console.log("Full updated cart:", fullUpdatedCart);
    return { updatedCart: fullUpdatedCart };
}


// export async function deleteProductFromCart(userId: string, productId: string): Promise<Product[]> {
//     try {
//         const deleteResponse = await fetch(`http://localhost:3000/api/user/${userId}/cart`, {
//             method: 'DELETE',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({productId}),
//         });
//
//         if (!deleteResponse.ok) {
//             throw new Error('Failed to delete product');
//         }
//
//         const deleteResult = await deleteResponse.json();
//         console.log("Delete response:", deleteResult);
//
//         // Fetch the updated cart
//         const cartResponse = await fetch(`http://localhost:3000/api/user/${userId}/cart`, {cache: 'no-cache'});
//         if (!cartResponse.ok) {
//             throw new Error('Failed to fetch updated cart');
//         }
//
//         const updatedCart = await cartResponse.json();
//         console.log("[Delete] Updated cart items: ", updatedCart);
//         alert(`Product ID: ${productId} has been removed from your cart.`);
//
//         return updatedCart;
//     } catch (error) {
//         console.error("Error deleting product:", error);
//         throw error;
//     }
// }