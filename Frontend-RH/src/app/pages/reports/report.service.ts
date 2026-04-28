import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface KpiData {
    totalEmployees: number;
    totalInterns: number;
    totalUsers: number;
}

@Injectable({ providedIn: 'root' })
export class ReportService {

    private readonly BASE = 'http://localhost:8090/api/v1/reports';

    constructor(private http: HttpClient) {}

    getKpis(): Observable<KpiData> {
        return this.http.get<KpiData>(`${this.BASE}/kpi`);
    }

    downloadEmployeesExcel(): void {
        this.http.get(`${this.BASE}/employees/excel`, { responseType: 'blob' }).subscribe(blob => {
            this.triggerDownload(blob, 'employees.xlsx');
        });
    }

    downloadInternsExcel(): void {
        this.http.get(`${this.BASE}/interns/excel`, { responseType: 'blob' }).subscribe(blob => {
            this.triggerDownload(blob, 'interns.xlsx');
        });
    }

    downloadEmployeesPdf(): void {
        this.http.get(`${this.BASE}/employees/pdf`, { responseType: 'blob' }).subscribe(blob => {
            this.triggerDownload(blob, 'employees.pdf');
        });
    }

    private triggerDownload(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}
