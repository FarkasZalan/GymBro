import { Timestamp } from "firebase/firestore";

export interface ProductReeviews {
    id: string;
    userId: string; // the user who created the review
    userFirstName: string;
    userLastName: string;
    rating: number;
    title: string;
    text: string;
    date: Timestamp;
    productId: string;
    response: string;
    responseDate: Timestamp;
    // this will store the users who liked the review
    likes: string[];
    // this will store the users who liked the response
    responseLikes: string[];
    checkedByAdmin: boolean;
    // if the user edited the review then the admin got a new alert from it
    reviewEdited: boolean;
}