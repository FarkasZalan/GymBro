import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProductReeviews } from '../../product-models/product-reviews.model';
import { ProductViewText } from '../../product-view-texts';
import { ProductService } from '../../../../products/product.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentHandlerService } from '../../../../document.handler.service';
import { FoodSupliment } from '../../product-models/food-supliment.model';
import { OrganicFood } from '../../product-models/organic-food';
import { Clothes } from '../../product-models/clothing.model';
import { Accessories } from '../../product-models/accessories.model';
import { Location } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DeleteConfirmationDialogComponent } from '../../../../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { DeleteConfirmationText } from '../../../../delete-confirmation-dialog/delete-text';
import { SuccessfullDialogComponent } from '../../../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../../../successfull-dialog/sucessfull-dialog-text';
import { MatDialog } from '@angular/material/dialog';
import { ReviewHandleComponent } from '../../../../products/review-handle/review-handle.component';

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
    private location: Location) { }

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
          this.getReviews();
        });
      } else if (this.productCategory === ProductViewText.CLOTHES) {
        // get the product by id
        this.documentHandler.getInnerDocumentByID("products", this.productCategory, "allProduct", params['productId']).subscribe(async (cloth: Clothes) => {
          // make a copy from the object
          this.clothObject = { ...cloth };
          this.productName = this.clothObject.productName;
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
          this.productId = this.accessoriObject.id;
          this.selectedImage = this.getDefaultPrice(this.accessoriObject).productImage;
          //this.smallDescription = this.accessoriObject.smallDescription;
          this.getReviews();
        });
      }
    });
  }

  // Function to mark a review as checked
  async markReviewAsChecked(review: any) {
    // Update the Firestore document
    if (!review.checkedByAdmin && !review.checkedByAdminLocal) {
      review.checkedByAdminLocal = true;
      await this.db
        .collection('reviews')
        .doc(this.productCategory)
        .collection('allReview')
        .doc(review.id)
        .update({ checkedByAdmin: true, reviewEdited: false })
    }
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
      this.reviews = this.productService.sortReviewsByRatingASC(this.reviews);
    } else if (this.selectedReviewFilter === ProductViewText.ORDER_BY_WORST_RATING) {
      this.reviews = this.productService.sortReviewsByRatingDESC(this.reviews);
    } else if (this.selectedReviewFilter === ProductViewText.ORDER_BY_LATEST) {
      this.reviews = this.productService.sortReviewsByNewest(this.reviews);
    } else if (this.selectedReviewFilter === ProductViewText.ORDER_BY_OLDEST) {
      this.reviews = this.productService.sortReviewsByOldest(this.reviews);
    }
  }

  getReviews() {
    this.productService.getReviewsForProduct(this.productId, this.productCategory).subscribe(reviews => {
      this.reviews = reviews;
      this.selectedReviewFilter = ProductViewText.ORDER_BY_LATEST;
      this.reviews = this.productService.sortReviewsByNewest(this.reviews);
      this.calculateAverageRating();
    })
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
        text: DeleteConfirmationText.REVIEW_DELETE
      }
    });

    // Wait for the dialog to close and get the user's confirmation
    const confirmToDeleteAddress = await dialogRef.afterClosed().toPromise();

    if (confirmToDeleteAddress) {
      // Delete the review from firestore
      const deleteAddressRef = this.db.collection("reviews").doc(this.productCategory).collection("allReview").doc(review.id);
      await deleteAddressRef.delete();
      this.dialog.open(SuccessfullDialogComponent, {
        data: {
          text: SuccessFullDialogText.DELETED_TEXT,
          needToGoPrevoiusPage: false
        }
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