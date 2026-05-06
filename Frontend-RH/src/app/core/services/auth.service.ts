import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthUser } from '../models/auth.models';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    private readonly BASE_URL = `${environment.apiUrl}/auth`;
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

    refreshToken(): Observable<{ accessToken: string; refreshToken: string }> {
        const user = this.getAuthenticatedUser();
        if (!user?.refreshToken) {
            this.logout();
            return throwError(() => new Error('No refresh token'));
        }
        return this.http.post<{ accessToken: string; refreshToken: string }>(
            `${this.BASE_URL}/refresh`,
            { refreshToken: user.refreshToken }
        ).pipe(
            tap(response => {
                const current = this.getAuthenticatedUser();
                if (current) {
                    const updated: AuthUser = {
                        ...current,
                        accessToken: response.accessToken,
                        refreshToken: response.refreshToken
                    };
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
                }
            }),
            catchError(err => {
                this.clearAuthData();
                return throwError(() => err);
            })
        );
    }

    logout(): void {
        this.http.post(`${this.BASE_URL}/logout`, {}).subscribe({ error: () => {} });
        this.clearAuthData();
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
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
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
        const user = this.getAuthenticatedUser();
        return user !== null && !!user.accessToken;
    }

    storeAuthData(user: AuthUser): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    }

    clearAuthData(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    registerUser(firstName: string, lastName: string, email: string, title: string, userRole: string): Observable<void> {
        if (!firstName || !lastName || !email || !userRole) {
            return throwError(() => new Error('firstName, lastName, email and userRole are required'));
        }
        return this.http.post<void>(`${this.BASE_URL}/register`, { firstName, lastName, email, title, userRole }).pipe(
            catchError(err => throwError(() => err))
        );
    }
}
