import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { CartService } from '../cart.service';
import { CartItem } from '../cart.model';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { CurrencyPipe, Location } from '@angular/common';

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
        ]),
        trigger('removeItem', [
            state('in', style({
                opacity: 1,
                height: '*',
                transform: 'translateX(0)'
            })),
            transition(':leave', [
                animate('300ms ease-out', style({
                    opacity: 0,
                    height: 0,
                    transform: 'translateX(-100%)',
                    marginBottom: 0,
                    paddingTop: 0,
                    paddingBottom: 0
                }))
            ])
        ])
    ]
})
export class CartComponent {
    @ViewChild('cartItems') cartItemsElement: ElementRef; // Access the cart section element
    cartItems$: Observable<CartItem[]>;
    // Calculate total price from all items in cart
    cartTotal$: Observable<number>;

    errorMaxStock: boolean = false;
    errorMinStock: boolean = false;

    initialCartItemCount: number = 5;
    showAllCartItems: boolean = false;

    constructor(
        private cartService: CartService,
        private router: Router,
        private location: Location,
        private currencyPipe: CurrencyPipe
    ) {
        this.cartItems$ = this.cartService.cartItems$;
        this.cartTotal$ = this.getTotalPrice();

        // Check and sync error states
        this.cartItems$.subscribe(items => {
            this.errorMinStock = items.some(item => item.quantity <= 0);
            this.errorMaxStock = items.some(item => item.quantity > item.maxStock);

            // Update individual item error states
            items.forEach(item => {
                item.maxStockError = item.quantity > item.maxStock;
            });
        });

        if (this.cartService.isCartEmpty()) {
            this.location.back();
        }
    }

    // Getter to control which cart items are visible
    get visibleCartItems$(): Observable<CartItem[]> {
        return this.cartItems$.pipe(
            map(items => this.showAllCartItems ? items : items.slice(0, this.initialCartItemCount))
        );
    }

    // Toggle cart items display
    toggleCartItemsDisplay() {
        this.showAllCartItems = !this.showAllCartItems;

        if (!this.showAllCartItems) {
            this.goTopOfTheCartItemSection();
        }
    }

    // Scroll to the top of the cart items section element
    goTopOfTheCartItemSection() {
        this.cartItemsElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    getTotalPrice() {
        return this.cartItems$.pipe(
            map(items => items.reduce((total, item) => total + (item.selectedPrice.discountedPrice > 0
                ? item.selectedPrice.discountedPrice
                : item.selectedPrice.productPrice) * item.quantity, 0))
        );
    }

    // Remove item from cart
    removeItem(index: number) {
        this.cartService.removeFromCart(index);

        this.goTopOfTheCartItemSection();
    }

    // Clear all items from cart
    clearCart() {
        this.goTopOfTheCartItemSection();
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

    // Navigate to product page
    navigateToProduct(item: CartItem) {
        this.router.navigate(['/product', item.category, item.productId], {
            queryParams: {
                selectedPrice: JSON.stringify(item.selectedPrice)
            }
        });
    }

    // Increment quantity of item in the cart
    incrementQuantity(item: CartItem, index: number) {
        item.quantity++;
        console.log(item.quantity, item.maxStock);
        if (item.quantity >= item.maxStock) {
            item.maxStockError = true;
        } else {
            item.maxStockError = false;
        }

        this.cartTotal$ = this.getTotalPrice();
        this.cartService.updateQuantity(index, item.quantity);
    }

    // Decrement quantity of item in the cart
    decrementQuantity(item: CartItem, index: number) {
        if (item.quantity > 1) {
            item.quantity--;
            if (item.quantity < 1) {
                item.quantity = 1;
            }
        }

        if (item.quantity > item.maxStock) {
            item.maxStockError = true;
        } else {
            item.maxStockError = false;
        }

        this.cartTotal$ = this.getTotalPrice();
        this.cartService.updateQuantity(index, item.quantity);
    }
} 