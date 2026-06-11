import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class MeetingService {

    private readonly BASE = `${environment.apiUrl}/meetings`;

    constructor(private http: HttpClient) {}

    /** GET /meetings */
    getAll(page = 0, size = 20): Observable<any[]> {
        const params = new HttpParams().set('page', String(page)).set('size', String(size));
        return this.http.get<any>(this.BASE, { params }).pipe(
            map(res => res?.content ?? res?.data ?? (Array.isArray(res) ? res : [])),
            catchError(this.handleError)
        );
    }

    /** GET /meetings/intern/{internId} */
    getByIntern(internId: number): Observable<any[]> {
        if (!internId) return throwError(() => new Error('internId is required'));
        return this.http.get<any>(`${this.BASE}/intern/${internId}`).pipe(
            map(res => res?.data ?? (Array.isArray(res) ? res : [])),
            catchError(this.handleError)
        );
    }

    /** GET /meetings/{id} */
    getById(id: number): Observable<any> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.get<any>(`${this.BASE}/${id}`).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /** POST /meetings */
    create(dto: any): Observable<any> {
        return this.http.post<any>(this.BASE, dto).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /** PUT /meetings/{id} */
    update(id: number, dto: any): Observable<any> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.put<any>(`${this.BASE}/${id}`, dto).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /** DELETE /meetings/{id} */
    delete(id: number): Observable<void> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.delete<void>(`${this.BASE}/${id}`).pipe(catchError(this.handleError));
    }

    private handleError(err: any): Observable<never> {
        console.error('[MeetingService] Error:', err);
        return throwError(() => err);
    }
}
