import { ProductPrice } from "./product-price.model";

export interface FoodSupliment {
    // identification and basic details
    id?: string;
    productName: string;
    productCategory: string; // forexample protein, vitamin, creatin...
    description: string;

    // Dosage form and flavors
    dosageUnit: string;
    dailyDosage: number;
    flavors: string[];

    // Pregnancy and breastfeeding safety
    safeForConsumptionDuringPregnancy: boolean;
    safeForConsumptionDuringBreastfeeding: boolean;

    // Nutritional informations

    // Energy
    nutritionalValueEnergyKj: number;
    nutritionalValueEnergyCal: number;

    //Fats
    nutritionalValueFats: number;
    nutritionalValueFattyAcids: number;

    // Carbohydrates
    nutritionalValueCarbohydrates: number;
    nutritionalValueSugar: number;

    // Fiber
    nutritionalValueFiber: number;

    // Proteins
    nutritionalValueProteins: number;

    // Salt
    nutritionalValueSalt: number;

    // Ingredients and Allergens
    proteinType: string; // example isolate, concentrate, beef...
    allergens: string[];

    // key = weight/piece  
    // stringValue = prodzct image to this amount of weight/piece
    // numberValue = the price for this product
    prices: ProductPrice[];
}