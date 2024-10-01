import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../products/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FoodSupliment } from '../../../products/product-models/food-supliment.model';
import { HealthyProduct } from '../../../products/product-models/healthy-food.model';
import { Clothes } from '../../../products/product-models/clothing.model';
import { Location } from '@angular/common';
import { Accessories } from '../../../products/product-models/accessories.model';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrl: '../../../../styles/products.scss'
})
export class ProductsListComponent implements OnInit {
  foodSupliments: FoodSupliment[];
  productCategory: string = '';
  healthyProducts: HealthyProduct[];
  clothes: Clothes[];
  accessories: Accessories[];

  // if there are no products in the collection
  emptyCollection: boolean;

  constructor(private productServie: ProductService, private router: Router, private route: ActivatedRoute, private location: Location) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.productCategory = params['productCategory'];
      if (this.productCategory === 'foodSupliments') {
        this.productServie.getAllProductByCategory(this.productCategory).subscribe((foodSuplimentsCollection: FoodSupliment[]) => {
          this.foodSupliments = foodSuplimentsCollection;

          // if the collection doesn't have any products
          if (this.foodSupliments.length === 0) {
            this.emptyCollection = true;
          }
        });
      }
      if (this.productCategory === 'healthyProducts') {
        this.productServie.getAllProductByCategory(this.productCategory).subscribe((healthyProductsCollection: HealthyProduct[]) => {
          this.healthyProducts = healthyProductsCollection;

          // if the collection doesn't have any products
          if (this.healthyProducts.length === 0) {
            this.emptyCollection = true;
          }
        });
      }
      if (this.productCategory === 'clothes') {
        this.productServie.getAllProductByCategory(this.productCategory).subscribe((clothesCollection: Clothes[]) => {
          this.clothes = clothesCollection;

          // if the collection doesn't have any products
          if (this.clothes.length === 0) {
            this.emptyCollection = true;
          }
        });
      }
      if (this.productCategory === 'accessories') {
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

  back() {
    this.location.back();
    this.router.navigate(['admin-profile']);
  }

  goToCreateProduct() {
    this.router.navigate(['admin-profile/create-product', this.productCategory])
  }
}
