import { Component } from '@angular/core';
import { ProductViewText } from '../../admin-profile/product-management/product-view-texts';
import { AppComponent } from '../../app.component';
import { User } from '../../profile/user.model';
import { AuthService } from '../../auth/auth.service';
import { UserNotificationService } from '../../profile/user-notification.service';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialog } from '@angular/material/dialog';
import { LogOutComponent } from '../../auth/log-out/log-out.component';
import { AdminService } from '../../admin-profile/admin.service';
import { UserService } from '../../profile/user.service';
import { AdminNotificationService } from '../../admin-profile/admin-notification.service';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { trigger, transition, style, animate, state } from '@angular/animations';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  animations: [
    trigger('collapseField', [
      state('void', style({
        height: '0px', // Initially collapsed
        overflow: 'hidden'
      })),
      state('*', style({
        height: '*', // Expands to the full height of the content
        overflow: 'hidden'
      })),
      transition('void => *', [
        animate('250ms ease-out') // Expands smoothly
      ]),
      transition('* => void', [
        animate('250ms ease-in') // Collapses smoothly
      ])
    ]),
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ])
  ]
})
export class SidebarComponent {
  language: string = ''; // Default language
  languageSwithButtonText: string = ''; // Initial button text

  sidebarOpen: boolean = false;

  user: User; // Store user details
  userLoggedIn: boolean = false; // Check if the user is logged in
  profileOptionsOpen: boolean = false;
  userFirstName: string = '';

  pageLinks = [
    {
      name: 'menu.foodSuplimentsMenu.foodSupliments',
      icon: 'flash-outline',
      route: '/product/' + ProductViewText.FOOD_SUPLIMENTS
    },
    {
      name: 'menu.organicFoodMenu.organicFood',
      icon: 'heart-outline',
      route: '/product/' + ProductViewText.ORGANIC_FOOD
    },
    {
      name: 'menu.clothingMenu.clothing',
      icon: 'pricetags-outline',
      route: '/product/' + ProductViewText.CLOTHES
    },
    {
      name: 'menu.accessoriesMenu.accessories',
      icon: 'shield-outline',
      route: '/product/' + ProductViewText.ACCESSORIES
    },
    {
      name: 'menu.blog',
      icon: 'book-outline',
      route: '/blog'
    }
  ];

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

  constructor(
    private appComponent: AppComponent,
    private auth: AngularFireAuth,
    private authService: AuthService,
    private userNotificationService: UserNotificationService,
    private router: Router,
    private dialog: MatDialog,
    private adminService: AdminService,
    private adminNotificationService: AdminNotificationService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    // Check if the user is logged in and fetch user details
    this.auth.authState.subscribe(userAuth => {
      if (userAuth) {
        this.userLoggedIn = true;
        this.authService.getCurrentUser(userAuth.uid).subscribe((user: User) => {
          this.user = user;
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
        this.userLoggedIn = false;
      }
    });

    // Set default language
    this.language = this.appComponent.getBrowserLanguage();
    this.languageSwithButtonText = this.language === 'en' ? 'hu' : 'en';
  }

  toggleProfileOptions() {
    this.profileOptionsOpen = !this.profileOptionsOpen;
    this.showNotificationPanel = false;
  }

  navigateToProfile() {
    this.profileOptionsOpen = false; // Close dropdown
    if (this.userLoggedIn && !this.user.isAdmin) {
      this.router.navigate(['profile']);
    } else if (this.userLoggedIn && this.user.isAdmin) {
      this.router.navigate(['admin-profile']);
    }
    else {
      this.router.navigate(['/auth']);
    }
    this.closeSidebar();
  }

  // Open logout confirmation dialog
  logOut() {
    this.profileOptionsOpen = false; // Close dropdown
    // Check if there's already an open dialog
    if (this.dialog.openDialogs.length > 0) {
      this.dialog.closeAll();
    }

    // Open the logout confirmation dialog
    const dialogRef = this.dialog.open(LogOutComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.closeSidebar();
      }
    });
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
    * Navigation methods for admin notifications
    */
  navigateToAdminProfileToOrders() {
    this.router.navigate(['/admin-profile'], { queryParams: { openOrders: 'true' } });
    this.closeSidebar();
  }

  navigateToAdminProfileToReviews() {
    this.router.navigate(['/admin-profile'], { queryParams: { openOrders: 'false' } });
    this.closeSidebar();
  }

  // Navigation method for user notifications
  navigateToBasicUserToOrders() {
    this.router.navigate(['/profile'], { queryParams: { openOrders: 'true' } });
    this.closeSidebar();
  }

  /**
 * Toggles visibility of notification panel
 */
  toggleNotificationPanel() {
    this.showNotificationPanel = !this.showNotificationPanel;
    this.profileOptionsOpen = false;
  }

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

  // Toggle Sidebar visibility
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.profileOptionsOpen = false;
    this.showNotificationPanel = false;

    // Slight delay to ensure the sidebar closes before navigation
    setTimeout(() => {
    }, 300); // Time to close the sidebar
  }

  // Method to close the sidebar when a link is clicked
  closeSidebar() {
    this.sidebarOpen = false;
    this.profileOptionsOpen = false;
    this.showNotificationPanel = false;

    // Slight delay to ensure the sidebar closes before navigation
    setTimeout(() => {
    }, 300); // Time to close the sidebar
  }
}
