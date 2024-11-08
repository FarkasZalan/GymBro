import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ForgotPasswordComponent } from '../auth/forgot-password/forgot-password.component';
import { ProductViewText } from '../admin-profile/product-management/product-view-texts';
import { Filter } from './filter.model';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-filter-page',
  templateUrl: './filter-page.component.html',
  styleUrl: './filter-page.component.scss',
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
export class FilterPageComponent {
  errorMessage: boolean = false;

  filterObject: Filter;

  productViewText = ProductViewText;

  fromPageFilter: string = '';

  // page from
  isBlog: boolean = false;
  isFoodSupliments: boolean = false;
  isOrganicFood: boolean = false;
  isClothes: boolean = false;
  isAccessories: boolean = false;
  isShakers: boolean = false;

  // order by
  availableOrders: string[] = [];
  selectedOrder: string = '';
  isOrderByDropdownOpen: boolean = false;

  // language
  availableLanguage: string[] = [
    ProductViewText.HUNGARIAN,
    ProductViewText.ENGLISH
  ];
  selectedLanguage: string = '';
  isLanguageDropdownOpen: boolean = false;

  // category
  availableCategories: string[] = [];
  selectedCategory: string = '';
  isCategoryDropdownOpen: boolean = false;

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
    ProductViewText.LACTOSE_ALLERGEN,
    ProductViewText.GLUTEN_ALLERGEN,
    ProductViewText.SOY_ALLERGEN,
    ProductViewText.EGGS_ALLERGEN,
    ProductViewText.ADDED_SUGARS_ALLERGEN,
    ProductViewText.PEANUTS_ALLERGEN,
    ProductViewText.FISH_ALLERGEN
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
  isProteinTypeDropdownOpen: boolean = false;

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
  isClothingTypeDropdownOpen: boolean = false;

  // clothing material
  availableMaterials: string[] = [
    ProductViewText.BLENDED_FIBER,
    ProductViewText.COTTON,
  ];
  selectedMaterial: string = '';
  isMaterialDropdownOpen: boolean = false;

  availableProductSizes: string[] = [];
  selectedSize: string = '';
  isSizeDropdownOpen: boolean = false;

  availableColors: string[] = [
    ProductViewText.BROWN,
    ProductViewText.BURGUNDY,
    ProductViewText.WHITE,
    ProductViewText.BLACK,
    ProductViewText.BLUE,
    ProductViewText.PURPLE,
    ProductViewText.RED,
    ProductViewText.PINK,
    ProductViewText.GRAY,
    ProductViewText.YELLOW,
    ProductViewText.ORANGE,
    ProductViewText.GREEN,
    ProductViewText.BEIGE,
    ProductViewText.MAUVE,
  ];
  selectedColor: string = '';
  isColorDropdownOpen: boolean = false;

  availableGenders: string[] = [
    ProductViewText.MALE,
    ProductViewText.FEMALE,
    ProductViewText.UNISEX
  ];
  selectedGender: string = '';
  isGenderDropdownOpen: boolean = false;

  // accessories type
  availableAccessoriesTypes: string[] = [
    ProductViewText.SHAKERS,
    ProductViewText.WEIGHT_LIFTING
  ];
  selectedAccessoryType: string = '';
  isAccessoryDropdownOpen: boolean = false;

  isSafeForConsumptionDuringBreastfeeding: boolean = true;
  isSafeForConsumptionDuringPregnancy: boolean = true;


  constructor(@Inject(MAT_DIALOG_DATA) public data, public dialog: MatDialog, public dialogRef: MatDialogRef<ForgotPasswordComponent>) {
    this.filterObject = data.filter;
    this.fromPageFilter = data.fromPage;

    this.selectedCategory = this.filterObject.category;
    this.selectedLanguage = this.filterObject.language;
    this.selectedOrder = this.filterObject.orderBy;
    this.selectedFlavors = this.filterObject.flavors;
    this.selectedAllergenes = this.filterObject.allergenes;
    this.isSafeForConsumptionDuringBreastfeeding = this.filterObject.safeForConsumptionDuringBreastfeeding;
    this.isSafeForConsumptionDuringPregnancy = this.filterObject.safeForConsumptionDuringPregnancy;
    this.selectedProteinType = this.filterObject.proteinType;
    this.selectedGender = this.filterObject.gender;
    this.selectedColor = this.filterObject.color;
    this.selectedSize = this.filterObject.size;
    this.selectedClothingType = this.filterObject.clothingType;
    this.selectedMaterial = this.filterObject.material;
    this.selectedAccessoryType = this.filterObject.equipmentType;

    if (this.fromPageFilter === ProductViewText.BLOG) {
      this.isBlog = true;
      this.availableOrders = [
        ProductViewText.ORDER_BY_LATEST,
        ProductViewText.ORDER_BY_OLDEST
      ];
      this.selectedOrder = ProductViewText.ORDER_BY_LATEST;
    } else if (this.fromPageFilter === ProductViewText.FOOD_SUPLIMENTS) {
      this.isFoodSupliments = true;
      this.availableCategories = [
        ProductViewText.PROTEINS,
        ProductViewText.MASS_GAINERS,
        ProductViewText.AMINO_ACIDS,
        ProductViewText.CREATINES,
        ProductViewText.VITAMINS_AND_MINERALS,
        ProductViewText.JOIN_SUPPORT,
        ProductViewText.FAT_BURNERS
      ];

      // order by
      this.availableOrders = [
        ProductViewText.ORDER_BY_PRICE_CHEAPEST,
        ProductViewText.ORDER_BY_PRICE_MOST_EXPENSIVE,
        ProductViewText.ORDER_BY_NAME_ASC,
        ProductViewText.ORDER_BY_NAME_DESC
      ];
    } else if (this.fromPageFilter === ProductViewText.ORGANIC_FOOD) {
      this.isOrganicFood = true;
      this.availableCategories = [
        ProductViewText.CEREALS,
        ProductViewText.HEALTHY_SNACKS,
        ProductViewText.COOKING_iNGREDIENTS,
        ProductViewText.DRINKS
      ];

      // order by
      this.availableOrders = [
        ProductViewText.ORDER_BY_PRICE_CHEAPEST,
        ProductViewText.ORDER_BY_PRICE_MOST_EXPENSIVE,
        ProductViewText.ORDER_BY_NAME_ASC,
        ProductViewText.ORDER_BY_NAME_DESC
      ];
    } else if (this.fromPageFilter === ProductViewText.CLOTHES) {
      this.isClothes = true;
      this.availableCategories = [
        ProductViewText.MAN_CLOTHES,
        ProductViewText.WOMEN_CLOTHES,
      ];

      // order by
      this.availableOrders = [
        ProductViewText.ORDER_BY_PRICE_CHEAPEST,
        ProductViewText.ORDER_BY_PRICE_MOST_EXPENSIVE,
        ProductViewText.ORDER_BY_NAME_ASC,
        ProductViewText.ORDER_BY_NAME_DESC
      ];
    } else if (this.fromPageFilter === ProductViewText.ACCESSORIES) {
      this.isAccessories = true;
      this.availableCategories = [
        ProductViewText.SHAKERS_AND_SPORTS_EQUIPMENTS
      ];
      this.selectedCategory = ProductViewText.SHAKERS_AND_SPORTS_EQUIPMENTS

      if (this.selectedAccessoryType === ProductViewText.SHAKERS) {
        this.isShakers = true;

        this.availableProductSizes = [
          ProductViewText.XS,
          ProductViewText.S,
          ProductViewText.M,
          ProductViewText.L,
          ProductViewText.XL,
          ProductViewText.XXL,
          ProductViewText.XXXL,
        ];
      } else {
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

      // order by
      this.availableOrders = [
        ProductViewText.ORDER_BY_PRICE_CHEAPEST,
        ProductViewText.ORDER_BY_PRICE_MOST_EXPENSIVE,
        ProductViewText.ORDER_BY_NAME_ASC,
        ProductViewText.ORDER_BY_NAME_DESC
      ];
    }

    this.sortItems();
  }

  // Sort product categories, genders, flavors, proteins and allergies
  sortItems(): void {
    // categories
    this.availableCategories.sort((a, b) => a.localeCompare(b));

    // Genders
    this.availableGenders.sort((a, b) => a.localeCompare(b));

    // Flavors
    this.availableFlavors.sort((a, b) => a.localeCompare(b));

    // Proteins
    this.availableProteins.sort((a, b) => a.localeCompare(b));

    // Allergens
    this.availableAllergens.sort((a, b) => a.localeCompare(b));

    // Order by
    this.availableOrders.sort((a, b) => a.localeCompare(b));

    // Language
    this.availableLanguage.sort((a, b) => a.localeCompare(b));

    // Color
    this.availableColors.sort((a, b) => a.localeCompare(b));

    // Clothing type
    this.availableClothingTypes.sort((a, b) => a.localeCompare(b));

    // Material
    this.availableMaterials.sort((a, b) => a.localeCompare(b));

    // Equipment type
    this.availableAccessoriesTypes.sort((a, b) => a.localeCompare(b));
  }

  toggleOrderDropdown() {
    this.isOrderByDropdownOpen = !this.isOrderByDropdownOpen;
  }

  toggleLanguageDropdown() {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  toggleGenderDropdown() {
    this.isGenderDropdownOpen = !this.isGenderDropdownOpen;
  }

  toggleProteinTypeDropdown() {
    this.isProteinTypeDropdownOpen = !this.isProteinTypeDropdownOpen;
  }

  toggleAccessoryTypeDropdown() {
    this.isAccessoryDropdownOpen = !this.isAccessoryDropdownOpen;
  }

  toggleColorDropdown() {
    this.isColorDropdownOpen = !this.isColorDropdownOpen;
  }

  toggleSizeDropdown() {
    this.isSizeDropdownOpen = !this.isSizeDropdownOpen;
  }

  toggleClothingTypeDropdown() {
    this.isClothingTypeDropdownOpen = !this.isClothingTypeDropdownOpen;
  }

  toggleMaterialDropdown() {
    this.isMaterialDropdownOpen = !this.isMaterialDropdownOpen;
  }

  // Handle selection of flavors, allergens, and genders
  selectionOfTheList(type: string, item: string): void {
    switch (type) {
      case ProductViewText.FLAVORS:
        this.toggleSelection(this.selectedFlavors, item);
        break;
      case ProductViewText.ALLERGENES:
        this.toggleSelection(this.selectedAllergenes, item);
        break;
      case ProductViewText.GENDER:
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
    if (type === ProductViewText.FLAVORS) {
      this.removeItem(this.selectedFlavors, item);
    }
    if (type === ProductViewText.ALLERGENES) {
      this.removeItem(this.selectedAllergenes, item);
    }
  }

  // Helper function to remove item from array
  removeItem(list: string[], item: string): void {
    const index = list.indexOf(item);
    if (index > -1) list.splice(index, 1);
  }

  isAccessoryTypeSelected() {
    if (this.selectedAccessoryType === ProductViewText.SHAKERS) {
      this.isShakers = true;

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
    } else {
      this.isShakers = false;

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

  filter() {
    // Blog filter object
    this.filterObject = {
      category: this.selectedCategory,
      orderBy: this.selectedOrder,
      language: this.selectedLanguage,
      flavors: this.selectedFlavors,
      allergenes: this.selectedAllergenes,
      safeForConsumptionDuringBreastfeeding: this.isSafeForConsumptionDuringBreastfeeding,
      safeForConsumptionDuringPregnancy: this.isSafeForConsumptionDuringPregnancy,
      proteinType: this.selectedClothingType,
      gender: this.selectedGender,
      color: this.selectedColor,
      size: this.selectedSize,
      clothingType: this.selectedClothingType,
      material: this.selectedMaterial,
      equipmentType: this.selectedAccessoryType
    }
    this.dialogRef.close(this.filterObject);
  }

  deleteFilter() {
    this.dialogRef.close(true);
  }

  back() {
    this.dialog.closeAll();
  }
}
