import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ProductViewText } from '../../../../products/product-view-texts';
import { TranslateService } from '@ngx-translate/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AddPriceDialogComponent } from './add-price-dialog/add-price-dialog.component';
import { ProductPrice } from '../../../../products/product-models/product-price.model';
import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import { Vitamin } from '../../../../products/product-models/vitamin.model';
import { NgForm } from '@angular/forms';
import { FoodSupliment } from '../../../../products/product-models/food-supliment.model';
import { DocumentHandlerService } from '../../../../document.handler.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { SuccessfullDialogComponent } from '../../../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../../../successfull-dialog/sucessfull-dialog-text';
import { NutritionalTable } from '../../../../products/product-models/nutritional-table.model';
import { ActivatedRoute } from '@angular/router';
import { DeleteConfirmationDialogComponent } from '../../../../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { DeleteConfirmationText } from '../../../../delete-confirmation-dialog/delete-text';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-create-food-supliements',
  templateUrl: './create-food-supliements.component.html',
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
export class CreateFoodSuplimentsComponent implements OnInit {
  @ViewChild('form') createFoodSuplimentForm: NgForm;  // Reference to the form for validation

  // Form-related properties
  errorMessage: boolean = false;
  productNameExistsError: boolean = false;
  isSafeForConsumptionDuringPregnancy: boolean = true;
  isSafeForConsumptionDuringBreastfeeding: boolean = true;

  selectedUnit: string = '';
  selectedCategory: string = '';
  selectedVitaminUnit: string = '';

  // if true then display protein type select
  isProtein: boolean = false;

  // if these true then the flavor can be only unflavored
  isJoinSupport: boolean = false;
  isVitamin: boolean = false;


  // Vitamin-related properties
  vitaminList: Vitamin[] = [];
  vitaminName: string = '';
  vitaminQuantity: number = null;

  availableGenders: string[] = [
    ProductViewText.MALE,
    ProductViewText.FEMALE
  ];
  translatedGenders: string[] = [];
  selectedGenders: string[] = [];

  selectedVitamin: Vitamin;

  // if true then display the vitamin edit and cancel buttons
  vitaminModificationIsInProgress: boolean = false;
  modifiedVitaminId: number;
  vitaminMissingFieldsError: boolean = false;

  // Product categories
  productViewText = ProductViewText;
  productCategories: string[] = [
    ProductViewText.PROTEINS,
    ProductViewText.MASS_GAINERS,
    ProductViewText.AMINO_ACIDS,
    ProductViewText.CREATINES,
    ProductViewText.VITAMINS_AND_MINERALS,
    ProductViewText.JOIN_SUPPORT,
    ProductViewText.FAT_BURNERS
  ];
  translatedCategories: string[] = [];

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
    ProductViewText.BLACK_BISCUIT_FLAVOR
  ];
  translatedFlavors: string[] = [];
  selectedFlavors: string[] = [];

  availableAllergens: string[] = [
    ProductViewText.LACTOSE_ALLERGEN,
    ProductViewText.GLUTEN_ALLERGEN,
    ProductViewText.SOY_ALLERGEN,
    ProductViewText.EGGS_ALLERGEN,
    ProductViewText.ADDED_SUGARS_ALLERGEN,
    ProductViewText.PEANUTS_ALLERGEN,
    ProductViewText.FISH_ALLERGEN
  ];
  translatedAllergens: string[] = [];
  selectedAllergenes: string[] = [];

  // Protein type
  availableProteins: string[] = [
    ProductViewText.CASEIN,
    ProductViewText.PLANT_BASED_PROTEIN,
    ProductViewText.DAIRY_FREE_PROTEIN,
    ProductViewText.WHEY_PROTEIN,
    ProductViewText.ANIMAL_BASED_PROTEIN
  ];
  translatedProteins: string[] = [];
  selectedProteinType: string = '';

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

  // New supplement to be created
  newFoodSupliment: FoodSupliment;

  // create or modify an existing product
  isProductEdit: boolean = false;
  foodSuplimentId: string = '';

  constructor(private route: ActivatedRoute, private storage: AngularFireStorage, private db: AngularFirestore, private location: Location, private translate: TranslateService, public dialog: MatDialog, private changeDetector: ChangeDetectorRef, private documentumHandler: DocumentHandlerService) { }

  ngOnInit(): void {
    this.newFoodSupliment = {
      id: "",
      productName: "",
      productCategory: "",
      description: "",
      dosageUnit: "",
      dailyDosage: null,
      flavors: [],

      safeForConsumptionDuringBreastfeeding: true,
      safeForConsumptionDuringPregnancy: true,

      nutritionalTable: null,

      proteinType: "",
      allergens: [],

      vitaminList: [],
      genderList: [],

      prices: []
    }
    this.route.params.subscribe(params => {
      // get the food supliment product by id
      this.documentumHandler.getInnerDocumentByID("products", ProductViewText.FOOD_SUPLIMENTS, "allProduct", params['productId']).subscribe((foodSupliment: FoodSupliment) => {
        // make a copy from the object
        this.newFoodSupliment = { ...foodSupliment };

        // if it's not undefinied (so the user want to edit a specified product not create a new)
        if (this.newFoodSupliment.productName !== undefined) {
          this.foodSuplimentId = this.newFoodSupliment.id;
          this.isProductEdit = true;
          // pass the value to the object
          this.selectedCategory = this.newFoodSupliment.productCategory;
          if (this.selectedCategory === this.translate.instant(ProductViewText.PROTEINS)) {
            this.isProtein = true;
          }
          this.selectedUnit = this.newFoodSupliment.dosageUnit;

          // prices
          this.productPrices = this.newFoodSupliment.prices;

          // flavor and allergies list
          this.selectedProteinType = this.newFoodSupliment.proteinType;
          this.selectedFlavors = this.newFoodSupliment.flavors;
          this.selectedAllergenes = this.newFoodSupliment.allergens;

          // safety
          this.isSafeForConsumptionDuringBreastfeeding = this.newFoodSupliment.safeForConsumptionDuringBreastfeeding;
          this.isSafeForConsumptionDuringPregnancy = this.newFoodSupliment.safeForConsumptionDuringPregnancy;

          // genders
          if ((this.selectedCategory === this.translate.instant(ProductViewText.JOIN_SUPPORT) || (this.selectedCategory === this.translate.instant(ProductViewText.VITAMINS_AND_MINERALS)))) {
            this.selectedGenders = this.newFoodSupliment.genderList;
          }

          //vitamin
          this.vitaminList = this.newFoodSupliment.vitaminList;
          if (this.selectedCategory === this.translate.instant(ProductViewText.VITAMINS_AND_MINERALS)) {
            this.isJoinSupport = true;
            this.isProtein = this.isVitamin = false;
            this.resetFlavors([ProductViewText.UNFLAVORED], true);
          }

          if (this.selectedCategory === this.translate.instant(ProductViewText.JOIN_SUPPORT)) {
            this.isVitamin = true;
            this.isProtein = this.isJoinSupport = false;
            this.resetFlavors([ProductViewText.UNFLAVORED], true);
          }


          // nutritional table
          if ((this.selectedCategory !== this.translate.instant(ProductViewText.JOIN_SUPPORT) && (this.selectedCategory !== this.translate.instant(ProductViewText.VITAMINS_AND_MINERALS)))) {
            this.nutritionalTable = this.newFoodSupliment.nutritionalTable;
          }


        }
      });
    });
    // Listen for language change and re-translate categories
    this.translate.onLangChange.subscribe(() => {
      this.translateAndSortItems();
    });
    this.translateAndSortItems();
  }

  // Translate and sort product categories, genders, flavors, proteins and allergies
  translateAndSortItems(): void {
    // categories
    this.translatedCategories = this.productCategories.map(item => this.translate.instant(item));
    this.translatedCategories.sort((a, b) => a.localeCompare(b));

    // Genders
    this.translatedGenders = this.availableGenders.map(item => this.translate.instant(item));
    this.translatedGenders.sort((a, b) => a.localeCompare(b));

    // Flavors
    this.translatedFlavors = this.availableFlavors.map(item => this.translate.instant(item));
    this.translatedFlavors.sort((a, b) => a.localeCompare(b));

    // Proteins
    this.translatedProteins = this.availableProteins.map(item => this.translate.instant(item));
    this.translatedProteins.sort((a, b) => a.localeCompare(b));

    // Allergens
    this.translatedAllergens = this.availableAllergens.map(item => this.translate.instant(item));
    this.translatedAllergens.sort((a, b) => a.localeCompare(b));
  }

  // Update UI based on selected category
  // If the selected category is vitamins or join supports then the product must be unflavored otherwise flavored
  isCategorySelected() {
    switch (this.selectedCategory) {
      case this.translate.instant(ProductViewText.PROTEINS):
        this.isProtein = true;
        this.resetFlavors(
          [
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
            ProductViewText.BLACK_BISCUIT_FLAVOR
          ]);
        this.isVitamin = this.isJoinSupport = false;
        break;
      case this.translate.instant(ProductViewText.JOIN_SUPPORT):
        this.isJoinSupport = true;
        this.isProtein = this.isVitamin = false;
        this.resetFlavors([ProductViewText.UNFLAVORED], true);
        break;
      case this.translate.instant(ProductViewText.VITAMINS_AND_MINERALS):
        this.isVitamin = true;
        this.isProtein = this.isJoinSupport = false;
        this.resetFlavors([ProductViewText.UNFLAVORED], true);
        break;
      default:
        this.isProtein = this.isVitamin = this.isJoinSupport = false;
        this.resetFlavors(
          [
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
            ProductViewText.BLACK_BISCUIT_FLAVOR
          ]);
    }
  }

  // Helper to reset and update the flavor list
  resetFlavors(flavors: string[], selectFirst = false) {
    this.availableFlavors = flavors;
    this.selectedFlavors = selectFirst ? [this.translate.instant(flavors[0])] : [];
    this.translateAndSortItems();
    this.changeDetector.detectChanges();
  }

  // Handle selection of flavors, allergens, and genders
  selectionOfTheList(type: string, item: string): void {
    switch (type) {
      case ProductViewText.FLAVORS:
        this.toggleSelection(this.selectedFlavors, item);
        if ((this.isVitamin || this.isJoinSupport) && (this.selectedFlavors.length === 0)) {
          this.selectedFlavors.push(this.translate.instant(this.availableFlavors[0]))
        }
        break;
      case ProductViewText.ALLERGENES:
        this.toggleSelection(this.selectedAllergenes, item);
        break;
      case ProductViewText.GENDER:
        this.toggleSelection(this.selectedGenders, item);
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
    if (type === ProductViewText.FLAVORS && this.isCategorySelectableForFlavors()) {
      this.removeItem(this.selectedFlavors, item);
    }
    if (type === ProductViewText.ALLERGENES) {
      this.removeItem(this.selectedAllergenes, item);
    }
    if (type === ProductViewText.GENDER) {
      this.removeItem(this.selectedGenders, item);
    }
  }

  // Check if flavors can be deselected for the category
  isCategorySelectableForFlavors() {
    return !(this.isJoinSupport || this.isVitamin);
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
        productCategory: ProductViewText.FOOD_SUPLIMENTS
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
        productCategory: ProductViewText.FOOD_SUPLIMENTS
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
      }
    });
  }

  deletePrice(id: number) {
    this.productPrices.splice(id, 1);
  }

  // Handle vitamin list addition or update
  handleVitaminList(editVitamin: boolean) {
    if (!this.vitaminName || !this.vitaminQuantity || !this.selectedVitaminUnit) {
      this.vitaminMissingFieldsError = true;
      return;
    }

    this.vitaminMissingFieldsError = false;

    // Check if the vitamin already exists in the list
    const existingVitaminIndex = this.vitaminList.findIndex(vitamin => vitamin.name.toLowerCase() === this.vitaminName.toLowerCase());

    if (existingVitaminIndex !== -1) {
      // If it exists, update the existing vitamin
      this.vitaminList[existingVitaminIndex] = {
        name: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.vitaminName),
        stock: this.vitaminQuantity,
        unit: this.selectedVitaminUnit,
      };
    } else {
      // If it does not exist, push a new vitamin object
      if (!editVitamin) {
        this.vitaminList.push({
          name: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.vitaminName),
          stock: this.vitaminQuantity,
          unit: this.selectedVitaminUnit,
        });
      } else { // if the user want to edit the selected vitamin
        this.vitaminList[this.modifiedVitaminId] = {
          name: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.vitaminName),
          stock: this.vitaminQuantity,
          unit: this.selectedVitaminUnit,
        }
      }

    }

    this.resetVitaminFields();
  }

  // Reset vitamin input fields
  resetVitaminFields(): void {
    this.vitaminName = '';
    this.vitaminQuantity = null;
    this.selectedVitaminUnit = '';
    this.vitaminModificationIsInProgress = false;
  }

  // Method to display the edit form with existing vitamin data
  displayEditVitamin(id: number) {
    this.modifiedVitaminId = id;
    this.vitaminModificationIsInProgress = true;
    this.selectedVitamin = { ...this.vitaminList[id] };  // Deep copy to avoid object reference issues

    // Assign values to the fields
    this.vitaminName = this.selectedVitamin.name;
    this.vitaminQuantity = this.selectedVitamin.stock;
    this.selectedVitaminUnit = this.selectedVitamin.unit;
  }

  // Method to cancel the vitamin modification
  cancelVitaminModification() {
    // reset input fields
    this.vitaminModificationIsInProgress = false;
    this.vitaminName = '';
    this.vitaminQuantity = null;
    this.selectedVitaminUnit = '';
    this.vitaminMissingFieldsError = false;

    // Reassign the original vitamin object back into the vitamin list
    this.vitaminList[this.modifiedVitaminId] = this.selectedVitamin;
  }

  // Remove vitamin from list by index
  deleteVitamin(index: number) {
    this.vitaminList.splice(index, 1);
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

  async addNewFoodSupplement() {
    // error handleing
    if (this.selectedFlavors.length === 0) {
      this.selectedFlavors.push(this.translate.instant(this.availableFlavors[0]));
    }

    if (this.selectedGenders.length === 0) {
      this.selectedGenders = this.translatedGenders;
    }

    if (this.productPrices.length === 0) {
      this.missingPricesErrorMessage = true;
    } else {
      this.missingPricesErrorMessage = false;
    }

    const checkForDuplication = await this.documentumHandler.checkForDuplicationInnerCollection(
      "products", ProductViewText.FOOD_SUPLIMENTS, "allProduct", "productName", this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createFoodSuplimentForm.value.productName), undefined, ""
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

    // create new Food supliment object
    this.newFoodSupliment = {
      id: "",
      productName: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createFoodSuplimentForm.value.productName),
      productCategory: this.selectedCategory,
      description: this.createFoodSuplimentForm.value.description,
      dosageUnit: this.selectedUnit,
      dailyDosage: this.createFoodSuplimentForm.value.dailyDosage,
      flavors: this.selectedFlavors,

      safeForConsumptionDuringBreastfeeding: this.isSafeForConsumptionDuringBreastfeeding,
      safeForConsumptionDuringPregnancy: this.isSafeForConsumptionDuringPregnancy,

      nutritionalTable: this.nutritionalTable,

      proteinType: this.selectedProteinType,
      allergens: this.selectedAllergenes,

      vitaminList: this.vitaminList,
      genderList: this.selectedGenders,

      prices: []
    }

    // Add the new food supliment product
    try {
      const documentumRef = await this.db.collection("products").doc(ProductViewText.FOOD_SUPLIMENTS).collection("allProduct").add(this.newFoodSupliment);
      // id the document created then save the document id in the field
      await documentumRef.update({ id: documentumRef.id });
      await this.uploadImagesAndSaveProduct(documentumRef.id);
      await documentumRef.update({ prices: this.productPrices });
      this.errorMessage = false;
      this.productNameExistsError = false;
      this.missingPricesErrorMessage = false;
      this.vitaminMissingFieldsError = false;
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

  async editFoodSupliment() {
    // error handleing
    if (this.selectedFlavors.length === 0) {
      this.selectedFlavors.push(this.translate.instant(this.availableFlavors[0]));
    }

    if (this.selectedGenders.length === 0) {
      this.selectedGenders = this.translatedGenders;
    }

    if (this.productPrices.length === 0) {
      this.missingPricesErrorMessage = true;
    } else {
      this.missingPricesErrorMessage = false;
    }

    const checkForDuplication = await this.documentumHandler.checkForDuplicationInnerCollection(
      "products", ProductViewText.FOOD_SUPLIMENTS, "allProduct", "productName", this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createFoodSuplimentForm.value.productName), undefined, this.newFoodSupliment.id
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
    await this.uploadImagesAndSaveProduct(this.foodSuplimentId);

    // create new Food supliment object
    this.newFoodSupliment = {
      id: this.foodSuplimentId,
      productName: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createFoodSuplimentForm.value.productName),
      productCategory: this.selectedCategory,
      description: this.createFoodSuplimentForm.value.description,
      dosageUnit: this.selectedUnit,
      dailyDosage: this.createFoodSuplimentForm.value.dailyDosage,
      flavors: this.selectedFlavors,

      safeForConsumptionDuringBreastfeeding: this.isSafeForConsumptionDuringBreastfeeding,
      safeForConsumptionDuringPregnancy: this.isSafeForConsumptionDuringPregnancy,

      nutritionalTable: this.nutritionalTable,

      proteinType: this.selectedProteinType,
      allergens: this.selectedAllergenes,

      vitaminList: this.vitaminList,
      genderList: this.selectedGenders,

      prices: this.productPrices
    }

    // Edit the food supliment product
    try {
      await this.db.collection("products").doc(ProductViewText.FOOD_SUPLIMENTS).collection("allProduct").doc(this.foodSuplimentId).update(this.newFoodSupliment);

      this.errorMessage = false;
      this.productNameExistsError = false;
      this.missingPricesErrorMessage = false;
      this.vitaminMissingFieldsError = false;
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

  async deleteFoodSupliment() {
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
            console.log(price.productImage)
            // Reference the file by its URL
            const fileRef = this.storage.refFromURL(price.productImage);
            return fileRef.delete().toPromise();  // Returns a promise to delete the image
          }
        });

        // Await all delete promises
        await Promise.all(deleteImagePromises);

        // Delete the product from firestore
        const deleteAddressRef = this.db.collection("products").doc(ProductViewText.FOOD_SUPLIMENTS).collection("allProduct").doc(this.foodSuplimentId);
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
