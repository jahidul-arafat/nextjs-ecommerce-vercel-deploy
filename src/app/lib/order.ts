import { Product } from "@/app/lib/product-data";

export interface OrderItem {
    productId: string;
    quantity: number;
}

export interface Order {
    userId: string;
    items: OrderItem[];
    transactionId: string;
    totalCost: number;
    paymentMethod: string;
    dateReceived: string;
}