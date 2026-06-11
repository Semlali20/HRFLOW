import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

/** Lightweight ref used in dropdowns / selects */
export interface DeptRef {
  id: number;
  name: string;
  code?: string;
}

export interface PosRef {
  id: number;
  title: string;
  code?: string;
  departmentId?: number;
}

@Injectable({ providedIn: 'root' })
export class DepartmentService {

  private readonly base = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // ── Departments ────────────────────────────────────────────────────────────

  getAllDepartments(): Observable<any[]> {
    return this.http.get<any>(`${this.base}/departments`).pipe(
      map(res => Array.isArray(res) ? res : (res?.content ?? res?.data ?? [])),
      catchError(() => throwError(() => new Error('Failed to load departments')))
    );
  }

  /** Fetches only active departments via the dedicated /active endpoint */
  getActiveDepartments(): Observable<any[]> {
    return this.http.get<any>(`${this.base}/departments/active`).pipe(
      map(res => res?.data ?? (Array.isArray(res) ? res : (res?.content ?? []))),
      catchError(() => this.getAllDepartments())   // fallback to paginated if /active not available
    );
  }

  getDepartmentById(id: number): Observable<any> {
    return this.http.get<any>(`${this.base}/departments/${id}`);
  }

  createDepartment(dto: any): Observable<any> {
    return this.http.post<any>(`${this.base}/departments`, dto);
  }

  updateDepartment(id: number, dto: any): Observable<any> {
    return this.http.put<any>(`${this.base}/departments/${id}`, dto);
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/departments/${id}`);
  }

  // ── Positions ──────────────────────────────────────────────────────────────

  getAllPositions(): Observable<any[]> {
    return this.http.get<any>(`${this.base}/positions`).pipe(
      map(res => Array.isArray(res) ? res : (res?.content ?? res?.data ?? [])),
      catchError(() => throwError(() => new Error('Failed to load positions')))
    );
  }

  getPositionsByDepartment(departmentId: number): Observable<any[]> {
    return this.http.get<any>(`${this.base}/positions/department/${departmentId}`).pipe(
      map(res => res?.data ?? (Array.isArray(res) ? res : (res?.content ?? []))),
      catchError(() => throwError(() => new Error('Failed to load positions for department')))
    );
  }

  createPosition(dto: any): Observable<any> {
    return this.http.post<any>(`${this.base}/positions`, dto);
  }

  updatePosition(id: number, dto: any): Observable<any> {
    return this.http.put<any>(`${this.base}/positions/${id}`, dto);
  }

  deletePosition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/positions/${id}`);
  }
}
