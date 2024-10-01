import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../products/product.service';

@Component({
  selector: 'app-products-categories',
  templateUrl: './products-categories.component.html',
  styleUrl: '../../../styles/products.scss'
})
export class ProductsCategoriesComponent implements OnInit {
  foodSuplimentsCount: number;
  healthyProductsCount: number;
  ClothesCount: number;
  accessoriesCount: number;

  constructor(private productServie: ProductService, private router: Router) { }

  // get the products count by the categories
  ngOnInit(): void {
    this.productServie.getAllProductByCategory('foodSupliments').subscribe(foodSuplimentsLenth => {
      this.foodSuplimentsCount = foodSuplimentsLenth.length;
    });
    this.productServie.getAllProductByCategory('healthyProducts').subscribe(healthyFoodsLenth => {
      this.healthyProductsCount = healthyFoodsLenth.length;
    });
    this.productServie.getAllProductByCategory('clothes').subscribe(clothesLength => {
      this.ClothesCount = clothesLength.length;
    });
    this.productServie.getAllProductByCategory('accessories').subscribe(accessoriesLenth => {
      this.accessoriesCount = accessoriesLenth.length;
    });
  }

  // go to the products by category
  goToFoodSupliments() {
    this.router.navigate(['/admin-profile/pruducts', 'foodSupliments']);
  }

  goToHealthyProducts() {
    this.router.navigate(['/admin-profile/pruducts', 'healthyProducts']);
  }

  goToClothes() {
    this.router.navigate(['/admin-profile/pruducts', 'clothes']);
  }

  goToAccessories() {
    this.router.navigate(['/admin-profile/pruducts', 'accessories']);
  }
}
