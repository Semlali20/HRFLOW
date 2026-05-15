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

    getByUser(email: string): Observable<AuditLog[]> {
        if (!email) return throwError(() => new Error('email is required'));
        return this.http.get<AuditLog[]>(`${this.BASE}/user/${encodeURIComponent(email)}`).pipe(catchError(this.handleError));
    }

    getByModule(module: string): Observable<AuditLog[]> {
        if (!module) return throwError(() => new Error('module is required'));
        return this.http.get<AuditLog[]>(`${this.BASE}/module/${module}`).pipe(catchError(this.handleError));
    }

    getByAction(action: string): Observable<AuditLog[]> {
        if (!action) return throwError(() => new Error('action is required'));
        return this.http.get<any>(`${this.BASE}/action/${action}`).pipe(
            map(res => res?.content ?? res?.data ?? (Array.isArray(res) ? res : [])),
            catchError(this.handleError)
        );
    }

    getByDateRange(from: string, to: string): Observable<AuditLog[]> {
        if (!from || !to) return throwError(() => new Error('from and to are required'));
        const params = new HttpParams().set('from', from).set('to', to);
        return this.http.get<AuditLog[]>(`${this.BASE}/range`, { params }).pipe(catchError(this.handleError));
    }

    private handleError(err: any): Observable<never> {
        console.error('[AuditService] Error:', err);
        return throwError(() => err);
    }
}
