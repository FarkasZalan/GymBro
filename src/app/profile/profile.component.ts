import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { UserNotificationService } from './user-notification.service';
import { User } from './user.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../auth/auth.service';
import { LoadingService } from '../loading-spinner/loading.service';

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
  isCollapsedProfileDetails = true;
  isCollapsedOrders = false;
  isCollapsedShippingAddress = true;
  isCollapsedPayemenetMethods = true;
  isCollapsedLoyaltyProgram = true;
  numberOfNewOrders: number = 0;

  currentUser: User;

  constructor(
    private userService: UserService,
    private userNotificationService: UserNotificationService,
    public loadingService: LoadingService,
    private auth: AngularFireAuth,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadingService.withLoading(async () => {
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

    if (!this.isCollapsedProfileDetails) {
      this.isCollapsedOrders = true;
      this.isCollapsedShippingAddress = true;
      this.isCollapsedPayemenetMethods = true;
      this.isCollapsedLoyaltyProgram = true;
    }
  }

  toggleCollapsedOrders() {
    this.isCollapsedOrders = !this.isCollapsedOrders;

    if (!this.isCollapsedOrders) {
      this.isCollapsedProfileDetails = true;
      this.isCollapsedShippingAddress = true;
      this.isCollapsedPayemenetMethods = true;
      this.isCollapsedLoyaltyProgram = true;
    }
  }

  toggleCollapsedShippingAddress() {
    this.isCollapsedShippingAddress = !this.isCollapsedShippingAddress;

    if (!this.isCollapsedShippingAddress) {
      this.isCollapsedOrders = true;
      this.isCollapsedProfileDetails = true;
      this.isCollapsedPayemenetMethods = true;
      this.isCollapsedLoyaltyProgram = true;
    }
  }

  toggleCollapsedPayemenetMethods() {
    this.isCollapsedPayemenetMethods = !this.isCollapsedPayemenetMethods;

    if (!this.isCollapsedPayemenetMethods) {
      this.isCollapsedOrders = true;
      this.isCollapsedShippingAddress = true;
      this.isCollapsedProfileDetails = true;
      this.isCollapsedLoyaltyProgram = true;
    }
  }

  toggleCollapsedLoyaltyProgram() {
    this.isCollapsedLoyaltyProgram = !this.isCollapsedLoyaltyProgram;

    if (!this.isCollapsedLoyaltyProgram) {
      this.isCollapsedOrders = true;
      this.isCollapsedShippingAddress = true;
      this.isCollapsedPayemenetMethods = true;
      this.isCollapsedProfileDetails = true;
    }
  }
}
