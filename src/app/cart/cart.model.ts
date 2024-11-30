import { ProductPrice } from "../admin-profile/product-management/product-models/product-price.model";

export interface CartItem {
    productId: string;
    productName: string;
    quantity: number;
    category: string;
    size?: string;
    productUnit?: string;
    selectedPrice?: ProductPrice;
    maxStockError?: boolean;
    maxStock?: number;
}