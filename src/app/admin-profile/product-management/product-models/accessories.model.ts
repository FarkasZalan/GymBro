import { Timestamp } from "firebase/firestore";
import { ProductPrice } from "./product-price.model";

export interface Accessories {
    // identification and basic details
    id?: string;
    productName: string;
    productCategory: string;
    description: string;
    smallDescription: string;
    dateAdded: Timestamp;

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