import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface DeptRef { id: number; name: string; }
export interface PosRef  { id: number; name: string; departmentId?: number; }

@Injectable({ providedIn: 'root' })
export class DepartmentService {

    private readonly DEPT_BASE = `${environment.apiUrl}/departments`;
    private readonly POS_BASE  = `${environment.apiUrl}/positions`;

    constructor(private http: HttpClient) {}

    getActiveDepartments(): Observable<DeptRef[]> {
        return this.http.get<any>(`${this.DEPT_BASE}/active`).pipe(
            map(res => {
                const raw: any[] = Array.isArray(res) ? res : (res?.data ?? res?.content ?? []);
                return raw.map(d => ({ id: d.id, name: d.name }));
            }),
            catchError(err => throwError(() => err))
        );
    }

    getAllPositions(): Observable<PosRef[]> {
        return this.http.get<any>(this.POS_BASE).pipe(
            map(res => {
                const raw: any[] = Array.isArray(res)
                    ? res
                    : (res?.data ?? res?.content ?? []);
                return raw.map(p => ({ id: p.id, name: p.title ?? p.name, departmentId: p.department?.id }));
            }),
            catchError(err => throwError(() => err))
        );
    }
}
