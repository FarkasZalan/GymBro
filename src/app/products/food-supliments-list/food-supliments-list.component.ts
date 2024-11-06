import { Component, OnInit } from '@angular/core';
import { FoodSupliment } from '../../admin-profile/product-management/product-models/food-supliment.model';
import { ProductViewText } from '../../admin-profile/product-management/product-view-texts';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../product.service';
import { Filter } from '../../filter-page/filter.model';
import { FilterPageComponent } from '../../filter-page/filter-page.component';

@Component({
  selector: 'app-food-supliments-list',
  templateUrl: './food-supliments-list.component.html',
  styleUrl: '../../../styles/products.scss'
})
export class FoodSuplimentsListComponent implements OnInit {
  // store the products one of the array
  foodSupliments: FoodSupliment[];
  productViewText = ProductViewText;

  // if there are no products in the collection
  emptyCollection: boolean = false;

  filterObject: Filter = {
    language: '',
    orderBy: ProductViewText.ORDER_BY_LATEST
  };

  constructor(private productService: ProductService, private router: Router, private route: ActivatedRoute, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.productService.getAllProductByCategory(ProductViewText.FOOD_SUPLIMENTS).subscribe((foodSuplimentsCollection: FoodSupliment[]) => {
      this.foodSupliments = foodSuplimentsCollection;

      // Sort default by name
      this.foodSupliments = this.productService.sortFoodSuplimentsByPriceASC(this.foodSupliments);

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

    });
  }
}
