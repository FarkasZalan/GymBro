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
      name: this.translate.instant('menu.foodSuplimentsMenu.foodSupliments'),
      icon: 'flash-outline',
      route: '/product/' + ProductViewText.FOOD_SUPLIMENTS,
      image: '../../../assets/images/food-supliments-image.jpg'
    },
    {
      name: this.translate.instant('menu.organicFoodMenu.organicFood'),
      icon: 'heart-outline',
      route: '/product/' + ProductViewText.ORGANIC_FOOD,
      image: '../../../assets/images/healthy-food-image.jpg'
    },
    {
      name: this.translate.instant('menu.clothingMenu.clothing'),
      icon: 'pricetags-outline',
      route: '/product/' + ProductViewText.CLOTHES,
      image: '../../../assets/images/clothing-image.jpg'
    },
    {
      name: this.translate.instant('menu.accessoriesMenu.accessories'),
      icon: 'shield-outline',
      route: '/product/' + ProductViewText.ACCESSORIES,
      image: '../../../assets/images/gym-accessories-image.jpg'
    }
  ];

  promoEndTime: Date = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  timeLeft: any = { days: 0, hours: 0, minutes: 0, seconds: 0 };

  private autoSlideSubscription?: Subscription;
  currentIndexDiscounted = 0;
  currentIndexNewArrivals = 0;
  currentIndexBlogs = 0;
  displayCount = 3; // Number of items to show at once
  slideInterval = 6000; // Time between slides in milliseconds

  private autoSlideTimer?: any;

  constructor(
    private router: Router,
    private productService: ProductService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    // Get featured blogs
    this.productService.getLatestBlogs(6).subscribe((blogs: Blog[]) => {
      this.featuredBlogs = blogs;
    });

    // Get discounted products
    this.productService.getDiscountedProducts(6).subscribe((products: Product[]) => {
      this.discountedProducts = products;
      console.log(this.discountedProducts);
    });

    // Get new arrivals
    this.productService.getNewArrivals(6).subscribe((products: Product[]) => {
      this.newArrivals = products;
    });

    this.startCountdown();

    // Start the auto-sliding after getting the data
    this.startAutoSlide();
  }

  ngOnDestroy() {
    if (this.autoSlideSubscription) {
      this.autoSlideSubscription.unsubscribe();
    }
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
    }
  }

  navigateToCategory(route: string) {
    this.router.navigate([route]);
  }

  navigateToBlog(blogId: string) {
    this.router.navigate(['/blog/blog-view/', blogId]);
  }

  navigateToShop() {
    this.router.navigate(['/products']);
  }

  navigateToLoyalty() {
    this.router.navigate(['/product/loyaltyProgram']);
  }

  navigateToPromo() {
    this.router.navigate(['/products'], { queryParams: { promo: true } });
  }

  private startCountdown() {
    interval(1000)
      .pipe(takeWhile(() => new Date() < this.promoEndTime))
      .subscribe(() => {
        const now = new Date().getTime();
        const distance = this.promoEndTime.getTime() - now;

        this.timeLeft = {
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        };
      });
  }

  private startAutoSlide() {
    this.autoSlideTimer = setInterval(() => {
      if (this.discountedProducts.length > 0) {
        this.slideNext('discounted');
      }
      if (this.newArrivals.length > 0) {
        this.slideNext('newArrivals');
      }
      if (this.featuredBlogs.length > 0) {
        this.slideNext('blogs');
      }
    }, this.slideInterval);
  }

  slideNext(type: 'discounted' | 'newArrivals' | 'blogs') {
    this.resetAutoSlideTimer();
    const items = type === 'discounted' ? this.discountedProducts :
      type === 'newArrivals' ? this.newArrivals :
        this.featuredBlogs;

    if (!items.length) return;

    switch (type) {
      case 'discounted':
        this.currentIndexDiscounted = (this.currentIndexDiscounted + 1) % items.length;
        break;
      case 'newArrivals':
        this.currentIndexNewArrivals = (this.currentIndexNewArrivals + 1) % items.length;
        break;
      case 'blogs':
        this.currentIndexBlogs = (this.currentIndexBlogs + 1) % items.length;
        break;
    }
  }

  slidePrev(type: 'discounted' | 'newArrivals' | 'blogs') {
    this.resetAutoSlideTimer();
    const items = type === 'discounted' ? this.discountedProducts :
      type === 'newArrivals' ? this.newArrivals :
        this.featuredBlogs;

    if (!items.length) return;

    switch (type) {
      case 'discounted':
        this.currentIndexDiscounted = (this.currentIndexDiscounted - 1 + items.length) % items.length;
        break;
      case 'newArrivals':
        this.currentIndexNewArrivals = (this.currentIndexNewArrivals - 1 + items.length) % items.length;
        break;
      case 'blogs':
        this.currentIndexBlogs = (this.currentIndexBlogs - 1 + items.length) % items.length;
        break;
    }
  }

  private resetAutoSlideTimer() {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
    }
    this.startAutoSlide();
  }
}
