import { Component, Inject, OnInit } from '@angular/core';
import { ProductReeviews } from '../../admin-profile/product-management/product-models/product-reviews.model';
import { Timestamp } from 'firebase/firestore';
import { trigger, transition, style, animate } from '@angular/animations';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { SuccessfullDialogComponent } from '../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../successfull-dialog/sucessfull-dialog-text';
import { DeleteConfirmationDialogComponent } from '../../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { DeleteConfirmationText } from '../../delete-confirmation-dialog/delete-text';

@Component({
  selector: 'app-review-handle',
  templateUrl: './review-handle.component.html',
  styleUrl: './review-handle.component.scss',
  animations: [
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ]
})
export class ReviewHandleComponent implements OnInit {
  review: ProductReeviews;
  rating: number = 1;
  hoverRating: number = 0; // Stores the hovered star index
  userId: string = '';
  userFirstName: string = '';
  userLastName: string = '';
  category: string = '';
  errorMessage: boolean = false;
  productId: string = '';
  edit: boolean = false;

  reviewText: string = '';
  reviewTitle: string = '';
  reviewId: string = '';
  reviewDate = Timestamp.now();
  reviewLikes: string[] = [];
  reviewResponseLikes: string[] = [];
  reviewResponse: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data, public dialog: MatDialog, private db: AngularFirestore) {
    this.userId = data.userId;
    this.category = data.category;
    this.productId = data.productId;
    this.userFirstName = data.userFirstName;
    this.userLastName = data.userLastName;
    this.edit = data.edit;

    if (this.edit) {
      this.review = { ...data.review };
      this.reviewId = this.review.id;
      this.reviewText = this.review.text;
      this.reviewTitle = this.review.title;
      this.rating = this.review.rating;
      this.reviewDate = this.review.date;
      this.reviewLikes = this.review.likes;
      this.reviewResponseLikes = this.review.responseLikes;
      this.reviewResponse = this.review.response;
    }
  }

  ngOnInit(): void {
    this.review = {
      id: '',
      userId: this.userId,
      userFirstName: this.userFirstName,
      userLastName: this.userLastName,
      productId: this.productId,
      rating: 1,
      text: '',
      title: '',
      date: Timestamp.now(),
      likes: [],
      response: '',
      responseLikes: [],
      checkedByAdmin: false
    }
  }

  async createReview() {
    this.review.rating = this.rating;
    this.review.date = Timestamp.now();
    this.review.text = this.reviewText;
    this.review.title = this.reviewTitle;
    try {
      const documentRef = await this.db.collection("reviews").doc(this.category).collection("allReview").add(this.review);
      // id the document created then save the document id in the field
      await documentRef.update({ id: documentRef.id });

      // if everything was succes then open successfull dialog
      this.dialog.open(SuccessfullDialogComponent, {
        data: {
          text: SuccessFullDialogText.REVIEW_CREATED,
          needToGoPrevoiusPage: false
        }
      });
    } catch (error) {
      this.errorMessage = true;
    }
  }

  async editReview() {
    this.review.rating = this.rating;
    this.review = {
      id: this.reviewId,
      userId: this.userId,
      userFirstName: this.userFirstName,
      userLastName: this.userLastName,
      productId: this.productId,
      rating: this.rating,
      text: this.reviewText,
      title: this.reviewTitle,
      date: this.reviewDate,
      likes: this.reviewLikes,
      response: this.reviewResponse,
      responseLikes: this.reviewResponseLikes,
      checkedByAdmin: false
    }
    try {
      await this.db.collection("reviews").doc(this.category).collection("allReview").doc(this.reviewId).update(this.review);

      // if everything was succes then open successfull dialog
      this.dialog.open(SuccessfullDialogComponent, {
        data: {
          text: SuccessFullDialogText.REVIEW_EDITED,
          needToGoPrevoiusPage: false
        }
      });
    } catch (error) {
      this.errorMessage = true;
    }
  }

  async removeReview() {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        text: DeleteConfirmationText.REVIEW_DELETE
      }
    });

    // Wait for the dialog to close and get the user's confirmation
    const confirmToDeleteAddress = await dialogRef.afterClosed().toPromise();

    if (confirmToDeleteAddress) {
      // Delete the review from firestore
      console.log(this.review.id)
      const deleteAddressRef = this.db.collection("reviews").doc(this.category).collection("allReview").doc(this.reviewId);
      await deleteAddressRef.delete();
      this.dialog.open(SuccessfullDialogComponent, {
        data: {
          text: SuccessFullDialogText.DELETED_TEXT,
          needToGoPrevoiusPage: false
        }
      });
    }
  }

  back() {
    this.dialog.closeAll();
  }

  // Set rating when user clicks a star
  setRating(value: number): void {
    this.rating = value;
  }

  // Set hover rating when the user hovers over a star
  setHoverRating(value: number): void {
    this.hoverRating = value;
  }

  // Reset hover rating when the mouse leaves the stars
  resetHoverRating(): void {
    this.hoverRating = 0;
  }
}
