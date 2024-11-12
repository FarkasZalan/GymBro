import { NutritionalTable } from "./nutritional-table.model";
import { ProductPrice } from "./product-price.model";
import { Vitamin } from "./vitamin.model";

export interface FoodSupliment {
    // identification and basic details
    id?: string;
    productName: string;
    productCategory: string; // forexample protein, vitamin, creatin...
    smallDescription: string;
    ingredients: string;
    description: string;

    // Dosage form and flavors
    dosageUnit: string;
    dailyDosage: number;
    flavors: string[];

    // Pregnancy and breastfeeding safety
    safeForConsumptionDuringPregnancy: boolean;
    safeForConsumptionDuringBreastfeeding: boolean;

    // Nutritional informations

    nutritionalTable: NutritionalTable;

    // Vitamins

    vitaminList: Vitamin[];
    genderList: string[];

    // Ingredients and Allergens
    proteinType: string; // example isolate, concentrate, beef...
    allergens: string[];

    // weight/piece  
    // flavor
    // product image to this amount of weight/piece
    // the price for this product
    // stock
    prices: ProductPrice[];

    useUnifiedImage: boolean;
}