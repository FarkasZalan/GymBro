import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../product.service';
import { Product } from '../../admin-profile/product-management/product-models/product.model';
import { ProductViewText } from '../../admin-profile/product-management/product-view-texts';
import { trigger, transition, style, animate } from '@angular/animations';
import { ProductReeviews } from '../../admin-profile/product-management/product-models/product-reviews.model';
import { DiscountedPrice } from '../discounted-price.model';

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
    @ViewChild('toScrollAfterNavigate') toScrollAfterNavigate: ElementRef;
    discountedProducts: Product[] = [];

    // pagination
    paginatedProducts: Product[] = [];
    itemsPerPage = 12;
    currentPage = 1;

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
        this.productService.getDiscountedProducts(0, false).subscribe((products: Product[]) => {
            this.discountedProducts = products;
            this.emptyCollection = products.length === 0;

            this.updatePaginatedList();
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

    // navigation for the pagination
    updatePaginatedList(): void {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.paginatedProducts = this.discountedProducts.slice(startIndex, endIndex);
    }

    goToPage(page: number): void {
        this.currentPage = page;
        this.toScrollAfterNavigate.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        this.updatePaginatedList();
    }

    getTotalPages(): number {
        return Math.ceil(this.discountedProducts.length / this.itemsPerPage);
    }

    navigateToProduct(product: DiscountedPrice) {
        this.router.navigate(['/product/' + product.category + '/' + product.id], {
            queryParams: {
                selectedPrice: JSON.stringify(product.selectedPrice)
            }
        });
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

    getCategoryIcon(category: string): string {
        if (category === ProductViewText.FOOD_SUPLIMENTS) {
            return 'flash-outline';
        } else if (category === ProductViewText.ORGANIC_FOOD) {
            return 'heart-outline';
        } else if (category === ProductViewText.CLOTHES) {
            return 'pricetags-outline';
        } else if (category === ProductViewText.ACCESSORIES) {
            return 'shield-outline';
        }
    }
} 