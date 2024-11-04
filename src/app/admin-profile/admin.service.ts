import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { User } from "../user/user.model";
import { AuthService } from "../auth/auth.service";
import { FoodSupliment } from "./product-management/product-models/food-supliment.model";
import { HealthyProduct } from "./product-management/product-models/healthy-food.model";
import { ProductPrice } from "./product-management/product-models/product-price.model";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { Clothes } from "./product-management/product-models/clothing.model";
import { ProductViewText } from "./product-management/product-view-texts";
import { Accessories } from "./product-management/product-models/accessories.model";
import {
    getStorage,
    ref,
    listAll,
    deleteObject
} from "firebase/storage";
import { Blog } from "./blog/blog.model";
import { Timestamp } from "firebase/firestore";

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

    getAllBlog() {
        this.db
            .collection("blog")
            .valueChanges();
    }

    async uploadImagesAndSaveProduct(productCategory: string, productId: string, unifiedImageUrl: string, productPrices?: ProductPrice[], accessoryType?: string) {
        const uploadPromises = productPrices.map(async (price: ProductPrice) => {
            // Check if productImage is a Base64 string (indicating a new upload) or a URL (existing image)
            if (price.productImage && price.productImage.startsWith("data:image")) {
                let base64Data = price.productImage;
                let blob = this.base64ToBlob(base64Data);
                if (unifiedImageUrl === null) {
                    base64Data = price.productImage;
                    blob = this.base64ToBlob(base64Data);
                } else {
                    base64Data = unifiedImageUrl;
                    blob = this.base64ToBlob(base64Data);
                }

                // Define the path in Firebase Storage
                let filePath;
                if (productCategory === ProductViewText.CLOTHES || (productCategory === ProductViewText.ACCESSORIES && accessoryType === ProductViewText.SHAKERS)) {
                    filePath = `ProductsImages/${productCategory}/${productId}/${productId}_color_of_the_product: ${price.productColor}`;
                } else if (productCategory === ProductViewText.ACCESSORIES && accessoryType === ProductViewText.WEIGHT_LIFTING) {
                    if (unifiedImageUrl === null) {
                        filePath = `ProductsImages/${productCategory}/${productId}/${productId}_price_of_the_product: ${price.productPrice}_size_of_the_product: ${price.productSize}`;
                    } else {
                        filePath = `ProductsImages/${productCategory}/${productId}/${productId}_unifiend_image`;
                    }
                }
                else {
                    if (unifiedImageUrl === null) {
                        filePath = `ProductsImages/${productCategory}/${productId}/${productId}_price_of_the_product: ${price.productPrice}_quantity_in_product: ${price.quantityInProduct}`;
                    } else {
                        filePath = `ProductsImages/${productCategory}/${productId}/${productId}_unifiend_image`;
                    }
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

    // Function to delete all files in a folder before uploading new images
    async deleteAllFilesInFolder(productCategory: string, productId: string) {
        const folderRef = ref(getStorage(), `ProductsImages/${productCategory}/${productId}`);

        try {
            // List all items in the folder
            listAll(folderRef)
                .then(async (listResults) => {
                    // Create delete promises for each file
                    const promises = listResults.items.map((item) => {
                        return deleteObject(item);
                    });
                    await Promise.all(promises);
                });
            console.log(`All files in the folder ProductsImages/${productId} have been deleted.`);
        } catch (error) {
            console.error("Error deleting files in folder:", error);
        }
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

    // Sort clothes
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

    // Sort accessories
    sortAccessoriesPriceByASC(accessories: Accessories[]) {
        // Sort default by defaul price desc
        return accessories.sort((a, b) => {
            // Find the default price for the food supplement
            const defaultPriceA = a.prices.find(price => price.setAsDefaultPrice)?.productPrice ?? Infinity;
            const defaultPriceB = b.prices.find(price => price.setAsDefaultPrice)?.productPrice ?? Infinity;

            // Sort in ascending order based on the default price
            return defaultPriceB - defaultPriceA;
        });
    }

    sortAccessoriesPriceByDESC(accessories: Accessories[]) {
        // Sort default by defaul price desc
        return accessories.sort((a, b) => {
            // Find the default price for the food supplement
            const defaultPriceA = a.prices.find(price => price.setAsDefaultPrice)?.productPrice ?? Infinity;
            const defaultPriceB = b.prices.find(price => price.setAsDefaultPrice)?.productPrice ?? Infinity;

            // Sort in ascending order based on the default price
            return defaultPriceA - defaultPriceB;
        });
    }

    sortAccessoriesByNameASC(accessories: Accessories[]) {
        return accessories.sort((a, b) => {

            // Sort in ascending order based on product name
            return a.productName.localeCompare(b.productName);
        });
    }

    sortAccessoriesByNameDESC(accessories: Accessories[]) {
        return accessories.sort((a, b) => {

            // Sort in ascending order based on product name
            return b.productName.localeCompare(a.productName);
        });
    }

    sortByDateASC(blogs: Blog[]) {
        return blogs.sort((a, b) => {
            // Convert `a.date` and `b.date` to Date objects if they are Firebase Timestamps
            const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
            const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);

            // Sort blogs by date in ascending order (oldest to newest)
            return dateB.getTime() - dateA.getTime();
        });
    }

    sortByDateDESC(blogs: Blog[]) {
        return blogs.sort((a, b) => {
            // Convert `a.date` and `b.date` to Date objects if they are Firebase Timestamps
            const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
            const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);

            // Sort blogs by date in ascending order (oldest to newest)
            return dateA.getTime() - dateB.getTime();
        });
    }

    filterBlogByLanguage(blogs: Blog[], selectedLanguage: string) {
        return blogs.filter((a) => {
            return a.language === selectedLanguage
        });
    }
}