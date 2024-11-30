import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from './cart.model';
import { CartNotificationService } from './cart-notification.service';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    // BehaviorSubject to store and manage cart items state
    private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);

    // Observable to expose cart items to components
    cartItems$ = this.cartItemsSubject.asObservable();

    constructor(private cartNotificationService: CartNotificationService) {
        // Load saved cart items from localStorage on service initialization
        this.loadCartItems();
    }

    // Get current cart items
    private get cartItems(): CartItem[] {
        return this.cartItemsSubject.value;
    }

    // Load cart items from localStorage
    private loadCartItems(): void {
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
            this.cartItemsSubject.next(JSON.parse(savedCart));
        }
    }

    // Save current cart state to localStorage
    private saveCartItems(): void {
        localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    }

    // Add new item to cart or update quantity if item already exists
    addToCart(item: CartItem): void {
        const currentItems = this.cartItems;
        // Check if item already exists in cart
        const existingItemIndex = currentItems.findIndex(
            cartItem =>
                cartItem.productId === item.productId &&
                cartItem.size === item.size &&
                cartItem.selectedPrice.productColor === item.selectedPrice.productColor &&
                cartItem.selectedPrice.productFlavor === item.selectedPrice.productFlavor
        );

        if (existingItemIndex !== -1) {
            // Update quantity if item exists
            currentItems[existingItemIndex].quantity += item.quantity;
        } else {
            // Add new item if it doesn't exist
            currentItems.push(item);
        }

        this.cartItemsSubject.next(currentItems);
        this.saveCartItems();

        // Show enhanced notification
        this.cartNotificationService.showNotification({
            productName: item.productName,
            imageUrl: item.selectedPrice.productImage,
            quantity: item.quantity,
            price: item.selectedPrice.discountedPrice > 0
                ? item.selectedPrice.discountedPrice
                : item.selectedPrice.productPrice
        });
    }

    // Update quantity of specific item in cart
    updateQuantity(index: number, quantity: number): void {
        const currentItems = this.cartItems;
        if (currentItems[index]) {
            currentItems[index].quantity = quantity;
            this.cartItemsSubject.next(currentItems);
            this.saveCartItems();
        }
    }

    // Remove specific item from cart
    removeFromCart(index: number): void {
        const currentItems = [...this.cartItems]; // Make a copy of the current items
        const removedItem = currentItems[index]; // Save the removed item for undo

        currentItems.splice(index, 1); // Remove the item
        this.cartItemsSubject.next(currentItems); // Update the BehaviorSubject
        this.saveCartItems(); // Persist the changes
    }

    // Clear all items from cart
    clearCart(): void {
        this.cartItemsSubject.next([]);
        localStorage.removeItem('cartItems');
    }

    isCartEmpty(): boolean {
        return this.cartItems.length === 0;
    }

    getCartTotal(): number {
        return this.cartItems.reduce((total, item) => {
            const price = item.selectedPrice.discountedPrice > 0
                ? item.selectedPrice.discountedPrice
                : item.selectedPrice.productPrice;
            return total + (price * item.quantity);
        }, 0);
    }

    getCartCount(): number {
        return this.cartItems.reduce((count, item) =>
            count + item.quantity, 0);
    }

    // Method specifically for logout cleanup
    clearCartOnLogout(): void {
        this.clearCart();
        localStorage.removeItem('cartItems'); // Explicitly remove from localStorage
    }
} 