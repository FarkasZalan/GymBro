import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartService } from '../cart.service';
import { CartItem } from '../cart.model';
import { trigger, transition, style, animate } from '@angular/animations';
import { Location } from '@angular/common';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss'],
    animations: [
        trigger('zoomIn', [
            transition(':enter', [
                style({ transform: 'scale(0.8)', opacity: 0 }),
                animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
            ]),
        ])
    ]
})
export class CartComponent implements OnInit {
    cartItems$: Observable<CartItem[]>;
    // Calculate total price from all items in cart
    cartTotal$: Observable<number>;

    constructor(
        private cartService: CartService,
        private router: Router,
        private location: Location
    ) {
        this.cartItems$ = this.cartService.cartItems$;
        // Reduce cart items to calculate total price
        this.cartTotal$ = this.cartItems$.pipe(
            map(items => items.reduce((total, item) =>
                total + (item.price * item.quantity), 0))
        );
    }

    ngOnInit(): void { }

    // Update quantity and validate it's greater than 0
    updateQuantity(index: number, event: any) {
        const quantity = parseInt(event.target.value, 10);
        if (quantity > 0) {
            this.cartService.updateQuantity(index, quantity);
        }
    }

    // Remove specific item from cart by index
    removeItem(index: number) {
        this.cartService.removeFromCart(index);
    }

    // Clear all items from cart
    clearCart() {
        this.cartService.clearCart();
    }

    // Navigate to checkout page to complete purchase
    checkout() {
        this.router.navigate(['/checkout']);
    }

    // Navigate to products page when cart is empty
    goToProducts() {
        this.router.navigate(['/home']);
    }

    back() {
        this.location.back();
    }
} 