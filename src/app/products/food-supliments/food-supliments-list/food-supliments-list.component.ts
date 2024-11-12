import { Component, OnInit } from '@angular/core';
import { FoodSupliment } from '../../../admin-profile/product-management/product-models/food-supliment.model';
import { ProductViewText } from '../../../admin-profile/product-management/product-view-texts';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../product.service';
import { Filter } from '../../../filter-page/filter.model';
import { FilterPageComponent } from '../../../filter-page/filter-page.component';
import { trigger, transition, style, animate } from '@angular/animations';

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
  ]
})
export class FoodSuplimentsListComponent implements OnInit {
  // store the products one of the array
  foodSupliments: FoodSupliment[] = [];
  originalFoodSuplimentList: FoodSupliment[] = [];
  productViewText = ProductViewText;

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

  constructor(private productService: ProductService, private router: Router, private route: ActivatedRoute, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.productService.getAllProductByCategory(ProductViewText.FOOD_SUPLIMENTS).subscribe((foodSuplimentsCollection: FoodSupliment[]) => {
      this.foodSupliments = foodSuplimentsCollection;
      this.originalFoodSuplimentList = foodSuplimentsCollection;

      // Sort default by name
      this.foodSupliments = this.productService.sortFoodSuplimentsByPriceASC(this.foodSupliments);
      this.originalFoodSuplimentList = this.productService.sortFoodSuplimentsByPriceASC(this.originalFoodSuplimentList);

      // if the collection doesn't have any products
      if (this.foodSupliments.length === 0) {
        this.emptyCollection = true;
      }
    });
  }

  // Method to get the default price for a the products
  getDefaultPrice(foodSupliment: FoodSupliment) {
    return foodSupliment.prices.find(price => price.setAsDefaultPrice);
  }

  // navigateto the product page
  goToProductPage(productId: string) {
    this.router.navigate(['product/' + ProductViewText.FOOD_SUPLIMENTS + '/' + productId])
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
        if (this.foodSupliments.length === 0) {
          this.emptyCollection = true;
        } else {
          this.emptyCollection = false;

          if (filterObject.orderBy === ProductViewText.ORDER_BY_PRICE_CHEAPEST) {
            this.foodSupliments = this.productService.sortFoodSuplimentsByPriceDESC(this.foodSupliments);
          } else if (filterObject.orderBy === ProductViewText.ORDER_BY_PRICE_MOST_EXPENSIVE) {
            this.foodSupliments = this.productService.sortFoodSuplimentsByPriceASC(this.foodSupliments);
          } else if (filterObject.orderBy === ProductViewText.ORDER_BY_NAME_ASC) {
            this.foodSupliments = this.productService.sortFoodSuplimentsByNameASC(this.foodSupliments);
          } else if (filterObject.orderBy === ProductViewText.ORDER_BY_NAME_DESC) {
            this.foodSupliments = this.productService.sortFoodSuplimentsByNameDESC(this.foodSupliments);
          }
        }
      }
    });
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
  }

  applyFilters() {
    this.foodSupliments = this.originalFoodSuplimentList.filter((item) => {
      // Check each filter conditionally

      // Category
      if (this.filterObject.category && item.productCategory !== this.filterObject.category) {
        return false;
      }

      // Flavors (array contains any)
      if (this.filterObject.flavors && this.filterObject.flavors.length > 0) {
        if (!this.filterObject.flavors.some(flavor => item.flavors.includes(flavor))) {
          return false;
        }
      }

      // Allergens (array contains any)
      if (this.filterObject.allergenes && this.filterObject.allergenes.length > 0) {
        if (!this.filterObject.allergenes.some(allergen => item.allergens.includes(allergen))) {
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
  }
}
