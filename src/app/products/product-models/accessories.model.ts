export interface Accessories {
    // identification and basic details
    id?: string;
    productnName: string;
    productCategory: string[]; // forexample cereals, snacks, drink...
    description: string;
    productImage: string;

    // color, size, type and material
    colors: string[];
    sizes: string[];
    type: string; // T-shirt, short, leggings
    material: string;

    // price per amount
    price: number;

    // for male or female
    male: boolean;

    // Stock information
    stock: number;
}