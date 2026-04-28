import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { AuthenticationService } from '../services/auth.service';

/**
 * Functional permission guard. Usage in routes:
 * { path: '...', canActivate: [permissionGuard('EMPLOYEE_READ')] }
 */
export function permissionGuard(permission: string): CanActivateFn {
    return (_route: ActivatedRouteSnapshot) => {
        const permService = inject(PermissionService);
        const authService = inject(AuthenticationService);
        const router = inject(Router);

        if (!authService.isLoggedIn()) {
            router.navigate(['/account/auth/login']);
            return false;
        }
        if (!permService.has(permission)) {
            router.navigate(['/unauthorized']);
            return false;
        }
        return true;
    };
}
