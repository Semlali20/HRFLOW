import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthUser } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    private readonly BASE_URL = 'http://localhost:8090/api/v1/auth';
    private readonly STORAGE_KEY = 'authUser';

    constructor(private http: HttpClient, private router: Router) {}

    loginUser(email: string, password: string): Observable<AuthUser> {
        return this.http.post<AuthUser>(`${this.BASE_URL}/login`, { email, password }).pipe(
            tap(response => {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(response));
            }),
            catchError(err => {
                console.error('Login failed:', err);
                return throwError(() => err);
            })
        );
    }

    refreshToken(): Observable<{ message: string }> {
        const user = this.getAuthenticatedUser();
        if (!user?.refreshToken) {
            this.logout();
            return throwError(() => new Error('No refresh token'));
        }
        return this.http.post<{ message: string }>(`${this.BASE_URL}/refresh`, {
            refreshToken: user.refreshToken
        }).pipe(
            tap(response => {
                const current = this.getAuthenticatedUser();
                if (current) {
                    current.accessToken = response.message;
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(current));
                }
            })
        );
    }

    logout(): void {
        this.http.post(`${this.BASE_URL}/logout`, {}).subscribe({ error: () => {} });
        localStorage.removeItem(this.STORAGE_KEY);
        this.router.navigate(['/account/auth/login']);
    }

    editPassword(oldPassword: string, newPassword: string): Observable<string> {
        const user = this.getAuthenticatedUser();
        if (!user?.email) return throwError(() => new Error('Not authenticated'));
        const params = new HttpParams()
            .set('email', user.email)
            .set('oldPassword', oldPassword)
            .set('newPassword', newPassword);
        return this.http.put(`${this.BASE_URL}/password`, null, {
            params,
            responseType: 'text'
        });
    }

    getAuthenticatedUser(): AuthUser | null {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    }

    getToken(): string | null {
        return this.getAuthenticatedUser()?.accessToken ?? null;
    }

    getUserRole(): string | null {
        return this.getAuthenticatedUser()?.userRole ?? null;
    }

    getPermissions(): string[] {
        return this.getAuthenticatedUser()?.permissions ?? [];
    }

    hasPermission(permission: string): boolean {
        return this.getPermissions().includes(permission);
    }

    isLoggedIn(): boolean {
        return this.getAuthenticatedUser() !== null;
    }
}
