import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { User } from "./user.model";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Order } from "../payment/order.model";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private db: AngularFirestore, private auth: AngularFireAuth) { }

    // Method to update user information in Firestore
    updateUser(user: User) {
        return new Promise<boolean>((resolve, reject) => {
            this.db.collection("users").doc(user.id).update(user).then(() => {
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

    getUserOrders(userId: string) {
        return this.db.collection<Order>('orders', ref =>
            ref
                .where('userId', '==', userId)
                .orderBy('orderDate')
        ).valueChanges();
    }

    getUserMonthlyCouponsUsed(userId: string) {
        return this.db.collection<Order>('orders', ref =>
            ref
                .where('userId', '==', userId)
                .where('couponUsed', '==', true)
                .orderBy('orderDate')
        ).valueChanges();
    }

    async getAllNewOrdersForUser(userId: string) {
        return this.db.collection('orders', ref => ref.where('userId', '==', userId).where('isUserChecked', '==', false)).valueChanges();
    }

    async markOrderAsChecked(orderId: string) {
        return this.db.collection('orders').doc(orderId).update({ isUserChecked: true });
    }

    async getAllOrders(userId: string) {
        return this.db.collection('orders', ref => ref.where('userId', '==', userId).orderBy('orderDate', 'desc')).valueChanges();
    }
}