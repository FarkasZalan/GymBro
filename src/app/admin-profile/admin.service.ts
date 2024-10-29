import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Router } from "@angular/router";
import { User } from "../user/user.model";
import { AuthService } from "../auth/auth.service";
import { FoodSupliment } from "./product-management/product-models/food-supliment.model";
import { HealthyProduct } from "./product-management/product-models/healthy-food.model";
import { ProductPrice } from "./product-management/product-models/product-price.model";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { Clothes } from "./product-management/product-models/clothing.model";
import { ProductViewText } from "./product-management/product-view-texts";

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    constructor(private auth: AngularFireAuth, private db: AngularFirestore, private storage: AngularFireStorage, private authService: AuthService) { }

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

    async uploadImagesAndSaveProduct(productCategory: string, productId: string, productPrices?: ProductPrice[]) {
        const uploadPromises = productPrices.map(async (price: ProductPrice) => {
            // Check if productImage is a Base64 string (indicating a new upload) or a URL (existing image)
            if (price.productImage && price.productImage.startsWith("data:image")) {
                const base64Data = price.productImage;
                const blob = this.base64ToBlob(base64Data);

                // Define the path in Firebase Storage
                let filePath;
                if (productCategory === ProductViewText.CLOTHES) {
                    filePath = `ProductsImages/${productCategory}/${productId}/${productId}_color_of_the_product: ${price.clothingColor}`;
                } else {
                    filePath = `ProductsImages/${productCategory}/${productId}/${productId}_price_of_the_product: ${price.productPrice}`;
                }
                const fileRef = this.storage.ref(filePath);
                const task = this.storage.upload(filePath, blob);

                // Wait for upload to complete and get the download URL
                await task.snapshotChanges().toPromise();
                const url = await fileRef.getDownloadURL().toPromise();
                price.productImage = url; // Set productImage to the download URL
            }
            // If productImage is already a URL, skip uploading
        });

        // Wait for all images to finish uploading
        await Promise.all(uploadPromises);
        return productPrices;
    }


    // Helper function to convert Base64 string to Blob
    base64ToBlob(base64Data: string): Blob {
        const byteString = atob(base64Data.split(',')[1]);
        const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
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

    // Sort heclothes
    sortClothesPriceByASC(clothes: Clothes[]) {
        // Sort default by defaul price desc
        return clothes.sort((a, b) => {
            // Find the default price for the food supplement
            const defaultPriceA = a.prices.find(price => price.setAsDefaultPrice)?.productPrice ?? Infinity;
            const defaultPriceB = b.prices.find(price => price.setAsDefaultPrice)?.productPrice ?? Infinity;

            // Sort in ascending order based on the default price
            return defaultPriceB - defaultPriceA;
        });
    }

    sortClothesPriceByDESC(clothes: Clothes[]) {
        // Sort default by defaul price desc
        return clothes.sort((a, b) => {
            // Find the default price for the food supplement
            const defaultPriceA = a.prices.find(price => price.setAsDefaultPrice)?.productPrice ?? Infinity;
            const defaultPriceB = b.prices.find(price => price.setAsDefaultPrice)?.productPrice ?? Infinity;

            // Sort in ascending order based on the default price
            return defaultPriceA - defaultPriceB;
        });
    }

    sortClothesByNameASC(clothes: Clothes[]) {
        return clothes.sort((a, b) => {

            // Sort in ascending order based on product name
            return a.productName.localeCompare(b.productName);
        });
    }

    sortClothesByNameDESC(clothes: Clothes[]) {
        return clothes.sort((a, b) => {

            // Sort in ascending order based on product name
            return b.productName.localeCompare(a.productName);
        });
    }
}