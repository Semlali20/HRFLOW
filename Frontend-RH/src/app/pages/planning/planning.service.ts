import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PlanningEvent } from 'src/app/core/models/hr.models';

export { PlanningEvent };

@Injectable({ providedIn: 'root' })
export class PlanningService {

    /** Backend endpoint: /planning */
    private readonly BASE = `${environment.apiUrl}/planning`;

    constructor(private http: HttpClient) {}

    /** GET /planning/all — all events */
    getAllEvents(): Observable<PlanningEvent[]> {
        return this.http.get<PlanningEvent[]>(`${this.BASE}/all`).pipe(catchError(this.handleError));
    }

    /** GET /planning?from=...&to=... — events by date range */
    getEventsByRange(from: Date, to: Date): Observable<PlanningEvent[]> {
        const params = new HttpParams()
            .set('from', from.toISOString())
            .set('to', to.toISOString());
        return this.http.get<PlanningEvent[]>(this.BASE, { params }).pipe(catchError(this.handleError));
    }

    /** GET /planning/{id} */
    getById(id: number): Observable<PlanningEvent> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.get<PlanningEvent>(`${this.BASE}/${id}`).pipe(catchError(this.handleError));
    }

    /** POST /planning — create { title, description, startDateTime, endDateTime, type } */
    createEvent(event: PlanningEvent): Observable<PlanningEvent> {
        if (!event.title || !event.startDateTime) {
            return throwError(() => new Error('title and startDateTime are required'));
        }
        return this.http.post<PlanningEvent>(this.BASE, event).pipe(catchError(this.handleError));
    }

    /** PUT /planning/{id} */
    updateEvent(id: number, event: PlanningEvent): Observable<PlanningEvent> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.put<PlanningEvent>(`${this.BASE}/${id}`, event).pipe(catchError(this.handleError));
    }

    /** DELETE /planning/{id} → 204 */
    deleteEvent(id: number): Observable<void> {
        if (!id) return throwError(() => new Error('id is required'));
        return this.http.delete<void>(`${this.BASE}/${id}`).pipe(catchError(this.handleError));
    }

    private handleError(err: any): Observable<never> {
        console.error('[PlanningService] Error:', err);
        return throwError(() => err);
    }
}
