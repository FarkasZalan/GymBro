export interface ShippingAddress {
    id?: string;
    addressName: string;
    addressType?: string;
    country: string;
    postalCode: string;
    city: string;
    street: string;
    streetType: string;
    houseNumber: string;
    floor?: number;
    door?: number;
    isSetAsDefaultAddress?: boolean;
    companyName?: string;
    taxNumber?: string;

    // New fields for billing address
    isBillingDifferentFromShipping?: boolean;
    billingAddress?: ShippingAddress;
}