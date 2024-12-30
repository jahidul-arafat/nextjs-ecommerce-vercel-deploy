"use client"

// Not found page
// Define a component when navigating to a wrong route
import {useEffect, useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";

/**
 * Renders the content for a not found page based on the type of item not found.
 * 
 * @param notFoundType - The type of item that was not found.
 *                       Can be 'route' for a non-existent route,
 *                       'product' for a non-existent product,
 *                       or null if the type is not yet determined.
 * 
 * @returns A JSX element containing the appropriate not found message
 *          and a link to return to the home page.
 */
function renderNotFoundContent(notFoundType:'route'|'product'|null){
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center p-8 bg-white shadow-xl rounded-lg">
                <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                    {notFoundType === 'product' ? 'Product Not Found' : 'Page Not Found'}
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                    {notFoundType === 'product'
                        ? "We couldn't find the product you are looking for."
                        : "The page you are looking for doesn't exist or has been moved."
                    }
                </p>
                <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
                    Go back to Home
                </Link>
            </div>
        </div>
    )
}

export default function NotFoundPage() {
    // Enhancing the Route Not Found and Product Not found
    // 3X React Client Side Hooks will be used here
    /*
    React Hook Definition:
    ---------------------
    React Hooks are functions that let you "hook into" React state and lifecycle features from function components.
    They were introduced in React 16.8 to allow you to use state and other React features without writing a class.
    The term "Hook" is used because these functions hook into React's internal workings, allowing you to tap into its features like state management and side effects in a more direct way than was previously possible with functional components.
    1. usePathname(): This hook is used to access the current route information. It needs to run on the client because routing in Next.js can be dynamic and change without a full page reload.
    2. useState(): This hook manages local component state. It runs on the client to allow for dynamic updates to the component's state without needing server interaction.
    3. useEffect(): This hook is used for side effects in your component, like fetching data or manipulating the DOM at client side. It runs after the component renders, which happens on the client side.

    -- By using these client-side hooks, your NotFoundPage can dynamically determine whether it's dealing with a missing route or a missing product, and update its display accordingly, all without needing to make additional requests to the server.
    */

    const currentRoute = usePathname(); // get the current route information i.e. /product, /xyz etc
    const [notFoundType, setNotFoundType] = useState<'route' | 'product' | null>(null); // to determine whether the not foudn type is a route or a product or null; default is null

    // once a route is rendered i.e. /xyz, /products; if /product -> then setNotFoundType to 'product', else keep it 'route'
    // is a side effect, means, only executes when there is a change in the 'currentRoute' path; not always
    useEffect(() => {
        if (currentRoute?.startsWith('/products/')) {
            setNotFoundType('product')
        } else {
            setNotFoundType('route');
        }
    }, [currentRoute]); // check if any changes in 'currentRoute', trigger only if any changes here

    return renderNotFoundContent(notFoundType);


}