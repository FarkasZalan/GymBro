export interface ProductPrice {
    quantityInProduct?: number;
    productImage: string;
    productFlavor?: string;
    productColor?: string;
    productSize?: string;
    productPrice: number;
    productStock: number;
    setAsDefaultPrice: boolean;
}