import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../products/product.service';
import { Blog } from '../../admin-profile/blog/blog.model';
import { ProductViewText } from '../../admin-profile/product-management/product-view-texts';
import { trigger, transition, style, animate, query, group } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import { Product } from '../../admin-profile/product-management/product-models/product.model';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { NgbCarousel } from '@ng-bootstrap/ng-bootstrap';
import { DiscountedPrice } from '../../products/discounted-price.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
    ]),
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredBlogs: Blog[] = [];
  discountedProducts: Product[] = [];
  newArrivals: Product[] = [];
  categories = [
    {
      name: 'menu.foodSuplimentsMenu.foodSupliments',
      icon: 'flash-outline',
      route: '/product/' + ProductViewText.FOOD_SUPLIMENTS,
      image: '../../../assets/images/food-supliments-image.jpg'
    },
    {
      name: 'menu.organicFoodMenu.organicFood',
      icon: 'heart-outline',
      route: '/product/' + ProductViewText.ORGANIC_FOOD,
      image: '../../../assets/images/healthy-food-image.jpg'
    },
    {
      name: 'menu.clothingMenu.clothing',
      icon: 'pricetags-outline',
      route: '/product/' + ProductViewText.CLOTHES,
      image: '../../../assets/images/clothing-image.jpg'
    },
    {
      name: 'menu.accessoriesMenu.accessories',
      icon: 'shield-outline',
      route: '/product/' + ProductViewText.ACCESSORIES,
      image: '../../../assets/images/gym-accessories-image.jpg'
    }
  ];

  private autoSlideSubscription?: Subscription;
  currentIndexDiscounted = 0;
  currentIndexNewArrivals = 0;
  currentIndexBlogs = 0;
  displayCount = 3; // Number of items to show at once
  discountedInterval = 4000;  // 4 seconds
  newArrivalsInterval = 5000; // 5 seconds
  blogsInterval = 6000;       // 6 seconds

  constructor(
    private router: Router,
    private productService: ProductService
  ) { }

  ngOnInit() {
    // Get featured blogs (max 9)
    this.productService.getLatestBlogs(9).subscribe((blogs: Blog[]) => {
      this.featuredBlogs = blogs.slice(0, 9);  // Ensure max 9 items
    });

    // Get discounted products (max 9)
    this.productService.getDiscountedProducts(9, true).subscribe((products: Product[]) => {
      this.discountedProducts = products.slice(0, 9);  // Ensure max 9 items
    });

    // Get new arrivals (max 9)
    this.productService.getNewArrivals(9).subscribe((products: Product[]) => {
      this.newArrivals = products.slice(0, 9);  // Ensure max 9 items
    });
  }

  ngOnDestroy() {
    // Clean up any remaining subscriptions
    if (this.autoSlideSubscription) {
      this.autoSlideSubscription.unsubscribe();
    }
  }

  navigateToCategory(route: string) {
    this.router.navigate([route]);
  }

  navigateToBlog(blogId: string) {
    this.router.navigate(['/blog/blog-view/', blogId]);
  }

  navigateToShop() {
    this.router.navigate(['/product/' + ProductViewText.FOOD_SUPLIMENTS]);
  }

  navigateToProduct(product: DiscountedPrice) {
    this.router.navigate(['/product/' + product.category + '/' + product.id], {
      queryParams: {
        selectedPrice: JSON.stringify(product.selectedPrice)
      }
    });
  }

  navigateToLoyalty() {
    this.router.navigate(['/product/loyaltyProgram']);
  }

  navigateToBlogs() {
    this.router.navigate(['/blog']);
  }

  navigateToDiscountedProducts() {
    this.router.navigate(['/product/discountedProducts']);
  }

  getDiscountedProductsSlice(start: number, end: number): Product[] {
    return this.discountedProducts.slice(start, end);
  }

  getNewArrivalsSlice(start: number, end: number): Product[] {
    return this.newArrivals.slice(start, end);
  }

  getBlogsSlice(start: number, end: number): Blog[] {
    return this.featuredBlogs.slice(start, end);
  }

  getDiscountedProduct(index: number): Product | undefined {
    // Handle circular array access
    const normalizedIndex = ((index % this.discountedProducts.length) + this.discountedProducts.length) % this.discountedProducts.length;
    return this.discountedProducts[normalizedIndex];
  }

  getNewArrivalProduct(index: number): Product | undefined {
    const normalizedIndex = ((index % this.newArrivals.length) + this.newArrivals.length) % this.newArrivals.length;
    return this.newArrivals[normalizedIndex];
  }

  getBlog(index: number): Blog | undefined {
    const normalizedIndex = ((index % this.featuredBlogs.length) + this.featuredBlogs.length) % this.featuredBlogs.length;
    return this.featuredBlogs[normalizedIndex];
  }

  getCarouselSlides(totalItems: number): number[] {
    const itemsPerSlide = 3;
    const totalSlides = Math.ceil(totalItems / itemsPerSlide);
    return Array.from({ length: totalSlides }, (_, i) => i);
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
