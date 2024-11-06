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
  clothes: Clothes[];
  productViewText = ProductViewText;

  // if there are no products in the collection
  emptyCollection: boolean = false;

  filterObject: Filter = {
    language: '',
    orderBy: ProductViewText.ORDER_BY_LATEST
  };

  constructor(private productService: ProductService, private router: Router, private route: ActivatedRoute, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.productService.getAllProductByCategory(ProductViewText.CLOTHES).subscribe((organicFoodCollection: Clothes[]) => {
      this.clothes = organicFoodCollection;

      // Sort default by name
      this.clothes = this.productService.sortClothesPriceByASC(this.clothes);

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

    });
  }
}
