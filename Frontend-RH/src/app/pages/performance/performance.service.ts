import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface PerformanceReview {
  id?: number;
  collaborateurId: number;
  collaborateurName?: string;
  reviewPeriod: string;
  reviewDate: string;
  status?: 'DRAFT' | 'SUBMITTED' | 'ACKNOWLEDGED';
  technicalScore?: number;
  communicationScore?: number;
  teamworkScore?: number;
  initiativeScore?: number;
  attendanceScore?: number;
  overallScore?: number;
  strengths?: string;
  improvements?: string;
  goals?: string;
  reviewerNotes?: string;
  reviewerName?: string;
}

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private readonly base = `${environment.apiUrl}/performance-reviews`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20): Observable<{ content: PerformanceReview[]; totalPages: number; totalElements: number }> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(this.base, { params });
  }

  getById(id: number): Observable<PerformanceReview> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map(r => r.data ?? r));
  }

  getByCollaborateur(collabId: number): Observable<PerformanceReview[]> {
    return this.http.get<any>(`${this.base}/collaborateur/${collabId}`).pipe(map(r => r.data ?? r));
  }

  create(review: PerformanceReview): Observable<PerformanceReview> {
    return this.http.post<any>(this.base, review).pipe(map(r => r.data ?? r));
  }

  update(id: number, review: PerformanceReview): Observable<PerformanceReview> {
    return this.http.put<any>(`${this.base}/${id}`, review).pipe(map(r => r.data ?? r));
  }

  submit(id: number): Observable<PerformanceReview> {
    return this.http.patch<any>(`${this.base}/${id}/submit`, {}).pipe(map(r => r.data ?? r));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
