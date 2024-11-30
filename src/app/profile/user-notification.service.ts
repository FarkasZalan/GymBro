import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserNotificationService {
    // BehaviorSubject to track count of user's orders
    // Initial value set to 0
    private ordersCountSubject = new BehaviorSubject<number>(0);

    // Public Observable that components can subscribe to
    // Using $ suffix as per Angular convention for Observables
    ordersCount$ = this.ordersCountSubject.asObservable();

    /**
     * Updates the count of user's orders in the notification service
     * @param count The new number of orders
     */
    updateOrdersCount(count: number) {
        this.ordersCountSubject.next(count);
    }
} 