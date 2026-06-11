import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface AuditLog {
    readonly id: number;
    readonly userEmail: string;
    readonly action: string;
    readonly module: string;
    readonly description: string;
    readonly timestamp: string;
}

export interface AuditPage {
    readonly content: AuditLog[];
    readonly totalElements: number;
    readonly totalPages: number;
    readonly number: number;
    readonly size: number;
}

@Injectable({ providedIn: 'root' })
export class AuditService {

    /** Backend endpoint: GET /audit (paginated) */
    private readonly BASE = `${environment.apiUrl}/audit`;

    constructor(private http: HttpClient) {}

    getLogs(page = 0, size = 50): Observable<AuditPage> {
        const params = new HttpParams()
            .set('page', String(page))
            .set('size', String(size));
        return this.http.get<AuditPage>(this.BASE, { params }).pipe(catchError(this.handleError));
    }

    getByUser(email: string, page = 0, size = 50): Observable<AuditPage> {
        if (!email) return throwError(() => new Error('email is required'));
        const params = new HttpParams().set('page', String(page)).set('size', String(size));
        return this.http.get<AuditPage>(`${this.BASE}/user/${encodeURIComponent(email)}`, { params }).pipe(
            catchError(this.handleError)
        );
    }

    getByModule(module: string, page = 0, size = 50): Observable<AuditPage> {
        if (!module) return throwError(() => new Error('module is required'));
        const params = new HttpParams().set('page', String(page)).set('size', String(size));
        return this.http.get<AuditPage>(`${this.BASE}/module/${module}`, { params }).pipe(
            catchError(this.handleError)
        );
    }

    getByAction(action: string, page = 0, size = 50): Observable<AuditPage> {
        if (!action) return throwError(() => new Error('action is required'));
        const params = new HttpParams().set('page', String(page)).set('size', String(size));
        return this.http.get<AuditPage>(`${this.BASE}/action/${action}`, { params }).pipe(
            catchError(this.handleError)
        );
    }

    getByDateRange(from: string, to: string, page = 0, size = 50): Observable<AuditPage> {
        if (!from || !to) return throwError(() => new Error('from and to are required'));
        const params = new HttpParams()
            .set('from', from)
            .set('to', to)
            .set('page', String(page))
            .set('size', String(size));
        return this.http.get<AuditPage>(`${this.BASE}/range`, { params }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Combined search — passes whichever filters are provided as query params.
     * Maps onto GET /audit/search on the backend (added in a previous batch).
     */
    searchLogs(filters: {
        email?: string;
        module?: string;
        action?: string;
        from?: string;
        to?: string;
        page?: number;
        size?: number;
    }): Observable<AuditPage> {
        let params = new HttpParams();
        if (filters.email)  params = params.set('email',  filters.email);
        if (filters.module) params = params.set('module', filters.module);
        if (filters.action) params = params.set('action', filters.action);
        if (filters.from)   params = params.set('from',   filters.from);
        if (filters.to)     params = params.set('to',     filters.to);
        params = params
            .set('page', String(filters.page ?? 0))
            .set('size', String(filters.size ?? 50));
        return this.http.get<AuditPage>(`${this.BASE}/search`, { params }).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(err: any): Observable<never> {
        console.error('[AuditService] Error:', err);
        return throwError(() => err);
    }
}
