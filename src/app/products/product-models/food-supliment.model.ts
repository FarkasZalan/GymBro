export interface FoodSupliment {
    // identification and basic details
    id?: string;
    productnName: string;
    productCategory: string[]; // forexample protein, vitamin, creatin...
    description: string;
    productImage: string;

    // Dosage form and flavors
    dosageForm: string;
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
    containsVitamins: string[];
    proteinType: string; // example isolate, concentrate, beef...
    allergens: string[];
    freeFrom: string[];

    // Weights, amounts and priceing
    weights: number[];
    amounts: number[];
    pricePerKg: number;
    pricePerAmount: number;
    ammountPerServing: number;

    // for male or female
    male: boolean;

    // Stock information
    stock: number;
}