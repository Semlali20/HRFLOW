import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private base = `${environment.apiUrl}/onboarding`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20): Observable<any[]> {
    const params = new HttpParams().set('page', String(page)).set('size', String(size));
    return this.http.get<any>(this.base, { params }).pipe(
      map(res => Array.isArray(res) ? res : (res?.content ?? res?.data ?? []))
    );
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map(r => r?.data ?? r));
  }

  getByEmployee(collabId: number): Observable<any[]> {
    return this.http.get<any>(`${this.base}/employee/${collabId}`).pipe(
      map(res => Array.isArray(res) ? res : (res?.content ?? res?.data ?? []))
    );
  }

  start(req: any): Observable<any> {
    return this.http.post<any>(this.base, req).pipe(map(r => r?.data ?? r));
  }

  completeTask(processId: number, taskId: number, notes?: string): Observable<any> {
    return this.http.patch<any>(
      `${this.base}/${processId}/tasks/${taskId}/complete`,
      null,
      { params: notes ? { notes } : {} }
    ).pipe(map(r => r?.data ?? r));
  }

  uncompleteTask(processId: number, taskId: number): Observable<any> {
    return this.http.patch<any>(`${this.base}/${processId}/tasks/${taskId}/uncomplete`, {}).pipe(
      map(r => r?.data ?? r)
    );
  }

  cancel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
