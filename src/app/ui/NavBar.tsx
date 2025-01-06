// import Link from "next/link";
//
// function NavBar(){
//     return (
//         <nav className="bg-white shadow-md">
//             <div className="container mx-auto px-4 py-3 flex justify-between items-center">
//                 <ul className="flex space-x-4">
//                     <li>
//                         <Link className="text-gray-700 hover:text-black" href={"/products"}>All Products</Link>
//                     </li>
//                     <li>
//                         <Link className="text-gray-700 hover:text-black" href={"/cart"}>Cart</Link>
//                     </li>
//                     <li>
//                         <Link className="text-gray-700 hover:text-black" href={"/checkout"}>Checkout</Link>
//                     </li>
//                 </ul>
//             </div>
//         </nav>
//     )
// }
//
// export default NavBar

'use client'

import Link from "next/link";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {useUser} from '../lib/UserContext';

function NavBar() {
    //const [user, setUser] = useState<string | null>(null);
    const {user,setUser, cartCount,setCartCount}= useUser();
    const [showDropdown, setShowDropdown] = useState(false);
    const router = useRouter();

    // architecture
    const [showArchitectureMenu, setShowArchitectureMenu] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState('');

    const handleLogin = () => {
        const username = prompt("Please enter your username to login:");
        if (username) {
            localStorage.setItem('user', username);
            setUser(username);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setCartCount(0);
        setShowDropdown(false);
        router.push('/products');
    };


    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            setUser(loggedInUser);
        }
    }, []);


    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <ul className="flex space-x-4">
                    <li>
                        <Link className="text-gray-700 hover:text-black" href={"/products"}>All Products</Link>
                    </li>
                    {user && (
                        <>
                            <li>
                                <Link className="text-gray-700 hover:text-black" href={`/user/${user}/cart`}>Cart</Link>
                            </li>
                            <li>
                                <Link className="text-gray-700 hover:text-black"
                                      href={`/user/${user}/checkout`}>Checkout</Link>
                            </li>
                            <li>
                                <Link className="text-gray-700 hover:text-black flex items-center animate-flash" href={`/api-docs`}>
                                    Backend
                                    <span className="ml-1 inline-block animate-flash">⭐</span>
                                </Link>
                            </li>

                        </>
                    )}

                    <li className="relative group">
                        <button
                            className="text-gray-700 hover:text-black"
                            onClick={() => setShowArchitectureMenu(!showArchitectureMenu)}
                        >
                            See Architecture
                        </button>
                        {showArchitectureMenu && (
                            <ul className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-10">
                                <li>
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setExpandedCategory(expandedCategory === 'api' ? '' : 'api')}
                                    >
                                        See API Architectures
                                    </button>
                                    {expandedCategory === 'api' && (
                                        <ul className="ml-4">
                                            <li><Link href="/architecture/api/cart"
                                                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Cart
                                                Management API</Link></li>
                                            <li><Link href="/architecture/api/order"
                                                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Order
                                                Management API</Link></li>
                                            <li><Link href="/architecture/api/checkout"
                                                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Checkout
                                                Management API</Link></li>
                                            <li><Link href="/architecture/api/product"
                                                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Product
                                                Management API</Link></li>
                                        </ul>
                                    )}
                                </li>
                                <li>
                                    <Link href="/architecture/state"
                                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        See Internal State Transition
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/architecture/lifecycle"
                                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Components Lifecycle Management
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>
                </ul>
                <div className="relative">
                    {user ? (
                        <div>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center space-x-2 text-gray-700 hover:text-black"
                            >
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600"
                                         viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                              clipRule="evenodd"/>
                                    </svg>
                                </div>
                                <span>{user}</span>
                            </button>
                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                    <Link href={`/user/${user}/cart`}
                                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        View Cart
                                    </Link>
                                    <Link href={`/user/${user}/favorite`}
                                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        My Favorites
                                    </Link>
                                    <Link href={`/user/${user}/order`}
                                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        My Orders
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="text-gray-700 hover:text-black"
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default NavBar