import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { NbMenuService, NbSidebarService } from '@nebular/theme';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../profile/user.model';
import { filter, tap, map, combineLatest } from 'rxjs';
import { LogOutComponent } from '../../auth/log-out/log-out.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from '../../app.component';
import { Product } from '../../admin-profile/product-management/product-models/product.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ProductViewText } from '../../admin-profile/product-management/product-view-texts';
import { FoodSupliment } from '../../admin-profile/product-management/product-models/food-supliment.model';
import { CartService } from '../../cart/cart.service';
import { CartNotificationService } from '../../cart/cart-notification.service';
import { trigger, style, animate, transition, keyframes } from '@angular/animations';
import { ProductReeviews } from '../../admin-profile/product-management/product-models/product-reviews.model';
import { ProductService } from '../../products/product.service';
import { AdminService } from '../../admin-profile/admin.service';
import { AdminNotificationService } from '../../admin-profile/admin-notification.service';
import { UserService } from '../../profile/user.service';
import { UserNotificationService } from '../../profile/user-notification.service';
import { LoadingService } from '../../loading-spinner/loading.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({
          transform: 'translateY(20px)',
          opacity: 0
        }),
        animate('300ms ease-out', style({
          transform: 'translateY(0)',
          opacity: 1
        }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({
          transform: 'translateY(20px)',
          opacity: 0
        }))
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef;
  userLoggedIn: boolean = false;
  userMenu = [];
  user: User;
  userFirstName: string = "";
  language: string = "";
  languageSwithButtonText: string = "";

  searchExpanded: boolean = false;
  searcForProductText: string = '';
  searchResults: Product[] = []; // Store search results
  // Map to store reviews for products
  productReviews: Map<string, ProductReeviews[]> = new Map();

  // Observable for cart notifications, transforms cart items into total count
  cartCount$ = this.cartService.cartItems$.pipe(
    map(items => items.reduce((count, item) => count + item.quantity, 0))
  );

  // Observable for cart notifications (add/remove items)
  cartNotification$ = this.cartNotificationService.notification$;

  // Admin notification observables for new orders and reviews
  newOrdersCount$ = this.adminNotificationService.ordersCount$;
  newReviewsCount$ = this.adminNotificationService.reviewsCount$;

  // Combines admin notifications into a single total count
  adminNotificationCount$ = combineLatest([
    this.newOrdersCount$,
    this.newReviewsCount$
  ]).pipe(
    map(([orders, reviews]) => orders + reviews)
  );

  // Controls visibility of notification panel
  showNotificationPanel: boolean = false;

  // Observable for user's order notifications
  userOrdersCount$ = this.userNotificationService.ordersCount$;

  constructor(private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private db: AngularFirestore,
    private router: Router,
    private auth: AngularFireAuth,
    private authService: AuthService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private appComponent: AppComponent,
    private cartService: CartService,
    private productService: ProductService,
    private cartNotificationService: CartNotificationService,
    private adminService: AdminService,
    private adminNotificationService: AdminNotificationService,
    private userService: UserService,
    private userNotificationService: UserNotificationService,
    public loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    // Wrap the auth state subscription in loadingService
    this.loadingService.withLoading(async () => {
      this.auth.authState.subscribe((userAuth) => {
        if (userAuth) {
          this.userLoggedIn = true;
          this.authService.getCurrentUser(userAuth.uid).subscribe((currentUser: User) => {
            this.user = currentUser;
            this.userFirstName = this.user.firstName;
            if (this.user === undefined) {
              this.authService.logOut();
              this.userLoggedIn = false; // User is logged out
            } else if (this.user.isAdmin) {
              this.checkAdminNotifications();
            } else {
              this.checkUserNotifications();
            }
          });
        } else {
          this.userLoggedIn = false; // User is logged out
        }
      });
    });

    // Get the current language
    this.language = this.appComponent.getBrowserLanguage();
    if (this.language === 'en') {
      this.languageSwithButtonText = 'hu';
    } else {
      this.languageSwithButtonText = 'en';
    }

    // Translate userMenu items
    this.translate.onLangChange.subscribe(() => {
      //this method call when the languaage is changed
      this.translateMenu();
    });
    //this is for the first time when we need to load in the items based on the default language
    this.translateMenu();

    // Handle menu item clicks
    this.menuService.onItemClick()
      .pipe(
        //the 'header-menu' tag is for the html to the nbContextMenuTag, this is a click listener for this menu
        filter(({ tag }) => tag === 'header-menu'),
        tap(({ item }) => {
          if (item.title === this.translate.instant('header.logOut')) {
            this.logOut();
          } else {
            if (this.user.isAdmin) {
              this.router.navigate(['admin-profile']);
            } else {
              this.router.navigate(['profile']);
            }
          }
        })
      ).subscribe()
  }

  translateMenu() {
    this.userMenu = [
      { title: this.translate.instant('header.profile') },
      { title: this.translate.instant('header.logOut') }
    ];
  }

  // Toggle between languages
  switchLanguage() {
    if (this.language === 'en') {
      this.language = 'hu';
      this.languageSwithButtonText = 'en';
    } else {
      this.language = 'en';
      this.languageSwithButtonText = 'hu';
    }

    this.appComponent.switchLanguage(this.language);
  }

  // Toggle the sidebar visibility
  sidebarOpen: boolean = false;

  // Toggle Sidebar visibility
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  openSearch() {
    this.searchExpanded = true;

    this.searchInput.nativeElement.focus();
  }

  // Search Function
  onSearchChange() {
    const searchText = this.searcForProductText.toLowerCase();

    if (searchText) {
      const categories = [ProductViewText.FOOD_SUPLIMENTS, ProductViewText.ORGANIC_FOOD, ProductViewText.CLOTHES, ProductViewText.ACCESSORIES];
      this.searchResults = []; // Clear previous results

      // Iterate through each category and fetch all products once
      categories.forEach(category => {
        this.db.collection('products').doc(category).collection('allProduct').valueChanges().subscribe((results: Product[]) => {
          const filteredResults = results.filter(product =>
            product.productName.toLowerCase().includes(searchText)
          );

          // Add filtered results and fetch reviews for each product
          filteredResults.forEach(product => {
            this.productService.getReviewsForProduct(product.id, category)
              .subscribe(reviews => {
                this.productReviews.set(product.id, reviews);
              });
          });

          this.searchResults.push(...filteredResults.map(product => ({
            ...product,
            category
          })));
        });
      });
    } else {
      this.searchResults = []; // Clear results if search is empty
      this.productReviews.clear();
    }
  }

  closeSearch() {
    this.searchExpanded = false;
    this.searcForProductText = '';
    this.searchResults = []; // Clear results on close
  }

  // Method to get the default price for a the products
  getDefaultPrice(foodSupliment: FoodSupliment) {
    return foodSupliment.prices.find(price => price.setAsDefaultPrice);
  }

  // Method to get the reviews for the product
  getProductReviews(productId: string): ProductReeviews[] {
    return this.productReviews.get(productId) || [];
  }

  // Method to get the average rating for the product
  getAverageRating(productId: string): number {
    const reviews = this.getProductReviews(productId);
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / reviews.length;
    return Math.round(average * 100) / 100;
  }

  onProductSelected(selectedProduct: Product) {
    this.closeSearch();
    this.router.navigate(['product/' + selectedProduct.category + '/' + selectedProduct.id])
  }

  //click to logo and then navigate home
  navigateHome() {
    this.router.navigate(['/home']);
  }

  //go to login
  navigateToLogin() {
    this.router.navigate(['/auth']);
  }

  // Open logout confirmation dialog
  logOut() {
    // Check if there's already an open dialog
    if (this.dialog.openDialogs.length > 0) {
      this.dialog.closeAll();
    }

    // Open the logout confirmation dialog
    const dialogRef = this.dialog.open(LogOutComponent);
  }

  // Navigate to cart page
  navigateToCart() {
    this.hideNotification();
    if (!this.cartService.isCartEmpty()) {
      this.router.navigate(['/cart']);
    } else {
      this.cartNotificationService.showEmptyCartNotification();
    }
  }

  hideNotification() {
    this.cartNotificationService.hideNotification();
  }

  /**
   * Checks and sets up admin notifications if user is an admin
   * Subscribes to new orders and unchecked reviews
   */
  private checkAdminNotifications() {
    if (this.user?.isAdmin) {
      // Subscribe to new orders count
      this.adminService.getAllNewOrders().then(async ordersObservable => {
        ordersObservable.subscribe(newOrders => {
          this.adminNotificationService.updateOrdersCount(newOrders.length);
        });
      });

      // Subscribe to unchecked reviews count
      this.adminService.watchUncheckedReviews().subscribe(count => {
        this.adminNotificationService.updateReviewsCount(count);
      });
    }
  }

  /**
   * Checks and sets up user notifications for regular users
   * Subscribes to user's new orders
   */
  private checkUserNotifications() {
    if (this.userLoggedIn && !this.user?.isAdmin) {
      this.userService.getAllNewOrdersForUser(this.user.id).then(async ordersObservable => {
        ordersObservable.subscribe(newOrders => {
          this.userNotificationService.updateOrdersCount(newOrders.length);
        });
      });
    }
  }

  /**
   * Toggles visibility of notification panel
   */
  toggleNotificationPanel() {
    this.showNotificationPanel = !this.showNotificationPanel;
  }

  /**
   * Navigation methods for admin notifications
   */
  navigateToAdminProfileToOrders() {
    this.router.navigate(['/admin-profile'], { queryParams: { openOrders: 'true' } });
  }

  navigateToAdminProfileToReviews() {
    this.router.navigate(['/admin-profile'], { queryParams: { openOrders: 'false' } });
  }

  // Navigation method for user notifications
  navigateToBasicUserToOrders() {
    this.router.navigate(['/profile'], { queryParams: { openOrders: 'true' } });
  }

  // Method to hide the notification panel when it loses focus
  onPanelBlur() {
    this.showNotificationPanel = false;
  }
}
