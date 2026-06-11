import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface TrainingSession {
  id?: number;
  title: string;
  description?: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  trainerName?: string;
  maxParticipants?: number;
  cost?: number;
  status?: 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  participantIds?: number[];
  participantNames?: string[];
  participantCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class TrainingService {
  private readonly base = `${environment.apiUrl}/trainings`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20): Observable<TrainingSession[]> {
    const params = new HttpParams().set('page', String(page)).set('size', String(size));
    return this.http.get<any>(this.base, { params }).pipe(
      map(res => Array.isArray(res) ? res : (res?.content ?? res?.data ?? []))
    );
  }

  getById(id: number): Observable<TrainingSession> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map(r => r?.data ?? r));
  }

  create(t: TrainingSession): Observable<TrainingSession> {
    return this.http.post<any>(this.base, t).pipe(map(r => r?.data ?? r));
  }

  update(id: number, t: TrainingSession): Observable<TrainingSession> {
    return this.http.put<any>(`${this.base}/${id}`, t).pipe(map(r => r?.data ?? r));
  }

  enroll(trainingId: number, collabId: number): Observable<TrainingSession> {
    return this.http.patch<any>(`${this.base}/${trainingId}/enroll/${collabId}`, {}).pipe(map(r => r?.data ?? r));
  }

  unenroll(trainingId: number, collabId: number): Observable<TrainingSession> {
    return this.http.patch<any>(`${this.base}/${trainingId}/unenroll/${collabId}`, {}).pipe(map(r => r?.data ?? r));
  }

  updateStatus(id: number, status: string): Observable<TrainingSession> {
    return this.http.patch<any>(`${this.base}/${id}/status`, null, { params: { status } }).pipe(map(r => r?.data ?? r));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
