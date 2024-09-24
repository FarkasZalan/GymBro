import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) { }

    // Method that determines if a route can be activated
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.authService.isAuthenticated().then(
            (authenticated: boolean) => {
                // If the user is authenticated, allow access to the route
                if (authenticated) {
                    return true;
                } else {
                    // If not authenticated, redirect to the login page
                    this.router.navigate(['/auth/login']);
                    return false;
                }
            }
        )
    }
}