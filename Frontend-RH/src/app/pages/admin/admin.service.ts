import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
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
        return this.http.get<any>(this.USERS_BASE, { params: new HttpParams().set('size', '200') }).pipe(
            map(res => {
                const items: any[] = Array.isArray(res) ? res : (res?.content ?? res?.data ?? []);
                return items;
            }),
            catchError(this.handleError)
        );
    }

    /** GET /admin/users/{id} */
    getUserById(userId: number): Observable<AdminUser> {
        if (!userId) return throwError(() => new Error('userId is required'));
        return this.http.get<any>(`${this.USERS_BASE}/${userId}`).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /**
     * Update user roles via PUT /admin/users/{id}.
     * Fetches current user first to preserve firstName, lastName, email, title.
     */
    updateUserRoles(userId: number, roleNames: string[]): Observable<AdminUser> {
        if (!userId) return throwError(() => new Error('userId is required'));
        return this.getUserById(userId).pipe(
            switchMap((user: any) => {
                const request = {
                    firstName: user.firstName,
                    lastName:  user.lastName,
                    email:     user.email,
                    title:     user.title ?? '',
                    roles:     roleNames,
                    version:   user.version ?? null,
                };
                return this.http.put<any>(`${this.USERS_BASE}/${userId}`, request).pipe(
                    map(res => res?.data ?? res)
                );
            }),
            catchError(this.handleError)
        );
    }

    /** PUT /admin/users/{id} — full user update */
    updateUser(userId: number, request: { firstName: string; lastName: string; email: string; title?: string; roles?: string[]; version?: number | null }): Observable<AdminUser> {
        if (!userId) return throwError(() => new Error('userId is required'));
        return this.http.put<any>(`${this.USERS_BASE}/${userId}`, request).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /** DELETE /admin/users/{id} */
    deleteUser(userId: number): Observable<void> {
        if (!userId) return throwError(() => new Error('userId is required'));
        return this.http.delete<void>(`${this.USERS_BASE}/${userId}`).pipe(
            catchError(this.handleError)
        );
    }

    /** POST /admin/emails/send — backend uses @RequestParam so params go in the URL */
    sendEmail(payload: { to: string; subject: string; message: string }): Observable<void> {
        const params = new HttpParams()
            .set('to',      payload.to)
            .set('subject', payload.subject)
            .set('message', payload.message);
        return this.http.post<void>(`${environment.apiUrl}/admin/emails/send`, null, { params }).pipe(
            catchError(this.handleError)
        );
    }

    // ── Roles ──────────────────────────────────────────────────────────────────

    /** GET /admin/roles */
    getAllRoles(): Observable<Role[]> {
        return this.http.get<any>(this.ROLES_BASE).pipe(
            map(res => res?.data ?? (Array.isArray(res) ? res : [])),
            catchError(this.handleError)
        );
    }

    /** POST /admin/roles */
    createRole(role: Partial<Role>): Observable<Role> {
        return this.http.post<any>(this.ROLES_BASE, role).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /** PUT /admin/roles/{id}/permissions — body: List<String> (plain array) */
    updateRolePermissions(roleId: number, permNames: string[]): Observable<Role> {
        if (!roleId) return throwError(() => new Error('roleId is required'));
        return this.http.put<any>(`${this.ROLES_BASE}/${roleId}/permissions`, permNames).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /** DELETE /admin/roles/{id} */
    deleteRole(roleId: number): Observable<void> {
        if (!roleId) return throwError(() => new Error('roleId is required'));
        return this.http.delete<void>(`${this.ROLES_BASE}/${roleId}`).pipe(
            catchError(this.handleError)
        );
    }

    // ── Permissions ────────────────────────────────────────────────────────────

    /** GET /admin/roles/permissions */
    getAllPermissions(): Observable<Permission[]> {
        return this.http.get<any>(this.PERMS_BASE).pipe(
            map(res => res?.data ?? (Array.isArray(res) ? res : [])),
            catchError(this.handleError)
        );
    }

    private handleError(err: any): Observable<never> {
        console.error('[AdminService] Error:', err);
        return throwError(() => err);
    }
}
