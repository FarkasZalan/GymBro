import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ForgotPasswordComponent } from '../../../../auth/forgot-password/forgot-password.component';
import { DeleteConfirmationDialogComponent } from '../../../../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { DeleteConfirmationText } from '../../../../delete-confirmation-dialog/delete-text';
import { ProductViewText } from '../../product-view-texts';
import { ProductColor } from '../../product-models/product-color.model';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { LoadingService } from '../../../../loading-spinner/loading.service';
import { DefaultImageUrl } from '../../../default-image-url';

@Component({
  selector: 'app-add-color-dialog',
  templateUrl: './add-color-dialog.component.html',
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
export class AddColorDialogComponent {
  @ViewChild('form') priceForm: NgForm;  // Reference to the form for validation
  @ViewChild('fileInput') fileInput!: ElementRef; // To the upload image button management

  // error handleing
  public errorMessage = false;

  imageBase64: string;
  imagePreview: string;

  editText: boolean = false;

  newColor: ProductColor;
  buttonText: string = '';
  productCategory: string;
  allColorsForProduct: ProductColor[] = [];
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

  constructor(@Inject(MAT_DIALOG_DATA) public data, public dialog: MatDialog, public dialogRef: MatDialogRef<ForgotPasswordComponent>, private translate: TranslateService, public loadingService: LoadingService) {
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
        imageUrl: DefaultImageUrl.productUrl,
        color: ''
      }
      this.imageBase64 = '';
      this.imagePreview = '';
    }
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
          this.imageBase64 = reader.result as string; // Base64 string
          this.imagePreview = this.imageBase64; // Preview for the user
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage() {
    this.imageBase64 = DefaultImageUrl.productUrl;
    this.imagePreview = this.imageBase64;
  }

  // Method to initiate password recovery
  async addNewPrice() {
    await this.loadingService.withLoading(async () => {
      this.newColor = {
        imageUrl: this.imageBase64,
        color: this.selectedColor,
      };

      this.dialogRef.close(this.newColor);
    });
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
      await this.loadingService.withLoading(async () => {
        // Close the dialog and return to with boolean to delete this color
        this.dialogRef.close(true);
      });
    }
  }

  // Close all dialogs
  back() {
    this.dialog.closeAll();
  }
}
