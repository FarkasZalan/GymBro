import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserNotificationService {
    private ordersCountSubject = new BehaviorSubject<number>(0);
    ordersCount$ = this.ordersCountSubject.asObservable();

    updateOrdersCount(count: number) {
        this.ordersCountSubject.next(count);
    }
} 