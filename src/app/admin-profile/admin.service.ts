import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Router } from "@angular/router";
import { User } from "../user/user.model";
import { AuthService } from "../auth/auth.service";
import { FoodSupliment } from "../products/product-models/food-supliment.model";
import { HealthyProduct } from "../products/product-models/healthy-food.model";

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    constructor(private auth: AngularFireAuth, private db: AngularFirestore, private router: Router, private authService: AuthService) { }

    // Check if a user is authenticated by observing the auth state
    isAuthenticated() {
        return new Promise(resolve => {
            this.auth.onAuthStateChanged(user => {
                this.authService.getCurrentUser(user.uid).subscribe((isAdminUser: User) => {
                    if (isAdminUser.isAdmin) { // check if user is authenticated and is admin
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            });
        });
    }

    getAllFoodSupliments() {
        this.db
            .collection("products")
            .doc("foodSupliments")
            .collection("allFoodSupliment")
            .valueChanges();
    }

    // Sort food supliments
    sortFoodSuplimentsByPriceASC(foodSupliments: FoodSupliment[]) {
        // Sort default by defaul price desc
        return foodSupliments.sort((a, b) => {
            // Find the default price for the food supplement
            const defaultPriceA = a.prices.find(price => price.setAsDefaultPrice)?.productPrice ?? Infinity;
            const defaultPriceB = b.prices.find(price => price.setAsDefaultPrice)?.productPrice ?? Infinity;

            // Sort in ascending order based on the default price
            return defaultPriceB - defaultPriceA;
        });
    }

    sortFoodSuplimentsByPriceDESC(foodSupliments: FoodSupliment[]) {
        // Sort default by defaul price desc
        return foodSupliments.sort((a, b) => {
            // Find the default price for the food supplement
            const defaultPriceA = a.prices.find(price => price.setAsDefaultPrice)?.productPrice ?? Infinity;
            const defaultPriceB = b.prices.find(price => price.setAsDefaultPrice)?.productPrice ?? Infinity;

            // Sort in ascending order based on the default price
            return defaultPriceA - defaultPriceB;
        });
    }

    sortFoodSuplimentsByNameASC(foodSupliments: FoodSupliment[]) {
        return foodSupliments.sort((a, b) => {

            // Sort in ascending order based on product name
            return a.productName.localeCompare(b.productName);
        });
    }

    sortFoodSuplimentsByNameDESC(foodSupliments: FoodSupliment[]) {
        return foodSupliments.sort((a, b) => {

            // Sort in ascending order based on product name
            return b.productName.localeCompare(a.productName);
        });
    }

    // Sort healthy products
    sortHealthyProductsPriceByASC(healthyProducts: HealthyProduct[]) {
        // Sort default by defaul price desc
        return healthyProducts.sort((a, b) => {
            // Find the default price for the food supplement
            const defaultPriceA = a.prices.find(price => price.setAsDefaultPrice)?.productPrice ?? Infinity;
            const defaultPriceB = b.prices.find(price => price.setAsDefaultPrice)?.productPrice ?? Infinity;

            // Sort in ascending order based on the default price
            return defaultPriceB - defaultPriceA;
        });
    }

    sortHealthyProductsPriceByDESC(healthyProducts: HealthyProduct[]) {
        // Sort default by defaul price desc
        return healthyProducts.sort((a, b) => {
            // Find the default price for the food supplement
            const defaultPriceA = a.prices.find(price => price.setAsDefaultPrice)?.productPrice ?? Infinity;
            const defaultPriceB = b.prices.find(price => price.setAsDefaultPrice)?.productPrice ?? Infinity;

            // Sort in ascending order based on the default price
            return defaultPriceA - defaultPriceB;
        });
    }

    sortHealthyProductsByNameASC(healthyProducts: HealthyProduct[]) {
        return healthyProducts.sort((a, b) => {

            // Sort in ascending order based on product name
            return a.productName.localeCompare(b.productName);
        });
    }

    sortHealthyProductsByNameDESC(healthyProducts: HealthyProduct[]) {
        return healthyProducts.sort((a, b) => {

            // Sort in ascending order based on product name
            return b.productName.localeCompare(a.productName);
        });
    }
}