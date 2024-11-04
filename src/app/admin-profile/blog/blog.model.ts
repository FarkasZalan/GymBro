import { Timestamp } from "firebase/firestore";

export interface Blog {
    id?: string;
    title: string;
    language: string;
    blogTags: string[];
    headerImageUrl: string;
    date: Timestamp;
    htmlText: string;
    description: string;
}