import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export type DocumentCategory = 'CONTRACT' | 'IDENTITY' | 'DIPLOMA' | 'MEDICAL' | 'PAYSLIP' | 'EVALUATION' | 'OTHER';

@Injectable({ providedIn: 'root' })
export class DocumentService {

    private readonly BASE = `${environment.apiUrl}/documents`;

    constructor(private http: HttpClient) {}

    /** POST /documents/upload — multipart/form-data */
    upload(file: File, employeeId: number, category: DocumentCategory, description?: string, expiryDate?: string): Observable<any> {
        if (!file) return throwError(() => new Error('file is required'));
        const form = new FormData();
        form.append('file', file);
        form.append('employeeId', String(employeeId));
        form.append('category', category);
        if (description) form.append('description', description);
        if (expiryDate)  form.append('expiryDate', expiryDate);
        return this.http.post<any>(`${this.BASE}/upload`, form).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /** GET /documents — all documents (admin file manager) */
    getAll(page = 0, size = 50): Observable<any[]> {
        const params = new HttpParams().set('page', String(page)).set('size', String(size));
        return this.http.get<any>(this.BASE, { params }).pipe(
            map(res => res?.content ?? res?.data ?? (Array.isArray(res) ? res : [])),
            catchError(this.handleError)
        );
    }

    /** GET /documents/{id} */
    getById(id: number): Observable<any> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.get<any>(`${this.BASE}/${id}`).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /** GET /documents/{id}/download?attachment=false */
    download(id: number, attachment = false): string {
        return `${this.BASE}/${id}/download?attachment=${attachment}`;
    }

    /** GET /documents/employee/{employeeId} */
    getByEmployee(employeeId: number, page = 0, size = 20): Observable<any[]> {
        if (!employeeId) return throwError(() => new Error('employeeId is required'));
        const params = new HttpParams().set('page', String(page)).set('size', String(size));
        return this.http.get<any>(`${this.BASE}/employee/${employeeId}`, { params }).pipe(
            map(res => res?.content ?? res?.data ?? (Array.isArray(res) ? res : [])),
            catchError(this.handleError)
        );
    }

    /** GET /documents/employee/{employeeId}/category/{category} */
    getByEmployeeAndCategory(employeeId: number, category: DocumentCategory): Observable<any[]> {
        if (!employeeId) return throwError(() => new Error('employeeId is required'));
        return this.http.get<any>(`${this.BASE}/employee/${employeeId}/category/${category}`).pipe(
            map(res => res?.data ?? (Array.isArray(res) ? res : [])),
            catchError(this.handleError)
        );
    }

    /** GET /documents/expiring?daysAhead=30 */
    getExpiringSoon(daysAhead = 30): Observable<any[]> {
        const params = new HttpParams().set('daysAhead', String(daysAhead));
        return this.http.get<any>(`${this.BASE}/expiring`, { params }).pipe(
            map(res => res?.data ?? (Array.isArray(res) ? res : [])),
            catchError(this.handleError)
        );
    }

    /** DELETE /documents/{id} */
    delete(id: number): Observable<void> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.delete<void>(`${this.BASE}/${id}`).pipe(catchError(this.handleError));
    }

    private handleError(err: any): Observable<never> {
        console.error('[DocumentService] Error:', err);
        return throwError(() => err);
    }
}
