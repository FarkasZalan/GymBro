import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { User } from "./user.model";
import { AngularFireAuth } from "@angular/fire/compat/auth";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private db: AngularFirestore, private auth: AngularFireAuth) { }

    updateUser(user: User) {
        return new Promise<boolean>((resolve, reject) => {
            this.db.collection("users").doc(user.id).set({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                deleted: false
            }).then(() => {
                resolve(true);
            }).catch(() => {
                resolve(false);
            });
        });
    }

    async updatePassword(newPassword: string) {
        this.auth.currentUser
            .then((user) => {
                if (user) {
                    console.log(user)
                    return user.updatePassword(newPassword) // Update password
                }
            })
    }
}