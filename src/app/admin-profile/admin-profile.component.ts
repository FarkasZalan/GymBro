import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
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
export class AdminProfileComponent {
  isCollapsedStatisticsDetails = false;
  isCollapsedProfileDetails = true;
  isCollapsedItemsDetails = true;
  isCollapsedBlogDetails = true;
  isCollapsedOrders = true;

  toggleCollapsedStatistics() {
    this.isCollapsedStatisticsDetails = !this.isCollapsedStatisticsDetails;

    if (!this.isCollapsedStatisticsDetails) {
      this.isCollapsedOrders = true;
      this.isCollapsedProfileDetails = true;
      this.isCollapsedItemsDetails = true;
      this.isCollapsedBlogDetails = true;
    }
  }

  toggleCollapsedProfilDetails() {
    this.isCollapsedProfileDetails = !this.isCollapsedProfileDetails;

    if (!this.isCollapsedProfileDetails) {
      this.isCollapsedOrders = true;
      this.isCollapsedStatisticsDetails = true;
      this.isCollapsedItemsDetails = true;
      this.isCollapsedBlogDetails = true;
    }
  }

  toggleCollapsedItemDetails() {
    this.isCollapsedItemsDetails = !this.isCollapsedItemsDetails;

    if (!this.isCollapsedItemsDetails) {
      this.isCollapsedOrders = true;
      this.isCollapsedStatisticsDetails = true;
      this.isCollapsedProfileDetails = true;
      this.isCollapsedBlogDetails = true;
    }
  }

  toggleCollapsedBlogDetails() {
    this.isCollapsedBlogDetails = !this.isCollapsedBlogDetails;

    if (!this.isCollapsedBlogDetails) {
      this.isCollapsedOrders = true;
      this.isCollapsedStatisticsDetails = true;
      this.isCollapsedItemsDetails = true;
      this.isCollapsedProfileDetails = true;
    }
  }

  toggleCollapsedOrders() {
    this.isCollapsedOrders = !this.isCollapsedOrders;

    if (!this.isCollapsedOrders) {
      this.isCollapsedProfileDetails = true;
      this.isCollapsedStatisticsDetails = true;
      this.isCollapsedItemsDetails = true;
      this.isCollapsedBlogDetails = true;
    }
  }
}
