import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartNotificationData } from './cart-notification.model';

@Injectable({
    providedIn: 'root'
})
export class CartNotificationService {
    private notificationSubject = new BehaviorSubject<CartNotificationData | null>(null);
    notification$ = this.notificationSubject.asObservable();

    showNotification(data: CartNotificationData) {
        this.notificationSubject.next(data);
        setTimeout(() => {
            this.notificationSubject.next(null);
        }, 5000); // Show for 5 seconds
    }

    hideNotification() {
        this.notificationSubject.next(null);
    }
} 