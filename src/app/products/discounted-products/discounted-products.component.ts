import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../product.service';
import { Product } from '../../admin-profile/product-management/product-models/product.model';
import { ProductViewText } from '../../admin-profile/product-management/product-view-texts';
import { trigger, transition, style, animate } from '@angular/animations';
import { ProductReeviews } from '../../admin-profile/product-management/product-models/product-reviews.model';

@Component({
    selector: 'app-discounted-products',
    templateUrl: './discounted-products.component.html',
    styleUrl: '../../../styles/products.scss',
    animations: [
        trigger('zoomIn', [
            transition(':enter', [
                style({ transform: 'scale(0.8)', opacity: 0 }),
                animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
            ]),
        ])
    ]
})
export class DiscountedProductsComponent implements OnInit {
    discountedProducts: Product[] = [];
    productReviews: Map<string, ProductReeviews[]> = new Map();
    emptyCollection: boolean = false;

    constructor(
        private productService: ProductService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadDiscountedProducts();
    }

    private loadDiscountedProducts(): void {
        this.productService.getDiscountedProducts(0, false).subscribe(products => {
            this.discountedProducts = products;
            this.emptyCollection = products.length === 0;
            this.loadReviewsForProducts();
        });
    }

    private loadReviewsForProducts(): void {
        this.discountedProducts.forEach(product => {
            this.productService.getReviewsForProduct(product.id, product.category)
                .subscribe(reviews => {
                    this.productReviews.set(product.id, reviews);
                });
        });
    }

    navigateToProduct(category: string, productId: string): void {
        this.router.navigate(['/product', category, productId]);
    }

    getProductReviews(productId: string): ProductReeviews[] {
        return this.productReviews.get(productId) || [];
    }

    getAverageRating(productId: string): number {
        const reviews = this.getProductReviews(productId);
        if (!reviews.length) return 0;

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        return Math.round((totalRating / reviews.length) * 100) / 100;
    }
} 