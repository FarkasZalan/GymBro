import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartNotificationData } from './cart-notification.model';

@Injectable({
    providedIn: 'root'
})
export class CartNotificationService {
    // BehaviorSubject to manage the state of cart notifications
    // Initial value is null (no notification)
    private notificationSubject = new BehaviorSubject<CartNotificationData | null>(null);

    // Public Observable that components can subscribe to
    // Using $ suffix as per Angular convention for Observables
    notification$ = this.notificationSubject.asObservable();

    /**
     * Displays a notification with the provided cart data
     * @param data CartNotificationData containing product details
     */
    showNotification(data: CartNotificationData) {
        // Emit the new notification data
        this.notificationSubject.next(data);

        // Automatically hide the notification after 5 seconds
        setTimeout(() => {
            this.notificationSubject.next(null);
        }, 5000);
    }

    /**
     * Immediately hides any active notification
     */
    hideNotification() {
        this.notificationSubject.next(null);
    }

    /**
     * Shows a special notification for empty cart state
     * Uses a placeholder image and sets isEmptyCart flag to true
     */
    showEmptyCartNotification() {
        const emptyCartData: CartNotificationData = {
            productName: '',
            imageUrl: '../../../../../assets/images/no-products.jpg',
            quantity: 0,
            price: 0,
            isEmptyCart: true  // Flag to indicate empty cart state
        };

        // Show the empty cart notification
        this.notificationSubject.next(emptyCartData);

        // Automatically hide after 5 seconds
        setTimeout(() => {
            this.notificationSubject.next(null);
        }, 5000);
    }
} 