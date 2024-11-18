export interface CartItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    imageUrl: string;
    category: string;
    size?: string;
    productUnit?: string;
    color?: string;
    flavor?: string;
    maxStockError?: boolean;
    maxStock?: number;
}