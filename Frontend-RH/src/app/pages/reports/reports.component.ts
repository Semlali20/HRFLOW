import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from './report.service';
import { KpiData } from 'src/app/core/models/hr.models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .page { padding: 0 24px 40px; animation: fadeIn .4s ease both; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none} }

    .page-header { display:flex; align-items:center; justify-content:space-between; padding:14px 20px; background:#fff; border-radius:12px; box-shadow:0 4px 20px rgba(22,34,51,.08); margin-bottom:18px; }
    .page-title { font-family:'Inter',sans-serif; font-size:22px; font-weight:700; color:#1A2B3C; margin:0; }
    .page-date  { font-size:13px; color:#8FA3B8; display:flex; align-items:center; gap:6px; }

    /* ── KPI Cards ── */
    .kpi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin-bottom:24px; }
    .kpi-card { background:#fff; border-radius:12px; padding:22px 24px; box-shadow:0 4px 20px rgba(22,34,51,.08); }
    .kpi-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px; margin-bottom:14px; }
    .kpi-icon--teal  { background:#E8F7F6; color:#1B7872; }
    .kpi-icon--blue  { background:#EFF6FF; color:#1D4ED8; }
    .kpi-icon--amber { background:#FFF7ED; color:#C2410C; }
    .kpi-label { font-size:13px; color:#8FA3B8; margin-bottom:6px; }
    .kpi-value { font-family:'Inter',sans-serif; font-size:36px; font-weight:800; color:#1A2B3C; line-height:1; }

    /* ── Loading ── */
    .state-box { padding:48px 0; text-align:center; color:#8FA3B8; font-size:14px; }
    .state-box i { font-size:36px; display:block; margin-bottom:10px; }
    .state-box--error { color:#EF4444; }
    .spinner { width:32px; height:32px; border:3px solid #E2E8F0; border-top-color:#2FA8A0; border-radius:50%; animation:spin .7s linear infinite; margin:0 auto 10px; }
    @keyframes spin { to { transform:rotate(360deg); } }

    /* ── Export ── */
    .exports-card { background:#fff; border-radius:12px; padding:24px; box-shadow:0 4px 20px rgba(22,34,51,.08); }
    .exports-title { font-family:'Inter',sans-serif; font-size:15px; font-weight:700; color:#1A2B3C; margin-bottom:18px; }
    .exports-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(220px,1fr)); gap:14px; }
    .export-card { border:1.5px solid #E2E8F0; border-radius:10px; padding:18px; display:flex; flex-direction:column; gap:10px; cursor:pointer; transition:all .15s; }
    .export-card:hover { border-color:#2FA8A0; box-shadow:0 4px 16px rgba(47,168,160,.12); }
    .export-card--loading { opacity:.6; pointer-events:none; }
    .export-icon { width:40px; height:40px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px; }
    .export-icon--green { background:#DCFCE7; color:#15803D; }
    .export-icon--red   { background:#FFE4E6; color:#BE123C; }
    .export-name { font-family:'Inter',sans-serif; font-size:13.5px; font-weight:700; color:#1A2B3C; }
    .export-desc { font-size:12px; color:#8FA3B8; }
    .export-btn { display:flex; align-items:center; justify-content:center; gap:6px; padding:9px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; font-size:13px; font-weight:600; color:#4A6080; cursor:pointer; transition:all .15s; }
    .export-btn:hover { background:#2FA8A0; color:#fff; border-color:#2FA8A0; }
  `],
  template: `
  <div class="page">

    <div class="page-header">
      <h4 class="page-title">Reports & Analytics</h4>
      <span class="page-date"><i class="bx bx-calendar-alt"></i> {{ today | date:'EEEE, MMMM d, y' }}</span>
    </div>

    <!-- Loading KPI -->
    <div class="state-box" *ngIf="loadingKpi">
      <div class="spinner"></div>Loading KPIs…
    </div>

    <!-- Error KPI -->
    <div class="state-box state-box--error" *ngIf="!loadingKpi && errorKpi">
      <i class="bx bx-error-circle"></i>{{ errorKpi }}
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid" *ngIf="!loadingKpi && !errorKpi && kpi">
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--teal"><i class="bx bx-group"></i></div>
        <div class="kpi-label">Total Employees</div>
        <div class="kpi-value">{{ kpi.totalEmployees | number }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--blue"><i class="bx bx-briefcase"></i></div>
        <div class="kpi-label">Total Interns</div>
        <div class="kpi-value">{{ kpi.totalInterns | number }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-icon--amber"><i class="bx bx-calendar-x"></i></div>
        <div class="kpi-label">Pending Leave Requests</div>
        <div class="kpi-value">{{ kpi.pendingLeaves | number }}</div>
      </div>
    </div>

    <!-- Export Section -->
    <div class="exports-card">
      <div class="exports-title">Export Reports</div>
      <div class="exports-grid">

        <div class="export-card" [class.export-card--loading]="downloading['emp-excel']">
          <div class="export-icon export-icon--green"><i class="bx bx-table"></i></div>
          <div>
            <div class="export-name">Employees — Excel</div>
            <div class="export-desc">Full employee list in Excel format (.xlsx)</div>
          </div>
          <button class="export-btn" (click)="download('emp-excel')">
            <i class="bx" [class.bx-download]="!downloading['emp-excel']" [class.bx-loader-alt]="downloading['emp-excel']" [class.bx-spin]="downloading['emp-excel']"></i>
            {{ downloading['emp-excel'] ? 'Downloading…' : 'Download Excel' }}
          </button>
        </div>

        <div class="export-card" [class.export-card--loading]="downloading['emp-pdf']">
          <div class="export-icon export-icon--red"><i class="bx bxs-file-pdf"></i></div>
          <div>
            <div class="export-name">Employees — PDF</div>
            <div class="export-desc">Full employee list in PDF format</div>
          </div>
          <button class="export-btn" (click)="download('emp-pdf')">
            <i class="bx" [class.bx-download]="!downloading['emp-pdf']" [class.bx-loader-alt]="downloading['emp-pdf']" [class.bx-spin]="downloading['emp-pdf']"></i>
            {{ downloading['emp-pdf'] ? 'Downloading…' : 'Download PDF' }}
          </button>
        </div>

        <div class="export-card" [class.export-card--loading]="downloading['intern-excel']">
          <div class="export-icon export-icon--green"><i class="bx bx-table"></i></div>
          <div>
            <div class="export-name">Interns — Excel</div>
            <div class="export-desc">Full intern list in Excel format (.xlsx)</div>
          </div>
          <button class="export-btn" (click)="download('intern-excel')">
            <i class="bx" [class.bx-download]="!downloading['intern-excel']" [class.bx-loader-alt]="downloading['intern-excel']" [class.bx-spin]="downloading['intern-excel']"></i>
            {{ downloading['intern-excel'] ? 'Downloading…' : 'Download Excel' }}
          </button>
        </div>

      </div>
    </div>

  </div>
  `
})
export class ReportsComponent implements OnInit {

  today = new Date();
  kpi: KpiData | null = null;
  loadingKpi = false;
  errorKpi: string | null = null;
  downloading: Record<string, boolean> = {};

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadKpi();
  }

  loadKpi(): void {
    this.loadingKpi = true;
    this.errorKpi = null;
    this.reportService.getKpis().subscribe({
      next: kpi => { this.kpi = kpi; this.loadingKpi = false; },
      error: err => { this.errorKpi = err?.error?.message || 'Failed to load KPIs.'; this.loadingKpi = false; }
    });
  }

  download(type: string): void {
    this.downloading[type] = true;
    const action =
      type === 'emp-excel'    ? this.reportService.getEmployeesExcel() :
      type === 'emp-pdf'      ? this.reportService.getEmployeesPdf() :
                                this.reportService.getInternsExcel();
    const filename = type === 'emp-excel' ? 'employees.xlsx' : type === 'emp-pdf' ? 'employees.pdf' : 'interns.xlsx';
    const mime     = type === 'emp-pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    action.subscribe({
      next: buf => {
        const blob = new Blob([buf], { type: mime });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
        this.downloading[type] = false;
      },
      error: () => { this.downloading[type] = false; }
    });
  }
}
