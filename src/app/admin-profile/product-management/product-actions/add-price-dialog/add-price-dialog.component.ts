import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ForgotPasswordComponent } from '../../../../auth/forgot-password/forgot-password.component';
import { ProductPrice } from '../../product-models/product-price.model';
import { TranslateService } from '@ngx-translate/core';
import { ProductViewText } from '../../product-view-texts';
import { DeleteConfirmationDialogComponent } from '../../../../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { DeleteConfirmationText } from '../../../../delete-confirmation-dialog/delete-text';
import { ChangeDefaultPriceConfirmDialogComponent } from '../change-default-price-confirm-dialog/change-default-price-confirm-dialog.component';
import { ClothingColor } from '../../product-models/clothing-color.model';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-add-price-dialog',
  templateUrl: './add-price-dialog.component.html',
  styleUrl: '../../../../../styles/add-dialog.scss',
  animations: [
    // name of tha animation what can call in html
    trigger('collapseField', [
      state('void', style({
        height: '0px', // Initially collapsed
        overflow: 'hidden'
      })),
      state('*', style({
        height: '*', // Expands to the full height of the content
        overflow: 'hidden'
      })),
      transition('void => *', [
        animate('50ms ease-out') // Expands smoothly
      ]),
      transition('* => void', [
        animate('50ms ease-in') // Collapses smoothly
      ])
    ])
  ]
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
  productViewText = ProductViewText;

  // For clothing prices
  availableClothingSizes: string[] = [
    ProductViewText.XS,
    ProductViewText.S,
    ProductViewText.M,
    ProductViewText.L,
    ProductViewText.XL,
    ProductViewText.XXL,
    ProductViewText.XXXL,
  ];
  selectedSize: string = '';

  availableClothingColors: ClothingColor[] = [];
  selectedColor: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data, public dialog: MatDialog, public dialogRef: MatDialogRef<ForgotPasswordComponent>, private translate: TranslateService) {
    this.selectedUnit = data.unit;
    this.editText = data.editText;
    this.productCategory = data.productCategory;
    this.allPricesForProduct = data.allPrices;
    if (this.productCategory === ProductViewText.CLOTHES) {
      this.availableClothingColors = Object.values(this.data.allColors);
      this.availableClothingColors.sort((a, b) => a.color.localeCompare(b.color));
    }

    if (this.editText) {
      this.buttonText = this.translate.instant('profilePage.modify');
    } else {
      this.buttonText = this.translate.instant('products.add');
    }

    if (ProductViewText.GRAM === this.selectedUnit) {
      this.unitText = this.translate.instant('products.weight');
    } else if (ProductViewText.POUNDS === this.selectedUnit) {
      this.unitText = this.translate.instant('products.weight');
      this.selectedUnit = ProductViewText.LBS;
    } else if (ProductViewText.ML === this.selectedUnit) {
      this.unitText = this.translate.instant('products.quantity');
      this.selectedUnit = ProductViewText.ML;
    } else {
      this.unitText = this.translate.instant(ProductViewText.PIECES);
      this.selectedUnit = ProductViewText.PCS;
    }
  }

  ngOnInit(): void {
    this.newPrice = {
      quantityInProduct: null,
      clothingColor: '',
      productImage: '',
      productPrice: null,
      productStock: null,
      setAsDefaultPrice: false
    }

    if (this.data.selectedPrice !== null && this.data.selectedPrice !== undefined) {
      this.newPrice = { ...this.data.selectedPrice };
      if (this.productCategory === ProductViewText.CLOTHES) {
        this.availableClothingColors = Object.values(this.data.allColors);
        this.availableClothingColors.sort((a, b) => a.color.localeCompare(b.color));
        this.selectedSize = this.data.size;
        this.selectedColor = this.data.selectedColor;
      }

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

  isColorSelected() {
    // Find the color object in the array by the color name
    const color = this.availableClothingColors.find(item => item.color === this.selectedColor);
    this.imageBase64 = color.imageUrl;
    this.imagePreview = this.imageBase64;
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
    let quantity = 0
    if (this.priceForm.value.quantityInProduct !== undefined) {
      quantity = this.priceForm.value.quantityInProduct;
    }
    this.newPrice = {
      quantityInProduct: quantity,
      productImage: this.imageBase64,
      productPrice: this.priceForm.value.productPrice,
      productStock: this.priceForm.value.productStock,
      setAsDefaultPrice: this.isSetAsDefaultPrice,
      clothingSize: this.selectedSize,
      clothingColor: this.selectedColor
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
