import { Timestamp } from "firebase/firestore";

export interface ProductReeviews {
    rating: number;
    title: string;
    text: string;
    date: Timestamp;
}