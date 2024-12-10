import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProductReeviews } from '../../product-models/product-reviews.model';
import { ProductViewText } from '../../product-view-texts';
import { ProductService } from '../../../../products/product.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentHandlerService } from '../../../../document.handler.service';
import { FoodSupliment } from '../../product-models/food-supliment.model';
import { OrganicFood } from '../../product-models/organic-food.model';
import { Clothes } from '../../product-models/clothing.model';
import { Accessories } from '../../product-models/accessories.model';
import { Location } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DeleteConfirmationDialogComponent } from '../../../../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { DeleteConfirmationText } from '../../../../delete-confirmation-dialog/delete-text';
import { MatDialog } from '@angular/material/dialog';
import { ReviewHandleComponent } from '../../../../products/review-handle/review-handle.component';
import { AdminNotificationService } from '../../../admin-notification.service';
import { AdminService } from '../../../admin.service';
import { LoadingService } from '../../../../loading-spinner/loading.service';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-handle-reviews',
  templateUrl: './handle-reviews.component.html',
  styleUrl: '../../../../../styles/product-page-view.scss',
  animations: [
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ])
  ]
})
export class HandleReviewsComponent implements OnInit {
  @ViewChild('toScrollAfterNavigate') toScrollAfterNavigate: ElementRef;
  @ViewChild('reviewsSection') reviewsSection: ElementRef;
  // product details
  foodSuplimentObject: FoodSupliment;
  organicFoodObject: OrganicFood;
  clothObject: Clothes;
  accessoriObject: Accessories;
  productCategory: string = '';
  productId: string = '';

  selectedImage: string = '';
  allergens: string[] = [];
  productName: string = '';
  smallDescription: string = '';
  safeForConsumptionDuringPregnancy: boolean = false;
  safeForConsumptionDuringBreastfeeding: boolean = false;

  productViewText = ProductViewText;
  // reviews
  averageRating: number = 0;
  reviews: ProductReeviews[] = [];

  // pagination
  paginatedReviews: ProductReeviews[] = [];
  itemsPerPage = 6;
  currentPage = 1;

  userLoggedIn: boolean = false;
  reviewChecked: boolean = false;

  //filter
  selectedReviewFilter: string = ProductViewText.ORDER_BY_LATEST;
  availableReviewFilters: string[] = [
    ProductViewText.ORDER_BY_OLDEST,
    ProductViewText.ORDER_BY_LATEST,
    ProductViewText.ORDER_BY_WORST_RATING,
    ProductViewText.ORDER_BY_BEST_RATING
  ];

  constructor(private productService: ProductService,
    private route: ActivatedRoute,
    private db: AngularFirestore,
    private documentHandler: DocumentHandlerService,
    private router: Router,
    private dialog: MatDialog,
    private location: Location,
    private adminService: AdminService,
    private adminNotificationService: AdminNotificationService,
    public loadingService: LoadingService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.productCategory = params['productCategory'];
      if (this.productCategory === ProductViewText.FOOD_SUPLIMENTS) {
        // get the product by id
        this.documentHandler.getInnerDocumentByID("products", this.productCategory, "allProduct", params['productId']).subscribe(async (foodSupliment: FoodSupliment) => {
          // make a copy from the object
          this.foodSuplimentObject = { ...foodSupliment };
          this.productName = this.foodSuplimentObject.productName;
          this.productId = this.foodSuplimentObject.id;
          this.allergens = this.foodSuplimentObject.allergens;

          this.selectedImage = this.getDefaultPrice(this.foodSuplimentObject).productImage;
          this.smallDescription = this.foodSuplimentObject.smallDescription;
          this.safeForConsumptionDuringPregnancy = this.foodSuplimentObject.safeForConsumptionDuringPregnancy;
          this.safeForConsumptionDuringBreastfeeding = this.foodSuplimentObject.safeForConsumptionDuringBreastfeeding;
          this.getReviews();
        });
      } else if (this.productCategory === ProductViewText.ORGANIC_FOOD) {
        // get the product by id
        this.documentHandler.getInnerDocumentByID("products", this.productCategory, "allProduct", params['productId']).subscribe(async (organicFood: OrganicFood) => {
          // make a copy from the object
          this.organicFoodObject = { ...organicFood };
          this.productName = this.organicFoodObject.productName;
          this.productId = this.organicFoodObject.id;
          this.allergens = this.organicFoodObject.allergens;
          this.selectedImage = this.getDefaultPrice(this.organicFoodObject).productImage;
          this.smallDescription = this.organicFoodObject.smallDescription;
          this.safeForConsumptionDuringPregnancy = this.organicFoodObject.safeForConsumptionDuringPregnancy;
          this.safeForConsumptionDuringBreastfeeding = this.organicFoodObject.safeForConsumptionDuringBreastfeeding;
          this.getReviews();
        });
      } else if (this.productCategory === ProductViewText.CLOTHES) {
        // get the product by id
        this.documentHandler.getInnerDocumentByID("products", this.productCategory, "allProduct", params['productId']).subscribe(async (cloth: Clothes) => {
          // make a copy from the object
          this.clothObject = { ...cloth };
          this.productName = this.clothObject.productName;
          this.smallDescription = this.clothObject.smallDescription;
          this.productId = this.clothObject.id;
          this.selectedImage = this.getDefaultPrice(this.clothObject).productImage;
          //this.smallDescription = this.clothObject.smallDescription;
          this.getReviews();
        });
      } else if (this.productCategory === ProductViewText.ACCESSORIES) {
        // get the product by id
        this.documentHandler.getInnerDocumentByID("products", this.productCategory, "allProduct", params['productId']).subscribe(async (accessories: Accessories) => {
          // make a copy from the object
          this.accessoriObject = { ...accessories };
          this.productName = this.accessoriObject.productName;
          this.smallDescription = this.accessoriObject.smallDescription;
          this.productId = this.accessoriObject.id;
          this.selectedImage = this.getDefaultPrice(this.accessoriObject).productImage;
          //this.smallDescription = this.accessoriObject.smallDescription;
          this.getReviews();
        });
      }
    });
  }

  // Function to mark a review as checked
  async markReviewAsChecked(review: ProductReeviews) {
    await this.loadingService.withLoading(async () => {
      if (!review.checkedByAdmin || review.reviewEdited) {
        await this.db
          .collection('reviews')
          .doc(this.productCategory)
          .collection('allReview')
          .doc(review.id)
          .update({
            checkedByAdmin: true,
            reviewEdited: false
          });

        // Update the notification count
        const newCount = await this.adminService.getAllReviewsCount();
        this.adminNotificationService.updateReviewsCount(newCount);
      }
    });
  }

  // Method to get the default price for a the products
  getDefaultPrice(product) {
    return product.prices.find(price => price.setAsDefaultPrice);
  }

  goToReviews() {
    // Scroll to the reviews section element
    this.reviewsSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  filterRating() {
    if (this.selectedReviewFilter === ProductViewText.ORDER_BY_BEST_RATING) {
      this.reviews = this.reviews.sort((a, b) => b.rating - a.rating);
    } else if (this.selectedReviewFilter === ProductViewText.ORDER_BY_WORST_RATING) {
      this.reviews = this.reviews.sort((a, b) => a.rating - b.rating);
    } else if (this.selectedReviewFilter === ProductViewText.ORDER_BY_LATEST) {
      this.reviews = this.reviews.sort((a, b) => {
        const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
        const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
        return dateB.getTime() - dateA.getTime(); // Sort in descending order
      });
    } else if (this.selectedReviewFilter === ProductViewText.ORDER_BY_OLDEST) {
      this.reviews = this.reviews.sort((a, b) => {
        const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
        const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
        return dateA.getTime() - dateB.getTime(); // Sort in descending order
      });
    }
    this.currentPage = 1;
    this.updatePaginatedList();
  }

  getReviews() {
    this.productService.getReviewsForProduct(this.productId, this.productCategory).subscribe(reviews => {
      this.reviews = reviews;
      this.updatePaginatedList();
      this.selectedReviewFilter = ProductViewText.ORDER_BY_LATEST;
      this.calculateAverageRating();
      this.filterRating();
    })
  }

  // navigation for the pagination
  updatePaginatedList(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedReviews = this.reviews.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.toScrollAfterNavigate.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.updatePaginatedList();
  }

  getTotalPages(): number {
    return Math.ceil(this.reviews.length / this.itemsPerPage);
  }

  calculateAverageRating(): void {
    this.averageRating = 0;
    if (this.reviews.length > 0) {
      this.reviews.forEach(number => {
        this.averageRating += number.rating
      });
      this.averageRating = this.averageRating / this.reviews.length;
      this.averageRating = Math.round(this.averageRating * 100) / 100;
    } else {
      this.averageRating = 1;
    }
  }

  getRatingCount(star: number): number {
    return this.reviews.filter(review => review.rating === star).length;
  }

  getRatingPercentage(star: number): number {
    return (this.getRatingCount(star) / this.reviews.length) * 100;
  }

  gotoProductPage() {
    this.router.navigate(['product/' + this.productCategory + '/' + this.productId])
  }

  async removeReview(review: ProductReeviews) {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        text: DeleteConfirmationText.REVIEW_DELETE_ADMIN
      }
    });

    const confirmToDelete = await dialogRef.afterClosed().toPromise();

    if (confirmToDelete) {
      await this.loadingService.withLoading(async () => {
        try {
          // Delete the review
          await this.db
            .collection('reviews')
            .doc(this.productCategory)
            .collection('allReview')
            .doc(review.id)
            .delete();

          // Update the reviews list
          this.getReviews();
        } catch (error) { }
      });
    }
  }

  showCreateRespondToReviewSection(review: ProductReeviews) {
    this.dialog.open(ReviewHandleComponent, {
      data: {
        userId: review.userId,
        edit: true,
        responseEdit: false,
        productId: review.productId,
        userFirstName: review.userFirstName,
        userLastName: review.userLastName,
        pageFrom: ProductViewText.ADMIN_REVIEW,
        category: this.productCategory,
        review: review
      }
    });
  }

  showEditRespondToReviewSection(review: ProductReeviews) {
    this.dialog.open(ReviewHandleComponent, {
      data: {
        userId: review.userId,
        edit: true,
        responseEdit: true,
        productId: review.productId,
        userFirstName: review.userFirstName,
        userLastName: review.userLastName,
        pageFrom: ProductViewText.ADMIN_REVIEW,
        category: this.productCategory,
        review: review
      }
    });
  }

  back() {
    this.location.back();
    this.router.navigate(['admin-profile']);
  }
}
