import { ProductPrice } from "./product-price.model";

export interface Accessories {
    // identification and basic details
    id?: string;
    productName: string;
    productCategory: string;
    description: string;

    equipmentType: string;

    useUnifiedImage: boolean;

    // size  
    // color
    // image
    // price
    // stock
    prices: ProductPrice[];
}