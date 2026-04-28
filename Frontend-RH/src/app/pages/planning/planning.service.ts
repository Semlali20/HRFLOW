import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PlanningEvent {
    id?: number;
    title: string;
    description?: string;
    startDateTime: string;
    endDateTime?: string;
    location?: string;
    type: 'MEETING' | 'INTERVIEW' | 'TRAINING' | 'HOLIDAY' | 'DEADLINE' | 'OTHER';
    createdBy?: { id: number; firstname: string; lastname: string };
}

@Injectable({ providedIn: 'root' })
export class PlanningService {

    private readonly BASE = 'http://localhost:8090/api/v1/planning';

    constructor(private http: HttpClient) {}

    getAllEvents(): Observable<PlanningEvent[]> {
        return this.http.get<PlanningEvent[]>(`${this.BASE}/all`);
    }

    getEventsByRange(from: Date, to: Date): Observable<PlanningEvent[]> {
        const params = new HttpParams()
            .set('from', from.toISOString())
            .set('to', to.toISOString());
        return this.http.get<PlanningEvent[]>(this.BASE, { params });
    }

    createEvent(event: PlanningEvent): Observable<PlanningEvent> {
        return this.http.post<PlanningEvent>(this.BASE, event);
    }

    updateEvent(id: number, event: PlanningEvent): Observable<PlanningEvent> {
        return this.http.put<PlanningEvent>(`${this.BASE}/${id}`, event);
    }

    deleteEvent(id: number): Observable<void> {
        return this.http.delete<void>(`${this.BASE}/${id}`);
    }
}
