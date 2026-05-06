import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { KpiData } from 'src/app/core/models/hr.models';

export { KpiData };

@Injectable({ providedIn: 'root' })
export class ReportService {

    private readonly BASE = `${environment.apiUrl}/reports`;

    constructor(private http: HttpClient) {}

    getKpis(): Observable<KpiData> {
        return this.http.get<KpiData>(`${this.BASE}/kpi`).pipe(catchError(this.handleError));
    }

    getEmployeesExcel(): Observable<ArrayBuffer> {
        return this.http.get(`${this.BASE}/employees/excel`, { responseType: 'arraybuffer' }).pipe(catchError(this.handleError));
    }

    getInternsExcel(): Observable<ArrayBuffer> {
        return this.http.get(`${this.BASE}/interns/excel`, { responseType: 'arraybuffer' }).pipe(catchError(this.handleError));
    }

    getEmployeesPdf(): Observable<ArrayBuffer> {
        return this.http.get(`${this.BASE}/employees/pdf`, { responseType: 'arraybuffer' }).pipe(catchError(this.handleError));
    }

    downloadEmployeesExcel(): void {
        this.getEmployeesExcel().subscribe(buf => this.triggerDownload(buf, 'employees.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'));
    }

    downloadInternsExcel(): void {
        this.getInternsExcel().subscribe(buf => this.triggerDownload(buf, 'interns.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'));
    }

    downloadEmployeesPdf(): void {
        this.getEmployeesPdf().subscribe(buf => this.triggerDownload(buf, 'employees.pdf', 'application/pdf'));
    }

    private triggerDownload(buffer: ArrayBuffer, filename: string, mimeType: string): void {
        const blob = new Blob([buffer], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    private handleError(err: any): Observable<never> {
        return throwError(() => err);
    }
}
