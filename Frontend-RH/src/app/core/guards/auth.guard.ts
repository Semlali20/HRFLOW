import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthenticationService);
    const router = inject(Router);
    if (authService.isLoggedIn()) {
        return true;
    }
    router.navigate(['/account/auth/login']);
    return false;
};

/** Class-based guard kept for backward compatibility (used in app.module.ts providers) */
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthenticationService, private router: Router) {}

    canActivate(): boolean {
        if (this.authService.isLoggedIn()) {
            return true;
        }
        this.router.navigate(['/account/auth/login']);
        return false;
    }
}
