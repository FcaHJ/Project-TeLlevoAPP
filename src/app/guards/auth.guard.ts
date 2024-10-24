/*import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  return true;
};*/

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
        return auth;
    }
}