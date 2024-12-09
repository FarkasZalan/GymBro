import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductViewText } from '../../../admin-profile/product-management/product-view-texts';
import { FilterPageComponent } from '../../../filter-page/filter-page.component';
import { Filter } from '../../../filter-page/filter.model';
import { ProductService } from '../../product.service';
import { OrganicFood } from '../../../admin-profile/product-management/product-models/organic-food.model';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { ProductReeviews } from '../../../admin-profile/product-management/product-models/product-reviews.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-organic-food-list',
  templateUrl: './organic-food-list.component.html',
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
export class OrganicFoodListComponent implements OnInit {
  @ViewChild('toScrollAfterNavigate') toScrollAfterNavigate: ElementRef;
  // store the products one of the array
  organicFoods: OrganicFood[] = [];
  originalOrganicFood: OrganicFood[] = [];

  paginatedOrganicFoods: OrganicFood[] = [];
  itemsPerPage = 12;
  currentPage = 1;

  productViewText = ProductViewText;

  // Add property to store reviews
  productReviews: Map<string, ProductReeviews[]> = new Map();

  // if there are no products in the collection
  emptyCollection: boolean = false;

  filterObject: Filter = {
    category: '',
    language: '',
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

  // Filter section
  availableCategories = [
    ProductViewText.CEREALS,
    ProductViewText.HEALTHY_SNACKS,
    ProductViewText.COOKING_iNGREDIENTS,
    ProductViewText.DRINKS
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

  constructor(private productService: ProductService, private router: Router, private translate: TranslateService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.productService.getAllProductByCategory(ProductViewText.ORGANIC_FOOD).subscribe((organicFoodCollection: OrganicFood[]) => {
      this.organicFoods = organicFoodCollection;
      this.originalOrganicFood = organicFoodCollection;

      // Sort default by name
      this.organicFoods = this.productService.sortOrganicProductsPriceByDESC(this.organicFoods);
      this.originalOrganicFood = this.productService.sortOrganicProductsPriceByDESC(this.originalOrganicFood);

      // Get the reviews for the products
      this.organicFoods.forEach((product) => {
        this.productService.getReviewsForProduct(product.id, ProductViewText.ORGANIC_FOOD)
          .subscribe(reviews => {
            this.productReviews.set(product.id, reviews);
          });

        this.updatePaginatedList();
      });

      // if the collection doesn't have any products
      if (this.organicFoods.length === 0) {
        this.emptyCollection = true;
      }

      this.applyFilters();
    });
  }

  // navigation for the pagination
  updatePaginatedList(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedOrganicFoods = this.organicFoods.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedList();
    this.toScrollAfterNavigate.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  getTotalPages(): number {
    return Math.ceil(this.organicFoods.length / this.itemsPerPage);
  }

  sortAvailableFilterSections() {
    this.availableAllergens.sort((a, b) => this.translate.instant(a).localeCompare(this.translate.instant(b)) || a.localeCompare(b));
    this.availableFlavors.sort((a, b) => this.translate.instant(a).localeCompare(this.translate.instant(b)) || a.localeCompare(b));
  }

  // Method to get the default price for a the products
  getDefaultPrice(foodSupliment: OrganicFood) {
    return foodSupliment.prices.find(price => price.setAsDefaultPrice);
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

  // navigateto the product page
  goToProductPage(productId: string) {
    this.router.navigate(['product/' + ProductViewText.ORGANIC_FOOD + '/' + productId])
  }

  // Filter section on destop
  toggleOrderDropdown() {
    this.isOrderByDropdownOpen = !this.isOrderByDropdownOpen;
  }

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
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
        fromPage: ProductViewText.ORGANIC_FOOD,
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
      this.organicFoods = this.productService.sortOrganicProductsPriceByDESC(this.organicFoods);
    } else if (this.filterObject.orderBy === ProductViewText.ORDER_BY_PRICE_MOST_EXPENSIVE) {
      this.organicFoods = this.productService.sortOrganicProductsPriceByASC(this.organicFoods);
    } else if (this.filterObject.orderBy === ProductViewText.ORDER_BY_NAME_ASC) {
      this.organicFoods = this.productService.sortOrganicProductsByNameASC(this.organicFoods);
    } else if (this.filterObject.orderBy === ProductViewText.ORDER_BY_NAME_DESC) {
      this.organicFoods = this.productService.sortOrganicProductsByNameDESC(this.organicFoods);
    } else if (this.filterObject.orderBy === ProductViewText.ORDER_BY_BEST_RATING) {
      this.organicFoods.sort((a, b) => this.getAverageRating(b.id) - this.getAverageRating(a.id));
    } else if (this.filterObject.orderBy === ProductViewText.ORDER_BY_WORST_RATING) {
      this.organicFoods.sort((a, b) => this.getAverageRating(a.id) - this.getAverageRating(b.id));
    }

    this.updatePaginatedList();
  }



  applyFilters() {
    this.organicFoods = this.originalOrganicFood.filter((item) => {
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

      // If all conditions are met, include this item
      return true;
    });

    if (this.organicFoods.length === 0) {
      this.emptyCollection = true;
    } else {
      this.emptyCollection = false;
      this.orderItems();
    }
    this.updatePaginatedList();
  }

  deleteFilters() {
    this.organicFoods = [...this.originalOrganicFood];
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
