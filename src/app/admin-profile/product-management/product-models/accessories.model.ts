import { ProductPrice } from "./product-price.model";
import { ProductReeviews } from "./product-reviews.model";

export interface Accessories {
    // identification and basic details
    id?: string;
    productName: string;
    productCategory: string;
    description: string;

    // shakers or weight lifting
    equipmentType: string;

    useUnifiedImage: boolean;

    // size  
    // color
    // image
    // price
    // stock
    prices: ProductPrice[];
}