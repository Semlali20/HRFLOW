import { Injectable } from '@angular/core';
import { AuthenticationService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {

    constructor(private authService: AuthenticationService) {}

    has(permission: string): boolean {
        return this.authService.hasPermission(permission);
    }

    hasAny(...permissions: string[]): boolean {
        return permissions.some(p => this.has(p));
    }

    hasAll(...permissions: string[]): boolean {
        return permissions.every(p => this.has(p));
    }

    hasRole(role: string): boolean {
        return this.authService.getUserRole() === role;
    }
}
