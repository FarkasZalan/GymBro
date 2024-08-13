import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Router } from "@angular/router";
import { User } from "../user/user.model";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(private auth: AngularFireAuth, private db: AngularFirestore, private router: Router) { }

    isAuthenticated() {
        return new Promise(resolve => {
            this.auth.onAuthStateChanged(user => {
                // a !! convert the object to boolena so if it's null it returns to false but if it's an object then it's return to true
                resolve(!!user);
            });
        });
    }

    async login(emailInput: string, password: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            try {
                await this.auth.signInWithEmailAndPassword(emailInput, password);
                resolve(true);
            } catch {
                resolve(false);
            }

        });
    }

    async register(email: string, firstName: string, lastName: string, phone: string, password: string) {
        let newUser: User;
        try {
            const userAuth = await this.auth.createUserWithEmailAndPassword(email, password);
            if (userAuth) {
                newUser = {
                    id: userAuth.user.uid,
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    phone: phone,
                    deleted: false
                }
                await this.db.collection('users').doc(userAuth.user.uid).set(newUser);
                await this.sendEmailVerification();
            }
            return userAuth;
        } catch (error) {
            return false;
        }
    }

    // Method to send verification email
    async sendEmailVerification() {
        const user = await this.auth.currentUser;
        if (user) {
            await user.sendEmailVerification();
        } else {
            throw new Error("No user logged in");
        }
    }

    getCurrentUser(userId: string) {
        return this.db.collection('users').doc(userId).valueChanges();
    }

    logOut() {
        this.auth.signOut();
    }

    async forgotPassword(email: string) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            return true;
        } catch {
            return false;
        }
    }
}