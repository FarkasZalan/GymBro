import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductViewText } from '../../../admin-profile/product-management/product-view-texts';
import { FilterPageComponent } from '../../../filter-page/filter-page.component';
import { Filter } from '../../../filter-page/filter.model';
import { ProductService } from '../../product.service';
import { OrganicFood } from '../../../admin-profile/product-management/product-models/organic-food';
import { trigger, transition, style, animate } from '@angular/animations';

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
  ]
})
export class OrganicFoodListComponent implements OnInit {
  // store the products one of the array
  organicFoods: OrganicFood[] = [];
  originalOrganicFood: OrganicFood[] = [];
  productViewText = ProductViewText;

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

  constructor(private productService: ProductService, private router: Router, private route: ActivatedRoute, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.productService.getAllProductByCategory(ProductViewText.ORGANIC_FOOD).subscribe((organicFoodCollection: OrganicFood[]) => {
      this.organicFoods = organicFoodCollection;
      this.originalOrganicFood = organicFoodCollection;

      // Sort default by name
      this.organicFoods = this.productService.sortOrganicProductsPriceByASC(this.organicFoods);
      this.originalOrganicFood = this.productService.sortOrganicProductsPriceByASC(this.originalOrganicFood);

      // if the collection doesn't have any products
      if (this.organicFoods.length === 0) {
        this.emptyCollection = true;
      }
    });
  }

  // Method to get the default price for a the products
  getDefaultPrice(foodSupliment: OrganicFood) {
    return foodSupliment.prices.find(price => price.setAsDefaultPrice);
  }

  // navigateto the product page
  goToProductPage(productId: string) {
    this.router.navigate(['product/' + ProductViewText.ORGANIC_FOOD + '/' + productId])
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
        if (this.organicFoods.length === 0) {
          this.emptyCollection = true;
        } else {
          this.emptyCollection = false;

          if (filterObject.orderBy === ProductViewText.ORDER_BY_PRICE_CHEAPEST) {
            this.organicFoods = this.productService.sortOrganicProductsPriceByDESC(this.organicFoods);
          } else if (filterObject.orderBy === ProductViewText.ORDER_BY_PRICE_MOST_EXPENSIVE) {
            this.organicFoods = this.productService.sortOrganicProductsPriceByASC(this.organicFoods);
          } else if (filterObject.orderBy === ProductViewText.ORDER_BY_NAME_ASC) {
            this.organicFoods = this.productService.sortOrganicProductsByNameASC(this.organicFoods);
          } else if (filterObject.orderBy === ProductViewText.ORDER_BY_NAME_DESC) {
            this.organicFoods = this.productService.sortOrganicProductsByNameDESC(this.organicFoods);
          }
        }
      }
    });
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
  }

  applyFilters() {
    this.organicFoods = this.originalOrganicFood.filter((item) => {
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

      // If all conditions are met, include this item
      return true;
    });
  }
}
