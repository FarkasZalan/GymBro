import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminNotificationService {
    private reviewsCountSubject = new BehaviorSubject<number>(0);
    private ordersCountSubject = new BehaviorSubject<number>(0);

    reviewsCount$ = this.reviewsCountSubject.asObservable();
    ordersCount$ = this.ordersCountSubject.asObservable();
    // Update the count of unchecked reviews in the notification service
    updateReviewsCount(count: number) {
        this.reviewsCountSubject.next(count);
    }

    // Update the count of new orders in the notification service 
    updateOrdersCount(count: number) {
        this.ordersCountSubject.next(count);
    }
} 