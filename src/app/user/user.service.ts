import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { User } from "./user.model";
import { AngularFireAuth } from "@angular/fire/compat/auth";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private db: AngularFirestore, private auth: AngularFireAuth) { }

    // Method to update user information in Firestore
    updateUser(user: User) {
        return new Promise<boolean>((resolve, reject) => {
            this.db.collection("users").doc(user.id).set({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                isAdmin: user.isAdmin,
                deleted: false
            }).then(() => {
                // Resolve the promise to indicate successful update
                resolve(true);
            }).catch(() => {
                resolve(false);
            });
        });
    }

    async updatePassword(newPassword: string) {
        // Get the current authenticated user
        this.auth.currentUser
            .then((user) => {
                if (user) {
                    return user.updatePassword(newPassword) // Update password
                }
            })
    }
}