import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FoodSupliment } from '../../../admin-profile/product-management/product-models/food-supliment.model';
import { ProductViewText } from '../../../admin-profile/product-management/product-view-texts';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ProductService } from '../../product.service';
import { Filter } from '../../../filter-page/filter.model';
import { FilterPageComponent } from '../../../filter-page/filter-page.component';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { ProductReeviews } from '../../../admin-profile/product-management/product-models/product-reviews.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-food-supliments-list',
  templateUrl: './food-supliments-list.component.html',
  styleUrl: '../../../../styles/products.scss',
  animations: [
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
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
export class FoodSuplimentsListComponent implements OnInit {
  @ViewChild('toScrollAfterNavigate') toScrollAfterNavigate: ElementRef;
  // store the products one of the array
  foodSupliments: FoodSupliment[] = [];
  originalFoodSuplimentList: FoodSupliment[] = [];

  // pagination
  paginatedFoodSupliments: FoodSupliment[] = [];
  itemsPerPage = 12;
  currentPage = 1;

  productViewText = ProductViewText;

  // Add property to store reviews
  productReviews: Map<string, ProductReeviews[]> = new Map();

  // if there are no products in the collection
  emptyCollection: boolean = false;

  filterObject: Filter = {
    language: '',
    category: '',
    orderBy: ProductViewText.ORDER_BY_PRICE_CHEAPEST,
    flavors: [],
    allergenes: [],
    safeForConsumptionDuringBreastfeeding: true,
    safeForConsumptionDuringPregnancy: true,
    proteinType: '',
    gender: '',
    color: '',
    size: '',
    clothingType: '',
    material: '',
    equipmentType: ''
  };

  // Filters
  // categories
  availableCategories = [
    ProductViewText.PROTEINS,
    ProductViewText.MASS_GAINERS,
    ProductViewText.AMINO_ACIDS,
    ProductViewText.CREATINES,
    ProductViewText.VITAMINS_AND_MINERALS,
    ProductViewText.JOIN_SUPPORT,
    ProductViewText.FAT_BURNERS
  ];
  isCategoryDropdownOpen: boolean = false;

  // order by
  availableOrders = [
    ProductViewText.ORDER_BY_BEST_RATING,
    ProductViewText.ORDER_BY_WORST_RATING,
    ProductViewText.ORDER_BY_PRICE_CHEAPEST,
    ProductViewText.ORDER_BY_PRICE_MOST_EXPENSIVE,
    ProductViewText.ORDER_BY_NAME_ASC,
    ProductViewText.ORDER_BY_NAME_DESC
  ];
  isOrderByDropdownOpen: boolean = false;

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


  // Allergens
  availableAllergens: string[] = [
    ProductViewText.LACTOSE_FREE_ALLERGEN,
    ProductViewText.GLUTEN_FREE_ALLERGEN,
    ProductViewText.SOY_FREE_ALLERGEN,
    ProductViewText.EGG_FREE_ALLERGEN,
    ProductViewText.SUGAR_FREE_ALLERGEN,
    ProductViewText.PEANUTS_FREE_ALLERGEN,
    ProductViewText.FISH_FREE_ALLERGEN
  ];

  // Protein type
  availableProteins: string[] = [
    ProductViewText.CASEIN,
    ProductViewText.PLANT_BASED_PROTEIN,
    ProductViewText.DAIRY_FREE_PROTEIN,
    ProductViewText.WHEY_PROTEIN,
    ProductViewText.ANIMAL_BASED_PROTEIN
  ];
  isProteinTypeDropdownOpen: boolean = false;

  // Gender
  availableGenders: string[] = [
    ProductViewText.MALE,
    ProductViewText.FEMALE,
    ProductViewText.UNISEX
  ];
  isGenderDropdownOpen: boolean = false;

  constructor(private productService: ProductService, private router: Router, private translate: TranslateService, private dialog: MatDialog) { }

  ngOnInit(): void {
    // sort the available filter sections
    this.sortAvailableFilterSections();

    // get all the products
    this.productService.getAllProductByCategory(ProductViewText.FOOD_SUPLIMENTS).subscribe((foodSuplimentsCollection: FoodSupliment[]) => {
      this.foodSupliments = foodSuplimentsCollection;
      this.originalFoodSuplimentList = foodSuplimentsCollection;

      // Sort default by price
      this.foodSupliments = this.productService.sortFoodSuplimentsByPriceDESC(this.foodSupliments);
      this.originalFoodSuplimentList = this.productService.sortFoodSuplimentsByPriceDESC(this.originalFoodSuplimentList);

      // Get the reviews for the products
      this.foodSupliments.forEach((product) => {
        this.productService.getReviewsForProduct(product.id, ProductViewText.FOOD_SUPLIMENTS)
          .subscribe(reviews => {
            this.productReviews.set(product.id, reviews);
          });

        this.updatePaginatedList();
      });

      this.applyFilters();

      // if the collection doesn't have any products
      if (this.foodSupliments.length === 0) {
        this.emptyCollection = true;
      }
    });
  }

  // navigation for the pagination
  updatePaginatedList(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedFoodSupliments = this.foodSupliments.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedList();
    this.toScrollAfterNavigate.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  getTotalPages(): number {
    return Math.ceil(this.foodSupliments.length / this.itemsPerPage);
  }

  sortAvailableFilterSections() {
    this.availableAllergens.sort((a, b) => this.translate.instant(a).localeCompare(this.translate.instant(b)) || a.localeCompare(b));
    this.availableFlavors.sort((a, b) => this.translate.instant(a).localeCompare(this.translate.instant(b)) || a.localeCompare(b));
  }

  // Method to get the default price for a the products
  getDefaultPrice(foodSupliment: FoodSupliment) {
    return foodSupliment.prices.find(price => price.setAsDefaultPrice);
  }

  // navigateto the product page
  goToProductPage(productId: string) {
    this.router.navigate(['product/' + ProductViewText.FOOD_SUPLIMENTS + '/' + productId])
  }

  // Method to get the reviews for the product
  getProductReviews(productId: string): ProductReeviews[] {
    return this.productReviews.get(productId) || [];
  }

  // Method to get the average rating for the product
  getAverageRating(productId: string): number {
    const reviews = this.getProductReviews(productId);
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / reviews.length;
    return Math.round(average * 100) / 100;
  }

  toggleOrderDropdown() {
    this.isOrderByDropdownOpen = !this.isOrderByDropdownOpen;
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

  // Handle selection of flavors, allergens, and genders
  selectionOfTheList(type: string, item: string): void {
    switch (type) {
      case ProductViewText.FLAVORS:
        this.toggleSelection(this.filterObject.flavors, item);
        break;
      case ProductViewText.ALLERGENES:
        this.toggleSelection(this.filterObject.allergenes, item);
        break;
      case ProductViewText.GENDER:
    }
  }

  // Helper function to toggle item selection in an array
  toggleSelection(list: string[], item: string): void {
    const index = list.indexOf(item);

    // remove item from the list if it's selected othervise add to the list
    index > -1 ? list.splice(index, 1) : list.push(item);
    this.applyFilters();
  }

  // Remove selected item
  removeItemFromTheList(type: string, item: string): void {
    if (type === ProductViewText.FLAVORS) {
      this.removeItem(this.filterObject.flavors, item);
    }
    if (type === ProductViewText.ALLERGENES) {
      this.removeItem(this.filterObject.allergenes, item);
    }
    this.applyFilters();
  }

  // Helper function to remove item from array
  removeItem(list: string[], item: string): void {
    const index = list.indexOf(item);
    if (index > -1) list.splice(index, 1);
  }

  openFilterMenu() {
    const dialogRef = this.dialog.open(FilterPageComponent, {
      data: {
        fromPage: ProductViewText.FOOD_SUPLIMENTS,
        filter: this.filterObject
      }
    });

    dialogRef.afterClosed().subscribe((filterObject: Filter | boolean) => {
      // If true is returned, delete the filters
      if (filterObject === true) {
        this.deleteFilters();
      } else if (filterObject && typeof filterObject === 'object') {
        this.filterObject = filterObject;
        this.applyFilters(); // Apply the filters to the original list
      }
    });
  }

  orderItems() {
    if (this.filterObject.orderBy === ProductViewText.ORDER_BY_PRICE_CHEAPEST) {
      this.foodSupliments = this.productService.sortFoodSuplimentsByPriceDESC(this.foodSupliments);
    } else if (this.filterObject.orderBy === ProductViewText.ORDER_BY_PRICE_MOST_EXPENSIVE) {
      this.foodSupliments = this.productService.sortFoodSuplimentsByPriceASC(this.foodSupliments);
    } else if (this.filterObject.orderBy === ProductViewText.ORDER_BY_NAME_ASC) {
      this.foodSupliments = this.productService.sortFoodSuplimentsByNameASC(this.foodSupliments);
    } else if (this.filterObject.orderBy === ProductViewText.ORDER_BY_NAME_DESC) {
      this.foodSupliments = this.productService.sortFoodSuplimentsByNameDESC(this.foodSupliments);
    } else if (this.filterObject.orderBy === ProductViewText.ORDER_BY_BEST_RATING) {
      this.foodSupliments.sort((a, b) => this.getAverageRating(b.id) - this.getAverageRating(a.id));
    } else if (this.filterObject.orderBy === ProductViewText.ORDER_BY_WORST_RATING) {
      this.foodSupliments.sort((a, b) => this.getAverageRating(a.id) - this.getAverageRating(b.id));
    }

    this.updatePaginatedList();
  }

  applyFilters() {
    this.foodSupliments = this.originalFoodSuplimentList.filter((item) => {
      // Check each filter conditionally

      // Category
      if (this.filterObject.category && item.productCategory !== this.filterObject.category) {
        return false;
      }

      // Flavors (strict check: all filterObject.flavors must be in item.flavors)
      if (this.filterObject.flavors && this.filterObject.flavors.length > 0) {
        const hasExcludedFlavors = this.filterObject.flavors.some(flavor => !item.flavors.includes(flavor));
        if (hasExcludedFlavors) {
          return false;
        }
      }

      // Allergens (strict check: all filterObject.allergenes must be in item.allergens)
      if (this.filterObject.allergenes && this.filterObject.allergenes.length > 0) {
        const hasExcludedAllergens = this.filterObject.allergenes.some(allergen => !item.allergens.includes(allergen));
        if (hasExcludedAllergens) {
          return false;
        }
      }

      // Safe for pregnancy
      if (this.filterObject.safeForConsumptionDuringPregnancy !== undefined &&
        item.safeForConsumptionDuringPregnancy !== this.filterObject.safeForConsumptionDuringPregnancy) {
        return false;
      }

      // Safe for breastfeeding
      if (this.filterObject.safeForConsumptionDuringBreastfeeding !== undefined &&
        item.safeForConsumptionDuringBreastfeeding !== this.filterObject.safeForConsumptionDuringBreastfeeding) {
        return false;
      }

      // Protein type
      if (this.filterObject.proteinType && item.proteinType !== this.filterObject.proteinType) {
        return false;
      }

      // Gender (array contains any)
      if (this.filterObject.gender) {
        if (this.filterObject.gender === ProductViewText.UNISEX) {
          // If the selected gender is UNISEX, allow all items regardless of gender
          return true;
        } else if (!item.genderList.includes(this.filterObject.gender)) {
          // Otherwise, filter based on the selected gender
          return false;
        }
      }

      // If all conditions are met, include this item
      return true;
    });

    if (this.foodSupliments.length === 0) {
      this.emptyCollection = true;
    } else {
      this.emptyCollection = false;
      this.orderItems();
    }
    this.updatePaginatedList();
  }

  deleteFilters() {
    this.foodSupliments = [...this.originalFoodSuplimentList];
    this.filterObject = {
      language: '',
      category: '',
      orderBy: ProductViewText.ORDER_BY_PRICE_CHEAPEST,
      flavors: [],
      allergenes: [],
      safeForConsumptionDuringBreastfeeding: true,
      safeForConsumptionDuringPregnancy: true,
      proteinType: '',
      gender: '',
      color: '',
      size: '',
      clothingType: '',
      material: '',
      equipmentType: ''
    }
    this.emptyCollection = false;

    // to set the default filters
    this.applyFilters();
    this.updatePaginatedList();
  }
}
