import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from './user.service';
import { UserNotificationService } from './user-notification.service';
import { User } from './user.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../auth/auth.service';
import { LoadingService } from '../loading-spinner/loading.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: '../../styles/profile.scss',
  animations: [
    // name of tha animation what can call in html
    trigger('collapseComponent', [
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
    ])
  ]
})
export class ProfileComponent implements OnInit {
  @ViewChild('profile') profile: ElementRef;
  @ViewChild('orders') orders: ElementRef;
  @ViewChild('shipping') shipping: ElementRef;
  @ViewChild('loyalty') loyalty: ElementRef;

  isCollapsedProfileDetails = false;
  isCollapsedOrders = true;
  isCollapsedShippingAddress = true;
  isCollapsedLoyaltyProgram = true;
  numberOfNewOrders: number = 0;

  currentUser: User;

  constructor(
    private userService: UserService,
    private userNotificationService: UserNotificationService,
    public loadingService: LoadingService,
    private auth: AngularFireAuth,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadingService.withLoading(async () => {
      this.route.queryParams.subscribe(params => {
        if (params['openOrders'] === 'true') {
          this.isCollapsedOrders = false;
          this.isCollapsedProfileDetails = true;
        } else if (params['openOrders'] === 'false') {
          this.isCollapsedOrders = true;
          this.isCollapsedProfileDetails = false;
        }
      });
      this.auth.authState.subscribe((userAuth) => {
        if (userAuth) {
          this.authService.getCurrentUser(userAuth.uid).subscribe((currentUser: User) => {
            this.currentUser = currentUser;
            if (this.currentUser === undefined) {
              this.authService.logOut();
            }

            // Get the number of new orders for the user
            this.userService.getAllNewOrdersForUser(this.currentUser.id).then(async ordersObservable => {
              ordersObservable.subscribe(newOrders => {
                this.numberOfNewOrders = newOrders.length;
                this.userNotificationService.updateOrdersCount(newOrders.length);
              });
            });
          });
        } else {
          this.currentUser = undefined; // User is logged out
        }
      });
    });
  }

  toggleCollapsedProfilDetails() {
    this.isCollapsedProfileDetails = !this.isCollapsedProfileDetails;

    if (!this.isCollapsedLoyaltyProgram) {
      this.loyalty.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (!this.isCollapsedOrders) {
      this.orders.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (!this.isCollapsedShippingAddress) {
      this.shipping.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (!this.isCollapsedProfileDetails) {
      this.isCollapsedOrders = true;
      this.isCollapsedShippingAddress = true;
      this.isCollapsedLoyaltyProgram = true;
    }
  }

  toggleCollapsedOrders() {
    this.isCollapsedOrders = !this.isCollapsedOrders;

    if (!this.isCollapsedLoyaltyProgram) {
      this.loyalty.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (!this.isCollapsedProfileDetails) {
      this.profile.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (!this.isCollapsedShippingAddress) {
      this.shipping.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (!this.isCollapsedOrders) {
      this.isCollapsedProfileDetails = true;
      this.isCollapsedShippingAddress = true;
      this.isCollapsedLoyaltyProgram = true;
    }
  }

  toggleCollapsedShippingAddress() {
    this.isCollapsedShippingAddress = !this.isCollapsedShippingAddress;

    if (!this.isCollapsedLoyaltyProgram) {
      this.loyalty.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (!this.isCollapsedOrders) {
      this.orders.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (!this.isCollapsedProfileDetails) {
      this.profile.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (!this.isCollapsedShippingAddress) {
      this.isCollapsedOrders = true;
      this.isCollapsedProfileDetails = true;
      this.isCollapsedLoyaltyProgram = true;
    }
  }

  toggleCollapsedLoyaltyProgram() {
    this.isCollapsedLoyaltyProgram = !this.isCollapsedLoyaltyProgram;

    if (!this.isCollapsedProfileDetails) {
      this.profile.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (!this.isCollapsedOrders) {
      this.orders.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (!this.isCollapsedShippingAddress) {
      this.shipping.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (!this.isCollapsedLoyaltyProgram) {
      this.isCollapsedOrders = true;
      this.isCollapsedShippingAddress = true;
      this.isCollapsedProfileDetails = true;
    }
  }
}
