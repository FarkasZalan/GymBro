import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../../products/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FoodSupliment } from '../../../../products/product-models/food-supliment.model';
import { HealthyProduct } from '../../../../products/product-models/healthy-food.model';
import { Clothes } from '../../../../products/product-models/clothing.model';
import { Location } from '@angular/common';
import { Accessories } from '../../../../products/product-models/accessories.model';
import { ProductViewText } from '../../../../products/product-view-texts';
import { AdminService } from '../../../admin.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrl: '../../../../../styles/products.scss'
})
export class ProductsListComponent implements OnInit {
  // store the products one of the array based on the productCategory value
  foodSupliments: FoodSupliment[];
  healthyProducts: HealthyProduct[];
  clothes: Clothes[];
  accessories: Accessories[];
  productCategory: string = '';

  // if there are no products in the collection
  emptyCollection: boolean;

  constructor(private productServie: ProductService, private adminService: AdminService, private router: Router, private route: ActivatedRoute, private location: Location, private translate: TranslateService) { }

  ngOnInit() {
    // get the category of the products from the category component
    this.route.params.subscribe(params => {
      this.productCategory = params['productCategory'];
      if (this.productCategory === ProductViewText.FOOD_SUPLIMENTS) {
        this.productServie.getAllProductByCategory(this.productCategory).subscribe((foodSuplimentsCollection: FoodSupliment[]) => {
          this.foodSupliments = foodSuplimentsCollection;

          // Sort default by name
          this.foodSupliments = this.adminService.sortFoodSuplimentsByNameASC(this.foodSupliments);

          // if the collection doesn't have any products
          if (this.foodSupliments.length === 0) {
            this.emptyCollection = true;
          }
        });
      }
      if (this.productCategory === ProductViewText.HEALTHY_FOOD) {
        this.productServie.getAllProductByCategory(this.productCategory).subscribe((healthyProductsCollection: HealthyProduct[]) => {
          this.healthyProducts = healthyProductsCollection;

          // if the collection doesn't have any products
          if (this.healthyProducts.length === 0) {
            this.emptyCollection = true;
          }
        });
      }
      if (this.productCategory === ProductViewText.CLOTHES) {
        this.productServie.getAllProductByCategory(this.productCategory).subscribe((clothesCollection: Clothes[]) => {
          this.clothes = clothesCollection;

          // if the collection doesn't have any products
          if (this.clothes.length === 0) {
            this.emptyCollection = true;
          }
        });
      }
      if (this.productCategory === ProductViewText.ACCESSORIES) {
        this.productServie.getAllProductByCategory(this.productCategory).subscribe((accessoriesCollection: Accessories[]) => {
          this.accessories = accessoriesCollection;

          // if the collection doesn't have any products
          if (this.accessories.length === 0) {
            this.emptyCollection = true;
          }
        });
      }
    });
  }

  // Method to get the default price for a specific food supplement
  getDefaultPrice(foodSupliment: FoodSupliment) {
    return foodSupliment.prices.find(price => price.setAsDefaultPrice);
  }

  back() {
    this.location.back();
    this.router.navigate(['admin-profile']);
  }

  // navigate and add the products category to the create product components
  goToCreateProduct() {
    this.router.navigate(['admin-profile/create-product/' + this.productCategory])
  }

  // navigate and add the products category to the edit product components
  goToEditProduct(productId: string) {
    this.router.navigate(['admin-profile/edit-product/' + this.productCategory + '/' + productId])
  }
}
