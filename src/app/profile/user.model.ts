export interface User {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    isAdmin: boolean;
    loyaltyPoints: number;
    is10PercentDiscountActive: boolean;
    is20PercentDiscountActive: boolean;
    is30PercentDiscountActive: boolean;
    isFreeShippingActive: boolean;
    is5000HufDiscountActive: boolean;
    deleted: boolean;
}