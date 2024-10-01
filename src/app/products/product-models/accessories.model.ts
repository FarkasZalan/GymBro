export interface Accessories {
    // identification and basic details
    id?: string;
    productnName: string;
    productCategory: string[]; // forexample cereals, snacks, drink...
    description: string;
    productImage: string;

    // color, size, discount type and material

    // stringKey = color name
    // stringValue = product image url
    // numberValue = product price
    colors: Map<string, [string, number]>;

    // stringKey = size name
    // stringValue = product image url
    // numberValue = product price
    sizes: Map<string, [string, number]>;

    // stringKey = color name for this product
    // numberValue = amount of discount
    discountByColorProduct: Map<string, [number]>;

    // stringKey = size name for this product
    // numberValue = amount of discount
    discountBySizeProduct: Map<string, [number]>;

    type: string; // T-shirt, short, leggings
    material: string;

    // price per amount
    price: number;

    // for male or female
    male: boolean;

    // Stock information
    stock: number;
}