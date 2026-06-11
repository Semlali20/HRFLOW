import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LeaveRequest, LeaveBalance } from 'src/app/core/models/hr.models';

/** Shape returned by every paginated backend endpoint */
interface PagedResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
}

/**
 * AttendanceService
 *
 * The backend exposes attendance data via the /leaves endpoint.
 * This service wraps leave management calls that are relevant for
 * the attendance/absence tracking view.
 */
@Injectable({ providedIn: 'root' })
export class AttendanceService {

    private readonly LEAVES_BASE = `${environment.apiUrl}/leaves`;

    constructor(private http: HttpClient) {}

    /** GET /leaves — all leave requests (used as attendance records).
     *  Backend returns PagedResponse<LeaveRequestResponse> — we unwrap content here. */
    getAllLeaves(): Observable<LeaveRequest[]> {
        const params = new HttpParams().set('size', '1000').set('page', '0');
        return this.http
            .get<PagedResponse<LeaveRequest>>(this.LEAVES_BASE, { params })
            .pipe(
                map(res => Array.isArray(res) ? res : (res?.content ?? [])),
                catchError(this.handleError)
            );
    }

    /** GET /leaves/my — current user's own leave requests (also paginated). */
    getMyLeaves(): Observable<LeaveRequest[]> {
        const params = new HttpParams().set('size', '500').set('page', '0');
        return this.http
            .get<PagedResponse<LeaveRequest>>(`${this.LEAVES_BASE}/my`, { params })
            .pipe(
                map(res => Array.isArray(res) ? res : (res?.content ?? [])),
                catchError(this.handleError)
            );
    }

    /** GET /leaves/balance?year=N */
    getMyBalance(year?: number): Observable<LeaveBalance[]> {
        let params = new HttpParams();
        if (year) params = params.set('year', String(year));
        return this.http.get<LeaveBalance[]>(`${this.LEAVES_BASE}/balance`, { params }).pipe(catchError(this.handleError));
    }

    /** PATCH /leaves/{id}/approve */
    approveLeave(id: number, comment: string): Observable<LeaveRequest> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.patch<LeaveRequest>(`${this.LEAVES_BASE}/${id}/approve`, { comment }).pipe(catchError(this.handleError));
    }

    /** PATCH /leaves/{id}/reject */
    rejectLeave(id: number, comment: string): Observable<LeaveRequest> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.patch<LeaveRequest>(`${this.LEAVES_BASE}/${id}/reject`, { comment }).pipe(catchError(this.handleError));
    }

    private handleError(err: any): Observable<never> {
        console.error('[AttendanceService] Error:', err);
        return throwError(() => err);
    }
}
