import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../../products/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FoodSupliment } from '../../product-models/food-supliment.model';
import { Clothes } from '../../product-models/clothing.model';
import { Location } from '@angular/common';
import { Accessories } from '../../product-models/accessories.model';
import { ProductViewText } from '../../product-view-texts';
import { OrganicFood } from '../../product-models/organic-food';
import { trigger, transition, style, animate } from '@angular/animations';
import { AdminService } from '../../../admin.service';
import { ProductReeviews } from '../../product-models/product-reviews.model';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrl: '../../../../../styles/products.scss',
  animations: [
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ]
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

  // Map to store unchecked review flags
  productUncheckedReviewsMap: { [productId: string]: boolean } = {};

  // Map to store unchecked review counts
  productReviewCountMap: { [productId: string]: number } = {};

  constructor(private productServie: ProductService, private router: Router, private route: ActivatedRoute, private location: Location, private adminService: AdminService) { }

  ngOnInit() {
    // get the category of the products from the category component
    this.route.params.subscribe(params => {
      this.productCategory = params['productCategory'];
      if (this.productCategory === ProductViewText.FOOD_SUPLIMENTS) {
        this.productServie.getAllProductByCategory(this.productCategory).subscribe(async (foodSuplimentsCollection: FoodSupliment[]) => {
          this.foodSupliments = foodSuplimentsCollection;

          // Sort default by name
          this.foodSupliments = this.productServie.sortFoodSuplimentsByNameASC(this.foodSupliments);

          // check if products have any unchecked reviews and if yes then get those number
          this.foodSupliments.forEach((product) => {
            this.adminService.productUncheckedReviewsCount(product.id, ProductViewText.FOOD_SUPLIMENTS)
              .subscribe((count) => {
                this.productReviewCountMap[product.id] = count; // Store the count of unchecked reviews
                this.productUncheckedReviewsMap[product.id] = count > 0; // Set if there are unchecked reviews
              });
          });

          // if the collection doesn't have any products
          if (this.foodSupliments.length === 0) {
            this.emptyCollection = true;
          }
        });
      }
      if (this.productCategory === ProductViewText.ORGANIC_FOOD) {
        this.productServie.getAllProductByCategory(this.productCategory).subscribe(async (organicFoodCollection: OrganicFood[]) => {
          this.organicProducts = organicFoodCollection;

          // Sort default by name
          this.organicProducts = this.productServie.sortOrganicProductsByNameASC(this.organicProducts);

          // check if products have any unchecked reviews and if yes then get those number
          this.organicProducts.forEach((product) => {
            this.adminService.productUncheckedReviewsCount(product.id, ProductViewText.ORGANIC_FOOD)
              .subscribe((count) => {
                this.productReviewCountMap[product.id] = count; // Store the count of unchecked reviews
                this.productUncheckedReviewsMap[product.id] = count > 0; // Set if there are unchecked reviews
              });
          });

          // if the collection doesn't have any products
          if (this.organicProducts.length === 0) {
            this.emptyCollection = true;
          }
        });
      }
      if (this.productCategory === ProductViewText.CLOTHES) {
        this.productServie.getAllProductByCategory(this.productCategory).subscribe(async (clothesCollection: Clothes[]) => {
          this.clothes = clothesCollection;

          // Sort default by name
          this.clothes = this.productServie.sortClothesByNameASC(this.clothes);

          // check if products have any unchecked reviews and if yes then get those number
          this.clothes.forEach((product) => {
            this.adminService.productUncheckedReviewsCount(product.id, ProductViewText.CLOTHES)
              .subscribe((count) => {
                this.productReviewCountMap[product.id] = count; // Store the count of unchecked reviews
                this.productUncheckedReviewsMap[product.id] = count > 0; // Set if there are unchecked reviews
              });
          });

          // if the collection doesn't have any products
          if (this.clothes.length === 0) {
            this.emptyCollection = true;
          }
        });
      }
      if (this.productCategory === ProductViewText.ACCESSORIES) {
        this.productServie.getAllProductByCategory(this.productCategory).subscribe(async (accessoriesCollection: Accessories[]) => {
          this.accessories = accessoriesCollection;

          // Sort default by name
          this.accessories = this.productServie.sortAccessoriesByNameASC(this.accessories);

          // check if products have any unchecked reviews and if yes then get those number
          this.accessories.forEach((product) => {
            this.adminService.productUncheckedReviewsCount(product.id, ProductViewText.ACCESSORIES)
              .subscribe((count) => {
                this.productReviewCountMap[product.id] = count; // Store the count of unchecked reviews
                this.productUncheckedReviewsMap[product.id] = count > 0; // Set if there are unchecked reviews
              });
          });

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

  // navigate to the product review page
  goToShowReviews(productId: string) {
    this.router.navigate(['admin-profile/reviews/' + '/' + productId])
  }
}
