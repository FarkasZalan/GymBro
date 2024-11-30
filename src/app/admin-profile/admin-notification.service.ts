import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminNotificationService {
    // BehaviorSubjects to track counts of unchecked reviews and new orders
    // Initial values set to 0
    private reviewsCountSubject = new BehaviorSubject<number>(0);
    private ordersCountSubject = new BehaviorSubject<number>(0);

    // Public Observables that components can subscribe to
    // Using $ suffix as per Angular convention for Observables
    reviewsCount$ = this.reviewsCountSubject.asObservable();
    ordersCount$ = this.ordersCountSubject.asObservable();

    /**
     * Updates the count of unchecked reviews in the notification service
     * @param count The new number of unchecked reviews
     */
    updateReviewsCount(count: number) {
        this.reviewsCountSubject.next(count);
    }

    /**
     * Updates the count of new orders in the notification service
     * @param count The new number of unprocessed orders
     */
    updateOrdersCount(count: number) {
        this.ordersCountSubject.next(count);
    }
} 