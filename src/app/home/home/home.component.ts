import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../products/product.service';
import { Blog } from '../../admin-profile/blog/blog.model';
import { ProductViewText } from '../../admin-profile/product-management/product-view-texts';
import { trigger, transition, style, animate } from '@angular/animations';
import { Product } from '../../admin-profile/product-management/product-models/product.model';
import { Subscription } from 'rxjs';
import { DiscountedPrice } from '../../products/discounted-price.model';
import { DefaultImageUrl } from '../../admin-profile/default-image-url';

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
  @ViewChild('discountedProductsSection') discountedProductsSection!: ElementRef;
  @ViewChild('loyaltySection') loyaltySection!: ElementRef;
  @ViewChild('blogsSection') blogsSection!: ElementRef;
  featuredBlogs: Blog[] = [];
  discountedProducts: Product[] = [];
  newArrivals: Product[] = [];
  defaultImage = DefaultImageUrl;
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

  // responsibility
  screenSize: number = 0;

  constructor(
    private router: Router,
    private productService: ProductService
  ) { }

  ngOnInit() {
    this.checkScreenSize();
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

  @HostListener('window:resize', [])
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.screenSize = window.innerWidth;
    if (this.screenSize > 1400) {
      this.displayCount = 3;
    }
    if (this.screenSize <= 1400 && this.screenSize > 1000) {
      this.displayCount = 2;
    }

    if (this.screenSize <= 1000) {
      this.displayCount = 1;
    }
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

  /**
   * Navigates to product detail with selected price
   * @param product Product with category, ID and price info
   */
  navigateToProduct(product: DiscountedPrice) {
    this.router.navigate(
      ['/product/' + product.category + '/' + product.id],
      { queryParams: { selectedPrice: JSON.stringify(product.selectedPrice) } }
    );
  }

  // Scroll to the discounted products section element
  goToDiscountedProducts() {
    this.discountedProductsSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Scroll to the loyalty section element
  goToLoyalty() {
    this.loyaltySection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Scroll to the blogs section element
  goToBlogs() {
    this.blogsSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    const totalSlides = Math.ceil(totalItems / this.displayCount);
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
