import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Accessories } from '../../../admin-profile/product-management/product-models/accessories.model';
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
  selector: 'app-accessories-list',
  templateUrl: './accessories-list.component.html',
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
export class AccessoriesListComponent implements OnInit {
  @ViewChild('toScrollAfterNavigate') toScrollAfterNavigate: ElementRef;
  // store the products one of the array
  accessories: Accessories[] = [];
  originalAccessories: Accessories[] = [];

  // pagination
  paginatedAccessories: Accessories[] = [];
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
  availableProductSizes: string[] = [];

  // accessories type
  availableAccessoriesTypes: string[] = [
    ProductViewText.SHAKERS,
    ProductViewText.WEIGHT_LIFTING
  ];
  isAccessoryDropdownOpen: boolean = false;

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

  constructor(private productService: ProductService, private router: Router, private dialog: MatDialog, private translate: TranslateService) { }

  ngOnInit(): void {
    this.productService.getAllProductByCategory(ProductViewText.ACCESSORIES).subscribe((accessoriesCollection: Accessories[]) => {
      this.accessories = accessoriesCollection;
      this.originalAccessories = accessoriesCollection;

      // Sort default by name
      this.accessories = this.productService.sortAccessoriesPriceByDESC(this.accessories);
      this.originalAccessories = this.productService.sortAccessoriesPriceByDESC(this.originalAccessories);

      // Get the reviews for the products
      this.accessories.forEach((product) => {
        this.productService.getReviewsForProduct(product.id, ProductViewText.ACCESSORIES)
          .subscribe(reviews => {
            this.productReviews.set(product.id, reviews);
          });
        this.updatePaginatedList();
      });

      this.applyFilters();

      // if the collection doesn't have any products
      if (this.accessories.length === 0) {
        this.emptyCollection = true;
      }
    });
  }

  // navigation for the pagination
  updatePaginatedList(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedAccessories = this.accessories.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.toScrollAfterNavigate.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.updatePaginatedList();
  }

  getTotalPages(): number {
    return Math.ceil(this.accessories.length / this.itemsPerPage);
  }

  sortAvailableFilterSections() {
    this.availableAccessoriesTypes.sort((a, b) => this.translate.instant(a).localeCompare(this.translate.instant(b)) || a.localeCompare(b));
    this.availableColors.sort((a, b) => this.translate.instant(a).localeCompare(this.translate.instant(b)) || a.localeCompare(b));
  }

  // Method to get the default price for a the products
  getDefaultPrice(foodSupliment: Accessories) {
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
    this.router.navigate(['product/' + ProductViewText.ACCESSORIES + '/' + productId])
  }

  // Filter section for bigger screens
  isAccessoryTypeSelected() {
    if (this.filterObject.equipmentType === ProductViewText.SHAKERS) {

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

    this.filterObject.color = '';
    this.filterObject.size = '';
  }

  toggleAccessoryTypeDropdown() {
    this.isAccessoryDropdownOpen = !this.isAccessoryDropdownOpen;
  }

  toggleOrderDropdown() {
    this.isOrderByDropdownOpen = !this.isOrderByDropdownOpen;
  }

  toggleColorDropdown() {
    this.isColorDropdownOpen = !this.isColorDropdownOpen;
  }

  openFilterMenu() {
    const dialogRef = this.dialog.open(FilterPageComponent, {
      data: {
        fromPage: ProductViewText.ACCESSORIES,
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
        if (this.accessories.length === 0) {
          this.emptyCollection = true;
        } else {
          this.emptyCollection = false;
          this.orderItems();
        }
      }
    });
  }

  orderItems() {
    if (this.filterObject.orderBy === ProductViewText.ORDER_BY_PRICE_CHEAPEST) {
      this.accessories = this.productService.sortAccessoriesPriceByDESC(this.accessories);
    } else if (this.filterObject.orderBy === ProductViewText.ORDER_BY_PRICE_MOST_EXPENSIVE) {
      this.accessories = this.productService.sortAccessoriesPriceByASC(this.accessories);
    } else if (this.filterObject.orderBy === ProductViewText.ORDER_BY_NAME_ASC) {
      this.accessories = this.productService.sortAccessoriesByNameASC(this.accessories);
    } else if (this.filterObject.orderBy === ProductViewText.ORDER_BY_NAME_DESC) {
      this.accessories = this.productService.sortAccessoriesByNameDESC(this.accessories);
    } else if (this.filterObject.orderBy === ProductViewText.ORDER_BY_BEST_RATING) {
      this.accessories.sort((a, b) => this.getAverageRating(b.id) - this.getAverageRating(a.id));
    } else if (this.filterObject.orderBy === ProductViewText.ORDER_BY_WORST_RATING) {
      this.accessories.sort((a, b) => this.getAverageRating(a.id) - this.getAverageRating(b.id));
    }

    this.updatePaginatedList();
  }

  applyFilters() {
    this.accessories = this.originalAccessories.filter((item) => {
      // Caterory
      if (this.filterObject.category && item.productCategory !== this.filterObject.category) {
        return false;
      }

      // EquipmentType
      if (this.filterObject.equipmentType && item.equipmentType !== this.filterObject.equipmentType) {
        return false;
      }

      // Filtering prices array based on color and size
      const filteredPrices = item.prices.filter((price) => {
        // 3.1 Check color filter
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
    if (this.accessories.length === 0) {
      this.emptyCollection = true;
    } else {
      this.emptyCollection = false;
      this.orderItems();
    }
    this.updatePaginatedList();
  }

  deleteFilters() {
    this.accessories = [...this.originalAccessories];
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
    this.applyFilters();
    this.updatePaginatedList();
  }

}
