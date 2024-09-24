import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
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
export class ProfileComponent {
  isCollapsedProfileDetails = false;
  isCollapsedOrders = true;
  isCollapsedShippingAddress = true;
  isCollapsedPayemenetMethods = true;
  isCollapsedLoyaltyProgram = true;

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
