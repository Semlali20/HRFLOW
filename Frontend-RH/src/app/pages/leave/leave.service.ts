import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LeaveType, LeaveRequest, LeaveBalance, LeaveSubmitRequest } from 'src/app/core/models/hr.models';

export { LeaveType, LeaveRequest, LeaveBalance, LeaveSubmitRequest };

@Injectable({ providedIn: 'root' })
export class LeaveService {

    private readonly BASE = `${environment.apiUrl}/leaves`;

    constructor(private http: HttpClient) {}

    // ── Leave Types ────────────────────────────────────────────────────────────

    getLeaveTypes(): Observable<LeaveType[]> {
        return this.http.get<any>(`${this.BASE}/types`).pipe(
            map(res => res?.data ?? res ?? []),
            catchError(this.handleError)
        );
    }

    createLeaveType(leaveType: Partial<LeaveType>): Observable<LeaveType> {
        return this.http.post<any>(`${this.BASE}/types`, leaveType).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    updateLeaveType(id: number, leaveType: Partial<LeaveType>): Observable<LeaveType> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.put<any>(`${this.BASE}/types/${id}`, leaveType).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    deleteLeaveType(id: number): Observable<void> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.delete<void>(`${this.BASE}/types/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    // ── Leave Requests ─────────────────────────────────────────────────────────

    /** GET /leaves — all requests (requires LEAVE_READ_ALL permission) */
    getAllRequests(): Observable<LeaveRequest[]> {
        return this.http.get<any>(this.BASE, { params: new HttpParams().set('size', '200') }).pipe(
            map(res => {
                const items: any[] = Array.isArray(res) ? res : (res?.content ?? res?.data ?? []);
                return items;
            }),
            catchError(this.handleError)
        );
    }

    /** GET /leaves/{id} */
    getById(id: number): Observable<LeaveRequest> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.get<any>(`${this.BASE}/${id}`).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /** GET /leaves/my — own requests (requires LEAVE_REQUEST permission) */
    getMyRequests(): Observable<LeaveRequest[]> {
        return this.http.get<any>(`${this.BASE}/my`, { params: new HttpParams().set('size', '200') }).pipe(
            map(res => {
                const items: any[] = Array.isArray(res) ? res : (res?.content ?? res?.data ?? []);
                return items;
            }),
            catchError(this.handleError)
        );
    }

    /** POST /leaves — submit a leave request */
    submitRequest(payload: LeaveSubmitRequest): Observable<LeaveRequest> {
        if (!payload.leaveTypeId || !payload.startDate || !payload.endDate) {
            return throwError(() => new Error('leaveTypeId, startDate and endDate are required'));
        }
        return this.http.post<any>(this.BASE, payload).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /** PATCH /leaves/{id}/approve */
    approve(id: number, comment: string): Observable<LeaveRequest> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.patch<any>(`${this.BASE}/${id}/approve`, { comment }).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /** PATCH /leaves/{id}/reject */
    reject(id: number, comment: string): Observable<LeaveRequest> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.patch<any>(`${this.BASE}/${id}/reject`, { comment }).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /** PATCH /leaves/{id}/cancel */
    cancel(id: number): Observable<LeaveRequest> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.patch<any>(`${this.BASE}/${id}/cancel`, {}).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    // ── Leave Balance ──────────────────────────────────────────────────────────

    /** GET /leaves/user/{userId} — leave requests for a specific user */
    getByUser(userId: number): Observable<LeaveRequest[]> {
        if (!userId) return throwError(() => new Error('userId is required'));
        return this.http.get<any>(`${this.BASE}/user/${userId}`, { params: new HttpParams().set('size', '200') }).pipe(
            map(res => {
                const items: any[] = Array.isArray(res) ? res : (res?.content ?? res?.data ?? []);
                return items;
            }),
            catchError(this.handleError)
        );
    }

    /** GET /leaves/balance/{userId}?year=N — balances for a specific user (LEAVE_READ_ALL) */
    getBalancesForUser(userId: number, year?: number): Observable<LeaveBalance[]> {
        let params = new HttpParams();
        if (year) params = params.set('year', String(year));
        return this.http.get<any>(`${this.BASE}/balance/${userId}`, { params }).pipe(
            map(res => res?.data ?? res ?? []),
            catchError(this.handleError)
        );
    }

    /** GET /leaves/balance?year=N — my balances */
    getMyBalances(year?: number): Observable<LeaveBalance[]> {
        let params = new HttpParams();
        if (year) params = params.set('year', String(year));
        return this.http.get<any>(`${this.BASE}/balance`, { params }).pipe(
            map(res => res?.data ?? res ?? []),
            catchError(this.handleError)
        );
    }

    /** POST /leaves/balance/init — initialize leave balances */
    initBalance(dto: { leaveTypeId: number; year: number; totalDays: number; userId?: number | null }): Observable<any> {
        let params = new HttpParams()
            .set('leaveTypeId', String(dto.leaveTypeId))
            .set('year', String(dto.year))
            .set('totalDays', String(dto.totalDays));
        if (dto.userId) params = params.set('userId', String(dto.userId));
        return this.http.post<any>(`${this.BASE}/balance/init`, null, { params }).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(err: any): Observable<never> {
        console.error('[LeaveService] Error:', err);
        return throwError(() => err);
    }
}
