import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Payslip, PayslipCreateDto } from 'src/app/core/models/hr.models';

@Injectable({ providedIn: 'root' })
export class SalaryService {

    private readonly BASE = `${environment.apiUrl}/salaries`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<Payslip[]> {
        return this.http.get<any>(this.BASE, { params: new HttpParams().set('size', '500') }).pipe(
            map(res => {
                const items: any[] = Array.isArray(res) ? res : (res?.content ?? res?.data ?? []);
                return items;
            }),
            catchError(this.handleError)
        );
    }

    getById(id: number): Observable<Payslip> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.get<Payslip>(`${this.BASE}/${id}`).pipe(catchError(this.handleError));
    }

    getByCollaborateur(collaborateurId: number): Observable<Payslip[]> {
        if (!collaborateurId) return throwError(() => new Error('collaborateurId is required'));
        return this.http.get<Payslip[]>(`${this.BASE}/collaborateur/${collaborateurId}`).pipe(catchError(this.handleError));
    }

    getByPeriod(period: string): Observable<Payslip[]> {
        if (!period) return throwError(() => new Error('period is required'));
        const params = new HttpParams().set('period', period);
        return this.http.get<Payslip[]>(this.BASE, { params }).pipe(catchError(this.handleError));
    }

    create(dto: PayslipCreateDto): Observable<Payslip> {
        if (!dto.collaborateurId || !dto.period) {
            return throwError(() => new Error('collaborateurId and period are required'));
        }
        return this.http.post<any>(this.BASE, dto).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    update(id: number, dto: PayslipCreateDto): Observable<Payslip> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.put<any>(`${this.BASE}/${id}`, dto).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /** PATCH /salaries/{id}/status?status=VALIDATED */
    validate(id: number): Observable<Payslip> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.patch<any>(`${this.BASE}/${id}/status`, null, { params: { status: 'VALIDATED' } }).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /** PATCH /salaries/{id}/status?status=PAID */
    markPaid(id: number): Observable<Payslip> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.patch<any>(`${this.BASE}/${id}/status`, null, { params: { status: 'PAID' } }).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /** PATCH /salaries/{id}/status?status=X — generic status update */
    updateStatus(id: number, status: string): Observable<Payslip> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.patch<any>(`${this.BASE}/${id}/status`, null, { params: { status } }).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    delete(id: number): Observable<void> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.delete<void>(`${this.BASE}/${id}`).pipe(catchError(this.handleError));
    }

    private handleError(err: any): Observable<never> {
        return throwError(() => err);
    }
}
