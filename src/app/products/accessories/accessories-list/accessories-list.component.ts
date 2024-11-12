import { Component, OnInit } from '@angular/core';
import { Accessories } from '../../../admin-profile/product-management/product-models/accessories.model';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductViewText } from '../../../admin-profile/product-management/product-view-texts';
import { FilterPageComponent } from '../../../filter-page/filter-page.component';
import { Filter } from '../../../filter-page/filter.model';
import { ProductService } from '../../product.service';
import { trigger, transition, style, animate } from '@angular/animations';

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
  ]
})
export class AccessoriesListComponent implements OnInit {
  // store the products one of the array
  accessories: Accessories[] = [];
  originalAccessories: Accessories[] = [];
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

  constructor(private productService: ProductService, private router: Router, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.productService.getAllProductByCategory(ProductViewText.ACCESSORIES).subscribe((accessoriesCollection: Accessories[]) => {
      this.accessories = accessoriesCollection;
      this.originalAccessories = accessoriesCollection;

      // Sort default by name
      this.accessories = this.productService.sortAccessoriesPriceByASC(this.accessories);
      this.originalAccessories = this.productService.sortAccessoriesPriceByASC(this.originalAccessories);

      // if the collection doesn't have any products
      if (this.accessories.length === 0) {
        this.emptyCollection = true;
      }
    });
  }

  // Method to get the default price for a the products
  getDefaultPrice(foodSupliment: Accessories) {
    return foodSupliment.prices.find(price => price.setAsDefaultPrice);
  }

  // navigateto the product page
  goToProductPage(productId: string) {
    this.router.navigate(['product/' + ProductViewText.ACCESSORIES + '/' + productId])
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

          if (filterObject.orderBy === ProductViewText.ORDER_BY_PRICE_CHEAPEST) {
            this.accessories = this.productService.sortAccessoriesPriceByDESC(this.accessories);
          } else if (filterObject.orderBy === ProductViewText.ORDER_BY_PRICE_MOST_EXPENSIVE) {
            this.accessories = this.productService.sortAccessoriesPriceByASC(this.accessories);
          } else if (filterObject.orderBy === ProductViewText.ORDER_BY_NAME_ASC) {
            this.accessories = this.productService.sortAccessoriesByNameASC(this.accessories);
          } else if (filterObject.orderBy === ProductViewText.ORDER_BY_NAME_DESC) {
            this.accessories = this.productService.sortAccessoriesByNameDESC(this.accessories);
          }
        }
      }
    });
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
  }

}
