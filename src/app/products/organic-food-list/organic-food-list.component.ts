import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductViewText } from '../../admin-profile/product-management/product-view-texts';
import { FilterPageComponent } from '../../filter-page/filter-page.component';
import { Filter } from '../../filter-page/filter.model';
import { ProductService } from '../product.service';
import { OrganicFood } from '../../admin-profile/product-management/product-models/organic-food';

@Component({
  selector: 'app-organic-food-list',
  templateUrl: './organic-food-list.component.html',
  styleUrl: '../../../styles/products.scss'
})
export class OrganicFoodListComponent implements OnInit {
  // store the products one of the array
  organicFoods: OrganicFood[];
  productViewText = ProductViewText;

  // if there are no products in the collection
  emptyCollection: boolean = false;

  filterObject: Filter = {
    language: '',
    orderBy: ProductViewText.ORDER_BY_LATEST
  };

  constructor(private productService: ProductService, private router: Router, private route: ActivatedRoute, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.productService.getAllProductByCategory(ProductViewText.ORGANIC_FOOD).subscribe((organicFoodCollection: OrganicFood[]) => {
      this.organicFoods = organicFoodCollection;

      // Sort default by name
      this.organicFoods = this.productService.sortOrganicProductsPriceByASC(this.organicFoods);

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

    });
  }
}
