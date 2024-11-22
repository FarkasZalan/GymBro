import { Component, OnInit } from '@angular/core';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../profile/user.model';
import { AuthService } from '../auth/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-loyalty-program',
  templateUrl: './loyalty-program.component.html',
  styleUrls: ['./loyalty-program.component.scss']
})
export class LoyaltyProgramComponent implements OnInit {
  currentPoints: number = 0;
  pointsEarnedThisMonth: number = 0;
  rewardsRedeemed: number = 0;

  availableRewards = [
    {
      id: 'discount10',
      nameKey: 'loyaltyProgram.rewards.discount10.title',
      descriptionKey: 'loyaltyProgram.rewards.discount10.description',
      pointsRequired: 300,
      icon: 'percent-outline'
    },
    {
      id: 'discount20',
      nameKey: 'loyaltyProgram.rewards.discount20.title',
      descriptionKey: 'loyaltyProgram.rewards.discount20.description',
      pointsRequired: 600,
      icon: 'percent-outline'
    },
    {
      id: 'discount30',
      nameKey: 'loyaltyProgram.rewards.discount30.title',
      descriptionKey: 'loyaltyProgram.rewards.discount30.description',
      pointsRequired: 700,
      icon: 'percent-outline'
    },
    {
      id: 'freeShipping',
      nameKey: 'loyaltyProgram.rewards.freeShipping.title',
      descriptionKey: 'loyaltyProgram.rewards.freeShipping.description',
      pointsRequired: 850,
      icon: 'car-outline'
    },
    {
      id: 'giftCard',
      nameKey: 'loyaltyProgram.rewards.giftCard.title',
      descriptionKey: 'loyaltyProgram.rewards.giftCard.description',
      pointsRequired: 1500,
      icon: 'gift-outline'
    }
  ];

  userLoggedIn: boolean = false;
  currentUser: User | undefined;
  currentUserId: string = "";

  constructor(
    private auth: AngularFireAuth,
    private authService: AuthService,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    // check if user logged in for reviews
    this.auth.authState.subscribe((userAuth) => {
      if (userAuth) {
        this.userLoggedIn = true;
        this.authService.getCurrentUser(userAuth.uid).subscribe((currentUser: User) => {
          this.currentUser = currentUser;
          this.currentUserId = currentUser.id;
          this.currentPoints = currentUser.loyaltyPoints || 0;

          if (this.currentUser === undefined) {
            this.userLoggedIn = false; // User is logged out
          }
        });
      } else {
        this.userLoggedIn = false; // User is logged out
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/auth/register']);
  }

  back() {
    this.location.back();
  }

  async redeemReward(reward: any) {

  }
}
