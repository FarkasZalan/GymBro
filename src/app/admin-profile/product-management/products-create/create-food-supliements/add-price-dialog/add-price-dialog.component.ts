import { Component, Inject, OnInit, ViewChild } from '@angular/core';
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

  constructor(@Inject(MAT_DIALOG_DATA) public data, public dialog: MatDialog, public dialogRef: MatDialogRef<ForgotPasswordComponent>, private translate: TranslateService) {
    this.selectedUnit = data.unit;
    this.editText = data.editText;

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
      productStock: null
    }

    if (this.data.selectedPrice !== null && this.data.selectedPrice !== undefined) {
      this.newPrice = { ...this.data.selectedPrice };
      this.imageBase64 = this.newPrice.productImage;
      this.imagePreview = this.imageBase64;
    } else {
      this.newPrice = {
        quantityInProduct: null,
        productImage: '',
        productPrice: null,
        productStock: null
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
  addNewPrice() {
    this.newPrice = {
      quantityInProduct: this.priceForm.value.quantityInProduct,
      productImage: this.imageBase64,
      productPrice: this.priceForm.value.productPrice,
      productStock: this.priceForm.value.productStock
    };

    // Close the dialog and return the new product price object
    this.dialogRef.close(this.newPrice);
  }

  // Close all dialogs
  back() {
    this.dialog.closeAll();
  }
}
