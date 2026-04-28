import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Permission {
    id: number;
    name: string;
    module: string;
    description: string;
}

export interface Role {
    id: number;
    name: string;
    description: string;
    permissions: Permission[];
}

export interface AdminUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    title: string;
    roles: Role[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {

    private readonly USERS_BASE = 'http://localhost:8090/api/v1/admin/users';
    private readonly ROLES_BASE = 'http://localhost:8090/api/v1/admin/roles';

    constructor(private http: HttpClient) {}

    /* ——— Users ——— */
    getAllUsers(): Observable<AdminUser[]> {
        return this.http.get<AdminUser[]>(this.USERS_BASE);
    }

    updateUserRoles(userId: number, roleNames: string[]): Observable<AdminUser> {
        return this.http.put<AdminUser>(`${this.USERS_BASE}/${userId}/roles`, { roles: roleNames });
    }

    deleteUser(userId: number): Observable<void> {
        return this.http.delete<void>(`${this.USERS_BASE}/${userId}`);
    }

    /* ——— Roles ——— */
    getAllRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(this.ROLES_BASE);
    }

    getAllPermissions(): Observable<Permission[]> {
        return this.http.get<Permission[]>(`${this.ROLES_BASE}/permissions`);
    }

    createRole(role: Partial<Role>): Observable<Role> {
        return this.http.post<Role>(this.ROLES_BASE, role);
    }

    updateRolePermissions(roleId: number, permNames: string[]): Observable<Role> {
        return this.http.put<Role>(`${this.ROLES_BASE}/${roleId}/permissions`, { permissions: permNames });
    }

    deleteRole(roleId: number): Observable<void> {
        return this.http.delete<void>(`${this.ROLES_BASE}/${roleId}`);
    }
}
