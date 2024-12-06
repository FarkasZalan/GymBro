export interface User {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    isAdmin: boolean;
    loyaltyPoints: number;
    emailVerified: boolean;
}