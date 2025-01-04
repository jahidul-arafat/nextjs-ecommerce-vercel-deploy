// import fs from "fs/promises";
// import path from "node:path";

// write a function to list all the products name from directory ./product-images which will be later shown as listing in this page
// Function to list all the product names from the product-images directory
// async function listAllProductNames() {
//     const productImagesDir = path.join(process.cwd(), 'src', 'app', 'public/product-images');
//     const productImageFiles = await fs.readdir(productImagesDir);
//     return productImageFiles
//         .filter(file => file.endsWith('.jpg'))
//         .map(file => file.replace('.jpg', ''));
// }
//
// // function to render the product page with all the product names
// function renderProductPage(productNames: string[]) {
//     return (
//         <div className="container mx-auto p-4">
//             <h2 className="text-2xl font-bold mb-4">Welcome to the Product Page</h2>
//             <p className="mb-4">This is where you can find all the details about your products.</p>
//             <ul className="list-disc pl-5">
//                 {productNames.map(name => (
//                     <li key={name} className="mb-2">{name}</li>
//                 ))}
//             </ul>
//         </div>
//     );
// }

// Component to display the product page
import ProductsList from "@/app/products/childComponents/ProductsList";
import {Product} from "@/app/data/product-data";
import Link from "next/link";
import {fetchAllProducts} from "@/app/utils/utils";

export const dynamic='force-dynamic';

function renderProductListParentPage(products: Product[]){
    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Products</h1>
                <p className="text-gray-600">Explore our wide range of high-quality products</p>
            </header>

            <main>
                <ProductsList products={products} />
            </main>

            <footer className="mt-12 text-center text-gray-500">
                <p>Can't find what you are looking for?
                    <Link href="/contact-us" className="text-blue-500 hover:underline"> Contact us
                    </Link></p>
            </footer>
        </div>
    )
}

// Main component for the product page
// will add child component ProductsList to display all the products
export default async function AllProductPage() {
    // const productNames = await listAllProductNames();
    // return renderProductPage(productNames);

    const products = await fetchAllProducts(); // through API to fetch all products
    return renderProductListParentPage(products);
}