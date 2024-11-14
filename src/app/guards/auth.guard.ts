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
    
    async canActivate(): Promise<boolean> {
        console.log('Executing guard!')
        const auth = await this.authService.isAuthenticated();
        if (auth) {
            
            return true;
        }else{
            console.log('User is not authenticated, redirecting to Login!')
            await this.router.navigate(['/login']);
            return false;
        }
    }
}