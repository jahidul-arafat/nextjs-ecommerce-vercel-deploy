import { Product } from "@/app/data/product-data";

export async function fetchAllProducts() {
    // Fetch products from the API route
    const response = await fetch('http://localhost:3000/api/products', {
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

export async function addToCart(product: Product) {
    const user = localStorage.getItem('user');
    if (!user) {
        alert("Please log in to add items to your cart.");
        return;
    }

    try {
        // First, validate the user and get current cart items
        const cartResponse = await fetch(`/api/user/${user}/cart`,{cache: 'no-cache'});
        if (!cartResponse.ok) {
            console.error('Failed to fetch cart');
            return;
        }

        // Add the new product to the cart
        const addResponse = await fetch(`/api/user/${user}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId: product.id }),
        });

        if (!addResponse.ok) {
            console.error('Failed to add item to cart');
            return;
        }

        const result = await addResponse.json();
        console.log('Cart updated:', result);
        alert(`${product.name} has been added to your cart.`);
    } catch (error) {
        console.error('Error updating cart:', error);
        alert('Failed to add item to cart. Please try again.');
    }
}

export function addToFavorite(product: Product) {
    const user = localStorage.getItem('user');
    if (!user) {
        alert("Please log in to add items to your favorites.");
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
export async function deleteProductFromCart(userId: string, productId: string): Promise<Product[]> {
    try {
        const deleteResponse = await fetch(`http://localhost:3000/api/user/${userId}/cart`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({productId}),
        });

        if (!deleteResponse.ok) {
            throw new Error('Failed to delete product');
        }

        const deleteResult = await deleteResponse.json();
        console.log("Delete response:", deleteResult);

        // Fetch the updated cart
        const cartResponse = await fetch(`http://localhost:3000/api/user/${userId}/cart`, {cache: 'no-cache'});
        if (!cartResponse.ok) {
            throw new Error('Failed to fetch updated cart');
        }

        const updatedCart = await cartResponse.json();
        console.log("[Delete] Updated cart items: ", updatedCart);
        alert(`Product ID: ${productId} has been removed from your cart.`);

        return updatedCart;
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
}