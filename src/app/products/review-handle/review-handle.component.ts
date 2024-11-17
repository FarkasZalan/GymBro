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
import { ProductViewText } from '../../admin-profile/product-management/product-view-texts';

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
  pageFrom: string = '';
  productViewText = ProductViewText;

  reviewText: string = '';
  reviewTitle: string = '';
  reviewId: string = '';
  reviewDate = Timestamp.now();
  reviewLikes: string[] = [];
  reviewResponseLikes: string[] = [];
  reviewResponse: string = '';
  responseDate = Timestamp.now();
  responseEdit: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data, public dialog: MatDialog, private db: AngularFirestore) {
    this.userId = data.userId;
    this.category = data.category;
    this.productId = data.productId;
    this.userFirstName = data.userFirstName;
    this.userLastName = data.userLastName;
    this.edit = data.edit;
    this.pageFrom = data.pageFrom;

    if (this.pageFrom === this.productViewText.ADMIN_REVIEW) {
      this.responseEdit = data.responseEdit;
    }

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
      if (this.reviewResponse !== '' && this.pageFrom === ProductViewText.ADMIN_REVIEW) {
        this.responseEdit = true;
      }
      this.responseDate = this.review.responseDate;
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
      responseDate: Timestamp.now(),
      likes: [],
      response: '',
      responseLikes: [],
      checkedByAdmin: false,
      reviewEdited: false
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

  async handleResponse() {
    if (this.review.response === '') {
      this.responseDate = Timestamp.now();
    }

    await this.db
      .collection('reviews')
      .doc(this.category)
      .collection('allReview')
      .doc(this.reviewId)
      .update({ response: this.reviewResponse, responseDate: this.responseDate })

    // if everything was succes then open successfull dialog
    const successfullText = this.responseEdit ? SuccessFullDialogText.RESPONSE_EDITED : SuccessFullDialogText.RESPONSE_CREATED
    this.dialog.open(SuccessfullDialogComponent, {
      data: {
        text: successfullText,
        needToGoPrevoiusPage: false
      }
    });
  }

  async removeResponse() {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        text: DeleteConfirmationText.RESPONSE_DELETE
      }
    });

    // Wait for the dialog to close and get the user's confirmation
    const confirmToDeleteAddress = await dialogRef.afterClosed().toPromise();

    if (confirmToDeleteAddress) {
      // Update the Firestore document
      this.db
        .collection('reviews')
        .doc(this.category)
        .collection('allReview')
        .doc(this.reviewId)
        .update({ response: '' })

      // if everything was succes then open successfull dialog
      this.dialog.open(SuccessfullDialogComponent, {
        data: {
          text: SuccessFullDialogText.RESPONSE_DELETED,
          needToGoPrevoiusPage: false
        }
      });
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
      responseDate: this.responseDate,
      responseLikes: this.reviewResponseLikes,
      checkedByAdmin: false,
      reviewEdited: true
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
    if (this.pageFrom !== ProductViewText.ADMIN_REVIEW) {
      this.rating = value;
    }
  }

  // Set hover rating when the user hovers over a star
  setHoverRating(value: number): void {
    if (this.pageFrom !== ProductViewText.ADMIN_REVIEW) {
      this.hoverRating = value;
    }
  }

  // Reset hover rating when the mouse leaves the stars
  resetHoverRating(): void {
    if (this.pageFrom !== ProductViewText.ADMIN_REVIEW) {
      this.hoverRating = 0;
    }
  }
}
