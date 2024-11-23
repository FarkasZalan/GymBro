import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DeleteConfirmationDialogComponent } from '../../../../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { DeleteConfirmationText } from '../../../../delete-confirmation-dialog/delete-text';
import { DocumentHandlerService } from '../../../../document.handler.service';
import { FoodSupliment } from '../../product-models/food-supliment.model';
import { NutritionalTable } from '../../product-models/nutritional-table.model';
import { ProductPrice } from '../../product-models/product-price.model';
import { Vitamin } from '../../product-models/vitamin.model';
import { ProductViewText } from '../../product-view-texts';
import { SuccessfullDialogComponent } from '../../../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../../../successfull-dialog/sucessfull-dialog-text';
import { AddPriceDialogComponent } from '../add-price-dialog/add-price-dialog.component';
import { AdminService } from '../../../admin.service';
import { Editor, Toolbar } from 'ngx-editor';
import { ProductReeviews } from '../../product-models/product-reviews.model';

@Component({
  selector: 'app-handle-food-supliments',
  templateUrl: './handle-food-supliments.component.html',
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
export class HandleFoodSuplimentsComponent implements OnInit {
  @ViewChild('form') createFoodSuplimentForm: NgForm;  // Reference to the form for validation
  @ViewChild('fileInput') fileInput!: ElementRef; // To the upload image button management

  // Form-related properties
  errorMessage: boolean = false;
  productNameExistsError: boolean = false;
  isSafeForConsumptionDuringPregnancy: boolean = true;
  isSafeForConsumptionDuringBreastfeeding: boolean = true;

  selectedUnit: string = '';
  availableDosageUnits: string[] = [
    ProductViewText.GRAM,
    ProductViewText.CAPSULE,
    ProductViewText.POUNDS
  ]
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
  selectedFlavors: string[] = [];

  availableAllergens: string[] = [
    ProductViewText.LACTOSE_FREE_ALLERGEN,
    ProductViewText.GLUTEN_FREE_ALLERGEN,
    ProductViewText.SOY_FREE_ALLERGEN,
    ProductViewText.EGG_FREE_ALLERGEN,
    ProductViewText.SUGAR_FREE_ALLERGEN,
    ProductViewText.PEANUTS_FREE_ALLERGEN,
    ProductViewText.FISH_FREE_ALLERGEN
  ];
  selectedAllergenes: string[] = [];

  // Protein type
  availableProteins: string[] = [
    ProductViewText.CASEIN,
    ProductViewText.PLANT_BASED_PROTEIN,
    ProductViewText.DAIRY_FREE_PROTEIN,
    ProductViewText.WHEY_PROTEIN,
    ProductViewText.ANIMAL_BASED_PROTEIN
  ];
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
    nutritionalValueProteins: null,
    nutritionalValueSalt: null,
  };

  // Food suppliment object to handle the product
  foodSuplimentObject: FoodSupliment;

  // create or modify an existing product
  isProductEdit: boolean = false;
  foodSuplimentId: string = '';

  // use unified image to the product
  isUnifiedImage: boolean = false;
  unifiedImageUrl: string = null;

  // text editor
  editor: Editor;
  toolbar: Toolbar;

  // small description length
  smallDescriptionLength: number = 0;

  description: string = "";

  constructor(private route: ActivatedRoute, private storage: AngularFireStorage, private db: AngularFirestore, private location: Location, public dialog: MatDialog, private changeDetector: ChangeDetectorRef, private documentumHandler: DocumentHandlerService, private adminService: AdminService) { }

  ngOnInit(): void {
    this.editor = new Editor();

    // Set up toolbar with command keys
    this.toolbar = [
      ['bold', "italic", "underline", "strike"],
      ["blockquote", "horizontal_rule"],
      ["ordered_list", "bullet_list"],
      [{ heading: ["h1", "h2", "h3", "h4", "h5", "h6"] }],
      ["link"],
      ["align_left", "align_center", "align_right", "align_justify", "indent", "outdent"],
      ["undo", "redo"]
    ];

    this.foodSuplimentObject = {
      id: "",
      productName: "",
      productCategory: "",
      smallDescription: "",
      ingredients: "",
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

      prices: [],
      useUnifiedImage: this.isUnifiedImage,
    }
    this.route.params.subscribe(params => {
      // get the food supliment product by id
      this.documentumHandler.getInnerDocumentByID("products", ProductViewText.FOOD_SUPLIMENTS, "allProduct", params['productId']).subscribe((foodSupliment: FoodSupliment) => {
        // make a copy from the object
        this.foodSuplimentObject = { ...foodSupliment };

        // if it's not undefinied (so the user want to edit a specified product not create a new)
        if (this.foodSuplimentObject.productName !== undefined) {
          this.foodSuplimentId = this.foodSuplimentObject.id;
          this.isProductEdit = true;
          // pass the value to the object
          this.selectedCategory = this.foodSuplimentObject.productCategory;
          this.smallDescriptionLength = this.foodSuplimentObject.smallDescription.length;
          this.description = foodSupliment.description;
          if (this.selectedCategory === ProductViewText.PROTEINS || this.selectedCategory === ProductViewText.MASS_GAINERS) {
            this.isProtein = true;
          }
          this.selectedUnit = this.foodSuplimentObject.dosageUnit;

          // prices
          this.productPrices = this.foodSuplimentObject.prices;
          this.isUnifiedImage = this.foodSuplimentObject.useUnifiedImage;
          if (this.isUnifiedImage) {
            this.unifiedImageUrl = this.foodSuplimentObject.prices[0].productImage;
          }
          this.sortPrices();

          // flavor and allergies list
          this.selectedProteinType = this.foodSuplimentObject.proteinType;
          this.selectedFlavors = this.foodSuplimentObject.flavors;
          this.selectedAllergenes = this.foodSuplimentObject.allergens;

          // safety
          this.isSafeForConsumptionDuringBreastfeeding = this.foodSuplimentObject.safeForConsumptionDuringBreastfeeding;
          this.isSafeForConsumptionDuringPregnancy = this.foodSuplimentObject.safeForConsumptionDuringPregnancy;

          // genders
          if ((this.selectedCategory === ProductViewText.JOIN_SUPPORT || (this.selectedCategory === ProductViewText.VITAMINS_AND_MINERALS))) {
            this.selectedGenders = this.foodSuplimentObject.genderList;
          }

          //vitamin
          this.vitaminList = this.foodSuplimentObject.vitaminList;
          if (this.selectedCategory === ProductViewText.VITAMINS_AND_MINERALS) {
            this.isJoinSupport = true;
            this.isProtein = this.isVitamin = false;
            this.resetFlavors([ProductViewText.UNFLAVORED], true);
          }

          if (this.selectedCategory === ProductViewText.JOIN_SUPPORT) {
            this.isVitamin = true;
            this.isProtein = this.isJoinSupport = false;
            this.resetFlavors([ProductViewText.UNFLAVORED], true);
          }

          // nutritional table
          if ((this.selectedCategory !== ProductViewText.JOIN_SUPPORT && (this.selectedCategory !== ProductViewText.VITAMINS_AND_MINERALS))) {
            this.nutritionalTable = this.foodSuplimentObject.nutritionalTable;
          }
        }
      });
    });
  }

  // Sort product categories, genders, flavors, proteins and allergies
  sortItems(): void {
    // categories
    this.productCategories.sort((a, b) => a.localeCompare(b));

    // Genders
    this.availableGenders.sort((a, b) => a.localeCompare(b));

    // Flavors
    this.availableFlavors.sort((a, b) => a.localeCompare(b));

    // Proteins
    this.availableProteins.sort((a, b) => a.localeCompare(b));

    // Allergens
    this.availableAllergens.sort((a, b) => a.localeCompare(b));
  }

  // Update UI based on selected category
  // If the selected category is vitamins or join supports then the product must be unflavored otherwise flavored
  isCategorySelected() {
    switch (this.selectedCategory) {
      case ProductViewText.PROTEINS:
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
      case ProductViewText.MASS_GAINERS:
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
      case ProductViewText.JOIN_SUPPORT:
        this.isJoinSupport = true;
        this.isProtein = this.isVitamin = false;
        this.resetFlavors([ProductViewText.UNFLAVORED], true);
        break;
      case ProductViewText.VITAMINS_AND_MINERALS:
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
    this.selectedFlavors = selectFirst ? [flavors[0]] : [];
    this.sortItems();
    this.changeDetector.detectChanges();
  }

  // Handle selection of flavors, allergens, and genders
  selectionOfTheList(type: string, item: string): void {
    switch (type) {
      case ProductViewText.FLAVORS:
        this.toggleSelection(this.selectedFlavors, item);
        if ((this.isVitamin || this.isJoinSupport) && (this.selectedFlavors.length === 0)) {
          this.selectedFlavors.push(this.availableFlavors[0])
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

  // handle upload image button
  triggerImageUpload() {
    this.fileInput.nativeElement.click();
  }

  // handle unified checkbox value
  onUnifiedImageChange(isUnified: boolean) {
    if (isUnified) {
      this.unifiedImageUrl = '';
      this.productPrices.forEach(price => {
        price.productImage = this.unifiedImageUrl
      });
    } else {
      this.unifiedImageUrl = null;
    }
  }

  // Handle file selection and convert to Base64
  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.unifiedImageUrl = reader.result as string; // Base64 string
        this.productPrices.forEach(price => {
          price.productImage = this.unifiedImageUrl
        });
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.unifiedImageUrl = '';
    this.productPrices.forEach(price => {
      price.productImage = this.unifiedImageUrl
    });
  }

  // Open dialog to add new price
  addNewPrice() {
    this.missingPricesErrorMessage = false;
    const dialogRef = this.dialog.open(AddPriceDialogComponent, {
      data: {
        unit: this.selectedUnit,
        allPrices: this.productPrices,
        editText: false,
        useUnifiedImage: this.unifiedImageUrl,
        allFlavors: this.selectedFlavors,
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

        // Check for duplicates before adding
        const existingIndex = this.productPrices.findIndex(price =>
          price.productFlavor === newPrice.productFlavor &&
          price.quantityInProduct === newPrice.quantityInProduct
        );

        if (existingIndex !== -1) {
          // If a duplicate exists, update it instead of pushing a new price
          this.productPrices[existingIndex] = newPrice;
        } else {
          // If no duplicates, add the new price
          this.productPrices.push(newPrice);
        }

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
        allFlavors: this.selectedFlavors,
        selectedFlavor: this.productPrices[id].productFlavor,
        selectedPrice: this.productPrices[id],
        editText: true,
        useUnifiedImage: this.unifiedImageUrl,
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
          });
        }

        // Check if a price with the same flavor and quantity already exists
        const existingIndex = this.productPrices.findIndex(price =>
          price.productFlavor === editedPrice.productFlavor &&
          price.quantityInProduct === editedPrice.quantityInProduct
        );

        if (existingIndex !== -1 && existingIndex !== id) {
          // Update the existing entry and remove duplicates
          this.productPrices[existingIndex] = editedPrice;
          this.productPrices = this.productPrices.filter((price, index) =>
            !(price.productFlavor === editedPrice.productFlavor &&
              price.quantityInProduct === editedPrice.quantityInProduct && index !== existingIndex)
          );
        } else {
          // If no duplicate, update the price at the specified id
          this.productPrices[id] = editedPrice;
        }

        this.sortPrices();
      }
    });
  }

  deletePrice(id: number) {
    this.productPrices.splice(id, 1);
    this.sortPrices();
  }

  sortPrices() {
    this.productPrices = this.productPrices.sort((a, b) => {
      // Get effective prices (considering discounts)
      const priceA = this.getEffectivePrice(a);
      const priceB = this.getEffectivePrice(b);

      return priceA - priceB;
    });
  }

  // Helper method to get the effective price (product price or discounted price)
  private getEffectivePrice(price: ProductPrice): number {
    return price.discountedPrice > 0 ? price.discountedPrice : price.productPrice;
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
      this.selectedFlavors.push(this.availableFlavors[0]);
    }

    if (this.selectedGenders.length === 0) {
      this.selectedGenders = this.availableGenders;
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
        nutritionalValueProteins: 0,
        nutritionalValueSalt: 0
      }
    }

    const hasDefaultPrice = this.productPrices.some(priceObj => priceObj.setAsDefaultPrice);

    if (!hasDefaultPrice) {
      this.productPrices[0].setAsDefaultPrice = true;
    }

    // create new Food supliment object
    this.foodSuplimentObject = {
      id: "",
      productName: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createFoodSuplimentForm.value.productName),
      productCategory: this.selectedCategory,
      smallDescription: this.createFoodSuplimentForm.value.smallDescription,
      ingredients: this.createFoodSuplimentForm.value.ingredients,
      description: this.description,
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

      prices: [],
      useUnifiedImage: this.isUnifiedImage
    }

    // Add the new food supliment product
    try {
      const documentumRef = await this.db.collection("products").doc(ProductViewText.FOOD_SUPLIMENTS).collection("allProduct").add(this.foodSuplimentObject);
      // id the document created then save the document id in the field
      await documentumRef.update({ id: documentumRef.id });
      this.productPrices = await this.adminService.uploadImagesAndSaveProduct(ProductViewText.FOOD_SUPLIMENTS, documentumRef.id, this.unifiedImageUrl, this.productPrices);
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
      this.selectedFlavors.push(this.availableFlavors[0]);
    }

    if (this.selectedGenders.length === 0) {
      this.selectedGenders = this.availableGenders;
    }

    if (this.productPrices.length === 0) {
      this.missingPricesErrorMessage = true;
    } else {
      this.missingPricesErrorMessage = false;
    }

    const checkForDuplication = await this.documentumHandler.checkForDuplicationInnerCollection(
      "products", ProductViewText.FOOD_SUPLIMENTS, "allProduct", "productName", this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createFoodSuplimentForm.value.productName), undefined, this.foodSuplimentObject.id
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
        nutritionalValueProteins: 0,
        nutritionalValueSalt: 0
      }
    }

    const hasDefaultPrice = this.productPrices.some(priceObj => priceObj.setAsDefaultPrice);

    if (!hasDefaultPrice) {
      this.productPrices[0].setAsDefaultPrice = true;
    }
    this.productPrices = await this.adminService.uploadImagesAndSaveProduct(ProductViewText.FOOD_SUPLIMENTS, this.foodSuplimentId, this.unifiedImageUrl, this.productPrices);

    // create new Food supliment object
    this.foodSuplimentObject = {
      id: this.foodSuplimentId,
      productName: this.documentumHandler.makeUpperCaseEveryWordFirstLetter(this.createFoodSuplimentForm.value.productName),
      productCategory: this.selectedCategory,
      smallDescription: this.createFoodSuplimentForm.value.smallDescription,
      ingredients: this.createFoodSuplimentForm.value.ingredients,
      description: this.description,
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

      prices: this.productPrices,
      useUnifiedImage: this.isUnifiedImage
    }

    // Edit the food supliment product
    try {
      await this.db.collection("products").doc(ProductViewText.FOOD_SUPLIMENTS).collection("allProduct").doc(this.foodSuplimentId).update(this.foodSuplimentObject);

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
        await this.adminService.deleteAllFilesInFolder(ProductViewText.FOOD_SUPLIMENTS, this.foodSuplimentId);

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
