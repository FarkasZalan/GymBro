import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AdminService } from './admin.service';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from '../loading-spinner/loading.service';

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
  // if open the cards scroll to the top of the card
  @ViewChild('orderCard') orderCard: ElementRef;
  @ViewChild('itemsCard') itemsCard: ElementRef;
  @ViewChild('blogCard') blogCard: ElementRef;
  @ViewChild('profileCard') profileCard: ElementRef;

  isCollapsedProfileDetails = true;
  isCollapsedItemsDetails = true;
  isCollapsedBlogDetails = true;
  isCollapsedOrders = false;

  // number of the unchecked reviews
  uncheckedReviewsCount: number = 0;

  // number of the new orders
  numberOfNewOrders: number = 0;

  constructor(private adminService: AdminService, private route: ActivatedRoute, public loadingService: LoadingService) { }

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(params => {
      if (params['openOrders'] === 'true') {
        this.isCollapsedOrders = false;
        this.isCollapsedItemsDetails = true;
      } else if (params['openOrders'] === 'false') {
        this.isCollapsedOrders = true;
        this.isCollapsedItemsDetails = false;
      }
    });

    await this.loadingService.withLoading(async () => {
      this.uncheckedReviewsCount = await this.adminService.getAllReviewsCount();
    });

    await this.loadingService.withLoading(async () => {
      (await this.adminService.getAllNewOrders()).subscribe(newOrders => {
        this.numberOfNewOrders = newOrders.length;
      });
    });
  }

  toggleCollapsedProfilDetails() {
    this.isCollapsedProfileDetails = !this.isCollapsedProfileDetails;

    if (this.isCollapsedProfileDetails) {
      this.profileCard.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (!this.isCollapsedProfileDetails) {
      this.isCollapsedOrders = true;
      this.isCollapsedItemsDetails = true;
      this.isCollapsedBlogDetails = true;
    }
  }

  toggleCollapsedItemDetails() {
    this.isCollapsedItemsDetails = !this.isCollapsedItemsDetails;

    if (this.isCollapsedItemsDetails) {
      this.itemsCard.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (!this.isCollapsedItemsDetails) {
      this.isCollapsedOrders = true;
      this.isCollapsedProfileDetails = true;
      this.isCollapsedBlogDetails = true;
    }
  }

  toggleCollapsedBlogDetails() {
    this.isCollapsedBlogDetails = !this.isCollapsedBlogDetails;

    if (this.isCollapsedBlogDetails) {
      this.blogCard.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (!this.isCollapsedBlogDetails) {
      this.isCollapsedOrders = true;
      this.isCollapsedItemsDetails = true;
      this.isCollapsedProfileDetails = true;
    }
  }

  toggleCollapsedOrders() {
    this.isCollapsedOrders = !this.isCollapsedOrders;

    if (this.isCollapsedOrders) {
      this.orderCard.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

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
