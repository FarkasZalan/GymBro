import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../products/product.service';
import { ProductViewText } from '../../../products/product-view-texts';

@Component({
  selector: 'app-products-categories',
  templateUrl: './products-categories.component.html',
  styleUrl: '../../../../styles/products.scss'
})
export class ProductsCategoriesComponent implements OnInit {
  // products number by categories
  foodSuplimentsCount: number;
  healthyProductsCount: number;
  ClothesCount: number;
  accessoriesCount: number;

  constructor(private productServie: ProductService, private router: Router) { }

  // get the products count by the categories
  ngOnInit(): void {
    this.productServie.getAllProductByCategory(ProductViewText.FOOD_SUPLIMENTS).subscribe(foodSuplimentsLenth => {
      this.foodSuplimentsCount = foodSuplimentsLenth.length;
    });
    this.productServie.getAllProductByCategory(ProductViewText.HEALTHY_PRODUCT).subscribe(healthyFoodsLenth => {
      this.healthyProductsCount = healthyFoodsLenth.length;
    });
    this.productServie.getAllProductByCategory(ProductViewText.CLOTHES).subscribe(clothesLength => {
      this.ClothesCount = clothesLength.length;
    });
    this.productServie.getAllProductByCategory(ProductViewText.ACCESSORIES).subscribe(accessoriesLenth => {
      this.accessoriesCount = accessoriesLenth.length;
    });
  }

  // // navigate and pass the products category to the products list component
  goToFoodSupliments() {
    this.router.navigate(['/admin-profile/pruducts', ProductViewText.FOOD_SUPLIMENTS]);
  }

  goToHealthyProducts() {
    this.router.navigate(['/admin-profile/pruducts', ProductViewText.HEALTHY_PRODUCT]);
  }

  goToClothes() {
    this.router.navigate(['/admin-profile/pruducts', ProductViewText.CLOTHES]);
  }

  goToAccessories() {
    this.router.navigate(['/admin-profile/pruducts', ProductViewText.ACCESSORIES]);
  }
}
