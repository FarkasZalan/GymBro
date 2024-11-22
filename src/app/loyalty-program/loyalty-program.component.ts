import { Component, OnInit } from '@angular/core';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-loyalty-program',
  templateUrl: './loyalty-program.component.html',
  styleUrls: ['./loyalty-program.component.scss']
})
export class LoyaltyProgramComponent {
  currentPoints: number = 750;
  pointsEarnedThisMonth: number = 150;
  rewardsRedeemed: number = 2;

  availableRewards = [
    {
      id: 'discount10',
      nameKey: 'loyaltyProgram.rewards.discount10.title',
      descriptionKey: 'loyaltyProgram.rewards.discount10.description',
      pointsRequired: 500,
      icon: 'percent-outline'
    },
    {
      id: 'freeShipping',
      nameKey: 'loyaltyProgram.rewards.freeShipping.title',
      descriptionKey: 'loyaltyProgram.rewards.freeShipping.description',
      pointsRequired: 750,
      icon: 'car-outline'
    },
    {
      id: 'vipStatus',
      nameKey: 'loyaltyProgram.rewards.vipStatus.title',
      descriptionKey: 'loyaltyProgram.rewards.vipStatus.description',
      pointsRequired: 1000,
      icon: 'star-outline'
    },
    {
      id: 'giftCard',
      nameKey: 'loyaltyProgram.rewards.giftCard.title',
      descriptionKey: 'loyaltyProgram.rewards.giftCard.description',
      pointsRequired: 1500,
      icon: 'gift-outline'
    }
  ];

  constructor(
    private dialogService: NbDialogService,
    private toastrService: NbToastrService,
    private translateService: TranslateService
  ) { }

  async redeemReward(reward: any) {

  }
}
