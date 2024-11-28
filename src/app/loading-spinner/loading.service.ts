import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();

    show() {
        this.loadingSubject.next(true);
    }

    hide() {
        this.loadingSubject.next(false);
    }

    async withLoading<T>(operation: () => Promise<T>): Promise<T> {
        try {
            this.show();
            return await operation();
        } finally {
            this.hide();
        }
    }
} 