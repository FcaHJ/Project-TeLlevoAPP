import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable({
    providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {
    constructor(
        private readonly router: Router,
        private readonly authService: AuthService
    ){ }
    
    async canActivate() {
        console.log('Executing guard!')
        const auth = await this.authService.isAuthenticated();
        if (!auth) {
            console.log('User is not authenticated, redirecting to Login!')
            await this.router.navigate(['/login']);
        }

        const userRole = this.authService.getCurrentUserRole();
        if (userRole === 1) {
            // Redirige a la página de admin
            await this.router.navigate(['/users']);
        } else if (userRole === 2) {
            // Redirige al home del pasajero
            await this.router.navigate(['/home']);
        } else if (userRole === 3) {
            // Redirige al home del conductor
            await this.router.navigate(['/home-driver']);
        }

        return auth;
    }
}