export interface ProductPrice {
    quantityInProduct?: number;
    productImage: string;
    productFlavor?: string;
    productColor?: string;
    productSize?: string;
    productPrice: number;
    discountedPrice?: number;
    productStock: number;
    setAsDefaultPrice: boolean;
}