import { Component, Inject, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ForgotPasswordComponent } from '../../../../../auth/forgot-password/forgot-password.component';
import { ProductPrice } from '../../../../../products/product-models/product-price.model';
import { TranslateService } from '@ngx-translate/core';
import { ProductViewText } from '../../../../../products/product-view-texts';

@Component({
  selector: 'app-add-price-dialog',
  templateUrl: './add-price-dialog.component.html',
  styleUrl: './add-price-dialog.component.scss'
})
export class AddPriceDialogComponent {
  @ViewChild('form') priceForm: NgForm;  // Reference to the form for validation

  // error handleing
  public errorMessage = false;

  weight: number;
  productImage: string;
  productPrice: number;

  imageBase64: string | null = null;
  imagePreview: string | null = null;

  selectedUnit: string = '';
  newPrice: ProductPrice;
  unitText: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data, public dialog: MatDialog, public dialogRef: MatDialogRef<ForgotPasswordComponent>, private translate: TranslateService) {
    this.selectedUnit = data.unit;
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
  addNewPrice() {
    this.newPrice = {
      weight: this.priceForm.value.weight,
      productImage: this.imageBase64,
      productPrice: this.priceForm.value.productPrice,
    };

    // Close the dialog and return the new product price object
    this.dialogRef.close(this.newPrice);
  }

  // Close all dialogs
  back() {
    this.dialog.closeAll();
  }
}
