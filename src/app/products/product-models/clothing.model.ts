import { ProductPrice } from "./product-price.model";

export interface Clothes {
    // identification and basic details
    id?: string;
    productnName: string;
    productCategory: string[]; // forexample T-shirts, shorts...
    description: string;

    // size, color, type and material
    size: string;
    color: string;
    type: string; // T-shirt, short, leggings
    material: string;

    // weight/piece  
    // product image to this amount of weight/piece
    // the price for this product
    // stock
    prices: ProductPrice[];

    // for male or female
    genderList: string[];
}