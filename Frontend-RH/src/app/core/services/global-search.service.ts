import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SearchResult {
  id: number;
  type: 'employee' | 'leave' | 'recruitment' | 'training';
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  badge?: string;
  badgeClass?: string;
}

@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
  constructor(private http: HttpClient) {}

  search(term: string): Observable<SearchResult[]> {
    if (!term || term.trim().length < 2) return of([]);
    const q = term.trim();

    const employees$ = this.http.get<any>(`${environment.apiUrl}/employees`, {
      params: new HttpParams().set('search', q).set('size', '5')
    }).pipe(
      map((res: any) => {
        const list = res?.content ?? (Array.isArray(res) ? res : []);
        return list.slice(0, 5).map((e: any): SearchResult => ({
          id: e.id,
          type: 'employee',
          title: `${e.firstName} ${e.lastName}`,
          subtitle: e.department?.name || e.position?.name || 'Employee',
          icon: 'bi-person-fill',
          route: '/collaborateur',
          badge: e.status,
          badgeClass: e.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'
        }));
      }),
      catchError(() => of([]))
    );

    const leaves$ = this.http.get<any>(`${environment.apiUrl}/leaves`, {
      params: new HttpParams().set('search', q).set('size', '3')
    }).pipe(
      map((res: any) => {
        const list = res?.content ?? (Array.isArray(res) ? res : []);
        return list.slice(0, 3).map((l: any): SearchResult => ({
          id: l.id,
          type: 'leave',
          title: `Leave: ${l.collaborateurName || l.requesterName || ''}`,
          subtitle: `${l.leaveTypeName || l.type || ''} · ${l.startDate || ''}`,
          icon: 'bi-calendar-x',
          route: '/dayoff',
          badge: l.status,
          badgeClass: l.status === 'APPROVED' ? 'bg-success' : l.status === 'PENDING' ? 'bg-warning' : 'bg-danger'
        }));
      }),
      catchError(() => of([]))
    );

    const recruitment$ = this.http.get<any>(`${environment.apiUrl}/cvs/applications`, {
      params: new HttpParams().set('search', q).set('size', '3')
    }).pipe(
      map((res: any) => {
        const list = res?.content ?? (Array.isArray(res) ? res : []);
        return list.slice(0, 3).map((a: any): SearchResult => ({
          id: a.id,
          type: 'recruitment',
          title: a.candidateName || a.name || 'Candidate',
          subtitle: a.offerTitle || a.position || 'Application',
          icon: 'bi-person-lines-fill',
          route: '/recruitment',
          badge: a.status,
          badgeClass: 'bg-info'
        }));
      }),
      catchError(() => of([]))
    );

    return forkJoin([employees$, leaves$, recruitment$]).pipe(
      map(([emps, lvs, recs]) => [...emps, ...lvs, ...recs])
    );
  }
}
