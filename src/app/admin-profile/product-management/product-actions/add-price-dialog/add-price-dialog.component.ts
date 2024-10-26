import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ForgotPasswordComponent } from '../../../../auth/forgot-password/forgot-password.component';
import { ProductPrice } from '../../../../products/product-models/product-price.model';
import { TranslateService } from '@ngx-translate/core';
import { ProductViewText } from '../../../../products/product-view-texts';
import { DeleteConfirmationDialogComponent } from '../../../../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { DeleteConfirmationText } from '../../../../delete-confirmation-dialog/delete-text';
import { DocumentHandlerService } from '../../../../document.handler.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ChangeDefaultPriceConfirmDialogComponent } from '../change-default-price-confirm-dialog/change-default-price-confirm-dialog.component';

@Component({
  selector: 'app-add-price-dialog',
  templateUrl: './add-price-dialog.component.html',
  styleUrl: './add-price-dialog.component.scss'
})
export class AddPriceDialogComponent implements OnInit {
  @ViewChild('form') priceForm: NgForm;  // Reference to the form for validation

  // error handleing
  public errorMessage = false;

  imageBase64: string;
  imagePreview: string;

  editText: boolean = false;

  selectedUnit: string = '';
  newPrice: ProductPrice;
  unitText: string = '';
  buttonText: string = '';
  isSetAsDefaultPrice: boolean = false;
  productCategory: string;
  allPricesForProduct: ProductPrice[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data, public dialog: MatDialog, public dialogRef: MatDialogRef<ForgotPasswordComponent>, private translate: TranslateService, private documentumHandler: DocumentHandlerService, private db: AngularFirestore) {
    this.selectedUnit = data.unit;
    this.editText = data.editText;
    this.productCategory = data.productCategory;
    this.allPricesForProduct = data.allPrices;

    if (this.editText) {
      this.buttonText = this.translate.instant('profilePage.modify');
    } else {
      this.buttonText = this.translate.instant('products.add');
    }

    if (this.translate.instant(ProductViewText.GRAM) === this.selectedUnit) {
      this.unitText = this.translate.instant('products.weight');
    } else if (this.translate.instant(ProductViewText.POUNDS) === this.selectedUnit) {
      this.unitText = this.translate.instant('products.weight');
      this.selectedUnit = this.translate.instant('products.lbs')
    } else {
      this.unitText = this.translate.instant(ProductViewText.PIECES);
      this.selectedUnit = this.translate.instant('products.pcs')
    }
  }

  ngOnInit(): void {
    this.newPrice = {
      quantityInProduct: null,
      productImage: '',
      productPrice: null,
      productStock: null,
      setAsDefaultPrice: false
    }

    if (this.data.selectedPrice !== null && this.data.selectedPrice !== undefined) {
      this.newPrice = { ...this.data.selectedPrice };
      this.imageBase64 = this.newPrice.productImage;
      this.imagePreview = this.imageBase64;
      this.isSetAsDefaultPrice = this.newPrice.setAsDefaultPrice;
    } else {
      this.newPrice = {
        quantityInProduct: null,
        productImage: '',
        productPrice: null,
        productStock: null,
        setAsDefaultPrice: false
      }
      this.imageBase64 = '';
      this.imagePreview = '';
    }
  }

  // Handle file selection and convert to Base64
  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageBase64 = reader.result as string; // Base64 string
        this.imagePreview = this.imageBase64; // Preview for the user
      };
      reader.readAsDataURL(file);
    }
  }

  // Method to initiate password recovery
  async addNewPrice() {
    this.newPrice = {
      quantityInProduct: this.priceForm.value.quantityInProduct,
      productImage: this.imageBase64,
      productPrice: this.priceForm.value.productPrice,
      productStock: this.priceForm.value.productStock,
      setAsDefaultPrice: this.isSetAsDefaultPrice
    };


    let hasDefaultPrice = false;
    if (this.allPricesForProduct.length > 0 && this.isSetAsDefaultPrice) {
      // check if a default price already has been added before
      hasDefaultPrice = this.allPricesForProduct.some(productPrice => productPrice.setAsDefaultPrice === true);
    }
    // If there's a default price already set, we need to handle it
    if (hasDefaultPrice) {
      const dialogRef = this.dialog.open(ChangeDefaultPriceConfirmDialogComponent);

      // Wait for the dialog to close and get the user's confirmation
      const confirmToSetDefault = await dialogRef.afterClosed().toPromise();

      if (confirmToSetDefault) {
        // Find the price where isSetAsDefaultAddress is true
        this.newPrice.setAsDefaultPrice = true;
      } else {
        // User did not confirm, exit the method
        return;
      }
    }

    // Close the dialog and return the new product price object
    this.dialogRef.close(this.newPrice);
  }

  async deletePrice() {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        text: DeleteConfirmationText.PRICE_DELETE
      }
    });

    // Wait for the dialog to close and get the user's confirmation
    const confirmToDeletePrice = await dialogRef.afterClosed().toPromise();

    if (confirmToDeletePrice) {
      // Close the dialog and return to with boolean to delete this price
      this.dialogRef.close(true);
    }
  }

  // Close all dialogs
  back() {
    this.dialog.closeAll();
  }
}
