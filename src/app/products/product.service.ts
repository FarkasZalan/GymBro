import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    constructor(private auth: AngularFireAuth, private db: AngularFirestore, private router: Router, private authService: AuthService) { }

    getAllProductByCategory(categoryName: string) {
        return this.db.collection("products").doc(categoryName).collection('allProduct').valueChanges();
    }
}