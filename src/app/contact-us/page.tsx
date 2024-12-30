'use client';

import React, { useState } from 'react';

//  statement is used in Next.js to control the rendering behavior of a page or layout.
//  In this case, it's forcing the page to be dynamically rendered on each request.
export const dynamic='force-dynamic';

const products = [
    { id: '1', name: 'Hat' },
    { id: '2', name: 'Mug' },
    { id: '3', name: 'Shirt' },
    { id: '4', name: 'Upcoming: Socks' },
    { id: '5', name: 'Upcoming: Jacket' },
    { id: '6', name: 'Others' },
];

function RenderContactForm({
                         name,
                         email,
                         product,
                         description,
                         errors,
                         setName,
                         setEmail,
                         setProduct,
                         setDescription,
                         handleSubmit
                     }: {
    name: string;
    email: string;
    product: string;
    description: string;
    errors: { [key: string]: string };
    setName: (value: string) => void;
    setEmail: (value: string) => void;
    setProduct: (value: string) => void;
    setDescription: (value: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
}) {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
            <form onSubmit={handleSubmit} className="max-w-lg">
                <div className="mb-4">
                    <label htmlFor="name" className="block mb-2">Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block mb-2">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="product" className="block mb-2">Product</label>
                    <select
                        id="product"
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                    >
                        <option value="">Select a product</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                    </select>
                    {errors.product && <p className="text-red-500 text-sm mt-1">{errors.product}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="description" className="block mb-2">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        rows={4}
                    ></textarea>
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Submit
                </button>
            </form>
        </div>
    );
}

export default function ContactUsPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [product, setProduct] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
        if (!product) newErrors.product = 'Please select a product';
        if (!description.trim()) newErrors.description = 'Description is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            console.log('Form submitted:', { name, email, product, description });
            alert('Thank you for your inquiry. We will get back to you soon!');
            setName('');
            setEmail('');
            setProduct('');
            setDescription('');
        }
    };

    return (
        <RenderContactForm
            name={name}
            email={email}
            product={product}
            description={description}
            errors={errors}
            setName={setName}
            setEmail={setEmail}
            setProduct={setProduct}
            setDescription={setDescription}
            handleSubmit={handleSubmit}
        />
    );
}