export interface Filter {
    // All page filter items
    orderBy: string;
    category: string;

    //Blog
    language: string;

    // food supliments and organic food
    flavors: string[];
    allergenes: string[];
    safeForConsumptionDuringPregnancy: boolean;
    safeForConsumptionDuringBreastfeeding: boolean;

    // only food supliments
    proteinType: string;
    gender: string;

    // clothing and accessories
    color: string;
    size: string;

    // only clothing
    clothingType: string;
    material: string;

    // only accessories
    equipmentType: string;
}