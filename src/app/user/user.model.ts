export interface User {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    zipCode?: number;
    city?: string;
    street?: string;
    houseNumber?: string;
    isAdmin: boolean;
    deleted: boolean;
}