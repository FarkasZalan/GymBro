import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Router } from "@angular/router";
import { User } from "../user/user.model";
import { AuthService } from "../auth/auth.service";

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    constructor(private auth: AngularFireAuth, private db: AngularFirestore, private router: Router, private authService: AuthService) { }

    // Check if a user is authenticated by observing the auth state
    isAuthenticated() {
        return new Promise(resolve => {
            this.auth.onAuthStateChanged(user => {
                this.authService.getCurrentUser(user.uid).subscribe((isAdminUser: User) => {
                    if (isAdminUser.isAdmin) { // check if user is authenticated and is admin
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            });
        });
    }
}