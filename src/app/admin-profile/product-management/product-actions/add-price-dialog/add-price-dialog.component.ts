import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ForgotPasswordComponent } from '../../../../auth/forgot-password/forgot-password.component';
import { ProductPrice } from '../../product-models/product-price.model';
import { TranslateService } from '@ngx-translate/core';
import { ProductViewText } from '../../product-view-texts';
import { DeleteConfirmationDialogComponent } from '../../../../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { DeleteConfirmationText } from '../../../../delete-confirmation-dialog/delete-text';
import { ChangeDefaultPriceConfirmDialogComponent } from '../change-default-price-confirm-dialog/change-default-price-confirm-dialog.component';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ProductColor } from '../../product-models/product-color.model';
import { LoadingService } from '../../../../loading-spinner/loading.service';
import { DefaultImageUrl } from '../../../default-image-url';

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
        animate('250ms ease-out') // Expands smoothly
      ]),
      transition('* => void', [
        animate('250ms ease-in') // Collapses smoothly
      ])
    ]),
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ])
  ]
})
export class AddPriceDialogComponent implements OnInit {
  @ViewChild('form') priceForm: NgForm;  // Reference to the form for validation
  @ViewChild('fileInput') fileInput!: ElementRef; // To the upload image button management

  // error handleing
  public errorMessage = false;

  imageBase64: string = DefaultImageUrl.productUrl;
  imagePreview: string = DefaultImageUrl.productUrl;

  editText: boolean = false;

  selectedUnit: string = '';
  newPrice: ProductPrice;
  unitText: string = '';
  buttonText: string = '';
  isSetAsDefaultPrice: boolean = false;
  productCategory: string;
  allPricesForProduct: ProductPrice[] = [];
  productViewText = ProductViewText;
  defaultImage = DefaultImageUrl;

  // for food supliments and organic food
  availableFlavors: string[] = [];
  selectedFlavor: string = '';

  // use unified image
  unifiedImageUrl: string = '';

  // For clothing and accessories prices
  availableProductSizes: string[] = [
    ProductViewText.XS,
    ProductViewText.S,
    ProductViewText.M,
    ProductViewText.L,
    ProductViewText.XL,
    ProductViewText.XXL,
    ProductViewText.XXXL,
  ];
  selectedSize: string = '';

  availableProductColors: ProductColor[] = [];
  selectedColor: string = '';

  // for accessories handle
  accessoriesType: string = '';

  // for discounted price
  discountedPrice: number = 0;
  isDiscountedPrice: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data, public dialog: MatDialog, public dialogRef: MatDialogRef<ForgotPasswordComponent>, private translate: TranslateService, public loadingService: LoadingService) {
    this.selectedUnit = data.unit;
    this.editText = data.editText;
    this.productCategory = data.productCategory;
    this.allPricesForProduct = data.allPrices;
    this.unifiedImageUrl = data.useUnifiedImage;

    // if parent page was the clothing page
    if (this.productCategory === ProductViewText.CLOTHES) {
      this.availableProductColors = Object.values(this.data.allColors);
      this.availableProductColors.sort((a, b) => a.color.localeCompare(b.color));
    }

    // if parent page was the accessories page
    if (this.productCategory === ProductViewText.ACCESSORIES) {
      this.availableProductColors = Object.values(this.data.allColors);
      this.availableProductColors.sort((a, b) => a.color.localeCompare(b.color));
      this.accessoriesType = data.accessoriesType;
    }

    // if parent page was the food supliments ord organic food (drink and healthy snack have flavors) page
    if (this.productCategory === ProductViewText.FOOD_SUPLIMENTS || (this.productCategory === ProductViewText.ORGANIC_FOOD && this.data.productInnerCategory === ProductViewText.DRINKS) || (this.productCategory === ProductViewText.ORGANIC_FOOD && this.data.productInnerCategory === ProductViewText.HEALTHY_SNACKS)) {
      this.availableFlavors = Object.values(this.data.allFlavors);
      if (this.availableFlavors.length === 0) {
        this.availableFlavors.push(ProductViewText.UNFLAVORED);
      }
      this.availableFlavors.sort((a, b) => a.localeCompare(b));
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
      productColor: '',
      productImage: '',
      productPrice: null,
      productStock: null,
      setAsDefaultPrice: false
    }

    if (this.accessoriesType === this.productViewText.SHAKERS) {
      this.availableProductSizes = [
        ProductViewText.BOTTLE_100_ML,
        ProductViewText.BOTTLE_150_ML,
        ProductViewText.BOTTLE_300_ML,
        ProductViewText.BOTTLE_450_ML,
        ProductViewText.BOTTLE_500_ML,
        ProductViewText.BOTTLE_600_ML,
        ProductViewText.BOTTLE_700_ML,
        ProductViewText.BOTTLE_800_ML,
        ProductViewText.BOTTLE_1000_ML,
        ProductViewText.BOTTLE_1500_ML,
      ];
    }

    if (this.data.selectedPrice !== null && this.data.selectedPrice !== undefined) {
      this.newPrice = { ...this.data.selectedPrice };
      if (this.productCategory === ProductViewText.FOOD_SUPLIMENTS || (this.productCategory === ProductViewText.ORGANIC_FOOD && this.data.productInnerCategory === ProductViewText.DRINKS) || (this.productCategory === ProductViewText.ORGANIC_FOOD && this.data.productInnerCategory === ProductViewText.HEALTHY_SNACKS)) {
        this.availableFlavors = Object.values(this.data.allFlavors);
        if (this.availableFlavors.length === 0) {
          this.availableFlavors.push(ProductViewText.UNFLAVORED);
        }
        this.availableFlavors.sort((a, b) => a.localeCompare(b));
        this.selectedFlavor = this.data.selectedFlavor;
      }

      // if discounted price is set
      if (this.newPrice.discountedPrice !== 0 && this.newPrice.discountedPrice !== undefined) {
        this.isDiscountedPrice = true;
      }

      if (this.productCategory === ProductViewText.CLOTHES) {
        this.availableProductColors = Object.values(this.data.allColors);
        this.availableProductColors.sort((a, b) => a.color.localeCompare(b.color));
        this.selectedSize = this.data.size;
        this.selectedColor = this.data.selectedColor;
      }

      if (this.productCategory === ProductViewText.ACCESSORIES) {
        this.availableProductColors = Object.values(this.data.allColors);
        this.availableProductColors.sort((a, b) => a.color.localeCompare(b.color));
        this.accessoriesType = this.data.accessoriesType;
        this.selectedSize = this.data.size;
        if (this.accessoriesType === this.productViewText.SHAKERS) {
          this.availableProductSizes = [
            ProductViewText.BOTTLE_100_ML,
            ProductViewText.BOTTLE_150_ML,
            ProductViewText.BOTTLE_300_ML,
            ProductViewText.BOTTLE_450_ML,
            ProductViewText.BOTTLE_500_ML,
            ProductViewText.BOTTLE_600_ML,
            ProductViewText.BOTTLE_700_ML,
            ProductViewText.BOTTLE_800_ML,
            ProductViewText.BOTTLE_1000_ML,
            ProductViewText.BOTTLE_1500_ML,
          ];
          this.selectedColor = this.data.selectedColor;
        } else {
          this.availableProductSizes = [
            ProductViewText.XS,
            ProductViewText.S,
            ProductViewText.M,
            ProductViewText.L,
            ProductViewText.XL,
            ProductViewText.XXL,
            ProductViewText.XXXL,
          ];
        }
      }

      if (this.unifiedImageUrl !== null) {
        this.imageBase64 = this.unifiedImageUrl;
      } else {
        this.imageBase64 = this.newPrice.productImage;
      }
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
      if (this.unifiedImageUrl === null) {
        this.imageBase64 = DefaultImageUrl.productUrl;
        this.imagePreview = DefaultImageUrl.productUrl;
      } else {
        this.imageBase64 = this.unifiedImageUrl;
        this.imagePreview = this.imageBase64;
      }
    }
  }

  isColorSelected() {
    // Find the color object in the array by the color name
    const color = this.availableProductColors.find(item => item.color === this.selectedColor);
    this.imageBase64 = color.imageUrl;
    this.imagePreview = this.imageBase64;
  }

  // handle upload image button
  triggerImageUpload() {
    this.fileInput.nativeElement.click();
  }

  // Handle file selection and convert to Base64
  async onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      await this.loadingService.withLoading(async () => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imageBase64 = reader.result as string;
          this.imagePreview = this.imageBase64;
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage() {
    this.imageBase64 = DefaultImageUrl.productUrl;
    this.imagePreview = this.imageBase64;
  }

  // Method to create new price and return to the parent page
  async addNewPrice() {
    await this.loadingService.withLoading(async () => {
      if (this.productCategory === ProductViewText.CLOTHES) {
        this.newPrice.productColor = this.selectedColor;
      }

      if (this.productCategory === ProductViewText.ACCESSORIES && this.accessoriesType === this.productViewText.SHAKERS) {
        this.newPrice.productColor = this.selectedColor;
      }

      if (this.productCategory === ProductViewText.FOOD_SUPLIMENTS || (this.productCategory === ProductViewText.ORGANIC_FOOD && this.data.productInnerCategory === ProductViewText.DRINKS) || (this.productCategory === ProductViewText.ORGANIC_FOOD && this.data.productInnerCategory === ProductViewText.HEALTHY_SNACKS)) {
        this.newPrice.productFlavor = this.selectedFlavor;
      }

      if (this.productCategory === ProductViewText.CLOTHES || (this.productCategory === ProductViewText.ACCESSORIES && this.accessoriesType === this.productViewText.WEIGHT_LIFTING) || (this.productCategory === ProductViewText.ACCESSORIES && this.accessoriesType === this.productViewText.SHAKERS)) {
        this.newPrice.productSize = this.selectedSize;
      }

      if (!this.isDiscountedPrice) {
        this.newPrice.discountedPrice = 0;
      }

      this.newPrice.setAsDefaultPrice = this.isSetAsDefaultPrice;
      this.newPrice.productImage = this.imageBase64;

      this.dialogRef.close(this.newPrice);
    });
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
      await this.loadingService.withLoading(async () => {
        // Close the dialog and return to with boolean to delete this price
        this.dialogRef.close(true);
      });
    }
  }

  // Close all dialogs
  back() {
    this.dialog.closeAll();
  }
}
