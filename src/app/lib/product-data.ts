export interface Product {
    id: string;
    imageUrl: string;
    name: string;
    description: string;
    price: number;
    supplier: string;
    genre: string[];
    countryOfOrigin: string;
    material: string;
    inStock: boolean;
}

// An array of products implementing the Product interface
export const products: Product[] = [
    {
        id: '123',
        name: 'Hat',
        imageUrl: 'hat.jpg',
        description: 'Cheer the team on in style with our unstructured, low crown, six-panel baseball cap made of 100% organic cotton twill. Featuring our original Big Star Collectibles artwork, screen-printed with PVC- and phthalate-free inks. Complete with matching sewn ventilation eyelets, and adjustable fabric closure.',
        price: 29,
        supplier: 'EcoWear',
        genre: ['Accessories', 'Sportswear'],
        countryOfOrigin: 'USA',
        material: 'Organic Cotton',
        inStock: true,
    },
    {
        id: '234',
        name: 'Mug',
        imageUrl: 'mug.jpg',
        description: 'Enjoy your morning coffee or tea in the company of your favorite Big Star Collectible character. Our strong ceramic mug, with its comfortable D-shaped handle, is microwave and dishwasher safe, and available in one size: 11 oz (3.2" diameter x 3.8" h).',
        price: 16,
        supplier: 'CeramicCraft',
        genre: ['Kitchenware', 'Collectibles'],
        countryOfOrigin: 'China',
        material: 'Ceramic',
        inStock: true,
    },
    {
        id: '345',
        name: 'Shirt',
        imageUrl: 'shirt.jpg',
        description: 'Our t-shirts are made from ring-spun, long-staple organic cotton that\'s ethically sourced from member farms of local organic cotton cooperatives. Original artwork is screen-printed using PVC- and phthalate-free inks. Features crew-neck styling, shoulder-to-shoulder taping, and a buttery soft feel. Machine-wash warm, tumble-dry low.',
        price: 26,
        supplier: 'EcoWear',
        genre: ['Apparel', 'Casual Wear'],
        countryOfOrigin: 'India',
        material: 'Organic Cotton',
        inStock: true,
    },
    {
        id: '456',
        name: 'Apron',
        imageUrl: 'apron.jpg',
        description: "Everyone's a chef in our eco-friendly apron made from 55% organic cotton and 45% recycled polyester. Showcasing your favorite Big Star Collectibles design, the apron is screen-printed in PVC- and phthalate-free inks. Apron measures 24 inches wide by 30 inches long and is easily adjustable around the neck and waist with one continuous strap. Machine-wash warm, tumble-dry low.",
        price: 24,
        supplier: 'KitchenGear',
        genre: ['Kitchenware', 'Apparel'],
        countryOfOrigin: 'Vietnam',
        material: 'Organic Cotton Blend',
        inStock: false,
    },
    {
        id: '111',
        name: 'Person',
        imageUrl: 'person.jpg',
        description: "Jahidul Arafat/Everyone's a chef in our eco-friendly apron made from 55% organic cotton and 45% recycled polyester. Showcasing your favorite Big Star Collectibles design, the apron is screen-printed in PVC- and phthalate-free inks. Apron measures 24 inches wide by 30 inches long and is easily adjustable around the neck and waist with one continuous strap. Machine-wash warm, tumble-dry low.",
        price: 24,
        supplier: 'ArtPrints',
        genre: ['Wall Art', 'Collectibles'],
        countryOfOrigin: 'Japan',
        material: 'Canvas',
        inStock: true,
    },
];