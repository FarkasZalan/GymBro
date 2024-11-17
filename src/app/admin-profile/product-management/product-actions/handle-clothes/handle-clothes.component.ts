import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DeleteConfirmationDialogComponent } from '../../../../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { DeleteConfirmationText } from '../../../../delete-confirmation-dialog/delete-text';
import { DocumentHandlerService } from '../../../../document.handler.service';
import { ProductPrice } from '../../product-models/product-price.model';
import { ProductViewText } from '../../product-view-texts';
import { SuccessfullDialogComponent } from '../../../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../../../successfull-dialog/sucessfull-dialog-text';
import { AddPriceDialogComponent } from '../add-price-dialog/add-price-dialog.component';
import { Clothes } from '../../product-models/clothing.model';
import { AdminService } from '../../../admin.service';
import { AddColorDialogComponent } from '../add-color-dialog/add-color-dialog.component';
import { ProductColor } from '../../product-models/product-color.model';
import { ProductReeviews } from '../../product-models/product-reviews.model';

@Component({
  selector: 'app-handle-clothes',
  templateUrl: './handle-clothes.component.html',
  styleUrl: '../../../../../styles/product-management.scss',
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
export class HandleClothesComponent {
  @ViewChild('form') createClothesForm: NgForm;  // Reference to the form for validation

  // Form-related properties
  errorMessage: boolean = false;
  productNameExistsError: boolean = false;

  selectedGender: string = '';

  // Product categories
  productViewText = ProductViewText;
  availableGenders: string[] = [
    ProductViewText.MALE,
    ProductViewText.FEMALE,
    ProductViewText.UNISEX
  ];

  // clothing type
  availableClothingTypes: string[] = [
    ProductViewText.COAT,
    ProductViewText.PANTS,
    ProductViewText.SWEATER,
    ProductViewText.T_SHIRT,
    ProductViewText.SPORTS_BRA,
    ProductViewText.TANK_TOP
  ];
  selectedClothingType: string = '';

  // clothing material
  availableMaterials: string[] = [
    ProductViewText.BLENDED_FIBER,
    ProductViewText.COTTON,
  ];
  selectedMaterial: string = '';

  // Colors
  clothingColors: ProductColor[] = [];

  // Prices
  productPrices: ProductPrice[] = [];
  missingPricesErrorMessage: boolean = false;

  // Food suppliment object to handle the product
  clothingObject: Clothes;

  // create or modify an existing product
  isProductEdit: boolean = false;
  clothingId: string = '';

  constructor(private route: ActivatedRoute, private storage: AngularFireStorage, private db: AngularFirestore, private location: Location, public dialog: MatDialog, private documentumHandler: DocumentHandlerService, private adminService: AdminService) { }

  ngOnInit(): void {
    this.clothingObject = {
      id: "",
      productName: "",
      productGender: "",
      description: "",

      clothingType: "",
      material: "",

      prices: []
    }
    this.route.params.subscribe(params => {
      // get the food supliment product by id
      this.documentumHandler.getInnerDocumentByID("products", ProductViewText.CLOTHES, "allProduct", params['productId']).subscribe((healthyProduct: Clothes) => {
        // make a copy from the object
        this.clothingObject = { ...healthyProduct };

        // if it's not undefinied (so the user want to edit a specified product not create a new)
        if (this.clothingObject.productName !== undefined) {
          this.clothingId = this.clothingObject.id;
          this.isProductEdit = true;
          // pass the value to the object
          this.selectedGender = this.clothingObject.productGender;

          // type, material
          this.selectedClothingType = this.clothingObject.clothingType;
          this.selectedMaterial = this.clothingObject.material;

          // price, color, size
          this.productPrices = this.clothingObject.prices;

          // update the clothing colors array
          this.updateClothingColorsFromPrices();
        }
      });
    });
    this.sortItems();
  }

  updateClothingColorsFromPrices() {
    const uniqueColors: { [key: string]: string } = {}; // To track unique colors

    this.productPrices.forEach(price => {
      // Check if the color is already in the uniqueColors object
      if (!uniqueColors[price.productColor]) {
        // If it's not, add it to uniqueColors
        uniqueColors[price.productColor] = price.productImage; // Assuming productImage is available

        // Check if the color already exists in the clothingColors array
        const existingColorIndex = this.clothingColors.findIndex(color => color.color === price.productColor);
        if (existingColorIndex === -1) {
          // If not found, push the unique color and its imageUrl to the clothingColors array
          this.clothingColors.push({
            color: price.productColor,
            imageUrl: price.productImage || '' // Use an empty string if no image
          });
        }
      }
    });
  }

  // Sort product categories, genders, flavors, proteins and allergies
  sortItems(): void {
    // categories
    this.availableGenders.sort((a, b) => a.localeCompare(b));

    // CLothing types
    this.availableClothingTypes.sort((a, b) => a.localeCompare(b));

    // CLothing materials
    this.availableMaterials.sort((a, b) => a.localeCompare(b));
  }

  // Open dialog to add new color
  addNewColor() {
    this.missingPricesErrorMessage = false;
    const dialogRef = this.dialog.open(AddColorDialogComponent, {
      data: {
        allColors: this.clothingColors,
        editText: false,
        productCategory: ProductViewText.CLOTHES
      }
    });

    dialogRef.afterClosed().subscribe((newColor: ProductColor) => {
      if (newColor) {
        // Ensure color product image is not null
        if (newColor.imageUrl === null || newColor.imageUrl === undefined) {
          newColor.imageUrl = "";
        }

        // Check if the color already exists in the array
        const existingColor = this.clothingColors.find(color => color.color === newColor.color);

        if (existingColor) {
          existingColor.imageUrl = newColor.imageUrl;
        } else {
          this.clothingColors.push(newColor);
        }
        this.sortColors();
      }
    });
  }

  // Open dialog to edit color
  editColor(id: number) {
    const dialogRef = this.dialog.open(AddColorDialogComponent, {
      data: {
        allColors: this.clothingColors,
        selectedColor: this.clothingColors[id],
        editText: true,
        productCategory: ProductViewText.CLOTHES
      }
    });

    dialogRef.afterClosed().subscribe((editedColor: ProductColor | boolean) => {
      if (editedColor === true) {
        // If true is returned, delete the color
        this.deleteColor(id);
      } else if (editedColor && typeof editedColor === 'object') {
        // If an edited color is returned, update the clothingColors array
        // Ensure product image is not null
        if (editedColor.imageUrl === null || editedColor.imageUrl === undefined) {
          editedColor.imageUrl = "";
        }

        // Check if the color already exists in the array
        const existingIndex = this.clothingColors.findIndex(color => color.color === editedColor.color);

        if (existingIndex !== -1 && existingIndex !== id) {
          // If a duplicate exists, update its imageUrl and remove duplicates
          this.clothingColors[existingIndex].imageUrl = editedColor.imageUrl;
          this.clothingColors = this.clothingColors.filter((color, index) =>
            color.color !== editedColor.color || index === existingIndex
          );
        } else {
          // If no duplicate, update the existing color at the specified id
          this.clothingColors[id] = editedColor;
        }

        // Update corresponding productPrices for all entries that have the same color
        this.productPrices.forEach(price => {
          if (price.productColor === editedColor.color) {
            // Update the color and imageUrl as needed
            price.productColor = editedColor.color; // This is probably redundant
            price.productImage = editedColor.imageUrl; // Update to new image URL
          }
        });

        // Sort colors if needed
        this.sortColors();
      }
    });
  }

  deleteColor(id: number) {
    // Remove all prices associated with the deleted color
    this.productPrices = this.productPrices.filter(price => price.productColor !== this.clothingColors[id].color);
    this.clothingColors.splice(id, 1);
    this.sortColors();
  }

  sortColors() {
    this.clothingColors = this.clothingColors.sort((a, b) => a.color.localeCompare(b.color));
  }

  // Open dialog to add new price
  addNewPrice() {
    this.missingPricesErrorMessage = false;
    const dialogRef = this.dialog.open(AddPriceDialogComponent, {
      data: {
        unit: '',
        allColors: this.clothingColors,
        allPrices: this.productPrices,
        editText: false,
        useUnifiedImage: null,
        productCategory: ProductViewText.CLOTHES
      }
    });

    dialogRef.afterClosed().subscribe((newPrice: ProductPrice) => {
      if (newPrice) {
        // Ensure product image is not null
        if (newPrice.productImage === null || newPrice.productImage === undefined) {
          newPrice.productImage = "";
        }

        // if new price is the default then change the old default value to false
        if (newPrice.setAsDefaultPrice) {
          this.productPrices.forEach(price => {
            if (price.setAsDefaultPrice) {
              price.setAsDefaultPrice = false;
            }
          })
        }

        // Check for duplicates before adding
        const existingIndex = this.productPrices.findIndex(price =>
          price.productColor === newPrice.productColor &&
          price.productSize === newPrice.productSize
        );

        if (existingIndex !== -1) {
          // If a duplicate exists, update it instead of pushing a new price
          this.productPrices[existingIndex] = newPrice;
        } else {
          // If no duplicates, add the new price
          this.productPrices.push(newPrice);
        }

        // Sort the prices if needed
        this.sortPrices();
      }
    });
  }

  // Open dialog to edit price
  editPrice(id: number) {
    const dialogRef = this.dialog.open(AddPriceDialogComponent, {
      data: {
        unit: '',
        allColors: this.clothingColors,
        allPrices: this.productPrices,
        size: this.productPrices[id].productSize,
        selectedColor: this.productPrices[id].productColor,
        selectedPrice: this.productPrices[id],
        editText: true,
        useUnifiedImage: null,
        productCategory: ProductViewText.CLOTHES
      }
    });

    dialogRef.afterClosed().subscribe((editedPrice: ProductPrice | boolean) => {
      if (editedPrice === true) {
        // If true is returned, delete the price
        this.deletePrice(id);
      } else if (editedPrice && typeof editedPrice === 'object') {
        // If an edited price is returned, update the productPrices array
        // Ensure product image is not null
        if (editedPrice.productImage === null || editedPrice.productImage === undefined) {
          editedPrice.productImage = "";
        }

        // if edited price is the default then change the old default value to false
        if (editedPrice.setAsDefaultPrice) {
          this.productPrices.forEach(price => {
            if (price.setAsDefaultPrice) {
              price.setAsDefaultPrice = false;
            }
          })
        }

        // Check if a price with the same color and size already exists
        const existingIndex = this.productPrices.findIndex(price =>
          price.productColor === editedPrice.productColor &&
          price.productSize === editedPrice.productSize
        );

        if (existingIndex !== -1 && existingIndex !== id) {
          // Update the existing entry and remove duplicates
          this.productPrices[existingIndex] = editedPrice;
          this.productPrices = this.productPrices.filter((price, index) =>
            !(price.productColor === editedPrice.productColor &&
              price.productSize === editedPrice.productSize && index !== existingIndex)
          );
        } else {
          // If no duplicate, update the price at the specified id
          this.productPrices[id] = editedPrice;
        }

        // Sort the prices if needed
        this.sortPrices();
      }
    });
  }

  deletePrice(id: number) {
    this.productPrices.splice(id, 1);
    this.sortPrices();
  }

  sortPrices() {
    this.productPrices = this.productPrices.sort((a, b) => a.productPrice - b.productPrice);
  }

  async addNewClothes() {
    // error handleing
    if (this.productPrices.length === 0) {
      this.missingPricesErrorMessage = true;
    } else {
      this.missingPricesErrorMessage = false;
    }

    const checkForDuplication = await this.documentumHandler.checkForDuplicationInnerCollection(
      "products", ProductViewText.CLOTHES, "allProduct", "productName", this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createClothesForm.value.productName), undefined, ""
    );

    if (checkForDuplication) {
      this.productNameExistsError = true;

      return;
    }

    const hasDefaultPrice = this.productPrices.some(priceObj => priceObj.setAsDefaultPrice);

    if (!hasDefaultPrice) {
      this.productPrices[0].setAsDefaultPrice = true;
    }

    // create new Clothes object
    this.clothingObject = {
      id: "",
      productName: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createClothesForm.value.productName),
      productGender: this.selectedGender,
      description: this.createClothesForm.value.description,

      clothingType: this.selectedClothingType,
      material: this.selectedMaterial,

      prices: [],
    }

    // Add the new healthy product
    try {
      const documentumRef = await this.db.collection("products").doc(ProductViewText.CLOTHES).collection("allProduct").add(this.clothingObject);
      // id the document created then save the document id in the field
      await documentumRef.update({ id: documentumRef.id });
      this.productPrices = await this.adminService.uploadImagesAndSaveProduct(ProductViewText.CLOTHES, documentumRef.id, null, this.productPrices);
      await documentumRef.update({ prices: this.productPrices });
      this.errorMessage = false;
      this.productNameExistsError = false;
      this.missingPricesErrorMessage = false;
      // if everything was succes then open successfull dialog
      this.dialog.open(SuccessfullDialogComponent, {
        data: {
          text: SuccessFullDialogText.CREATED_TEXT,
          needToGoPrevoiusPage: true
        }
      });
    } catch (error) {
      this.errorMessage = true;
    }
  }

  async editClothing() {
    // error handleing
    if (this.productPrices.length === 0) {
      this.missingPricesErrorMessage = true;
    } else {
      this.missingPricesErrorMessage = false;
    }

    const checkForDuplication = await this.documentumHandler.checkForDuplicationInnerCollection(
      "products", ProductViewText.CLOTHES, "allProduct", "productName", this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createClothesForm.value.productName), undefined, this.clothingObject.id
    );

    if (checkForDuplication) {
      this.productNameExistsError = true;

      return;
    }

    const hasDefaultPrice = this.productPrices.some(priceObj => priceObj.setAsDefaultPrice);

    if (!hasDefaultPrice) {
      this.productPrices[0].setAsDefaultPrice = true;
    }
    this.productPrices = await this.adminService.uploadImagesAndSaveProduct(ProductViewText.CLOTHES, this.clothingId, null, this.productPrices);

    // create new Clothing object
    this.clothingObject = {
      id: this.clothingId,
      productName: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createClothesForm.value.productName),
      productGender: this.selectedGender,
      description: this.createClothesForm.value.description,

      clothingType: this.selectedClothingType,
      material: this.selectedMaterial,

      prices: this.productPrices,
    }

    // Edit the clothes
    try {
      await this.db.collection("products").doc(ProductViewText.CLOTHES).collection("allProduct").doc(this.clothingId).update(this.clothingObject);

      this.errorMessage = false;
      this.productNameExistsError = false;
      this.missingPricesErrorMessage = false;

      // if everything was succes then open successfull dialog
      this.dialog.open(SuccessfullDialogComponent, {
        data: {
          text: SuccessFullDialogText.MODIFIED_TEXT,
          needToGoPrevoiusPage: true
        }
      });
    } catch (error) {
      this.errorMessage = true;
    }
  }

  async deleteClothes() {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        text: DeleteConfirmationText.PRODUCT_DELETE
      }
    });

    // Wait for the dialog to close and get the user's confirmation
    const confirmToDeleteAddress = await dialogRef.afterClosed().toPromise();

    if (confirmToDeleteAddress) {
      try {
        // Delete images from Firebase Storage
        const deleteImagePromises = this.productPrices.map(async (price: ProductPrice) => {
          if (price.productImage) {
            try {
              // Reference the file by its URL
              const fileRef = this.storage.refFromURL(price.productImage);
              await fileRef.delete().toPromise();  // Attempt to delete the image
            } catch (error) { }
          }
        });

        // Await all delete promises
        await Promise.all(deleteImagePromises);

        // Delete all the images from the product storage folder
        await this.adminService.deleteAllFilesInFolder(ProductViewText.CLOTHES, this.clothingId);

        // Delete the product from firestore
        const deleteAddressRef = this.db.collection("products").doc(ProductViewText.CLOTHES).collection("allProduct").doc(this.clothingId);
        await deleteAddressRef.delete();
        this.dialog.open(SuccessfullDialogComponent, {
          data: {
            text: SuccessFullDialogText.DELETED_TEXT,
            needToGoPrevoiusPage: true
          }
        });
      } catch { }
    }
  }

  back() {
    this.location.back();
  }
}
