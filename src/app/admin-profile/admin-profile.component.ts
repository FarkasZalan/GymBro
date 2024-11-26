import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { AdminService } from './admin.service';

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
export class AdminProfileComponent implements OnInit {
  isCollapsedProfileDetails = true;
  isCollapsedItemsDetails = false;
  isCollapsedBlogDetails = true;
  isCollapsedOrders = true;

  // number of the unchecked reviews
  uncheckedReviewsCount: number = 0;

  // number of the new orders
  numberOfNewOrders: number = 0;

  constructor(private adminService: AdminService) { }

  async ngOnInit(): Promise<void> {
    this.uncheckedReviewsCount = await this.adminService.getAllReviewsCount();

    (await this.adminService.getAllNewOrders()).subscribe(newOrders => {
      this.numberOfNewOrders = newOrders.length;
    });
  }

  toggleCollapsedProfilDetails() {
    this.isCollapsedProfileDetails = !this.isCollapsedProfileDetails;

    if (!this.isCollapsedProfileDetails) {
      this.isCollapsedOrders = true;
      this.isCollapsedItemsDetails = true;
      this.isCollapsedBlogDetails = true;
    }
  }

  toggleCollapsedItemDetails() {
    this.isCollapsedItemsDetails = !this.isCollapsedItemsDetails;

    if (!this.isCollapsedItemsDetails) {
      this.isCollapsedOrders = true;
      this.isCollapsedProfileDetails = true;
      this.isCollapsedBlogDetails = true;
    }
  }

  toggleCollapsedBlogDetails() {
    this.isCollapsedBlogDetails = !this.isCollapsedBlogDetails;

    if (!this.isCollapsedBlogDetails) {
      this.isCollapsedOrders = true;
      this.isCollapsedItemsDetails = true;
      this.isCollapsedProfileDetails = true;
    }
  }

  toggleCollapsedOrders() {
    this.isCollapsedOrders = !this.isCollapsedOrders;

    if (!this.isCollapsedOrders) {
      this.isCollapsedProfileDetails = true;
      this.isCollapsedItemsDetails = true;
      this.isCollapsedBlogDetails = true;
    }
  }

  openItemsPanel() {
    this.isCollapsedItemsDetails = false;
    this.isCollapsedOrders = true;
    this.isCollapsedProfileDetails = true;
    this.isCollapsedBlogDetails = true;
  }
}
