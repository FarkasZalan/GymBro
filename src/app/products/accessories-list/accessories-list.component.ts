import { Component, OnInit } from '@angular/core';
import { Accessories } from '../../admin-profile/product-management/product-models/accessories.model';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductViewText } from '../../admin-profile/product-management/product-view-texts';
import { FilterPageComponent } from '../../filter-page/filter-page.component';
import { Filter } from '../../filter-page/filter.model';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-accessories-list',
  templateUrl: './accessories-list.component.html',
  styleUrl: '../../../styles/products.scss'
})
export class AccessoriesListComponent implements OnInit {
  // store the products one of the array
  accessories: Accessories[];
  productViewText = ProductViewText;

  // if there are no products in the collection
  emptyCollection: boolean = false;

  filterObject: Filter = {
    language: '',
    orderBy: ProductViewText.ORDER_BY_LATEST
  };

  constructor(private productService: ProductService, private router: Router, private route: ActivatedRoute, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.productService.getAllProductByCategory(ProductViewText.ACCESSORIES).subscribe((organicFoodCollection: Accessories[]) => {
      this.accessories = organicFoodCollection;

      // Sort default by name
      this.accessories = this.productService.sortAccessoriesPriceByASC(this.accessories);

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

    });
  }

}
