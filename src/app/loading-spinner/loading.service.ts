import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    // BehaviorSubject to manage loading state
    // Initial value set to false (not loading)
    private loadingSubject = new BehaviorSubject<boolean>(false);

    // Public Observable that components can subscribe to
    // Using $ suffix as per Angular convention for Observables
    loading$ = this.loadingSubject.asObservable();

    /**
     * Shows the loading spinner
     * Sets loading state to true
     */
    show() {
        this.loadingSubject.next(true);
    }

    /**
     * Hides the loading spinner
     * Sets loading state to false
     */
    hide() {
        this.loadingSubject.next(false);
    }

    /**
     * Utility method to wrap async operations with loading state
     * Automatically shows spinner before operation and hides it after completion
     * 
     * @param operation Promise-returning function to be executed
     * @returns Promise of the operation result
     * 
     * Usage example:
     * await loadingService.withLoading(async () => {
     *   const data = await fetchData();
     *   return data;
     * });
     */
    async withLoading<T>(operation: () => Promise<T>): Promise<T> {
        try {
            this.show();
            return await operation();
        } finally {
            this.hide();
        }
    }
} 