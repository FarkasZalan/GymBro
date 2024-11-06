import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../../products/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FoodSupliment } from '../../product-models/food-supliment.model';
import { Clothes } from '../../product-models/clothing.model';
import { Location } from '@angular/common';
import { Accessories } from '../../product-models/accessories.model';
import { ProductViewText } from '../../product-view-texts';
import { OrganicFood } from '../../product-models/organic-food';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrl: '../../../../../styles/products.scss'
})
export class ProductsListComponent implements OnInit {
  // store the products one of the array based on the productCategory value
  foodSupliments: FoodSupliment[];
  organicProducts: OrganicFood[];
  clothes: Clothes[];
  accessories: Accessories[];
  productCategory: string = '';
  productViewText = ProductViewText;

  // if there are no products in the collection
  emptyCollection: boolean;

  constructor(private productServie: ProductService, private router: Router, private route: ActivatedRoute, private location: Location) { }

  ngOnInit() {
    // get the category of the products from the category component
    this.route.params.subscribe(params => {
      this.productCategory = params['productCategory'];
      if (this.productCategory === ProductViewText.FOOD_SUPLIMENTS) {
        this.productServie.getAllProductByCategory(this.productCategory).subscribe((foodSuplimentsCollection: FoodSupliment[]) => {
          this.foodSupliments = foodSuplimentsCollection;

          // Sort default by name
          this.foodSupliments = this.productServie.sortFoodSuplimentsByNameASC(this.foodSupliments);

          // if the collection doesn't have any products
          if (this.foodSupliments.length === 0) {
            this.emptyCollection = true;
          }
        });
      }
      if (this.productCategory === ProductViewText.ORGANIC_FOOD) {
        this.productServie.getAllProductByCategory(this.productCategory).subscribe((organicFoodCollection: OrganicFood[]) => {
          this.organicProducts = organicFoodCollection;

          // Sort default by name
          this.organicProducts = this.productServie.sortOrganicProductsByNameASC(this.organicProducts);

          // if the collection doesn't have any products
          if (this.organicProducts.length === 0) {
            this.emptyCollection = true;
          }
        });
      }
      if (this.productCategory === ProductViewText.CLOTHES) {
        this.productServie.getAllProductByCategory(this.productCategory).subscribe((clothesCollection: Clothes[]) => {
          this.clothes = clothesCollection;

          // Sort default by name
          this.clothes = this.productServie.sortClothesByNameASC(this.clothes);

          // if the collection doesn't have any products
          if (this.clothes.length === 0) {
            this.emptyCollection = true;
          }
        });
      }
      if (this.productCategory === ProductViewText.ACCESSORIES) {
        this.productServie.getAllProductByCategory(this.productCategory).subscribe((accessoriesCollection: Accessories[]) => {
          this.accessories = accessoriesCollection;

          // Sort default by name
          this.accessories = this.productServie.sortAccessoriesByNameASC(this.accessories);

          // if the collection doesn't have any products
          if (this.accessories.length === 0) {
            this.emptyCollection = true;
          }
        });
      }
    });
  }

  // Method to get the default price for the products
  getDefaultPrice(productObject: FoodSupliment) {
    return productObject.prices.find(price => price.setAsDefaultPrice);
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
