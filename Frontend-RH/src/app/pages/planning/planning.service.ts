import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PlanningEvent } from 'src/app/core/models/hr.models';

export { PlanningEvent };

@Injectable({ providedIn: 'root' })
export class PlanningService {

    private readonly BASE = `${environment.apiUrl}/planning`;

    constructor(private http: HttpClient) {}

    /** GET /planning — all events (paginated, returns up to 200) */
    getAllEvents(): Observable<PlanningEvent[]> {
        return this.http.get<any>(this.BASE, { params: new HttpParams().set('size', '200') }).pipe(
            map(res => {
                const items: any[] = Array.isArray(res) ? res : (res?.content ?? res?.data ?? []);
                return items;
            }),
            catchError(this.handleError)
        );
    }

    /** GET /planning/range?from=...&to=... — events by date range */
    getEventsByRange(from: Date, to: Date): Observable<PlanningEvent[]> {
        const params = new HttpParams()
            .set('from', from.toISOString())
            .set('to', to.toISOString());
        return this.http.get<any>(`${this.BASE}/range`, { params }).pipe(
            map(res => res?.data ?? (Array.isArray(res) ? res : [])),
            catchError(this.handleError)
        );
    }

    /** GET /planning/{id} */
    getById(id: number): Observable<PlanningEvent> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.get<any>(`${this.BASE}/${id}`).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /** POST /planning — create event */
    createEvent(event: PlanningEvent): Observable<PlanningEvent> {
        if (!event.title || !event.startDateTime) {
            return throwError(() => new Error('title and startDateTime are required'));
        }
        return this.http.post<any>(this.BASE, event).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /** PUT /planning/{id} */
    updateEvent(id: number, event: PlanningEvent): Observable<PlanningEvent> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.put<any>(`${this.BASE}/${id}`, event).pipe(
            map(res => res?.data ?? res),
            catchError(this.handleError)
        );
    }

    /** DELETE /planning/{id} */
    deleteEvent(id: number): Observable<void> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.delete<void>(`${this.BASE}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(err: any): Observable<never> {
        console.error('[PlanningService] Error:', err);
        return throwError(() => err);
    }
}
