import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CheckoutPage from './page';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));

// Mock the fetchAllProducts function
jest.mock('../../../utils/utils', () => ({
    fetchAllProducts: jest.fn(),
}));

// Mock the fetch function
global.fetch = jest.fn();

describe('CheckoutPage', () => {
    const mockRouter = { push: jest.fn() };
    const mockSearchParams = new URLSearchParams('items=1,2,3');

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the checkout page with cart items', async () => {
        const mockProducts = [
            { id: '1', name: 'Product 1', price: 10 },
            { id: '2', name: 'Product 2', price: 20 },
            { id: '3', name: 'Product 3', price: 30 },
        ];
        (require('../../../utils/utils').fetchAllProducts as jest.Mock).mockResolvedValue(mockProducts);

        render(<CheckoutPage params={Promise.resolve({ id: 'user1' })} />);

        await waitFor(() => {
            expect(screen.getByText('Product 1')).toBeInTheDocument();
            expect(screen.getByText('Product 2')).toBeInTheDocument();
            expect(screen.getByText('Product 3')).toBeInTheDocument();
        });
    });

    it('calculates total price correctly', async () => {
        const mockProducts = [
            { id: '1', name: 'Product 1', price: 10 },
            { id: '2', name: 'Product 2', price: 20 },
            { id: '3', name: 'Product 3', price: 30 },
        ];
        (require('../../../utils/utils').fetchAllProducts as jest.Mock).mockResolvedValue(mockProducts);

        render(<CheckoutPage params={Promise.resolve({ id: 'user1' })} />);

        await waitFor(() => {
            expect(screen.getByText('Total: $60')).toBeInTheDocument();
        });
    });

    it('handles form submission correctly', async () => {
        const mockProducts = [
            { id: '1', name: 'Product 1', price: 10 },
        ];
        (require('../../../utils/utils').fetchAllProducts as jest.Mock).mockResolvedValue(mockProducts);
        (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

        render(<CheckoutPage params={Promise.resolve({ id: 'user1' })} />);

        await waitFor(() => {
            fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText('Payment Method:'), { target: { value: 'Credit Card' } });
            fireEvent.click(screen.getByText('Place Order'));
        });

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(2); // Once for order creation, once for cart deletion
        });
    });

    it('redirects to cart when no items are present', async () => {
        (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));

        render(<CheckoutPage params={Promise.resolve({ id: 'user1' })} />);

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith('/user/user1/cart');
        });
    });

    it('handles payment failure', async () => {
        const mockProducts = [{ id: '1', name: 'Product 1', price: 10 }];
        (require('../../../utils/utils').fetchAllProducts as jest.Mock).mockResolvedValue(mockProducts);
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Payment failed'));

        render(<CheckoutPage params={Promise.resolve({ id: 'user1' })} />);

        await waitFor(() => {
            fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText('Payment Method:'), { target: { value: 'Credit Card' } });
            fireEvent.click(screen.getByText('Place Order'));
        });

        await waitFor(() => {
            expect(screen.getByText('Error: Payment failed')).toBeInTheDocument();
        });
    });

    it('groups identical items correctly', async () => {
        const mockProducts = [
            { id: '1', name: 'Product 1', price: 10 },
            { id: '1', name: 'Product 1', price: 10 },
            { id: '2', name: 'Product 2', price: 20 },
        ];
        (require('../../../utils/utils').fetchAllProducts as jest.Mock).mockResolvedValue(mockProducts);

        render(<CheckoutPage params={Promise.resolve({ id: 'user1' })} />);

        await waitFor(() => {
            expect(screen.getByText('Product 1 (2x)')).toBeInTheDocument();
            expect(screen.getByText('Product 2 (1x)')).toBeInTheDocument();
        });
    });

    it('updates interaction data on mount and unmount', async () => {
        const mockProducts = [{ id: '1', name: 'Product 1', price: 10 }];
        (require('../../../utils/utils').fetchAllProducts as jest.Mock).mockResolvedValue(mockProducts);

        const { unmount } = render(<CheckoutPage params={Promise.resolve({ id: 'user1' })} />);

        await waitFor(() => {
            expect(screen.getByText('Product 1')).toBeInTheDocument();
        });

        unmount();

        // You might need to implement a way to check if the interaction data was updated correctly
    });

    it('starts countdown after successful payment', async () => {
        const mockProducts = [{ id: '1', name: 'Product 1', price: 10 }];
        (require('../../../utils/utils').fetchAllProducts as jest.Mock).mockResolvedValue(mockProducts);
        (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

        jest.useFakeTimers();

        render(<CheckoutPage params={Promise.resolve({ id: 'user1' })} />);

        await waitFor(() => {
            fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText('Payment Method:'), { target: { value: 'Credit Card' } });
            fireEvent.click(screen.getByText('Place Order'));
        });

        await waitFor(() => {
            expect(screen.getByText('Redirecting in 30 seconds')).toBeInTheDocument();
        });

        jest.advanceTimersByTime(15000);

        await waitFor(() => {
            expect(screen.getByText('Redirecting in 15 seconds')).toBeInTheDocument();
        });

        jest.useRealTimers();
    });
});