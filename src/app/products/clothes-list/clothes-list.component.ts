import { Component, OnInit } from '@angular/core';
import { Clothes } from '../../admin-profile/product-management/product-models/clothing.model';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductViewText } from '../../admin-profile/product-management/product-view-texts';
import { FilterPageComponent } from '../../filter-page/filter-page.component';
import { Filter } from '../../filter-page/filter.model';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-clothes-list',
  templateUrl: './clothes-list.component.html',
  styleUrl: '../../../styles/products.scss'
})
export class ClothesListComponent implements OnInit {
  // store the products one of the array
  clothes: Clothes[] = [];
  originaClothes: Clothes[] = [];
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
    this.productService.getAllProductByCategory(ProductViewText.CLOTHES).subscribe((organicFoodCollection: Clothes[]) => {
      this.clothes = organicFoodCollection;
      this.originaClothes = organicFoodCollection;

      // Sort default by name
      this.clothes = this.productService.sortClothesPriceByASC(this.clothes);
      this.originaClothes = this.productService.sortClothesPriceByASC(this.originaClothes);

      // if the collection doesn't have any products
      if (this.clothes.length === 0) {
        this.emptyCollection = true;
      }
    });
  }

  // Method to get the default price for a the products
  getDefaultPrice(foodSupliment: Clothes) {
    return foodSupliment.prices.find(price => price.setAsDefaultPrice);
  }

  // navigateto the product page
  goToProductPage(productId: string) {
    this.router.navigate(['product/' + ProductViewText.CLOTHES + '/' + productId])
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
        if (this.clothes.length === 0) {
          this.emptyCollection = true;
        } else {
          this.emptyCollection = false;

          if (filterObject.orderBy === ProductViewText.ORDER_BY_PRICE_CHEAPEST) {
            this.clothes = this.productService.sortClothesPriceByDESC(this.clothes);
          } else if (filterObject.orderBy === ProductViewText.ORDER_BY_PRICE_MOST_EXPENSIVE) {
            this.clothes = this.productService.sortClothesPriceByASC(this.clothes);
          } else if (filterObject.orderBy === ProductViewText.ORDER_BY_NAME_ASC) {
            this.clothes = this.productService.sortClothesByNameASC(this.clothes);
          } else if (filterObject.orderBy === ProductViewText.ORDER_BY_NAME_DESC) {
            this.clothes = this.productService.sortClothesByNameDESC(this.clothes);
          }
        }
      }
    });
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
  }

  applyFilters() {
    this.clothes = this.originaClothes.filter((item) => {
      // Category
      if (this.filterObject.gender && item.productGender !== this.filterObject.gender) {
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
  }
}
