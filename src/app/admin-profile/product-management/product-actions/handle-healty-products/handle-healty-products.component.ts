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
import { NutritionalTable } from '../../../../products/product-models/nutritional-table.model';
import { ProductPrice } from '../../../../products/product-models/product-price.model';
import { ProductViewText } from '../../../../products/product-view-texts';
import { SuccessfullDialogComponent } from '../../../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../../../successfull-dialog/sucessfull-dialog-text';
import { AddPriceDialogComponent } from '../add-price-dialog/add-price-dialog.component';
import { HealthyProduct } from '../../../../products/product-models/healthy-food.model';

@Component({
  selector: 'app-handle-healty-products',
  templateUrl: './handle-healty-products.component.html',
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
    ])
  ]
})
export class HandleHealtyProductsComponent {
  @ViewChild('form') createHealthyProductForm: NgForm;  // Reference to the form for validation

  // Form-related properties
  errorMessage: boolean = false;
  productNameExistsError: boolean = false;
  isSafeForConsumptionDuringPregnancy: boolean = true;
  isSafeForConsumptionDuringBreastfeeding: boolean = true;

  selectedUnit: string = '';
  selectedCategory: string = '';

  // Product categories
  productViewText = ProductViewText;
  productCategories: string[] = [
    ProductViewText.CEREALS,
    ProductViewText.HEALTHY_SNACKS,
    ProductViewText.COOKING_iNGREDIENTS,
    ProductViewText.DRINKS
  ];

  // Flavors and Allergens
  availableFlavors: string[] = [
    ProductViewText.UNFLAVORED,
    ProductViewText.VANILLA_FLAVOR,
    ProductViewText.CHOCOLATE_FLAVOR,
    ProductViewText.STRAWBERRY_FLAVOR,
    ProductViewText.PINEAPPLE_MANGO_FLAVOR,
    ProductViewText.COCONUT_FLAVOR,
    ProductViewText.TIRAMISU_FLAVOR,
    ProductViewText.COOKIES_AND_CREAM_FLAVOR,
    ProductViewText.PEANUT_BUTTER_FLAVOR,
    ProductViewText.WHITE_CHOCOLATE_FLAVOR,
    ProductViewText.PISTACHIO_FLAVOR,
    ProductViewText.CHOCOLATE_TOFFEE_FLAVOR,
    ProductViewText.BANANA_FLAVOR,
    ProductViewText.COFFEE_FLAVOR,
    ProductViewText.SALT_CARAMEL_FLAVOR,
    ProductViewText.MINT_CHOCOLATE_FLAVOR,
    ProductViewText.MOCHA_FLAVOR,
    ProductViewText.CINNAMON_ROLL_FLAVOR,
    ProductViewText.BLUEBERRY_FLAVOR,
    ProductViewText.PUMPKIN_SPICE_FLAVOR,
    ProductViewText.CHOCOLATE_PEANUT_BUTTER_FLAVOR,
    ProductViewText.APPLE_PIE_FLAVOR,
    ProductViewText.LEMON_CHEESECAKE_FLAVOR,
    ProductViewText.BLACK_BISCUIT_FLAVOR,
    ProductViewText.CAPPUCINO
  ];
  selectedFlavor: string = ProductViewText.UNFLAVORED;

  availableAllergens: string[] = [
    ProductViewText.LACTOSE_ALLERGEN,
    ProductViewText.GLUTEN_ALLERGEN,
    ProductViewText.SOY_ALLERGEN,
    ProductViewText.EGGS_ALLERGEN,
    ProductViewText.ADDED_SUGARS_ALLERGEN,
    ProductViewText.PEANUTS_ALLERGEN,
    ProductViewText.FISH_ALLERGEN
  ];
  selectedAllergenes: string[] = [];

  // Prices
  productPrices: ProductPrice[] = [];
  missingPricesErrorMessage: boolean = false;

  // Nutritional table
  nutritionalTable: NutritionalTable = {
    nutritionalValueEnergyKj: null,
    nutritionalValueEnergyCal: null,
    nutritionalValueFats: null,
    nutritionalValueFattyAcids: null,
    nutritionalValueCarbohydrates: null,
    nutritionalValueSugar: null,
    nutritionalValueFiber: null,
    nutritionalValueProteins: null,
    nutritionalValueSalt: null,
  };

  // Food suppliment object to handle the product
  healthyProductObject: HealthyProduct;

  // create or modify an existing product
  isProductEdit: boolean = false;
  healthyProductId: string = '';

  constructor(private route: ActivatedRoute, private storage: AngularFireStorage, private db: AngularFirestore, private location: Location, public dialog: MatDialog, private documentumHandler: DocumentHandlerService) { }

  ngOnInit(): void {
    this.healthyProductObject = {
      id: "",
      productName: "",
      productCategory: "",
      description: "",
      dosageUnit: "",
      flavor: "",

      safeForConsumptionDuringBreastfeeding: true,
      safeForConsumptionDuringPregnancy: true,

      nutritionalTable: null,

      allergens: [],

      prices: []
    }
    this.route.params.subscribe(params => {
      // get the food supliment product by id
      this.documentumHandler.getInnerDocumentByID("products", ProductViewText.HEALTHY_PRODUCT, "allProduct", params['productId']).subscribe((healthyProduct: HealthyProduct) => {
        // make a copy from the object
        this.healthyProductObject = { ...healthyProduct };

        // if it's not undefinied (so the user want to edit a specified product not create a new)
        if (this.healthyProductObject.productName !== undefined) {
          this.healthyProductId = this.healthyProductObject.id;
          this.isProductEdit = true;
          // pass the value to the object
          this.selectedCategory = this.healthyProductObject.productCategory;

          this.selectedUnit = this.healthyProductObject.dosageUnit;

          // prices
          this.productPrices = this.healthyProductObject.prices;

          // flavor and allergies list
          this.selectedFlavor = this.healthyProductObject.flavor;
          this.selectedAllergenes = this.healthyProductObject.allergens;

          // safety
          this.isSafeForConsumptionDuringBreastfeeding = this.healthyProductObject.safeForConsumptionDuringBreastfeeding;
          this.isSafeForConsumptionDuringPregnancy = this.healthyProductObject.safeForConsumptionDuringPregnancy;

          // nutritional table
          this.nutritionalTable = this.healthyProductObject.nutritionalTable;
        }
      });
    });
    this.sortItems();
  }

  // Sort product categories, genders, flavors, proteins and allergies
  sortItems(): void {
    // categories
    this.productCategories.sort((a, b) => a.localeCompare(b));

    // Flavors
    this.availableFlavors.sort((a, b) => a.localeCompare(b));

    // Allergens
    this.availableAllergens.sort((a, b) => a.localeCompare(b));
  }

  // Update UI based on selected category
  isCategorySelected() {
    if (this.selectedCategory === ProductViewText.DRINKS) {
      this.selectedUnit = ProductViewText.ML;
    } else {
      this.selectedUnit = ProductViewText.GRAM;
    }
  }

  // Handle selection of flavors, allergens, and genders
  selectionOfTheList(type: string, item: string): void {
    switch (type) {
      case ProductViewText.ALLERGENES:
        this.toggleSelection(this.selectedAllergenes, item);
        break;
    }
  }

  // Helper function to toggle item selection in an array
  toggleSelection(list: string[], item: string): void {
    const index = list.indexOf(item);

    // remove item from the list if it's selected othervise add to the list
    index > -1 ? list.splice(index, 1) : list.push(item);
  }

  // Remove selected item
  removeItemFromTheList(type: string, item: string): void {
    if (type === ProductViewText.ALLERGENES) {
      this.removeItem(this.selectedAllergenes, item);
    }
  }

  // Helper function to remove item from array
  removeItem(list: string[], item: string): void {
    const index = list.indexOf(item);
    if (index > -1) list.splice(index, 1);
  }

  // Open dialog to add new price
  addNewPrice() {
    this.missingPricesErrorMessage = false;
    const dialogRef = this.dialog.open(AddPriceDialogComponent, {
      data: {
        unit: this.selectedUnit,
        allPrices: this.productPrices,
        editText: false,
        productCategory: ProductViewText.HEALTHY_PRODUCT
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

        this.productPrices.push(newPrice);
        this.sortPrices();
      }
    });
  }

  // Open dialog to edit price
  editPrice(id: number) {
    const dialogRef = this.dialog.open(AddPriceDialogComponent, {
      data: {
        unit: this.selectedUnit,
        allPrices: this.productPrices,
        selectedPrice: this.productPrices[id],
        editText: true,
        productCategory: ProductViewText.HEALTHY_PRODUCT
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

        this.productPrices[id] = editedPrice;
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

  async uploadImagesAndSaveProduct(productId: string) {
    const uploadPromises = this.productPrices.map(async (price: ProductPrice) => {
      // Check if productImage is a Base64 string (indicating a new upload) or a URL (existing image)
      if (price.productImage && price.productImage.startsWith("data:image")) {
        const base64Data = price.productImage;
        const blob = this.base64ToBlob(base64Data);

        // Define the path in Firebase Storage
        const filePath = `ProductsImages/${productId}/${productId}_price_of_the_product: ${price.productPrice}`;
        const fileRef = this.storage.ref(filePath);
        const task = this.storage.upload(filePath, blob);

        // Wait for upload to complete and get the download URL
        await task.snapshotChanges().toPromise();
        const url = await fileRef.getDownloadURL().toPromise();
        price.productImage = url; // Set productImage to the download URL
      }
      // If productImage is already a URL, skip uploading
    });

    // Wait for all images to finish uploading
    await Promise.all(uploadPromises);
  }


  // Helper function to convert Base64 string to Blob
  base64ToBlob(base64Data: string): Blob {
    const byteString = atob(base64Data.split(',')[1]);
    const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  async addNewHealthyProduct() {
    // error handleing
    if (this.productPrices.length === 0) {
      this.missingPricesErrorMessage = true;
    } else {
      this.missingPricesErrorMessage = false;
    }

    const checkForDuplication = await this.documentumHandler.checkForDuplicationInnerCollection(
      "products", ProductViewText.HEALTHY_PRODUCT, "allProduct", "productName", this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createHealthyProductForm.value.productName), undefined, ""
    );

    if (checkForDuplication) {
      this.productNameExistsError = true;

      return;
    }

    if (this.nutritionalTable.nutritionalValueEnergyCal === null) {
      this.nutritionalTable = {
        nutritionalValueEnergyKj: 0,
        nutritionalValueEnergyCal: 0,
        nutritionalValueFats: 0,
        nutritionalValueFattyAcids: 0,
        nutritionalValueCarbohydrates: 0,
        nutritionalValueSugar: 0,
        nutritionalValueFiber: 0,
        nutritionalValueProteins: 0,
        nutritionalValueSalt: 0
      }
    }

    const hasDefaultPrice = this.productPrices.some(priceObj => priceObj.setAsDefaultPrice);

    if (!hasDefaultPrice) {
      this.productPrices[0].setAsDefaultPrice = true;
    }

    // create new Healthy product object
    this.healthyProductObject = {
      id: "",
      productName: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createHealthyProductForm.value.productName),
      productCategory: this.selectedCategory,
      description: this.createHealthyProductForm.value.description,
      dosageUnit: this.selectedUnit,
      flavor: this.selectedFlavor,

      safeForConsumptionDuringBreastfeeding: this.isSafeForConsumptionDuringBreastfeeding,
      safeForConsumptionDuringPregnancy: this.isSafeForConsumptionDuringPregnancy,

      nutritionalTable: this.nutritionalTable,

      allergens: this.selectedAllergenes,

      prices: []
    }

    // Add the new healthy product
    try {
      const documentumRef = await this.db.collection("products").doc(ProductViewText.HEALTHY_PRODUCT).collection("allProduct").add(this.healthyProductObject);
      // id the document created then save the document id in the field
      await documentumRef.update({ id: documentumRef.id });
      await this.uploadImagesAndSaveProduct(documentumRef.id);
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

  async editHealthyProduct() {
    // error handleing
    if (this.productPrices.length === 0) {
      this.missingPricesErrorMessage = true;
    } else {
      this.missingPricesErrorMessage = false;
    }

    const checkForDuplication = await this.documentumHandler.checkForDuplicationInnerCollection(
      "products", ProductViewText.HEALTHY_PRODUCT, "allProduct", "productName", this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createHealthyProductForm.value.productName), undefined, this.healthyProductObject.id
    );

    if (checkForDuplication) {
      this.productNameExistsError = true;

      return;
    }

    if (this.nutritionalTable.nutritionalValueEnergyCal === null) {
      this.nutritionalTable = {
        nutritionalValueEnergyKj: 0,
        nutritionalValueEnergyCal: 0,
        nutritionalValueFats: 0,
        nutritionalValueFattyAcids: 0,
        nutritionalValueCarbohydrates: 0,
        nutritionalValueSugar: 0,
        nutritionalValueFiber: 0,
        nutritionalValueProteins: 0,
        nutritionalValueSalt: 0
      }
    }

    const hasDefaultPrice = this.productPrices.some(priceObj => priceObj.setAsDefaultPrice);

    if (!hasDefaultPrice) {
      this.productPrices[0].setAsDefaultPrice = true;
    }
    await this.uploadImagesAndSaveProduct(this.healthyProductId);

    // create new Food supliment object
    this.healthyProductObject = {
      id: this.healthyProductId,
      productName: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createHealthyProductForm.value.productName),
      productCategory: this.selectedCategory,
      description: this.createHealthyProductForm.value.description,
      dosageUnit: this.selectedUnit,
      flavor: this.selectedFlavor,

      safeForConsumptionDuringBreastfeeding: this.isSafeForConsumptionDuringBreastfeeding,
      safeForConsumptionDuringPregnancy: this.isSafeForConsumptionDuringPregnancy,

      nutritionalTable: this.nutritionalTable,

      allergens: this.selectedAllergenes,

      prices: this.productPrices
    }

    // Edit the healthy product
    try {
      await this.db.collection("products").doc(ProductViewText.HEALTHY_PRODUCT).collection("allProduct").doc(this.healthyProductId).update(this.healthyProductObject);

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

  async deleteHealthyProduct() {
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
            // Reference the file by its URL
            const fileRef = this.storage.refFromURL(price.productImage);
            return fileRef.delete().toPromise();  // Returns a promise to delete the image
          }
        });

        // Await all delete promises
        await Promise.all(deleteImagePromises);

        // Delete the product from firestore
        const deleteAddressRef = this.db.collection("products").doc(ProductViewText.HEALTHY_PRODUCT).collection("allProduct").doc(this.healthyProductId);
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
