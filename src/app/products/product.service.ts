import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    constructor(private auth: AngularFireAuth, private db: AngularFirestore) { }

    getAllProductByCategory(categoryName: string) {
        return this.db.collection("products").doc(categoryName).collection('allProduct').valueChanges();
    }
}