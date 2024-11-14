import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable({
    providedIn: 'root'
})
export class NonAuthenticationGuard implements CanActivate {
    constructor(
        private readonly router: Router,
        private readonly authService: AuthService
    ){ }
    async canActivate() {
        console.log('Executing no-guard!')
        const auth = await this.authService.isAuthenticated();
        if (!auth) {
            return true;
        }else{
            console.log('User is authenticated, redirecting to Home!')
            await this.router.navigate(['/loading']);
            return false;
        }
    }
}