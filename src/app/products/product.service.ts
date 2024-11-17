import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Timestamp } from "firebase/firestore";
import { Blog } from "../admin-profile/blog/blog.model";
import { Accessories } from "../admin-profile/product-management/product-models/accessories.model";
import { Clothes } from "../admin-profile/product-management/product-models/clothing.model";
import { FoodSupliment } from "../admin-profile/product-management/product-models/food-supliment.model";
import { OrganicFood } from "../admin-profile/product-management/product-models/organic-food";
import { Observable } from "rxjs";
import { ProductReeviews } from "../admin-profile/product-management/product-models/product-reviews.model";

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    constructor(private db: AngularFirestore) { }

    getAllProductByCategory(categoryName: string) {
        return this.db.collection("products").doc(categoryName).collection('allProduct').valueChanges();
    }

    getReviewsForProduct(productId: string, productCategory: string) {
        return this.db.collection('reviews').doc(productCategory).collection<ProductReeviews>('allReview', ref =>
            ref
                .where('productId', '==', productId)
        ).valueChanges();
    }

    sortReviewsByOldest(reviews: ProductReeviews[]) {
        return reviews.sort((a, b) => {
            // Convert `a.date` and `b.date` to Date objects if they are Firebase Timestamps
            const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
            const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);

            // Sort reviews by date (oldest to newest)
            return dateA.getTime() - dateB.getTime();
        });
    }

    sortReviewsByNewest(reviews: ProductReeviews[]) {
        return reviews.sort((a, b) => {
            // Convert `a.date` and `b.date` to Date objects if they are Firebase Timestamps
            const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
            const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);

            // Sort reviews by date (newest to oldest)
            return dateB.getTime() - dateA.getTime();
        });
    }

    sortReviewsByRatingASC(reviews: ProductReeviews[]) {
        // Sort default by defaul price desc
        return reviews.sort((a, b) => {
            // Sort in ascending order the ratings
            return b.rating - a.rating;
        });
    }

    sortReviewsByRatingDESC(reviews: ProductReeviews[]) {
        // Sort default by defaul price desc
        return reviews.sort((a, b) => {
            // Sort in descending order the ratings
            return a.rating - b.rating;
        });
    }

    // Fetch related blogs based on tags and language
    getRelatedBlogs(tags: string[], currentBlogId: string, language: string): Observable<Blog[]> {
        return this.db.collection<Blog>('blog', ref =>
            ref
                .where('id', '!=', currentBlogId)
                .where('language', '==', language)
                .where('blogTags', 'array-contains-any', tags)
                .orderBy('date')
                .limit(6)
        ).valueChanges();
    }

    // Fetch random blogs based on language
    getRandomBlogs(currentBlogId: string, limit: number, language: string) {
        return this.db.collection<Blog>('blog', ref =>
            ref
                .where('id', '!=', currentBlogId)
                .where('language', '==', language)
                .orderBy('date')
                .limit(limit)
        ).valueChanges();
    }

    // Fetch related products based on category
    getRelatedProducts(currentProductId: string, category: string, productMainCategory: string) {
        return this.db.collection('products').doc(productMainCategory).collection('allProduct', ref =>
            ref
                .where('id', '!=', currentProductId)
                .where('productCategory', '==', category)
                .limit(6)
        ).valueChanges();
    }

    // Fetch random products
    getRandomProducts(currentProductId: string, limit: number, productMainCategory: string) {
        return this.db.collection('products').doc(productMainCategory).collection('allProduct', ref =>
            ref
                .where('id', '!=', currentProductId)
                .limit(limit)
        ).valueChanges();
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

    // Sort organic products
    sortOrganicProductsPriceByASC(healthyProducts: OrganicFood[]) {
        // Sort default by defaul price desc
        return healthyProducts.sort((a, b) => {
            // Find the default price for the food supplement
            const defaultPriceA = a.prices.find(price => price.setAsDefaultPrice)?.productPrice ?? Infinity;
            const defaultPriceB = b.prices.find(price => price.setAsDefaultPrice)?.productPrice ?? Infinity;

            // Sort in ascending order based on the default price
            return defaultPriceB - defaultPriceA;
        });
    }

    sortOrganicProductsPriceByDESC(healthyProducts: OrganicFood[]) {
        // Sort default by defaul price desc
        return healthyProducts.sort((a, b) => {
            // Find the default price for the food supplement
            const defaultPriceA = a.prices.find(price => price.setAsDefaultPrice)?.productPrice ?? Infinity;
            const defaultPriceB = b.prices.find(price => price.setAsDefaultPrice)?.productPrice ?? Infinity;

            // Sort in ascending order based on the default price
            return defaultPriceA - defaultPriceB;
        });
    }

    sortOrganicProductsByNameASC(healthyProducts: OrganicFood[]) {
        return healthyProducts.sort((a, b) => {

            // Sort in ascending order based on product name
            return a.productName.localeCompare(b.productName);
        });
    }

    sortOrganicProductsByNameDESC(healthyProducts: OrganicFood[]) {
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