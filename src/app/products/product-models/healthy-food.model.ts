import { NutritionalTable } from "./nutritional-table.model";
import { ProductPrice } from "./product-price.model";

export interface HealthyProduct {
    // identification and basic details
    id?: string;
    productnName: string;
    productCategory: string[]; // forexample cereals, snacks, drink...
    description: string;

    // Nutritional informations

    nutritionalTable: NutritionalTable;

    // Allergens
    allergens: string[];

    // weight/piece  
    // product image to this amount of weight/piece
    // the price for this product
    // stock
    prices: ProductPrice[];
}