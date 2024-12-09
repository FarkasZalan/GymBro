import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Clothes } from '../../../admin-profile/product-management/product-models/clothing.model';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductViewText } from '../../../admin-profile/product-management/product-view-texts';
import { FilterPageComponent } from '../../../filter-page/filter-page.component';
import { Filter } from '../../../filter-page/filter.model';
import { ProductService } from '../../product.service';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { ProductReeviews } from '../../../admin-profile/product-management/product-models/product-reviews.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-clothes-list',
  templateUrl: './clothes-list.component.html',
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
export class ClothesListComponent implements OnInit {
  @ViewChild('toScrollAfterNavigate') toScrollAfterNavigate: ElementRef;
  // store the products one of the array
  clothes: Clothes[] = [];
  originaClothes: Clothes[] = [];

  paginatedClothes: Clothes[] = [];
  itemsPerPage = 12;
  currentPage = 1;

  productViewText = ProductViewText;

  // if there are no products in the collection
  emptyCollection: boolean = false;

  // Add property to store reviews
  productReviews: Map<string, ProductReeviews[]> = new Map();

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
    ProductViewText.MAN_CLOTHES,
    ProductViewText.WOMEN_CLOTHES,
    ProductViewText.UNISEX
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

  // clothing type
  availableClothingTypes: string[] = [
    ProductViewText.COAT,
    ProductViewText.PANTS,
    ProductViewText.SWEATER,
    ProductViewText.T_SHIRT,
    ProductViewText.SPORTS_BRA,
    ProductViewText.TANK_TOP
  ];
  isClothingTypeDropdownOpen: boolean = false;

  // clothing material
  availableMaterials: string[] = [
    ProductViewText.BLENDED_FIBER,
    ProductViewText.COTTON,
  ];
  isMaterialDropdownOpen: boolean = false;

  // cloting size
  availableProductSizes = [
    ProductViewText.XS,
    ProductViewText.S,
    ProductViewText.M,
    ProductViewText.L,
    ProductViewText.XL,
    ProductViewText.XXL,
    ProductViewText.XXXL,
  ];
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
  isColorDropdownOpen: boolean = false;

  constructor(private productService: ProductService, private router: Router, private translate: TranslateService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.productService.getAllProductByCategory(ProductViewText.CLOTHES).subscribe((organicFoodCollection: Clothes[]) => {
      this.clothes = organicFoodCollection;
      this.originaClothes = organicFoodCollection;

      // Sort default by name
      this.clothes = this.productService.sortClothesPriceByDESC(this.clothes);
      this.originaClothes = this.productService.sortClothesPriceByDESC(this.originaClothes);

      // Get the reviews for the products
      this.clothes.forEach((product) => {
        this.productService.getReviewsForProduct(product.id, ProductViewText.CLOTHES)
          .subscribe(reviews => {
            this.productReviews.set(product.id, reviews);
          });

        this.updatePaginatedList();
      });

      this.applyFilters();

      // if the collection doesn't have any products
      if (this.clothes.length === 0) {
        this.emptyCollection = true;
      }
    });
  }

  // navigation for the pagination
  updatePaginatedList(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedClothes = this.clothes.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedList();
    this.toScrollAfterNavigate.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  getTotalPages(): number {
    return Math.ceil(this.clothes.length / this.itemsPerPage);
  }

  sortAvailableFilterSections() {
    this.availableCategories.sort((a, b) => this.translate.instant(a).localeCompare(this.translate.instant(b)) || a.localeCompare(b));
    this.availableColors.sort((a, b) => this.translate.instant(a).localeCompare(this.translate.instant(b)) || a.localeCompare(b));
    this.availableMaterials.sort((a, b) => this.translate.instant(a).localeCompare(this.translate.instant(b)) || a.localeCompare(b));
  }

  // Method to get the default price for a the products
  getDefaultPrice(foodSupliment: Clothes) {
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
    this.router.navigate(['product/' + ProductViewText.CLOTHES + '/' + productId])
  }

  // Filter section on destop
  toggleOrderDropdown() {
    this.isOrderByDropdownOpen = !this.isOrderByDropdownOpen;
  }

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
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

  openFilterMenu() {
    const dialogRef = this.dialog.open(FilterPageComponent, {
      data: {
        fromPage: ProductViewText.CLOTHES,
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
      this.clothes = this.productService.sortClothesPriceByDESC(this.clothes);
    } else if (this.filterObject.orderBy === ProductViewText.ORDER_BY_PRICE_MOST_EXPENSIVE) {
      this.clothes = this.productService.sortClothesPriceByASC(this.clothes);
    } else if (this.filterObject.orderBy === ProductViewText.ORDER_BY_NAME_ASC) {
      this.clothes = this.productService.sortClothesByNameASC(this.clothes);
    } else if (this.filterObject.orderBy === ProductViewText.ORDER_BY_NAME_DESC) {
      this.clothes = this.productService.sortClothesByNameDESC(this.clothes);
    } else if (this.filterObject.orderBy === ProductViewText.ORDER_BY_BEST_RATING) {
      this.clothes.sort((a, b) => this.getAverageRating(b.id) - this.getAverageRating(a.id));
    } else if (this.filterObject.orderBy === ProductViewText.ORDER_BY_WORST_RATING) {
      this.clothes.sort((a, b) => this.getAverageRating(a.id) - this.getAverageRating(b.id));
    }

    this.updatePaginatedList();
  }

  applyFilters() {
    this.clothes = this.originaClothes.filter((item) => {
      // Category
      if (this.filterObject.category && item.productGender !== this.filterObject.category) {
        return false;
      }

      // Clothing Type
      if (this.filterObject.clothingType && item.clothingType !== this.filterObject.clothingType) {
        return false;
      }

      // Material
      if (this.filterObject.material && item.material !== this.filterObject.material) {
        return false;
      }

      // Filtering the prices array based on color and size
      const filteredPrices = item.prices.filter((price) => {
        // Check color filter
        if (this.filterObject.color && price.productColor !== this.filterObject.color) {
          return false;
        }

        // Check size filter
        if (this.filterObject.size && price.productSize !== this.filterObject.size) {
          return false;
        }

        return true; // Keep price entry if it matches the filters
      });

      // If no matching prices exist, exclude this item from the list
      if (filteredPrices.length === 0) {
        return false;
      }

      return true; // Keep the item if it passes all filter conditions
    });

    if (this.clothes.length === 0) {
      this.emptyCollection = true;
    } else {
      this.emptyCollection = false;
      this.orderItems();
    }

    this.updatePaginatedList();
  }

  deleteFilters() {
    this.clothes = [...this.originaClothes];
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
