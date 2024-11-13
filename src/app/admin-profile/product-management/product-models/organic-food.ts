import { NutritionalTable } from "./nutritional-table.model";
import { ProductPrice } from "./product-price.model";
import { ProductReeviews } from "./product-reviews.model";

export interface OrganicFood {
    // identification and basic details
    id?: string;
    productName: string;
    productCategory: string;
    smallDescription: string;
    ingredients: string;
    description: string;
    dosageUnit: string;

    flavors: string[];

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

    useUnifiedImage: boolean;
}