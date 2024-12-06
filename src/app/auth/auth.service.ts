import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { User } from "../profile/user.model";
import { CartService } from '../cart/cart.service';
import { map } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(
        private auth: AngularFireAuth,
        private db: AngularFirestore,
        private cartService: CartService,
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
    async login(emailInput: string, password: string): Promise<boolean | null> {
        return new Promise<boolean | null>((resolve) => {
            this.auth
                .signInWithEmailAndPassword(emailInput, password)
                .then((loggingResponse) => {
                    // Fetch Firestore document for email verification
                    const userDocRef = this.db
                        .collection('users')
                        .doc(loggingResponse.user.uid);

                    // Subscribe to the Firestore document to check if emailVerified is true
                    userDocRef.get().subscribe((userDocSnapshot) => {
                        // Check if document exists
                        if (userDocSnapshot.exists) {
                            const userData = userDocSnapshot.data() as User;
                            if (userData && userData.emailVerified) {
                                resolve(true);  // Email verified in Firestore
                            } else {
                                resolve(null);  // Email not verified
                            }
                        } else {
                            resolve(false);  // User document not found in Firestore
                        }
                    });
                })
                .catch((error) => {
                    resolve(false);  // If login fails
                });
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
                    emailVerified: false,
                }
                await this.db.collection('users').doc(userAuth.user.uid).set(newUser);
            }
            return userAuth;
        } catch (error) {
            return false;
        }
    }

    getUserToken(userToken: string) {
        return this.db.collection('emailTokens').doc(userToken).valueChanges();
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const userDoc = await this.db.collection<User>('users', ref => ref.where('email', '==', email)).get().toPromise();
        if (!userDoc.empty) {
            return userDoc.docs[0].data() as User; // Return the first user found
        }
        return null; // Return null if no user found
    }

    // Fetch the current user's data from Firestore using their user ID
    getCurrentUser(userId: string) {
        return this.db.collection('users').doc(userId).valueChanges();
    }

    // Logout method
    async logOut() {
        try {
            // Clear the cart when logging out
            this.cartService.clearCartOnLogout();

            this.auth.signOut();
        } catch (error) { }
    }
}