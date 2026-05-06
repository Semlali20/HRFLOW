import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CollaborateurService } from 'src/app/core/services/collaborateur.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  styles: [`
    .page { padding:0 24px 40px; animation:fadeIn .4s ease both; }
    @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
    .page-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);margin-bottom:18px;}
    .page-title{font-family:'Inter',sans-serif;font-size:22px;font-weight:700;color:#1A2B3C;margin:0;}
    .header-right{display:flex;gap:12px;align-items:center;}
    .header-meta{display:flex;align-items:center;gap:20px;}
    .header-date{font-size:13px;color:#8FA3B8;display:flex;align-items:center;gap:6px;}
    .header-lang{font-size:13px;color:#4A6080;display:flex;align-items:center;gap:6px;cursor:pointer;border-left:1px solid #E2E8F0;padding-left:16px;}
    .btn-solid{background:#1B7872;color:#fff;border:none;border-radius:8px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;}
    .btn-ghost{background:#fff;color:#2FA8A0;border:1.5px solid #2FA8A0;border-radius:8px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;}

    .top-row{display:grid;grid-template-columns:1fr 340px;gap:18px;margin-bottom:20px;}

    .analytics-card{background:#fff;border-radius:12px;padding:22px;box-shadow:0 4px 20px rgba(22,34,51,.08);}
    .card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
    .card-title{font-family:'Inter',sans-serif;font-size:15px;font-weight:700;color:#1A2B3C;}
    .period-badge{font-size:12px;color:#2FA8A0;background:#E8F7F6;padding:4px 12px;border-radius:999px;cursor:pointer;font-weight:600;}

    .analytics-label{font-size:13px;font-weight:600;color:#1A2B3C;margin-bottom:6px;}
    .analytics-total{display:flex;align-items:baseline;gap:10px;margin-bottom:4px;}
    .analytics-num{font-family:'Inter',sans-serif;font-size:38px;font-weight:800;color:#1A2B3C;}
    .analytics-sub{font-size:12px;color:#8FA3B8;}
    .analytics-trend{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:700;color:#22C55E;background:#DCFCE7;padding:3px 9px;border-radius:999px;margin-bottom:10px;}

    .insight-lbl{font-size:13px;font-weight:700;color:#1A2B3C;margin-bottom:10px;}
    .kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;}
    .kpi-item{background:#F8FAFC;border-radius:8px;padding:12px 14px;}
    .kpi-val{font-family:'Inter',sans-serif;font-size:18px;font-weight:700;color:#1A2B3C;}
    .kpi-lbl{font-size:10.5px;color:#8FA3B8;margin-top:2px;}
    .kpi-pct{display:inline-block;font-size:11px;font-weight:700;padding:2px 7px;border-radius:999px;margin-top:4px;}
    .pct-green{background:#DCFCE7;color:#15803D;}
    .pct-amber{background:#FEF3C7;color:#92400E;}
    .pct-blue {background:#DBEAFE;color:#1E40AF;}
    .pct-red  {background:#FFE4E6;color:#BE123C;}

    .emp-month-card{background:#fff;border-radius:12px;padding:22px;box-shadow:0 4px 20px rgba(22,34,51,.08);}
    .emp-month-label{font-size:11px;color:#8FA3B8;margin-bottom:10px;}
    .emp-month-item{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
    .emp-month-item:last-child{margin-bottom:0;}
    .emp-avatar-box{width:48px;height:48px;border-radius:8px;background:#E8F7F6;display:flex;align-items:center;justify-content:center;font-family:'Inter',sans-serif;font-weight:700;color:#2FA8A0;font-size:16px;flex-shrink:0;}
    .emp-name{font-family:'Inter',sans-serif;font-size:13.5px;font-weight:600;color:#1A2B3C;}
    .emp-role{font-size:11.5px;color:#8FA3B8;}
    .emp-att-pct{margin-left:auto;font-family:'Inter',sans-serif;font-size:13px;font-weight:700;color:#2FA8A0;}

    .table-card{background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);overflow:hidden;}
    .tabs-bar{display:flex;align-items:center;gap:2px;padding:16px 20px 0;border-bottom:1px solid #F0F3F6;}
    .tab{padding:10px 18px;font-size:13px;font-weight:500;color:#8FA3B8;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;transition:all .15s;margin-bottom:-1px;white-space:nowrap;}
    .tab.active{color:#2FA8A0;border-bottom-color:#2FA8A0;font-weight:600;}
    .tabs-right{margin-left:auto;font-size:12px;color:#8FA3B8;}
    table{width:100%;border-collapse:collapse;}
    thead tr{background:#FAFBFC;}
    thead th{padding:11px 16px;font-family:'Inter',sans-serif;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8FA3B8;border-bottom:1px solid #F0F3F6;white-space:nowrap;}
    tbody tr{cursor:pointer;transition:background .15s;}
    tbody tr:hover{background:#FAFBFC;}
    tbody td{padding:12px 16px;font-size:13px;color:#4A6080;border-bottom:1px solid #F5F7FA;vertical-align:middle;}
    tbody tr:last-child td{border-bottom:none;}
    .td-id{font-family:'Inter',sans-serif;font-weight:600;color:#1A2B3C;font-size:12.5px;}
    .td-name{font-weight:600;color:#1A2B3C;}
    .status-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:999px;font-size:11.5px;font-weight:700;}
    .chip-attend{background:#DCFCE7;color:#15803D;}
    .chip-absent{background:#FFE4E6;color:#BE123C;}
    .chip-dayoff{background:#FEF3C7;color:#B45309;}
    .chip-sick  {background:#FFE4E6;color:#BE123C;}
    .act-icon{font-size:15px;color:#B0BEC5;cursor:pointer;margin-right:8px;}
    .act-icon:hover{color:#4A6080;}
    .act-icon--del:hover{color:#EF4444;}

    /* ── Backdrop ── */
    .backdrop{position:fixed;inset:0;background:rgba(10,20,35,.35);z-index:1800;backdrop-filter:blur(1px);}

    /* ── Right panel ── */
    .rp{position:fixed;top:70px;right:0;bottom:0;width:560px;background:#fff;box-shadow:-8px 0 40px rgba(10,20,35,.14);border-radius:16px 0 0 0;z-index:1801;display:flex;flex-direction:column;animation:rpIn .22s ease both;overflow:hidden;}
    @keyframes rpIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
    .rp-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px 18px;border-bottom:1px solid #F0F3F6;flex-shrink:0;}
    .rp-title{font-size:16px;font-weight:700;color:#1A2B3C;}
    .rp-head-right{display:flex;align-items:center;gap:10px;}
    .rp-close{width:32px;height:32px;border:none;background:#F1F5F9;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;color:#4A6080;}
    .rp-close:hover{background:#E2E8F0;}
    .rp-body{flex:1;overflow-y:auto;padding:24px;}

    .edit-att-btn{display:flex;align-items:center;gap:7px;padding:9px 18px;background:#1B7872;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;}
    .edit-att-btn:hover{background:#1A9690;}

    /* ── Detail panel ── */
    .dp-emp-block{display:flex;gap:18px;margin-bottom:22px;padding-bottom:22px;border-bottom:1px solid #F0F3F6;}
    .dp-photo{width:90px;height:90px;border-radius:10px;background:#F1F5F9;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1.5px dashed #CBD5E0;font-size:11px;color:#8FA3B8;text-align:center;}
    .dp-emp-info-title{font-size:14px;font-weight:700;color:#1A2B3C;margin-bottom:12px;}
    .dp-field{display:flex;align-items:center;gap:10px;margin-bottom:9px;}
    .dp-field-lbl{display:flex;align-items:center;gap:6px;font-size:12.5px;color:#8FA3B8;min-width:100px;}
    .dp-field-lbl i{font-size:14px;}
    .dp-field-val{font-size:13px;font-weight:600;color:#1A2B3C;}

    .dp-section-title{font-size:14px;font-weight:700;color:#1A2B3C;margin-bottom:14px;}
    .dp-summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:22px;}
    .dp-summary-box{background:#F8FAFC;border-radius:10px;padding:14px 16px;text-align:center;}
    .dp-summary-icon{font-size:20px;color:#8FA3B8;margin-bottom:6px;}
    .dp-summary-lbl{font-size:11px;color:#8FA3B8;margin-bottom:4px;}
    .dp-summary-val{font-size:18px;font-weight:700;color:#1A2B3C;}

    .dp-hist-table{width:100%;border-collapse:collapse;}
    .dp-hist-table thead th{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#8FA3B8;padding:8px 10px;border-bottom:1px solid #F0F3F6;text-align:left;}
    .dp-hist-table tbody td{padding:10px 10px;font-size:12.5px;color:#4A6080;border-bottom:1px solid #F5F7FA;vertical-align:middle;}
    .dp-hist-table tbody tr:last-child td{border-bottom:none;}

    /* ── Create/Edit form ── */
    .cp-section-title{font-size:15px;font-weight:700;color:#1A2B3C;margin:0 0 14px;}
    .cp-field{margin-bottom:16px;}
    .cp-field-lbl{font-size:13px;font-weight:600;color:#1A2B3C;margin-bottom:6px;}
    .cp-input{width:100%;padding:10px 14px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:#1A2B3C;font-family:'Inter',sans-serif;box-sizing:border-box;outline:none;transition:border .15s;}
    .cp-input:focus{border-color:#2FA8A0;box-shadow:0 0 0 3px rgba(47,168,160,.1);}
    .cp-input::placeholder{color:#C0CDD8;}
    .cp-select{width:100%;padding:10px 14px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:#4A6080;font-family:'Inter',sans-serif;appearance:none;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238FA3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 14px center;box-sizing:border-box;outline:none;cursor:pointer;}
    .cp-select:focus{border-color:#2FA8A0;}
    .cp-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
    .cp-footer{padding:16px 24px;border-top:1px solid #F0F3F6;flex-shrink:0;display:flex;justify-content:flex-end;gap:10px;}
    .cp-cancel-btn{padding:10px 22px;background:#F1F5F9;color:#4A6080;border:none;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;}
    .cp-submit-btn{padding:10px 24px;background:#1B7872;color:#fff;border:none;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;}
    .cp-submit-btn:hover{background:#1A9690;}
  `],
  template: `
  <!-- Backdrop -->
  <div class="backdrop" *ngIf="showDetail || showCreate" (click)="closeAll()"></div>

  <!-- ══ Attendance Detail Panel ══ -->
  <div class="rp" *ngIf="showDetail && selected">
    <div class="rp-header">
      <span class="rp-title">Attendance Detail</span>
      <div class="rp-head-right">
        <button class="edit-att-btn" (click)="openEdit()">
          <i class="bx bx-edit-alt"></i> Edit Attendance
        </button>
        <button class="rp-close" (click)="closeAll()"><i class="bx bx-x"></i></button>
      </div>
    </div>
    <div class="rp-body">

      <!-- Employee info block -->
      <div class="dp-emp-block">
        <div class="dp-photo">Image here</div>
        <div style="flex:1;">
          <div class="dp-emp-info-title">Employee Information</div>
          <div class="dp-field">
            <span class="dp-field-lbl"><i class="bx bx-id-card"></i> Employee ID</span>
            <span class="dp-field-val">12345678901234</span>
          </div>
          <div class="dp-field">
            <span class="dp-field-lbl"><i class="bx bx-user"></i> Full Name</span>
            <span class="dp-field-val">{{ selected.name }}</span>
          </div>
          <div class="dp-field">
            <span class="dp-field-lbl"><i class="bx bx-briefcase"></i> Role</span>
            <span class="dp-field-val">Web Developer</span>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="dp-section-title">Attendance Summary</div>
      <div class="dp-summary-grid">
        <div class="dp-summary-box">
          <div class="dp-summary-icon"><i class="bx bx-refresh"></i></div>
          <div class="dp-summary-lbl">Total Attendance</div>
          <div class="dp-summary-val">289 Days</div>
        </div>
        <div class="dp-summary-box">
          <div class="dp-summary-icon"><i class="bx bx-log-in"></i></div>
          <div class="dp-summary-lbl">Avarage Check In</div>
          <div class="dp-summary-val">08:11</div>
        </div>
        <div class="dp-summary-box">
          <div class="dp-summary-icon"><i class="bx bx-log-out"></i></div>
          <div class="dp-summary-lbl">Avarage Check Out</div>
          <div class="dp-summary-val">17:30</div>
        </div>
      </div>

      <!-- History -->
      <div class="dp-section-title">Attendance History</div>
      <table class="dp-hist-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Total Hour</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let h of historyRows">
            <td>{{ h.date }}</td>
            <td>{{ h.checkIn }}</td>
            <td>{{ h.checkOut }}</td>
            <td>{{ h.total }}</td>
            <td>
              <i class="bx bx-pencil act-icon" (click)="openEdit()"></i>
              <i class="bx bx-trash act-icon act-icon--del"></i>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ══ Create / Edit Attendance Panel ══ -->
  <div class="rp" *ngIf="showCreate">
    <div class="rp-header">
      <span class="rp-title">{{ isEditMode ? 'Edit Attendance' : 'Create Attendance' }}</span>
      <div class="rp-head-right">
        <button class="rp-close" (click)="closeAll()"><i class="bx bx-x"></i></button>
      </div>
    </div>
    <div class="rp-body" style="padding-bottom:0;">

      <div class="cp-section-title">Attendance Information</div>

      <div class="cp-field">
        <div class="cp-field-lbl">Employee</div>
        <select class="cp-select" [(ngModel)]="form.employee">
          <option value="">Select employee</option>
          <option *ngFor="let r of rows" [value]="r.name">{{ r.name }}</option>
        </select>
      </div>

      <div class="cp-field">
        <div class="cp-field-lbl">Date</div>
        <input class="cp-input" type="date" [(ngModel)]="form.date" />
      </div>

      <div class="cp-row">
        <div class="cp-field">
          <div class="cp-field-lbl">Check In</div>
          <input class="cp-input" type="time" [(ngModel)]="form.checkIn" />
        </div>
        <div class="cp-field">
          <div class="cp-field-lbl">Check Out</div>
          <input class="cp-input" type="time" [(ngModel)]="form.checkOut" />
        </div>
      </div>

      <div class="cp-field">
        <div class="cp-field-lbl">Status</div>
        <select class="cp-select" [(ngModel)]="form.status">
          <option value="">Select status</option>
          <option value="Attendance">Attendance</option>
          <option value="Absence">Absence</option>
          <option value="Day Off">Day Off</option>
          <option value="Sick Leave">Sick Leave</option>
        </select>
      </div>

      <div class="cp-field">
        <div class="cp-field-lbl">Note</div>
        <input class="cp-input" type="text" placeholder="Optional note..." [(ngModel)]="form.note" />
      </div>

    </div>
    <div class="cp-footer">
      <button class="cp-cancel-btn" (click)="closeAll()">Cancel</button>
      <button class="cp-submit-btn" (click)="submitForm()">
        {{ isEditMode ? 'Save Changes' : 'Create Attendance' }}
      </button>
    </div>
  </div>

  <!-- ══════════ Page ══════════ -->
  <div class="page">
    <div class="page-header">
      <h4 class="page-title">Attendances</h4>
      <div class="header-right">
        <button class="btn-ghost" (click)="openCreateDayOff()"><i class="bx bx-calendar-check"></i> Create Day-Off</button>
        <button class="btn-solid" (click)="openCreateSickLeave()"><i class="bx bx-plus"></i> Create Sick-Leave</button>
        <div class="header-meta">
          <span class="header-date"><i class="bx bx-calendar-alt"></i> {{ today | date:'EEEE, MMMM d, y' }}</span>
          <span class="header-lang"><i class="bx bx-flag"></i> English <i class="bx bx-chevron-down"></i></span>
        </div>
      </div>
    </div>

    <div class="top-row">
      <!-- Analytics -->
      <div class="analytics-card">
        <div class="card-head">
          <span class="card-title">Attendance Analytics</span>
          <span class="period-badge">Today &#x2304;</span>
        </div>
        <div class="analytics-label">Total Employees</div>
        <div class="analytics-total">
          <span class="analytics-num">{{ totalEmployees }}</span>
        </div>
        <div class="analytics-sub" style="margin-bottom:14px;">Registered employees</div>
        <div class="insight-lbl">Insight</div>
        <div class="kpi-row">
          <div class="kpi-item">
            <div class="kpi-lbl">Total Employees</div>
            <div class="kpi-val">{{ totalEmployees }}</div>
          </div>
          <div class="kpi-item">
            <div class="kpi-lbl">Overtime Hours</div>
            <div class="kpi-val">—</div>
            <span class="kpi-pct pct-blue">N/A</span>
          </div>
          <div class="kpi-item">
            <div class="kpi-lbl">Absences</div>
            <div class="kpi-val">—</div>
            <span class="kpi-pct pct-amber">N/A</span>
          </div>
          <div class="kpi-item">
            <div class="kpi-lbl">Check-Ins Today</div>
            <div class="kpi-val">—</div>
            <span class="kpi-pct pct-red">N/A</span>
          </div>
        </div>
        <apx-chart [series]="chart.series" [chart]="chart.chart" [colors]="chart.colors"
          [stroke]="chart.stroke" [fill]="chart.fill" [xaxis]="chart.xaxis"
          [grid]="chart.grid" [dataLabels]="chart.dataLabels">
        </apx-chart>
      </div>

      <!-- Employee of Month -->
      <div class="emp-month-card">
        <div class="card-head">
          <span class="card-title">Employee of the Month</span>
          <span class="period-badge">{{ today | date:'MMMM' }} &#x2304;</span>
        </div>
        <div class="emp-month-label">Top performers this month</div>
        <div *ngFor="let e of topEmployees" class="emp-month-item">
          <div class="emp-avatar-box">{{ e.initials }}</div>
          <div>
            <div class="emp-name">{{ e.name }}</div>
            <div class="emp-role">{{ e.role }}</div>
          </div>
          <span class="emp-att-pct">{{ e.pct }}%</span>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div class="tabs-bar">
        <button *ngFor="let t of tabs" class="tab" [class.active]="activeTab===t" (click)="activeTab=t">{{ t }}</button>
        <span class="tabs-right"><i class="bx bx-refresh"></i> {{ totalEmployees }} employees</span>
      </div>

      <!-- Loading -->
      <div style="padding:48px 0;text-align:center;color:#8FA3B8;font-size:14px;" *ngIf="loading">
        <div style="width:32px;height:32px;border:3px solid #E2E8F0;border-top-color:#2FA8A0;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 10px;"></div>
        Loading employees…
      </div>

      <!-- Error -->
      <div style="padding:48px 0;text-align:center;color:#EF4444;font-size:14px;" *ngIf="!loading && error">
        <i class="bx bx-error-circle" style="font-size:36px;display:block;margin-bottom:10px;"></i>
        {{ error }}
      </div>

      <!-- Empty -->
      <div style="padding:48px 0;text-align:center;color:#8FA3B8;font-size:14px;" *ngIf="!loading && !error && filteredRows.length === 0">
        <i class="bx bx-user-x" style="font-size:36px;display:block;margin-bottom:10px;"></i>
        No records found.
      </div>

      <div style="overflow-x:auto" *ngIf="!loading && !error && filteredRows.length > 0">
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Employee Name</th>
              <th>Department</th>
              <th>Date</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of filteredRows" (click)="openDetail(r)">
              <td class="td-id">{{ r.id }}</td>
              <td class="td-name">{{ r.name }}</td>
              <td>{{ r.department }}</td>
              <td>{{ r.date }}</td>
              <td>{{ r.checkIn }}</td>
              <td>{{ r.checkOut }}</td>
              <td><span class="status-chip" [ngClass]="chipClass(r.status)">{{ r.status }}</span></td>
              <td (click)="$event.stopPropagation()">
                <i class="bx bx-pencil act-icon" (click)="openDetail(r); openEdit()"></i>
                <i class="bx bx-trash act-icon act-icon--del"></i>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class AttendanceComponent implements OnInit {
  today = new Date();
  tabs = ['All', 'Attendance', 'Absence', 'Day-Off', 'Sick-Leave'];
  activeTab = 'All';

  showDetail = false;
  showCreate = false;
  isEditMode = false;
  selected: any = null;

  form = this.emptyForm();

  // State
  loading = false;
  error: string | null = null;

  // Derived from real API
  totalEmployees = 0;
  topEmployees: { initials: string; name: string; role: string; pct: number }[] = [];
  historyRows: any[] = [];
  rows: any[] = [];

  chart: any = {};

  constructor(private collaborateurService: CollaborateurService) {}

  get filteredRows(): any[] {
    if (this.activeTab === 'All') return this.rows;
    return this.rows.filter(r => r.status === this.activeTab);
  }

  openDetail(row: any) {
    this.selected = row;
    this.showDetail = true;
    this.showCreate = false;
    this.isEditMode = false;
  }

  openCreate() {
    this.showCreate = true;
    this.showDetail = false;
    this.isEditMode = false;
    this.form = this.emptyForm();
  }

  openCreateDayOff() {
    this.showCreate = true;
    this.showDetail = false;
    this.isEditMode = false;
    this.form = { ...this.emptyForm(), status: 'Day-Off' };
  }

  openCreateSickLeave() {
    this.showCreate = true;
    this.showDetail = false;
    this.isEditMode = false;
    this.form = { ...this.emptyForm(), status: 'Sick Leave' };
  }

  openEdit() {
    this.isEditMode = true;
    this.showCreate = true;
    this.showDetail = false;
    if (this.selected) {
      this.form = {
        employee: this.selected.name,
        date: new Date().toISOString().substring(0, 10),
        checkIn: this.selected.checkIn ?? '',
        checkOut: this.selected.checkOut ?? '',
        status: this.selected.status,
        note: '',
      };
    }
  }

  closeAll() {
    this.showDetail = false;
    this.showCreate = false;
    this.selected = null;
    this.isEditMode = false;
  }

  submitForm() { this.closeAll(); }

  chipClass(s: string) {
    return {
      'chip-attend': s === 'Attendance',
      'chip-absent': s === 'Absence',
      'chip-dayoff': s === 'Day Off' || s === 'Day-Off',
      'chip-sick':   s === 'Sick Leave' || s === 'Sick-Leave',
    };
  }

  private emptyForm() {
    return { employee:'', date:'', checkIn:'', checkOut:'', status:'', note:'' };
  }

  ngOnInit(): void {
    this.loading = true;
    const todayStr = this.today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    this.collaborateurService.getAll().subscribe({
      next: data => {
        this.totalEmployees = data.length;

        // Top employees by seniority (ancienneté)
        const sorted = [...data].sort((a, b) => (b.Ancienneté ?? 0) - (a.Ancienneté ?? 0));
        this.topEmployees = sorted.slice(0, 3).map(e => ({
          initials: `${(e.prenom?.[0] ?? '').toUpperCase()}${(e.nom?.[0] ?? '').toUpperCase()}`,
          name:     `${e.prenom ?? ''} ${e.nom ?? ''}`.trim(),
          role:     e.Fonction ?? e.Département ?? '—',
          pct:      Math.min(100, 80 + (e.Ancienneté ?? 0) * 2),
        }));

        // Attendance rows: real employees, no check-in data yet (no attendance backend)
        this.rows = data.map(e => ({
          id:       String(e.matricule),
          name:     `${e.prenom ?? ''} ${e.nom ?? ''}`.trim(),
          date:     todayStr,
          checkIn:  '—',
          checkOut: '—',
          status:   'Attendance',
          department: e.Département ?? '—',
        }));

        // No history data without attendance backend
        this.historyRows = [];

        this.buildChart(data.length);
        this.loading = false;
      },
      error: err => {
        this.error = err?.error?.message || 'Failed to load employees.';
        this.loading = false;
      }
    });
  }

  private buildChart(total: number): void {
    // Show employee count as a single reference data point — no timeseries without backend
    const pts = Array.from({ length: 12 }, (_, i) => total);
    this.chart = {
      series: [{ name: 'Employees', data: pts }],
      chart: { type: 'area', height: 100, toolbar: { show: false }, sparkline: { enabled: true }, fontFamily: 'Inter,sans-serif' },
      colors: ['#F59E0B'],
      stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'gradient', gradient: { opacityFrom: .35, opacityTo: .02 } },
      xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
      grid: { show: false },
      dataLabels: { enabled: false },
    };
  }
}
