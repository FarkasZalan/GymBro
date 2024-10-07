export interface FoodSupliment {
    // identification and basic details
    id?: string;
    productnName: string;
    productCategory: string; // forexample protein, vitamin, creatin...
    description: string;

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

    // key = weight/piece  
    // stringValue = prodzct image to this amount of weight/piece
    // numberValue = the price for this product
    weights: Map<number, [string, number]>;

    // numberKey = weight/piece amount for this product
    // numberValue = amount of discount
    discountByWeightProduct: Map<number, [number]>;

    priceByWeight: boolean; // proudct priced by weight (kg) or pieces (pcs)

    // for male or female
    male: boolean;

    // Stock information
    stock: number;
}