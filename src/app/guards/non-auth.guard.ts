import { CanActivateFn } from '@angular/router';

export const nonAuthGuard: CanActivateFn = (route, state) => {
  return true;
};

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
export class NonAuthenticationGuard implements CanActivate {
    constructor(
        private readonly router: Router,
        private readonly authService: AuthService
    ){ }
    async canActivate() {
        console.log('Executing no-guard!')
        const auth = await this.authService.isAuthenticated();
        if (auth) {
            console.log('User is authenticated, redirecting to Home!')
            await this.router.navigate(['/home']);
        }
        return auth;
    }
}