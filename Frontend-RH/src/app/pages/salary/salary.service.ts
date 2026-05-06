import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Payslip, PayslipCreateDto, SalarySummary } from 'src/app/core/models/hr.models';

@Injectable({ providedIn: 'root' })
export class SalaryService {

    private readonly BASE = `${environment.apiUrl}/salaries`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<Payslip[]> {
        return this.http.get<Payslip[]>(this.BASE).pipe(catchError(this.handleError));
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

    getSummary(period?: string): Observable<SalarySummary> {
        const params = period ? new HttpParams().set('period', period) : new HttpParams();
        return this.http.get<SalarySummary>(`${this.BASE}/summary`, { params }).pipe(catchError(this.handleError));
    }

    create(dto: PayslipCreateDto): Observable<Payslip> {
        if (!dto.collaborateurId || !dto.period) {
            return throwError(() => new Error('collaborateurId and period are required'));
        }
        return this.http.post<Payslip>(this.BASE, dto).pipe(catchError(this.handleError));
    }

    validate(id: number): Observable<Payslip> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.put<Payslip>(`${this.BASE}/${id}/validate`, {}).pipe(catchError(this.handleError));
    }

    markPaid(id: number): Observable<Payslip> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.put<Payslip>(`${this.BASE}/${id}/pay`, {}).pipe(catchError(this.handleError));
    }

    delete(id: number): Observable<void> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.delete<void>(`${this.BASE}/${id}`).pipe(catchError(this.handleError));
    }

    downloadPayslip(id: number): Observable<ArrayBuffer> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.get(`${this.BASE}/${id}/download`, { responseType: 'arraybuffer' }).pipe(catchError(this.handleError));
    }

    private handleError(err: any): Observable<never> {
        return throwError(() => err);
    }
}
