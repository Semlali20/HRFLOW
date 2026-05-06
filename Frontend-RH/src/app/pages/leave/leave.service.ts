import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LeaveType, LeaveRequest, LeaveBalance, LeaveSubmitRequest } from 'src/app/core/models/hr.models';

export { LeaveType, LeaveRequest, LeaveBalance, LeaveSubmitRequest };

@Injectable({ providedIn: 'root' })
export class LeaveService {

    /** Backend endpoint base: /leaves */
    private readonly BASE = `${environment.apiUrl}/leaves`;

    constructor(private http: HttpClient) {}

    // ── Leave Types ────────────────────────────────────────────────────────────

    getLeaveTypes(): Observable<LeaveType[]> {
        return this.http.get<LeaveType[]>(`${this.BASE}/types`).pipe(catchError(this.handleError));
    }

    createLeaveType(leaveType: Partial<LeaveType>): Observable<LeaveType> {
        return this.http.post<LeaveType>(`${this.BASE}/types`, leaveType).pipe(catchError(this.handleError));
    }

    updateLeaveType(id: number, leaveType: Partial<LeaveType>): Observable<LeaveType> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.put<LeaveType>(`${this.BASE}/types/${id}`, leaveType).pipe(catchError(this.handleError));
    }

    deleteLeaveType(id: number): Observable<void> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.delete<void>(`${this.BASE}/types/${id}`).pipe(catchError(this.handleError));
    }

    // ── Leave Requests ─────────────────────────────────────────────────────────

    /** GET /leaves — all requests (requires LEAVE_READ_ALL permission) */
    getAllRequests(): Observable<LeaveRequest[]> {
        return this.http.get<LeaveRequest[]>(this.BASE).pipe(catchError(this.handleError));
    }

    /** GET /leaves/{id} */
    getById(id: number): Observable<LeaveRequest> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.get<LeaveRequest>(`${this.BASE}/${id}`).pipe(catchError(this.handleError));
    }

    /** GET /leaves/my — own requests (requires LEAVE_REQUEST permission) */
    getMyRequests(): Observable<LeaveRequest[]> {
        return this.http.get<LeaveRequest[]>(`${this.BASE}/my`).pipe(catchError(this.handleError));
    }

    /** POST /leaves — submit a leave request */
    submitRequest(payload: LeaveSubmitRequest): Observable<LeaveRequest> {
        if (!payload.leaveTypeId || !payload.startDate || !payload.endDate) {
            return throwError(() => new Error('leaveTypeId, startDate and endDate are required'));
        }
        return this.http.post<LeaveRequest>(this.BASE, payload).pipe(catchError(this.handleError));
    }

    /** PATCH /leaves/{id}/approve */
    approve(id: number, comment: string): Observable<LeaveRequest> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.patch<LeaveRequest>(`${this.BASE}/${id}/approve`, { comment }).pipe(catchError(this.handleError));
    }

    /** PATCH /leaves/{id}/reject */
    reject(id: number, comment: string): Observable<LeaveRequest> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.patch<LeaveRequest>(`${this.BASE}/${id}/reject`, { comment }).pipe(catchError(this.handleError));
    }

    /** PATCH /leaves/{id}/cancel */
    cancel(id: number): Observable<LeaveRequest> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.patch<LeaveRequest>(`${this.BASE}/${id}/cancel`, {}).pipe(catchError(this.handleError));
    }

    // ── Leave Balance ──────────────────────────────────────────────────────────

    /** GET /leaves/balance?year=N — my balances */
    getMyBalances(year?: number): Observable<LeaveBalance[]> {
        let params = new HttpParams();
        if (year) params = params.set('year', String(year));
        return this.http.get<LeaveBalance[]>(`${this.BASE}/balance`, { params }).pipe(catchError(this.handleError));
    }

    private handleError(err: any): Observable<never> {
        console.error('[LeaveService] Error:', err);
        return throwError(() => err);
    }
}
