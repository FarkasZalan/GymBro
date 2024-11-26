import { Timestamp } from "firebase/firestore";
import { CartItem } from "../cart/cart.model";
import { OrderStatus } from "./order-status.modelts";
import { ShippingAddress } from "../profile/profile-shipping-address/shipping-address.model";

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
    orderStatus: OrderStatus;
    isAdminChecked: boolean;
}