export interface ShippingAddress {
    id?: string;
    addressName: string;
    country: string;
    postalCode: string;
    city: string;
    street: string;
    houseNumber: string;
    floor?: number;
    door?: number;
    isSetToDefaultAddress: boolean;
    deleted: boolean;
}