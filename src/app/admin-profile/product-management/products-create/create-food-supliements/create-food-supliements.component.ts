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

  constructor(private db: AngularFirestore, private location: Location, private translate: TranslateService, public dialog: MatDialog, private changeDetector: ChangeDetectorRef, private documentumHandler: DocumentHandlerService) { }

  ngOnInit(): void {
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
        editText: false
      }
    });

    dialogRef.afterClosed().subscribe((newPrice: ProductPrice) => {
      if (newPrice) {
        // Ensure product image is not null
        if (newPrice.productImage === null || newPrice.productImage === undefined) {
          newPrice.productImage = "";
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
        selectedPrice: this.productPrices[id],
        editText: true
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
      "products", "foodSupliments", "allFoodSupliment", "productName", this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createFoodSuplimentForm.value.productName), undefined, ""
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

      prices: this.productPrices
    }

    console.log(this.newFoodSupliment)


    // Add the new food supliment product
    try {
      const documentumRef = await this.db.collection("products").doc("foodSupliments").collection("allFoodSupliment").add(this.newFoodSupliment);
      // id the document created then save the document id in the field
      await documentumRef.update({ id: documentumRef.id });
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
      console.log(error);
      this.errorMessage = true;
    }
  }

  back() {
    this.location.back();
  }
}
