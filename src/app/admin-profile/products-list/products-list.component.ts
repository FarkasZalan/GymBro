import { Component, OnInit } from '@angular/core';
import { BasicProduct } from '../../products/product-models/product.model';
import { FoodSupliment } from '../../products/product-models/food-supliment.model';
import { HealthyProduct } from '../../products/product-models/healthy-food.model';
import { Clothes } from '../../products/product-models/clothing.model';
import { Accessories } from '../../products/product-models/accessories.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrl: '../../../styles/profile.scss'
})
export class ProductsListComponent implements OnInit {

  foodSuplimentsCount: number;
  healthyProductsCount: number;
  ClothesCount: number;
  accessoriesCount: number;

  constructor(private db: AngularFirestore) { }

  ngOnInit(): void {
    this.geFoodSuplimentsLength();
    this.geHealthyFoodsLength();
    this.geClothesLength();
    this.geAccessoriesLength();
  }

  geFoodSuplimentsLength() {
    this.db.collection("products").doc("foodSuplements").collection("items").get().subscribe(snapsot => {
      this.foodSuplimentsCount = snapsot.size;
    });
  }

  geHealthyFoodsLength() {
    this.db.collection("products").doc("healthyFoods").collection("items").get().subscribe(snapsot => {
      this.healthyProductsCount = snapsot.size;
    });
  }

  geClothesLength() {
    this.db.collection("products").doc("clothes").collection("items").get().subscribe(snapsot => {
      this.ClothesCount = snapsot.size;
    });
  }

  geAccessoriesLength() {
    this.db.collection("products").doc("accessories").collection("items").get().subscribe(snapsot => {
      this.accessoriesCount = snapsot.size;
    });
  }

  goToFoodSupliments() {

  }
}
