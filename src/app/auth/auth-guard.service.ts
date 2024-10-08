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
                    // If not authenticated (or admin), redirect to the home page
                    this.router.navigate(['/']);
                    return false;
                }
            }
        )
    }
}