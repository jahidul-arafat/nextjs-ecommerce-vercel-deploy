"use client" // beacuse we used 'useState' for filtering products by price

import Image from "next/image";
import Link from "next/link";
import {Product} from "@/app/data/product-data";
import {useEffect, useState} from "react"; // importing the interface Product{}
import {FaHeart, FaShoppingCart} from 'react-icons/fa';
import {addToCart, addToFavorite, deleteProductFromCart} from "@/app/utils/utils"; // Import icons
import {useUser} from "@/app/UserContext";

// render a single product
// create a simple product list component
function ProductItem({ product, index, updateCartCount}: { product: Product; index: number, updateCartCount: () => void }) {
    const [isInCart, setIsInCart] = useState(false);
    const {user} = useUser(); // using the user context, a central context to tag the user status

    useEffect(() => {
        async function checkCartStatus() {
            if (!user) {
                setIsInCart(false);
                return;
            }
            try {
                const response = await fetch(`/api/user/${user}/cart`);
                if (!response.ok) {
                    console.error('Failed to fetch cart items');
                    return;
                }
                const cartItems: Product[] = await response.json();
                setIsInCart(cartItems.some(item => item.id === product.id));
            } catch (error) {
                console.error('Error checking if product is in cart:', error);
                setIsInCart(false);
            }
        }

        checkCartStatus();
    }, [product.id, user]);

    const handleAddToCart = async () => {
        if (!user) {
            alert("[ProductList/Item] >> Please log in to add items to your cart.");
            return;
        }
        try {
            await addToCart(product);
            setIsInCart(true);
            updateCartCount();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'An error occurred');
        }
    };

    const handleRemoveFromCart = async () => {
        if (!user) {
            alert("[ProductList/Item] >> Please log in to remove items from your cart.");
            return;
        }
        try {
            await deleteProductFromCart(user, product.id);
            setIsInCart(false);
            updateCartCount();
        } catch (error) {
            console.error('Error removing product from cart:', error);
            alert(error instanceof Error ? error.message : 'An error occurred while removing from cart');
        }
    };

    const handleAddToFavorite = () => {
        if (!user) {
            alert("[ProductList/Item] >> Please log in to add items to your favorites.");
            return;
        }
        try {
            addToFavorite(product);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'An error occurred');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:scale-105 relative h-64">
            <Link key={`${product.id}-${index}`} href={"/products/" + product.id}>
                <div className="p-3">
                    <Image
                        className="w-full h-32 object-cover mb-2"
                        src={'/' + product.imageUrl}
                        alt={product.name}
                        width={100}
                        height={100}
                    />
                    <h2 className="text-xs text-gray-500">{`ID: ${product.id}`}</h2>
                    <p className="text-xs text-orange-400 truncate">{product.genre.join(", ")}</p>
                    <h2 className="text-sm font-semibold truncate">{product.name}</h2>
                    <p className="text-sm text-blue-600 font-bold">${product.price}</p>
                </div>
            </Link>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-white bg-opacity-100">
                <div className="flex justify-between">
                    {isInCart ? (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleRemoveFromCart();
                            }}
                            className="bg-yellow-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center"
                        >
                            <FaShoppingCart className="mr-1 text-xs"/> Remove
                        </button>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleAddToCart();
                            }}
                            className="bg-yellow-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center"
                        >
                            <FaShoppingCart className="mr-1 text-xs"/> Add
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            handleAddToFavorite();
                        }}
                        className="bg-gray-50 hover:bg-red-600 text-gray-600 hover:text-white px-2 py-1 rounded text-xs flex items-center"
                    >
                        <FaHeart className="mr-1 text-xs"/>
                    </button>
                </div>
            </div>
        </div>
    );
}


/*
Why key in Div where each Div is a child component of the Parent component ProductsList
------
Here's why this is important:

1. Uniqueness: Each key should be unique among siblings. In this case, product.id is a good choice because it's likely unique for each product.
2. Stability: The key should be consistent across re-renders. Using product.id is good because it's tied to the data and won't change unless the product itself changes.
3. Performance: React uses these keys to optimize rendering. It can quickly determine which items in a list have changed, been added, or been removed.
4. State Preservation: If your list items have state or are controlled inputs, proper keys help React maintain the correct state for each item.
5. Avoiding Warnings: React will give you a warning in the console if you don't provide keys for list items.
 */
export default function ProductsList({products}: { products: Product[] }) {
    const [filteredProducts, setFilteredProducts] = useState(products);
    const [filters, setFilters] = useState({
        price: "",
        genre: [],
        countryOfOrigin: []
    });
    const [searchTerm, setSearchTerm] = useState('');
    //const [cartCount, setCartCount] = useState(0);
    //const [userId, setUserId] = useState<string|null>(null);
    const {user, cartCount, setCartCount}=useUser();

    // Extract unique values for each filter
    const genres = Array.from(new Set(products.flatMap(p => p.genre)));
    const countries = Array.from(new Set(products.map(p => p.countryOfOrigin)));

    useEffect(() => {
        // Apply filters and search
        let result = products;

        // check if price filter is active and apply filter
        // explain the logic behind this approach
        // For each price range in the filter, check if the product's price is within that range'
        // Price filter logic
        if (filters.price) {
            const [min, max] = filters.price.split('-').map(Number);
            result = result.filter(product =>
                product.price >= min && (max ? product.price <= max : true)
            );
        }

        if (filters.genre.length > 0) {
            result = result.filter(product =>
                product.genre.some(g => filters.genre.includes(g))
            );
        }

        if (filters.countryOfOrigin.length > 0) {
            result = result.filter(product =>
                filters.countryOfOrigin.includes(product.countryOfOrigin)
            );
        }

        if (searchTerm) {
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredProducts(result);
    }, [filters, searchTerm, products]);


    // updateCartCount()
    // const fetchCartCount = async () => {
    //     const userId = localStorage.getItem('user');
    //     if (!userId) {
    //         console.log("User not logged in");
    //         return;
    //     }
    //     try {
    //         const response = await fetch(`/api/user/${userId}/cart`);
    //         if (response.ok) {
    //             const cartItems = await response.json();
    //             setCartCount(cartItems.length);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching cart count:', error);
    //     }
    // };

    const fetchCartCount = async () => {
        if (!user) {
            setCartCount(0);
            return;
        }
        try {
            const response = await fetch(`/api/user/${user}/cart`);
            if (response.ok) {
                const cartItems = await response.json();
                setCartCount(cartItems.length);
            }
        } catch (error) {
            console.error('Error fetching cart count:', error);
        }
    };




    // useEffect(() => {
    //     const storedUserId = localStorage.getItem('user');
    //     if (!storedUserId) {
    //         console.log("User not logged in");
    //         return;
    //     }
    //     setUserId(storedUserId);
    //     // Fetch cart count
    //     fetchCartCount();
    // }, [cartCount]);

    useEffect(() => {
        fetchCartCount();
    }, [user]);

    const handleFilterChange = (category, value) => {
        if (category === 'price') {
            // For price, just set the new value
            setFilters(prev => ({ ...prev, [category]: value }));
        } else {
            // For other categories, keep the existing toggle logic
            setFilters(prev => ({
                ...prev,
                [category]: prev[category].includes(value)
                    ? prev[category].filter(item => item !== value)
                    : [...prev[category], value]
            }));
        }
    };

    // explain the purpose of this handler
    // this handler will handle the click event on the cart button
    const handleCartClick = (e: React.MouseEvent) => {
        if (!user) {
            e.preventDefault();
            alert(" [Triggered From ProductList ]>> User not logged in. Please log in to view your cart.");
        }
    };


    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex mb-6">
                {/* Navbar with search and cart */}
                <div className="w-full flex justify-between items-center mb-4">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 border rounded"
                    />
                    <Link href={user ? `/user/${user}/cart` : '#'} onClick={handleCartClick}>
                        <div className="flex items-center cursor-pointer">
                            <FaShoppingCart className="mr-2" />
                            <span>Cart ({cartCount})</span>
                        </div>
                    </Link>
                </div>
            </div>
            <div className="flex">
                {/* Filter column */}
                <div className="w-1/4 pr-4">
                    <h2 className="text-xl font-bold mb-4">Filters</h2>

                    <div className="mb-4">
                        <h3 className="font-semibold mb-2">Price</h3>
                        {['0-50', '51-100', '101-200', '201+'].map(range => (
                            <label key={range} className="flex items-center mb-2">
                                <input
                                    type="radio"
                                    checked={filters.price === range}
                                    onChange={() => handleFilterChange('price', range)}
                                    className="mr-2"
                                    name="priceFilter" // This ensures only one can be selected
                                />
                                ${range}
                            </label>
                        ))}
                    </div>

                    <div className="mb-4">
                        <h3 className="font-semibold mb-2">Genre</h3>
                        {genres.map(genre => (
                            <label key={genre} className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    checked={filters.genre.includes(genre)}
                                    onChange={() => handleFilterChange('genre', genre)}
                                    className="mr-2"
                                />
                                {genre}
                            </label>
                        ))}
                    </div>

                    <div className="mb-4">
                        <h3 className="font-semibold mb-2">Country of Origin</h3>
                        {countries.map(country => (
                            <label key={country} className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    checked={filters.countryOfOrigin.includes(country)}
                                    onChange={() => handleFilterChange('countryOfOrigin', country)}
                                    className="mr-2"
                                />
                                {country}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Product grid */}
                <div className="w-3/4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {filteredProducts.map((product, index) => (
                            <ProductItem
                                key={`${product.id}-${index}`}
                                product={product}
                                index={index}
                                updateCartCount={fetchCartCount}  // When a product is added to the cart, update the cart count
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}