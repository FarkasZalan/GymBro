import { ProductPrice } from "./product-price.model";

export interface Accessories {
    // identification and basic details
    id?: string;
    productnName: string;
    productCategory: string[]; // forexample shakers, belts...
    description: string;

    // color
    color: string;

    // size
    size: string;

    // weight/piece  
    // product image to this amount of weight/piece
    // the price for this product
    // stock
    prices: ProductPrice[];

    // for male or female
    genderList: string[];
}