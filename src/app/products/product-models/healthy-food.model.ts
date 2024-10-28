import { NutritionalTable } from "./nutritional-table.model";
import { ProductPrice } from "./product-price.model";

export interface HealthyProduct {
    // identification and basic details
    id?: string;
    productName: string;
    productCategory: string; // forexample cereals, snacks, drink...
    description: string;
    dosageUnit: string;

    flavor: string;

    // Nutritional informations

    nutritionalTable: NutritionalTable;

    // Safety
    safeForConsumptionDuringBreastfeeding: boolean;
    safeForConsumptionDuringPregnancy: boolean;

    // Allergens
    allergens: string[];

    // weight/piece  
    // product image to this amount of weight/piece
    // the price for this product
    // stock
    prices: ProductPrice[];
}