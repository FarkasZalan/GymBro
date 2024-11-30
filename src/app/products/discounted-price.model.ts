import { ProductPrice } from "../admin-profile/product-management/product-models/product-price.model";

export interface DiscountedPrice {
    id: string,
    productName: string,
    imageUrl: string,
    category: string,
    selectedPrice?: ProductPrice
}