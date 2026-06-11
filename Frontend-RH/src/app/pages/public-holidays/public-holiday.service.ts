import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class PublicHolidayService {

    private readonly BASE = `${environment.apiUrl}/public-holidays`;

    constructor(private http: HttpClient) {}

    /** GET /public-holidays?countryCode=XX */
    getAll(countryCode?: string): Observable<any[]> {
        let params = new HttpParams();
        if (countryCode) params = params.set('countryCode', countryCode);
        return this.http.get<any>(this.BASE, { params }).pipe(
            map(res => res?.data ?? (Array.isArray(res) ? res : [])),
            catchError(this.handleError)
        );
    }

    /** POST /public-holidays */
    create(dto: { name: string; date: string; countryCode?: string; recurring?: boolean }): Observable<any> {
        return this.http.post<any>(this.BASE, dto).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /** PUT /public-holidays/{id} */
    update(id: number, dto: { name: string; date: string; countryCode?: string; recurring?: boolean }): Observable<any> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.put<any>(`${this.BASE}/${id}`, dto).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /** DELETE /public-holidays/{id} */
    delete(id: number): Observable<void> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.delete<void>(`${this.BASE}/${id}`).pipe(catchError(this.handleError));
    }

    private handleError(err: any): Observable<never> {
        console.error('[PublicHolidayService] Error:', err);
        return throwError(() => err);
    }
}
