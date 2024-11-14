import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../products/product.service';
import { ProductViewText } from '../product-view-texts';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-products-categories',
  templateUrl: './products-categories.component.html',
  styleUrl: '../../../../styles/products.scss'
})
export class ProductsCategoriesComponent implements OnInit {
  // products number by categories
  foodSuplimentsCount: number;
  organicProductsCount: number;
  ClothesCount: number;
  accessoriesCount: number;

  // number of the unchecked reviews by category
  uncheckedFoodSuplimentsReviewsCount: number = 0;
  uncheckedOrganicFoodReviewsCount: number = 0;
  uncheckedClothesReviewsCount: number = 0;
  uncheckedAccessoriesReviewsCount: number = 0;

  constructor(private productServie: ProductService, private router: Router, private adminService: AdminService) { }

  async ngOnInit(): Promise<void> {
    // get the products count by the categories
    this.productServie.getAllProductByCategory(ProductViewText.FOOD_SUPLIMENTS).subscribe(foodSuplimentsLenth => {
      this.foodSuplimentsCount = foodSuplimentsLenth.length;
    });
    this.productServie.getAllProductByCategory(ProductViewText.ORGANIC_FOOD).subscribe(organicProductLengths => {
      this.organicProductsCount = organicProductLengths.length;
    });
    this.productServie.getAllProductByCategory(ProductViewText.CLOTHES).subscribe(clothesLength => {
      this.ClothesCount = clothesLength.length;
    });
    this.productServie.getAllProductByCategory(ProductViewText.ACCESSORIES).subscribe(accessoriesLenth => {
      this.accessoriesCount = accessoriesLenth.length;
    });

    // get the products unchecked/new reviews count by the categories
    (await this.adminService.getProductUncheckedProductReviewsNumber(ProductViewText.FOOD_SUPLIMENTS)).subscribe(unCheckedNumbers => {
      this.uncheckedFoodSuplimentsReviewsCount = unCheckedNumbers;
    });

    (await this.adminService.getProductUncheckedProductReviewsNumber(ProductViewText.ORGANIC_FOOD)).subscribe(unCheckedNumbers => {
      this.uncheckedOrganicFoodReviewsCount = unCheckedNumbers;
    });

    (await this.adminService.getProductUncheckedProductReviewsNumber(ProductViewText.CLOTHES)).subscribe(unCheckedNumbers => {
      this.uncheckedClothesReviewsCount = unCheckedNumbers;
    });

    (await this.adminService.getProductUncheckedProductReviewsNumber(ProductViewText.ACCESSORIES)).subscribe(unCheckedNumbers => {
      this.uncheckedAccessoriesReviewsCount = unCheckedNumbers;
    });
  }

  // // navigate and pass the products category to the products list component
  goToFoodSupliments() {
    this.router.navigate(['/admin-profile/pruducts', ProductViewText.FOOD_SUPLIMENTS]);
  }

  goToHealthyProducts() {
    this.router.navigate(['/admin-profile/pruducts', ProductViewText.ORGANIC_FOOD]);
  }

  goToClothes() {
    this.router.navigate(['/admin-profile/pruducts', ProductViewText.CLOTHES]);
  }

  goToAccessories() {
    this.router.navigate(['/admin-profile/pruducts', ProductViewText.ACCESSORIES]);
  }
}
