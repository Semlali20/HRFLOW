import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { KpiData } from 'src/app/core/models/hr.models';

@Injectable({ providedIn: 'root' })
export class ReportService {

    private readonly BASE = `${environment.apiUrl}/reports`;

    constructor(private http: HttpClient) {}

    getKpis(): Observable<KpiData> {
        return this.http.get<any>(`${this.BASE}/kpi`).pipe(
            map(res => ({
                totalEmployees: res.totalEmployees ?? 0,
                totalInterns:   res.totalInterns   ?? 0,
                pendingLeaves:  res.pendingLeaves  ?? 0,
                totalUsers:     res.totalUsers     ?? 0,
            }))
        );
    }

    getEmployeesExcel(): Observable<ArrayBuffer> {
        return this.http.get(`${this.BASE}/employees/excel`, { responseType: 'arraybuffer' });
    }

    getInternsExcel(): Observable<ArrayBuffer> {
        return this.http.get(`${this.BASE}/interns/excel`, { responseType: 'arraybuffer' });
    }

    getEmployeesPdf(): Observable<ArrayBuffer> {
        return this.http.get(`${this.BASE}/employees/pdf`, { responseType: 'arraybuffer' });
    }

    getInternsExcelBlob(): Observable<Blob> {
        return this.http.get(`${this.BASE}/interns/excel`, { responseType: 'blob' });
    }

    getEmployeesExcelBlob(): Observable<Blob> {
        return this.http.get(`${this.BASE}/employees/excel`, { responseType: 'blob' });
    }

    getEmployeesPdfBlob(): Observable<Blob> {
        return this.http.get(`${this.BASE}/employees/pdf`, { responseType: 'blob' });
    }

    getLeavesExcel(year?: number): Observable<Blob> {
        const params = year ? `?year=${year}` : '';
        return this.http.get(`${this.BASE}/leaves/excel${params}`, { responseType: 'blob' });
    }

    getLeavesPdf(year?: number): Observable<Blob> {
        const params = year ? `?year=${year}` : '';
        return this.http.get(`${this.BASE}/leaves/pdf${params}`, { responseType: 'blob' });
    }

    getPayrollExcel(year?: number): Observable<Blob> {
        const params = year ? `?year=${year}` : '';
        return this.http.get(`${this.BASE}/payroll/excel${params}`, { responseType: 'blob' });
    }

    getPayrollPdf(year?: number): Observable<Blob> {
        const params = year ? `?year=${year}` : '';
        return this.http.get(`${this.BASE}/payroll/pdf${params}`, { responseType: 'blob' });
    }
}
