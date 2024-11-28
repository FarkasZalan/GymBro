import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Router } from "@angular/router";
import { User } from "../profile/user.model";
import { AdminEmail } from "../admin-profile/admin-email";
import { CartService } from '../cart/cart.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(
        private auth: AngularFireAuth,
        private db: AngularFirestore,
        private router: Router,
        private cartService: CartService
    ) { }

    // Check if a user is authenticated by observing the auth state
    isAuthenticated() {
        return new Promise(resolve => {
            this.auth.onAuthStateChanged(user => {
                if (user) {
                    this.getCurrentUser(user.uid).subscribe((isAdminUser: User) => {
                        if (!isAdminUser.isAdmin) { // check if user is authenticated and is not admin
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    });
                } else {
                    resolve(false);
                }
            });
        });
    }

    // Log in a user with email and password
    async login(emailInput: string, password: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            try {
                await this.auth.signInWithEmailAndPassword(emailInput, password).then((loggingResponse) => {
                    if (emailInput === AdminEmail.email) {
                        resolve(true);
                    }
                    if (loggingResponse.user.emailVerified) {
                        resolve(true);
                    } else {
                        resolve(null);
                    }
                });
            } catch {
                resolve(false);
            }

        });
    }

    // Register a new user and store their details in Firestore
    async register(email: string, firstName: string, lastName: string, phone: string, password: string) {
        let newUser: User;
        try {
            // Create a new user in Firebase Auth
            const userAuth = await this.auth.createUserWithEmailAndPassword(email, password);
            if (userAuth) {
                // Construct user object to save in Firestore
                newUser = {
                    id: userAuth.user.uid,
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    phone: phone,
                    isAdmin: false,
                    loyaltyPoints: 0,
                    is10PercentDiscountActive: false,
                    is20PercentDiscountActive: false,
                    is30PercentDiscountActive: false,
                    isFreeShippingActive: false,
                    is5000HufDiscountActive: false,
                    deleted: false,
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

    // Fetch the current user's data from Firestore using their user ID
    getCurrentUser(userId: string) {
        return this.db.collection('users').doc(userId).valueChanges();
    }

    // Send a password reset email to the user
    async forgotPassword(email: string) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            return true;
        } catch {
            return false;
        }
    }

    // Logout method
    async logOut() {
        try {
            // Clear the cart when logging out
            this.cartService.clearCartOnLogout();

            this.auth.signOut();
            this.router.navigate(['/']);
        } catch (error) { }
    }
}