import { ProductPrice } from "./product-price.model";
import { ProductReeviews } from "./product-reviews.model";

export interface Clothes {
    // identification and basic details
    id?: string;
    productName: string;
    productGender: string;
    smallDescription: string;
    description: string;

    // type and material
    clothingType: string;
    material: string;

    // size  
    // color
    // image
    // price
    // stock
    prices: ProductPrice[];
}