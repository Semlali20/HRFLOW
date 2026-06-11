import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, Subject, tap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthUser } from '../models/auth.models';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    private readonly BASE_URL = `${environment.apiUrl}/auth`;
    private readonly STORAGE_KEY = 'authUser';
    private readonly REMEMBER_EMAIL_KEY = 'rememberedEmail';
    private readonly REMEMBER_PWD_KEY   = 'rememberedCredential';

    /** Emits whenever permissions are silently refreshed from the backend. */
    private readonly _permissionsRefreshed$ = new Subject<void>();
    readonly permissionsRefreshed$ = this._permissionsRefreshed$.asObservable();

    constructor(private http: HttpClient, private router: Router) {}

    loginUser(email: string, password: string, rememberMe = false): Observable<AuthUser> {
        return this.http.post<any>(`${this.BASE_URL}/login`, { email, password }).pipe(
            map(response => ({
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                tokenType: response.tokenType ?? 'Bearer',
                id: response.id,
                firstname: response.firstName,
                lastname: response.lastName,
                email: response.email,
                title: response.title,
                userRole: Array.isArray(response.roles) ? (response.roles[0] ?? '') : (response.userRole ?? ''),
                permissions: response.permissions ?? [],
            } as AuthUser)),
            tap(user => {
                // rememberMe=true  → localStorage  (persists after browser close)
                // rememberMe=false → sessionStorage (cleared on browser close)
                this.storeAuthData(user, rememberMe);
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
        // Remove any legacy plain-text password key left by old code
        localStorage.removeItem('rememberedPassword');
        localStorage.removeItem(this.REMEMBER_PWD_KEY);
        this.router.navigate(['/account/auth/login']);
    }

    editPassword(oldPassword: string, newPassword: string): Observable<any> {
        return this.http.put(`${this.BASE_URL}/password`, {
            currentPassword: oldPassword,
            newPassword
        });
    }

    getAuthenticatedUser(): AuthUser | null {
        try {
            // Check localStorage first (remembered sessions), then sessionStorage
            const stored = localStorage.getItem(this.STORAGE_KEY)
                        ?? sessionStorage.getItem(this.STORAGE_KEY);
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

    /**
     * Calls GET /auth/me to fetch the current user's fresh permissions from the DB
     * and silently updates localStorage. Use this to reflect admin-side permission
     * changes without forcing a re-login.
     */
    refreshCurrentUser(): Observable<AuthUser | null> {
        return this.http.get<any>(`${this.BASE_URL}/me`).pipe(
            map(response => {
                const current = this.getAuthenticatedUser();
                if (!current) return null;
                const freshPerms: string[] = (response.permissions ?? [])
                    .map((p: any) => (typeof p === 'string' ? p : (p.name ?? '')))
                    .filter(Boolean);
                const freshRole: string = Array.isArray(response.roles)
                    ? (response.roles[0] ?? current.userRole)
                    : (current.userRole);
                const updated: AuthUser = {
                    ...current,
                    userRole: freshRole,
                    permissions: freshPerms,
                };
                this.storeAuthData(updated);
                this._permissionsRefreshed$.next();
                return updated;
            }),
            catchError(err => {
                // Silent fail — do not disrupt the user session
                console.warn('[AuthService] Silent permission refresh failed:', err?.status);
                return throwError(() => err);
            })
        );
    }

    /**
     * Persist auth data.
     * @param user      The authenticated user object.
     * @param remember  true  → localStorage  (survives browser close)
     *                  false → sessionStorage (cleared on browser close)
     *                  undefined → keep existing storage location (e.g. on token refresh)
     */
    storeAuthData(user: AuthUser, remember?: boolean): void {
        const data = JSON.stringify(user);
        if (remember === true) {
            sessionStorage.removeItem(this.STORAGE_KEY);
            localStorage.setItem(this.STORAGE_KEY, data);
        } else if (remember === false) {
            localStorage.removeItem(this.STORAGE_KEY);
            sessionStorage.setItem(this.STORAGE_KEY, data);
        } else {
            // Token refresh — write back to whichever storage already holds the key
            if (localStorage.getItem(this.STORAGE_KEY) !== null) {
                localStorage.setItem(this.STORAGE_KEY, data);
            } else {
                sessionStorage.setItem(this.STORAGE_KEY, data);
            }
        }
    }

    clearAuthData(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        sessionStorage.removeItem(this.STORAGE_KEY);
    }

    /** Save email + password for "Remember me" pre-fill (password is base64-obfuscated). */
    saveRememberedCredentials(email: string, password: string): void {
        localStorage.setItem(this.REMEMBER_EMAIL_KEY, email);
        localStorage.setItem(this.REMEMBER_PWD_KEY, btoa(unescape(encodeURIComponent(password))));
    }

    clearRememberedEmail(): void {
        localStorage.removeItem(this.REMEMBER_EMAIL_KEY);
        localStorage.removeItem(this.REMEMBER_PWD_KEY);
    }

    getRememberedEmail(): string | null {
        return localStorage.getItem(this.REMEMBER_EMAIL_KEY);
    }

    getRememberedPassword(): string | null {
        const raw = localStorage.getItem(this.REMEMBER_PWD_KEY);
        if (!raw) return null;
        try {
            return decodeURIComponent(escape(atob(raw)));
        } catch {
            return null;
        }
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post(`${this.BASE_URL}/forgot-password`, { email });
    }

    verifyOtp(email: string, otp: string): Observable<any> {
        return this.http.post(`${this.BASE_URL}/verify-otp`, { email, otp });
    }

    resetPassword(email: string, otp: string, newPassword: string): Observable<any> {
        return this.http.post(`${this.BASE_URL}/reset-password`, { email, otp, newPassword });
    }

    registerUser(firstName: string, lastName: string, email: string, title: string, userRole: string): Observable<void> {
        if (!firstName || !lastName || !email || !userRole) {
            return throwError(() => new Error('firstName, lastName, email and userRole are required'));
        }
        return this.http.post<void>(`${this.BASE_URL}/register`, {
            firstName,
            lastName,
            email,
            title,
            roles: [userRole],
        }).pipe(
            catchError(err => throwError(() => err))
        );
    }
}
