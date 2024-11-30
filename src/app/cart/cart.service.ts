import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from './cart.model';
import { CartNotificationService } from './cart-notification.service';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    // BehaviorSubject to manage cart state, initialized as empty array
    private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);

    // Public Observable that components can subscribe to for cart updates
    // Using $ suffix as per Angular convention for Observables
    cartItems$ = this.cartItemsSubject.asObservable();

    constructor(private cartNotificationService: CartNotificationService) {
        this.loadCartItems();
    }

    /**
     * Getter for current cart items state
     * @returns Current array of cart items
     */
    private get cartItems(): CartItem[] {
        return this.cartItemsSubject.value;
    }

    /**
     * Loads cart items from localStorage on service initialization
     */
    private loadCartItems(): void {
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
            this.cartItemsSubject.next(JSON.parse(savedCart));
        }
    }

    /**
     * Persists current cart state to localStorage
     */
    private saveCartItems(): void {
        localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    }

    /**
     * Adds item to cart or updates quantity if item exists
     * Shows notification after successful addition
     * @param item CartItem to be added
     */
    addToCart(item: CartItem): void {
        const currentItems = this.cartItems;
        // Check for existing item by matching all relevant properties
        const existingItemIndex = currentItems.findIndex(
            cartItem =>
                cartItem.productId === item.productId &&
                cartItem.size === item.size &&
                cartItem.selectedPrice.productColor === item.selectedPrice.productColor &&
                cartItem.selectedPrice.productFlavor === item.selectedPrice.productFlavor
        );

        if (existingItemIndex !== -1) {
            currentItems[existingItemIndex].quantity += item.quantity;
        } else {
            currentItems.push(item);
        }

        this.cartItemsSubject.next(currentItems);
        this.saveCartItems();

        // Show notification with item details
        this.cartNotificationService.showNotification({
            productName: item.productName,
            imageUrl: item.selectedPrice.productImage,
            quantity: item.quantity,
            price: item.selectedPrice.discountedPrice > 0
                ? item.selectedPrice.discountedPrice
                : item.selectedPrice.productPrice
        });
    }

    /**
     * Updates quantity of specific cart item
     * @param index Index of item in cart
     * @param quantity New quantity value
     */
    updateQuantity(index: number, quantity: number): void {
        const currentItems = this.cartItems;
        if (currentItems[index]) {
            currentItems[index].quantity = quantity;
            this.cartItemsSubject.next(currentItems);
            this.saveCartItems();
        }
    }

    /**
     * Removes specific item from cart
     * @param index Index of item to remove
     */
    removeFromCart(index: number): void {
        const currentItems = [...this.cartItems];
        currentItems.splice(index, 1);
        this.cartItemsSubject.next(currentItems);
        this.saveCartItems();
    }

    /**
     * Utility methods for cart operations
     */
    clearCart(): void {
        this.cartItemsSubject.next([]);
        localStorage.removeItem('cartItems');
    }

    isCartEmpty(): boolean {
        return this.cartItems.length === 0;
    }

    /**
     * Calculates total price of all items in cart
     * Considers discounted prices when available
     */
    getCartTotal(): number {
        return this.cartItems.reduce((total, item) => {
            const price = item.selectedPrice.discountedPrice > 0
                ? item.selectedPrice.discountedPrice
                : item.selectedPrice.productPrice;
            return total + (price * item.quantity);
        }, 0);
    }

    /**
     * Calculates total number of items in cart
     */
    getCartCount(): number {
        return this.cartItems.reduce((count, item) =>
            count + item.quantity, 0);
    }

    /**
     * Clears cart and removes from localStorage on user logout
     */
    clearCartOnLogout(): void {
        this.clearCart();
        localStorage.removeItem('cartItems');
    }
} 