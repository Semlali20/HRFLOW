/**
 * DayoffService — delegates to the real backend /leaves endpoint.
 *
 * The frontend "Day-Off" concept maps directly to the backend Leave Management
 * system. This service re-exports from LeaveService so existing imports keep working.
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LeaveRequest, LeaveType, LeaveBalance, LeaveSubmitRequest } from 'src/app/core/models/hr.models';

export type DayOffType = 'ANNUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY' | 'UNPAID' | 'OTHER';
export type DayOffStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

/** @deprecated Use LeaveService from pages/leave/leave.service.ts directly */
@Injectable({ providedIn: 'root' })
export class DayOffService {

    /** Backend endpoint: /leaves */
    private readonly BASE = `${environment.apiUrl}/leaves`;

    constructor(private http: HttpClient) {}

    /** GET /leaves — all leave requests (backend returns PagedResponse — unwrap content) */
    getAll(): Observable<LeaveRequest[]> {
        const params = new HttpParams().set('size', '1000').set('page', '0');
        return this.http.get<any>(this.BASE, { params }).pipe(
            map(res => Array.isArray(res) ? res : (res?.content ?? res?.data ?? [])),
            catchError(this.handleError)
        );
    }

    /** GET /leaves/{id} */
    getById(id: number): Observable<LeaveRequest> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.get<LeaveRequest>(`${this.BASE}/${id}`).pipe(catchError(this.handleError));
    }

    /** GET /leaves/my — own requests (also paginated) */
    getMyRequests(): Observable<LeaveRequest[]> {
        const params = new HttpParams().set('size', '500').set('page', '0');
        return this.http.get<any>(`${this.BASE}/my`, { params }).pipe(
            map(res => Array.isArray(res) ? res : (res?.content ?? res?.data ?? [])),
            catchError(this.handleError)
        );
    }

    /** POST /leaves — submit leave request */
    create(payload: LeaveSubmitRequest): Observable<LeaveRequest> {
        if (!payload.leaveTypeId || !payload.startDate || !payload.endDate) {
            return throwError(() => new Error('leaveTypeId, startDate and endDate are required'));
        }
        return this.http.post<LeaveRequest>(this.BASE, payload).pipe(catchError(this.handleError));
    }

    /** PATCH /leaves/{id}/approve */
    approve(id: number, comment?: string): Observable<LeaveRequest> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.patch<LeaveRequest>(`${this.BASE}/${id}/approve`, { comment: comment ?? '' }).pipe(catchError(this.handleError));
    }

    /** PATCH /leaves/{id}/reject */
    reject(id: number, comment?: string): Observable<LeaveRequest> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.patch<LeaveRequest>(`${this.BASE}/${id}/reject`, { comment: comment ?? '' }).pipe(catchError(this.handleError));
    }

    /** PATCH /leaves/{id}/cancel */
    cancel(id: number): Observable<LeaveRequest> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.patch<LeaveRequest>(`${this.BASE}/${id}/cancel`, {}).pipe(catchError(this.handleError));
    }

    /** GET /leaves/balance?year=N */
    getBalance(year?: number): Observable<LeaveBalance[]> {
        let params = new HttpParams();
        if (year) params = params.set('year', String(year));
        return this.http.get<LeaveBalance[]>(`${this.BASE}/balance`, { params }).pipe(catchError(this.handleError));
    }

    private handleError(err: any): Observable<never> {
        console.error('[DayOffService] Error:', err);
        return throwError(() => err);
    }
}
