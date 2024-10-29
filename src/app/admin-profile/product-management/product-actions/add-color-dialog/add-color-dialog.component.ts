import { Component, Inject, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ForgotPasswordComponent } from '../../../../auth/forgot-password/forgot-password.component';
import { DeleteConfirmationDialogComponent } from '../../../../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { DeleteConfirmationText } from '../../../../delete-confirmation-dialog/delete-text';
import { ProductViewText } from '../../product-view-texts';
import { ChangeDefaultPriceConfirmDialogComponent } from '../change-default-price-confirm-dialog/change-default-price-confirm-dialog.component';
import { ClothingColor } from '../../product-models/clothing-color.model';

@Component({
  selector: 'app-add-color-dialog',
  templateUrl: './add-color-dialog.component.html',
  styleUrl: '../../../../../styles/add-dialog.scss'
})
export class AddColorDialogComponent {
  @ViewChild('form') priceForm: NgForm;  // Reference to the form for validation

  // error handleing
  public errorMessage = false;

  imageBase64: string;
  imagePreview: string;

  editText: boolean = false;

  newColor: ClothingColor;
  buttonText: string = '';
  productCategory: string;
  allColorsForProduct: ClothingColor[] = [];
  productViewText = ProductViewText;

  availableClothingColors: string[] = [
    this.productViewText.BROWN,
    this.productViewText.BURGUNDY,
    this.productViewText.WHITE,
    this.productViewText.BLACK,
    this.productViewText.BLUE,
    this.productViewText.PURPLE,
    this.productViewText.RED,
    this.productViewText.PINK,
    this.productViewText.GRAY,
    this.productViewText.YELLOW,
    this.productViewText.ORANGE,
    this.productViewText.GREEN,
    this.productViewText.BEIGE,
    this.productViewText.MAUVE,
  ];
  selectedColor: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data, public dialog: MatDialog, public dialogRef: MatDialogRef<ForgotPasswordComponent>, private translate: TranslateService) {
    this.editText = data.editText;
    this.productCategory = data.productCategory;
    this.allColorsForProduct = data.allColors;

    if (this.editText) {
      this.buttonText = this.translate.instant('profilePage.modify');
    } else {
      this.buttonText = this.translate.instant('products.add');
    }
  }

  ngOnInit(): void {
    this.availableClothingColors.sort((a, b) => a.localeCompare(b));
    this.newColor = {
      imageUrl: '',
      color: ''
    }

    if (this.data.selectedColor !== null && this.data.selectedColor !== undefined) {
      this.newColor = { ...this.data.selectedColor };
      this.selectedColor = this.newColor.color;
      this.imageBase64 = this.newColor.imageUrl;
      this.imagePreview = this.imageBase64;
    } else {
      this.newColor = {
        imageUrl: '',
        color: ''
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
    this.newColor = {
      imageUrl: this.imageBase64,
      color: this.selectedColor,
    };

    this.dialogRef.close(this.newColor);
  }

  async deleteColor() {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        text: DeleteConfirmationText.PRICE_DELETE
      }
    });

    // Wait for the dialog to close and get the user's confirmation
    const confirmToDeletePrice = await dialogRef.afterClosed().toPromise();

    if (confirmToDeletePrice) {
      // Close the dialog and return to with boolean to delete this color
      this.dialogRef.close(true);
    }
  }

  // Close all dialogs
  back() {
    this.dialog.closeAll();
  }
}
