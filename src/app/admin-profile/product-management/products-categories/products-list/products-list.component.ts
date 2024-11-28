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
import { LoadingService } from '../../../../loading-spinner/loading.service';

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

  // Add property to store reviews
  productReviews: Map<string, ProductReeviews[]> = new Map();

  constructor(private productServie: ProductService,
    private router: Router, private route: ActivatedRoute, private location: Location, private adminService: AdminService, public loadingService: LoadingService) { }

  ngOnInit() {
    // get the category of the products from the category component
    this.route.params.subscribe(params => {
      this.productCategory = params['productCategory'];
      this.loadProducts();
    });
  }

  // New method to handle product loading
  private async loadProducts() {
    await this.loadingService.withLoading(async () => {
      if (this.productCategory === ProductViewText.FOOD_SUPLIMENTS) {
        this.productServie.getAllProductByCategory(this.productCategory).subscribe(async (foodSuplimentsCollection: FoodSupliment[]) => {
          this.foodSupliments = foodSuplimentsCollection;
          this.foodSupliments = this.productServie.sortFoodSuplimentsByNameASC(this.foodSupliments);

          // check if products have any unchecked reviews and if yes then get those number
          await this.loadProductReviews(this.foodSupliments);

          if (this.foodSupliments.length === 0) {
            this.emptyCollection = true;
          }
        });
      }
      if (this.productCategory === ProductViewText.ORGANIC_FOOD) {
        this.productServie.getAllProductByCategory(this.productCategory).subscribe(async (organicFoodCollection: OrganicFood[]) => {
          this.organicProducts = organicFoodCollection;
          this.organicProducts = this.productServie.sortOrganicProductsByNameASC(this.organicProducts);

          await this.loadProductReviews(this.organicProducts);

          if (this.organicProducts.length === 0) {
            this.emptyCollection = true;
          }
        });
      }
      if (this.productCategory === ProductViewText.CLOTHES) {
        this.productServie.getAllProductByCategory(this.productCategory).subscribe(async (clothesCollection: Clothes[]) => {
          this.clothes = clothesCollection;
          this.clothes = this.productServie.sortClothesByNameASC(this.clothes);

          await this.loadProductReviews(this.clothes);

          if (this.clothes.length === 0) {
            this.emptyCollection = true;
          }
        });
      }
      if (this.productCategory === ProductViewText.ACCESSORIES) {
        this.productServie.getAllProductByCategory(this.productCategory).subscribe(async (accessoriesCollection: Accessories[]) => {
          this.accessories = accessoriesCollection;
          this.accessories = this.productServie.sortAccessoriesByNameASC(this.accessories);

          await this.loadProductReviews(this.accessories);

          if (this.accessories.length === 0) {
            this.emptyCollection = true;
          }
        });
      }
    });
  }

  // Helper method to load reviews for products
  private async loadProductReviews(products: any[]) {
    for (const product of products) {
      this.adminService.productUncheckedReviewsCount(product.id, this.productCategory)
        .subscribe((count) => {
          this.productReviewCountMap[product.id] = count;
          this.productUncheckedReviewsMap[product.id] = count > 0;
        });

      this.productServie.getReviewsForProduct(product.id, this.productCategory)
        .subscribe(reviews => {
          this.productReviews.set(product.id, reviews);
        });
    }
  }

  // Method to get the reviews for the product
  getProductReviews(productId: string): ProductReeviews[] {
    return this.productReviews.get(productId) || [];
  }

  // Method to get the average rating for the product
  getAverageRating(productId: string): number {
    const reviews = this.getProductReviews(productId);
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / reviews.length;
    return Math.round(average * 100) / 100;
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
    this.router.navigate(['admin-profile/' + this.productCategory + '/reviews/' + '/' + productId])
  }
}
