import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Timestamp } from "firebase/firestore";
import { Blog } from "../admin-profile/blog/blog.model";
import { Accessories } from "../admin-profile/product-management/product-models/accessories.model";
import { Clothes } from "../admin-profile/product-management/product-models/clothing.model";
import { FoodSupliment } from "../admin-profile/product-management/product-models/food-supliment.model";
import { OrganicFood } from "../admin-profile/product-management/product-models/organic-food.model";
import { Observable, map, combineLatest } from "rxjs";
import { ProductReeviews } from "../admin-profile/product-management/product-models/product-reviews.model";
import { ProductViewText } from '../admin-profile/product-management/product-view-texts';
import { ProductPrice } from "../admin-profile/product-management/product-models/product-price.model";
import { Product } from "../admin-profile/product-management/product-models/product.model";
import { DiscountedPrice } from "./discounted-price.model";

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

    getLatestBlogs(limit: number) {
        return this.db.collection<Blog>('blog', ref =>
            ref
                .orderBy('date', 'desc')
                .limit(limit)
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
    getDefaultPrice(product: any): number {
        const defaultPrice = product.prices.find(price => price.setAsDefaultPrice);
        return defaultPrice?.productPrice || 0;
    }

    // Get discounted products across all categories
    getDiscountedProducts(limit?: number, hasLimit: boolean = true): Observable<any[]> {
        // Get discounted products from each category
        const categoryObservables = [
            ProductViewText.FOOD_SUPLIMENTS,
            ProductViewText.ORGANIC_FOOD,
            ProductViewText.CLOTHES,
            ProductViewText.ACCESSORIES
        ].map(category => this.getDiscountedProductsByCategory(category));

        return combineLatest(categoryObservables).pipe(
            map(([foods, organic, clothes, accessories]) => {
                // Combine products with their categories
                const allProducts = [
                    ...this.addCategoryToProducts(foods, ProductViewText.FOOD_SUPLIMENTS),
                    ...this.addCategoryToProducts(organic, ProductViewText.ORGANIC_FOOD),
                    ...this.addCategoryToProducts(clothes, ProductViewText.CLOTHES),
                    ...this.addCategoryToProducts(accessories, ProductViewText.ACCESSORIES)
                ];

                // Sort by discount percentage
                const sortedProducts = this.sortByDiscountPercentage(allProducts);

                // Apply limit if needed
                const finalProducts = hasLimit && limit ? sortedProducts.slice(0, limit) : sortedProducts;

                // Map to simplified product structure
                return finalProducts.map((product: DiscountedPrice) => ({
                    id: product.id,
                    productName: product.productName,
                    imageUrl: this.getDiscountedPrice(product).productImage,
                    category: product.category,
                    selectedPrice: this.getDiscountedPrice(product)
                }));
            })
        );
    }

    private getDiscountedProductsByCategory(category: string): Observable<any[]> {
        return this.db.collection('products')
            .doc(category)
            .collection('allProduct')
            .valueChanges()
            .pipe(
                map(products => products.filter(product => this.hasValidDiscount(product)))
            );
    }

    private hasValidDiscount(product: any): boolean {
        // Check if any price in the prices array has a valid discount, not just the default one
        return product.prices?.some(price =>
            price.discountedPrice > 0 &&
            price.discountedPrice < price.productPrice
        ) || false;
    }

    private addCategoryToProducts(products: any[], category: string): any[] {
        return products.map(product => ({ ...product, category }));
    }

    private sortByDiscountPercentage(products: any[]): any[] {
        return products.sort((a, b) => this.getDiscountPercentage(b) - this.getDiscountPercentage(a));
    }

    private getDiscountPercentage(product: any): number {
        // Find the price with the highest discount percentage
        const maxDiscount = Math.max(...product.prices.map(price => {
            if (!price.discountedPrice) return 0;
            return ((price.productPrice - price.discountedPrice) / price.productPrice) * 100;
        }));
        return maxDiscount;
    }

    private getDiscountedPrice(product: any): ProductPrice {
        // First try to find a default price with a discount
        const defaultPrice = product.prices.find(price =>
            price.setAsDefaultPrice &&
            price.discountedPrice > 0 &&
            price.discountedPrice < price.productPrice
        );

        // If no discounted default price, find the price with the highest discount
        if (!defaultPrice) {
            return product.prices.reduce((best, current) => {
                if (!current.discountedPrice) return best;
                const currentDiscount = (current.productPrice - current.discountedPrice) / current.productPrice;
                const bestDiscount = best ? (best.productPrice - best.discountedPrice) / best.productPrice : 0;
                return currentDiscount > bestDiscount ? current : best;
            }, null) || product.prices.find(price => price.setAsDefaultPrice);
        }

        return defaultPrice;
    }

    // Get new arrivals across all categories
    getNewArrivals(limit: number): Observable<any[]> {
        // Get latest products from each category
        const foodSuppliments$ = this.getLatestFromCollection(ProductViewText.FOOD_SUPLIMENTS, limit);
        const organicFood$ = this.getLatestFromCollection(ProductViewText.ORGANIC_FOOD, limit);
        const clothes$ = this.getLatestFromCollection(ProductViewText.CLOTHES, limit);
        const accessories$ = this.getLatestFromCollection(ProductViewText.ACCESSORIES, limit);

        // Combine all observables
        return combineLatest([
            foodSuppliments$,
            organicFood$,
            clothes$,
            accessories$
        ]).pipe(
            map(([foods, organic, clothes, accessories]) => {
                // Add category to each product array before combining
                const foodsWithCategory = foods.map(p => ({ ...p, category: ProductViewText.FOOD_SUPLIMENTS }));
                const organicWithCategory = organic.map(p => ({ ...p, category: ProductViewText.ORGANIC_FOOD }));
                const clothesWithCategory = clothes.map(p => ({ ...p, category: ProductViewText.CLOTHES }));
                const accessoriesWithCategory = accessories.map(p => ({ ...p, category: ProductViewText.ACCESSORIES }));

                // Combine all products and sort by date
                const allProducts = [...foodsWithCategory, ...organicWithCategory, ...clothesWithCategory, ...accessoriesWithCategory]
                    .sort((a, b) => b.dateAdded - a.dateAdded)
                    .slice(0, limit);

                return allProducts.map((product: DiscountedPrice) => ({
                    id: product.id,
                    productName: product.productName,
                    imageUrl: this.getDefaultProductImage(product),
                    price: this.getDefaultPrice(product),
                    category: product.category
                }));
            })
        );
    }

    private getLatestFromCollection(collection: string, limit: number): Observable<any[]> {
        return this.db.collection('products')
            .doc(collection)
            .collection('allProduct', ref =>
                ref.orderBy('dateAdded', 'desc')
                    .limit(limit))
            .valueChanges();
    }

    private getDefaultProductImage(product: any): string {
        if (product.useUnifiedImage && product.prices.length > 0) {
            return product.prices[0].productImage;
        }
        return product.prices.length > 0 ? product.prices[0].productImage : '';
    }
}