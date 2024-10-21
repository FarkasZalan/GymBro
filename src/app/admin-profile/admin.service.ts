import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Router } from "@angular/router";
import { User } from "../user/user.model";
import { AuthService } from "../auth/auth.service";
import { FoodSupliment } from "../products/product-models/food-supliment.model";

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


    // Sort by productName in ascending order
    sortFoodSuplimentsByNameAsc(foodSupliments: FoodSupliment[]): FoodSupliment[] {
        return foodSupliments.sort((a, b) => a.productName.localeCompare(b.productName));
    }

    // Sort by productName in descending order
    sortFoodSuplimentsByNameDesc(foodSupliments: FoodSupliment[]): FoodSupliment[] {
        return foodSupliments.sort((a, b) => b.productName.localeCompare(a.productName));
    }
}