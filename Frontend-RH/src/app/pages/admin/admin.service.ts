import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AdminUser, Role, Permission } from 'src/app/core/models/hr.models';

export { AdminUser, Role, Permission };

@Injectable({ providedIn: 'root' })
export class AdminService {

    private readonly USERS_BASE = `${environment.apiUrl}/admin/users`;
    private readonly ROLES_BASE = `${environment.apiUrl}/admin/roles`;
    private readonly PERMS_BASE = `${environment.apiUrl}/admin/roles/permissions`;

    constructor(private http: HttpClient) {}

    // ── Users ──────────────────────────────────────────────────────────────────

    /** GET /admin/users */
    getAllUsers(): Observable<AdminUser[]> {
        return this.http.get<AdminUser[]>(this.USERS_BASE).pipe(catchError(this.handleError));
    }

    /** GET /admin/users/{id} */
    getUserById(userId: number): Observable<AdminUser> {
        if (!userId) return throwError(() => new Error('userId is required'));
        return this.http.get<AdminUser>(`${this.USERS_BASE}/${userId}`).pipe(catchError(this.handleError));
    }

    /** PUT /admin/users/{id}/roles — body: { roles: ["ADMIN"] } */
    updateUserRoles(userId: number, roleNames: string[]): Observable<AdminUser> {
        if (!userId) return throwError(() => new Error('userId is required'));
        return this.http.put<AdminUser>(`${this.USERS_BASE}/${userId}/roles`, { roles: roleNames }).pipe(catchError(this.handleError));
    }

    /** DELETE /admin/users/{id} */
    deleteUser(userId: number): Observable<void> {
        if (!userId) return throwError(() => new Error('userId is required'));
        return this.http.delete<void>(`${this.USERS_BASE}/${userId}`).pipe(catchError(this.handleError));
    }

    // ── Roles ──────────────────────────────────────────────────────────────────

    /** GET /admin/roles */
    getAllRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(this.ROLES_BASE).pipe(catchError(this.handleError));
    }

    /** POST /admin/roles */
    createRole(role: Partial<Role>): Observable<Role> {
        return this.http.post<Role>(this.ROLES_BASE, role).pipe(catchError(this.handleError));
    }

    /** PUT /admin/roles/{id}/permissions (custom endpoint) */
    updateRolePermissions(roleId: number, permNames: string[]): Observable<Role> {
        if (!roleId) return throwError(() => new Error('roleId is required'));
        return this.http.put<Role>(`${this.ROLES_BASE}/${roleId}/permissions`, { permissions: permNames }).pipe(catchError(this.handleError));
    }

    /** DELETE /admin/roles/{id} */
    deleteRole(roleId: number): Observable<void> {
        if (!roleId) return throwError(() => new Error('roleId is required'));
        return this.http.delete<void>(`${this.ROLES_BASE}/${roleId}`).pipe(catchError(this.handleError));
    }

    // ── Permissions ────────────────────────────────────────────────────────────

    /** GET /admin/permissions */
    getAllPermissions(): Observable<Permission[]> {
        return this.http.get<Permission[]>(this.PERMS_BASE).pipe(catchError(this.handleError));
    }

    private handleError(err: any): Observable<never> {
        console.error('[AdminService] Error:', err);
        return throwError(() => err);
    }
}
