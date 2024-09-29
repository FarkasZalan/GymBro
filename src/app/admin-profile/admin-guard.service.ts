import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { AdminService } from "./admin.service";

@Injectable()
export class AdminGuard implements CanActivate {

    constructor(private adminService: AdminService, private router: Router) { }

    // Method that determines if a route can be activated
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.adminService.isAuthenticated().then(
            (authenticated: boolean) => {
                // If the admin user is authenticated, allow access to the route
                if (authenticated) {
                    return true;
                } else {
                    // If not authenticated (or not admin), redirect to the login page
                    this.router.navigate(['/']);
                    return false;
                }
            }
        )
    }
}