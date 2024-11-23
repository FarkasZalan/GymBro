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

    sortReviewsByOldest(productCategory: string) {
        return this.db.collection('reviews').doc(productCategory).collection('allReview', ref =>
            ref
                .orderBy('date', 'asc')
        ).valueChanges();
    }

    sortReviewsByNewest(productCategory: string) {
        return this.db.collection('reviews').doc(productCategory).collection('allReview', ref =>
            ref
                .orderBy('date', 'desc')
        ).valueChanges();
    }

    sortReviewsByRatingASC(productCategory: string) {
        return this.db.collection('reviews').doc(productCategory).collection('allReview', ref =>
            ref
                .orderBy('rating', 'desc')
        ).valueChanges();
    }

    sortReviewsByRatingDESC(productCategory: string) {
        return this.db.collection('reviews').doc(productCategory).collection('allReview', ref =>
            ref
                .orderBy('rating', 'asc')
        ).valueChanges();
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

    // Fetch related products based on gender
    getRelatedProductsByGender(currentProductId: string, gender: string, productMainCategory: string) {
        return this.db.collection('products').doc(productMainCategory).collection('allProduct', ref =>
            ref
                .where('id', '!=', currentProductId)
                .where('productGender', '==', gender)
                .limit(6)
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

    // Sort food supplements
    sortFoodSuplimentsByPriceASC(foodSupliments: FoodSupliment[]) {
        return foodSupliments.sort((a, b) => {
            // Find the default prices
            const priceA = this.getDefaultPrice(a);
            const priceB = this.getDefaultPrice(b);

            // Sort in ascending order
            return priceB - priceA;
        });
    }

    sortFoodSuplimentsByPriceDESC(foodSupliments: FoodSupliment[]) {
        return foodSupliments.sort((a, b) => {
            // Find the default prices
            const priceA = this.getDefaultPrice(a);
            const priceB = this.getDefaultPrice(b);

            // Sort in descending order
            return priceA - priceB;
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
        return healthyProducts.sort((a, b) => {
            const priceA = this.getDefaultPrice(a);
            const priceB = this.getDefaultPrice(b);

            return priceB - priceA;
        });
    }

    sortOrganicProductsPriceByDESC(healthyProducts: OrganicFood[]) {
        return healthyProducts.sort((a, b) => {
            const priceA = this.getDefaultPrice(a);
            const priceB = this.getDefaultPrice(b);

            return priceA - priceB;
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
        return clothes.sort((a, b) => {
            const priceA = this.getDefaultPrice(a);
            const priceB = this.getDefaultPrice(b);

            return priceB - priceA;
        });
    }

    sortClothesPriceByDESC(clothes: Clothes[]) {
        return clothes.sort((a, b) => {
            const priceA = this.getDefaultPrice(a);
            const priceB = this.getDefaultPrice(b);

            return priceA - priceB;
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
        return accessories.sort((a, b) => {
            const priceA = this.getDefaultPrice(a);
            const priceB = this.getDefaultPrice(b);

            return priceB - priceA;
        });
    }

    sortAccessoriesPriceByDESC(accessories: Accessories[]) {
        return accessories.sort((a, b) => {
            const priceA = this.getDefaultPrice(a);
            const priceB = this.getDefaultPrice(b);

            return priceA - priceB;
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

    // Helper method to get the effective price (product price or discounted price)
    getDefaultPrice(product: any): any {
        const defaultPrice = product.prices.find(price => price.setAsDefaultPrice);
        if (!defaultPrice) return Infinity;

        // Return discounted price if available, otherwise return regular price
        return defaultPrice.discountedPrice > 0
            ? defaultPrice.discountedPrice
            : defaultPrice.productPrice;
    }
}