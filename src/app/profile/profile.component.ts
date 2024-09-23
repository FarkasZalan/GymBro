import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  animations: [
    // fo the components
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
  isCollapsedShippingAddress = true;
  isCollapsedPayemenetMethods = true;
  isCollapsedLoyaltyProgram = true;

  toggleCollapsedProfilDetails() {
    this.isCollapsedProfileDetails = !this.isCollapsedProfileDetails;
  }

  toggleCollapsedShippingAddress() {
    this.isCollapsedShippingAddress = !this.isCollapsedShippingAddress;
  }

  toggleCollapsedPayemenetMethods() {
    this.isCollapsedPayemenetMethods = !this.isCollapsedPayemenetMethods;
  }

  toggleCollapsedLoyaltyProgram() {
    this.isCollapsedLoyaltyProgram = !this.isCollapsedLoyaltyProgram;
  }
}
