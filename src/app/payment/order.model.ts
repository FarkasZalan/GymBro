import { Timestamp } from "firebase/firestore";
import { CartItem } from "../cart/cart.model";
import { ShippingAddress } from "../profile/shipping-address/shipping-address.model";

export interface Order {
    id?: string;
    productList: CartItem[];
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    shippingAddress: ShippingAddress;
    subtotal: number;
    discountAmount: number;
    cashOnDeliveryAmount: number;
    totalPrice: number;
    shippingCost: number;
    shippingMethod: string;
    paymentMethod: string;
    totalLoyaltyPoints: number;
    orderDate: Timestamp;
    couponUsed: boolean;
    orderStatus: string;
    isAdminChecked: boolean;
    isUserChecked: boolean;
    isModified: boolean;
}