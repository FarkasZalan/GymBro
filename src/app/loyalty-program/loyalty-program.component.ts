import { Component, OnInit } from '@angular/core';
import { User } from '../profile/user.model';
import { AuthService } from '../auth/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Reward } from './reward.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { RewardText } from './reward-text';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-loyalty-program',
  templateUrl: './loyalty-program.component.html',
  styleUrls: ['./loyalty-program.component.scss']
})
export class LoyaltyProgramComponent implements OnInit {
  currentPoints: number = 0;
  pointsThisMonth: number = 0;

  availableRewards: Reward[] = [
    {
      id: RewardText.Discount10Id,
      name: RewardText.Discount10Title,
      description: RewardText.Discount10Description,
      pointsRequired: 300,
      icon: 'percent-outline'
    },
    {
      id: RewardText.Discount20Id,
      name: RewardText.Discount20Title,
      description: RewardText.Discount20Description,
      pointsRequired: 600,
      icon: 'percent-outline'
    },
    {
      id: RewardText.Discount30Id,
      name: RewardText.Discount30Title,
      description: RewardText.Discount30Description,
      pointsRequired: 700,
      icon: 'percent-outline'
    },
    {
      id: RewardText.FreeShippingId,
      name: RewardText.FreeShippingTitle,
      description: RewardText.FreeShippingDescription,
      pointsRequired: 850,
      icon: 'car-outline'
    },
    {
      id: RewardText.FiveThousandHufDiscountId,
      name: RewardText.FiveThousandHufDiscountTitle,
      description: RewardText.FiveThousandHufDiscountDescription,
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
    private location: Location,
    private db: AngularFirestore,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.checkAuthStatus();
    this.calculatePointsThisMonth();
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

  isRewardAvailable(rewardId: string): boolean {
    if (rewardId === RewardText.Discount10Id) {
      return this.currentUser.loyaltyPoints >= 300;
    } else if (rewardId === RewardText.Discount20Id) {
      return this.currentUser.loyaltyPoints >= 600;
    } else if (rewardId === RewardText.Discount30Id) {
      return this.currentUser.loyaltyPoints >= 700;
    } else if (rewardId === RewardText.FreeShippingId) {
      return this.currentUser.loyaltyPoints >= 850;
    } else if (rewardId === RewardText.FiveThousandHufDiscountId) {
      return this.currentUser.loyaltyPoints >= 1500;
    }
    return false;
  }

  calculatePointsThisMonth() {
    // For demo purposes, showing random points between 0-100
    // Later calculate this from actual purchase history
    this.pointsThisMonth = Math.floor(Math.random() * 100);
  }

  getAvailableRewardsCount(): number {
    if (!this.currentUser) return 0;
    return this.availableRewards.filter(reward =>
      this.currentUser!.loyaltyPoints >= reward.pointsRequired
    ).length;
  }

  getNextRewardPoints(): number {
    if (!this.currentUser) return 0;
    const nextReward = this.availableRewards
      .filter(reward => !this.isRewardAvailable(reward.id))
      .sort((a, b) => a.pointsRequired - b.pointsRequired)
      .find(reward => reward.pointsRequired > (this.currentUser?.loyaltyPoints || 0));

    if (nextReward) {
      return nextReward.pointsRequired - (this.currentUser.loyaltyPoints || 0);
    }
    return 0;
  }
}
