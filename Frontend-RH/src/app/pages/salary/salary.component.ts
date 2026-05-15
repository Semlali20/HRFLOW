import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CollaborateurService } from 'src/app/core/services/collaborateur.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WallClockComponent } from 'src/app/shared/wall-clock/wall-clock.component';

@Component({
  selector: 'app-salary',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule, TranslateModule, WallClockComponent],
  styles: [`
    .page { padding:0 24px 40px; font-family:'Inter',sans-serif; animation:fadeIn .4s ease both; }
    @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}

    /* ── Header ── */
    .page-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);margin-bottom:18px;}
    .page-title{font-size:22px;font-weight:700;color:#1A2B3C;margin:0;}
    .header-meta{display:flex;align-items:center;gap:20px;}
    .header-date{font-size:13px;color:#8FA3B8;display:flex;align-items:center;gap:6px;}
    .header-lang{font-size:13px;color:#4A6080;display:flex;align-items:center;gap:6px;cursor:pointer;border-left:1px solid #E2E8F0;padding-left:16px;}

    /* ── Top row ── */
    .top-row{display:grid;grid-template-columns:1fr 310px;gap:18px;margin-bottom:20px;align-items:stretch;}

    /* ── Overview card ── */
    .overview-card{background:#fff;border-radius:12px;padding:24px 26px;box-shadow:0 4px 20px rgba(22,34,51,.08);}
    .card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
    .card-title{font-size:15px;font-weight:700;color:#1A2B3C;}
    .filter-btn{display:flex;align-items:center;gap:5px;font-size:12.5px;color:#4A6080;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:5px 14px;cursor:pointer;}

    /* distribution section */
    .dist-section{display:grid;grid-template-columns:1fr auto;align-items:center;gap:0;margin-bottom:20px;}
    .dist-legends{}
    .dist-lbl-row{display:flex;align-items:center;gap:8px;margin-bottom:9px;}
    .dist-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
    .dist-lbl{font-size:13px;color:#4A6080;}
    .dist-chart{display:flex;align-items:center;justify-content:center;}

    /* Insight KPIs */
    .insight-lbl{font-size:13px;font-weight:700;color:#1A2B3C;margin-bottom:12px;}
    .kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
    .kpi-box{background:#F8FAFC;border-radius:9px;padding:14px 16px;}
    .kpi-box--highlight{background:#fff;border:1.5px dashed #3B82F6;}
    .kpi-lbl{font-size:11px;color:#8FA3B8;margin-bottom:6px;}
    .kpi-val{font-size:22px;font-weight:800;color:#1A2B3C;line-height:1;}
    .kpi-trend{display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;margin-top:6px;}
    .trend-up{background:#DCFCE7;color:#15803D;}
    .trend-dn{background:#FFE4E6;color:#BE123C;}

    /* ── Payroll date card ── */
    .payroll-card{background:#fff;border-radius:12px;padding:22px 24px;box-shadow:0 4px 20px rgba(22,34,51,.08);display:flex;flex-direction:column;align-items:center;text-align:center;}
    .payroll-illustration{width:100%;flex:1;min-height:160px;border-radius:12px;background:linear-gradient(145deg,#EFF6FF 0%,#E8F7F6 60%,#F0FDF4 100%);display:flex;align-items:center;justify-content:center;margin-bottom:20px;overflow:hidden;}
    .payroll-lbl{font-size:12px;color:#8FA3B8;margin-bottom:8px;letter-spacing:.02em;}
    .payroll-date{font-size:22px;font-weight:800;color:#1A2B3C;margin-bottom:18px;letter-spacing:-.02em;}
    .payroll-btn{width:100%;padding:13px;background:#1B7872;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;letter-spacing:.01em;}
    .payroll-btn:hover{background:#1A9690;}

    /* ── Table ── */
    .table-card{background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);overflow:hidden;}
    .tabs-bar{display:flex;align-items:center;gap:2px;padding:14px 20px 0;border-bottom:1px solid #F0F3F6;}
    .tab{padding:10px 18px;font-size:13px;font-weight:500;color:#8FA3B8;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;transition:all .15s;margin-bottom:-1px;}
    .tab.active{color:#2FA8A0;border-bottom-color:#2FA8A0;font-weight:600;}
    .tabs-right{margin-left:auto;font-size:12px;color:#8FA3B8;display:flex;align-items:center;gap:5px;}
    table{width:100%;border-collapse:collapse;}
    thead tr{background:#FAFBFC;}
    thead th{padding:11px 16px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8FA3B8;border-bottom:1px solid #F0F3F6;white-space:nowrap;}
    tbody tr{cursor:pointer;transition:background .15s;}
    tbody tr:hover{background:#FAFBFC;}
    tbody td{padding:11px 16px;font-size:13px;color:#4A6080;border-bottom:1px solid #F5F7FA;vertical-align:middle;}
    tbody tr:last-child td{border-bottom:none;}
    .td-id{font-weight:600;color:#4A6080;font-size:12px;}
    .td-name{font-weight:600;color:#1A2B3C;}
    .td-amt{font-weight:600;color:#1A2B3C;}
    .status-chip{display:inline-flex;padding:4px 12px;border-radius:999px;font-size:11.5px;font-weight:700;}
    .chip-unpaid{background:#FFE4E6;color:#BE123C;}
    .chip-paid  {background:#DCFCE7;color:#15803D;}
    .eye-btn{background:none;border:none;color:#B0BEC5;font-size:16px;cursor:pointer;padding:0;}
    .eye-btn:hover{color:#4A6080;}

    /* ── Backdrop & panel ── */
    .backdrop{position:fixed;inset:0;background:rgba(10,20,35,.35);z-index:1800;backdrop-filter:blur(1px);}
    .rp{position:fixed;top:70px;right:0;bottom:0;width:500px;background:#fff;box-shadow:-8px 0 40px rgba(10,20,35,.14);border-radius:16px 0 0 0;z-index:1801;display:flex;flex-direction:column;animation:rpIn .22s ease both;overflow:hidden;}
    @keyframes rpIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
    .rp-header{display:flex;align-items:center;justify-content:space-between;padding:18px 22px 16px;border-bottom:1px solid #F0F3F6;flex-shrink:0;}
    .rp-title{font-size:15px;font-weight:700;color:#1A2B3C;}
    .rp-close{width:30px;height:30px;border:none;background:transparent;border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:20px;color:#4A6080;}
    .rp-close:hover{background:#F1F5F9;}
    .edit-btn{display:flex;align-items:center;gap:7px;padding:9px 18px;background:#1B7872;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;}
    .edit-btn:hover{background:#1A9690;}
    .rp-body{flex:1;overflow-y:auto;padding:22px;}

    /* employee banner */
    .dp-emp-banner{display:flex;gap:18px;margin-bottom:20px;}
    .dp-photo{width:90px;height:90px;border-radius:10px;background:repeating-conic-gradient(#E2E8F0 0% 25%,#F8FAFC 0% 50%) 0 0/14px 14px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;color:#8FA3B8;font-weight:500;border:1px solid #E2E8F0;}
    .dp-section{font-size:14px;font-weight:700;color:#1A2B3C;margin-bottom:10px;}
    .dp-field{display:grid;grid-template-columns:150px 1fr;align-items:flex-start;gap:8px;padding:9px 0;border-bottom:1px solid #F5F7FA;}
    .dp-field:last-of-type{border-bottom:none;}
    .dp-lbl{display:flex;align-items:center;gap:7px;font-size:12px;color:#8FA3B8;padding-top:1px;}
    .dp-lbl i{font-size:14px;flex-shrink:0;}
    .dp-val{font-size:13px;font-weight:600;color:#1A2B3C;line-height:1.5;}
    .dp-val--highlight{border:1.5px dashed #3B82F6;border-radius:6px;padding:4px 8px;font-size:13px;font-weight:600;color:#1A2B3C;}
    .dp-divider{border:none;border-top:1px solid #F0F3F6;margin:16px 0;}

    /* deduction chips */
    .chips-wrap{display:flex;flex-wrap:wrap;gap:6px;margin-top:2px;}
    .d-chip{padding:4px 10px;background:#F1F5F9;color:#4A6080;border-radius:6px;font-size:11.5px;font-weight:500;}

    /* pay frequency chip */
    .freq-chip{padding:4px 12px;background:#F1F5F9;color:#4A6080;border-radius:6px;font-size:12px;font-weight:500;}

    /* payroll history table */
    .ph-table{width:100%;border-collapse:collapse;margin-top:10px;}
    .ph-table th{padding:8px 10px;font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#8FA3B8;border-bottom:1px solid #F0F3F6;text-align:left;}
    .ph-table td{padding:10px 10px;font-size:12px;color:#4A6080;border-bottom:1px solid #F8FAFC;vertical-align:middle;}
    .ph-table tr:last-child td{border-bottom:none;}
    .ph-date{font-weight:600;color:#1A2B3C;white-space:nowrap;}
    .ph-amt{font-weight:600;color:#1A2B3C;}
    .ph-status{display:inline-flex;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;}
    .ph-paid  {background:#DCFCE7;color:#15803D;}
    .ph-unpaid{background:#FFE4E6;color:#BE123C;}
  `],
  template: `
  <div class="backdrop" *ngIf="showDetail" (click)="closeAll()"></div>

  <!-- ══ Salary Detail Panel ══ -->
  <div class="rp" *ngIf="showDetail && selected">
    <div class="rp-header">
      <span class="rp-title">{{ 'SALARY.DETAIL_TITLE' | translate }}</span>
      <button class="rp-close" (click)="closeAll()"><i class="bx bx-x"></i></button>
    </div>
    <div class="rp-body">

      <!-- Employee Information -->
      <div class="dp-emp-banner">
        <div class="dp-photo">{{ 'SALARY.IMAGE_PLACEHOLDER' | translate }}</div>
        <div style="flex:1;">
          <div class="dp-section">{{ 'SALARY.SECTION_EMPLOYEE_INFO' | translate }}</div>
          <div class="dp-field">
            <span class="dp-lbl"><i class="bx bx-id-card"></i> {{ 'SALARY.EMPLOYEE_ID' | translate }}</span>
            <span class="dp-val">{{ selected.empId }}</span>
          </div>
          <div class="dp-field">
            <span class="dp-lbl"><i class="bx bx-font"></i> {{ 'SALARY.FULL_NAME' | translate }}</span>
            <span class="dp-val">{{ selected.name }}</span>
          </div>
          <div class="dp-field" style="border-bottom:none;">
            <span class="dp-lbl"><i class="bx bx-user-circle"></i> {{ 'SALARY.ROLE' | translate }}</span>
            <span class="dp-val">{{ selected.role }}</span>
          </div>
        </div>
      </div>

      <hr class="dp-divider">

      <!-- Salary Information -->
      <div class="dp-section">{{ 'SALARY.SECTION_SALARY_INFO' | translate }}</div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-dollar-circle"></i> {{ 'SALARY.HOURLY_RATE' | translate }}</span>
        <span class="dp-val">{{ selected.hourlyRate }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-dollar-circle"></i> {{ 'SALARY.ANNUAL_SALARY' | translate }}</span>
        <span class="dp-val">{{ selected.annualSalary }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-dollar-circle"></i> {{ 'SALARY.OVERTIME_RATE' | translate }}</span>
        <span class="dp-val">{{ selected.overtimeRate }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-dollar-circle"></i> {{ 'SALARY.BONUSES' | translate }}</span>
        <span class="dp-val--highlight">{{ selected.bonuses }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-minus-circle"></i> {{ 'SALARY.DEDUCTIONS_AMOUNT' | translate }}</span>
        <span class="dp-val">{{ selected.deductionsAmount }}</span>
      </div>
      <div class="dp-field" style="align-items:flex-start;">
        <span class="dp-lbl" style="padding-top:6px;"><i class="bx bx-minus-circle"></i> {{ 'SALARY.DEDUCTIONS_INCLUDED' | translate }}</span>
        <div class="chips-wrap">
          <span class="d-chip" *ngFor="let d of selected.deductionTypes">{{ d }}</span>
        </div>
      </div>
      <div class="dp-field" style="border-bottom:none;">
        <span class="dp-lbl"><i class="bx bx-calendar"></i> {{ 'SALARY.PAY_FREQUENCY' | translate }}</span>
        <span class="freq-chip">{{ selected.payFrequency }}</span>
      </div>

      <hr class="dp-divider">

      <!-- Payroll History -->
      <div class="dp-section">{{ 'SALARY.SECTION_PAYROLL_HISTORY' | translate }}</div>
      <table class="ph-table">
        <thead>
          <tr>
            <th>{{ 'SALARY.DATE' | translate }}</th>
            <th>{{ 'SALARY.PAID_HOURS' | translate }}</th>
            <th>{{ 'SALARY.GROSS_PAY' | translate }}</th>
            <th>{{ 'SALARY.DEDUCTIONS' | translate }}</th>
            <th>{{ 'SALARY.NET_PAY' | translate }}</th>
            <th>{{ 'SALARY.STATUS' | translate }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let h of selected.history">
            <td class="ph-date">{{ h.date }}</td>
            <td>{{ h.hours }}</td>
            <td class="ph-amt">{{ h.gross }}</td>
            <td class="ph-amt">{{ h.deductions }}</td>
            <td class="ph-amt">{{ h.net }}</td>
            <td><span class="ph-status" [ngClass]="h.status === 'Paid' ? 'ph-paid' : 'ph-unpaid'">{{ h.status }}</span></td>
          </tr>
        </tbody>
      </table>

    </div>
  </div>

  <!-- ══════════ Page ══════════ -->
  <div class="page">
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
      <div class="page-header" style="flex:1;margin-bottom:0;">
        <h4 class="page-title">{{ 'SALARY.TITLE' | translate }}</h4>
      </div>
      <app-wall-clock></app-wall-clock>
    </div>

    <div class="top-row">

      <!-- Salary Overview -->
      <div class="overview-card">
        <div class="card-head">
          <span class="card-title">{{ 'SALARY.SECTION_OVERVIEW' | translate }}</span>
          <button class="filter-btn">{{ 'SALARY.TODAY' | translate }} <i class="bx bx-chevron-down"></i></button>
        </div>

        <!-- Employee Contract Distribution (from real data) -->
        <div style="font-size:13px;font-weight:600;color:#1A2B3C;margin-bottom:14px;">{{ 'SALARY.CONTRACT_DISTRIBUTION' | translate }}</div>
        <div class="dist-section">
          <div class="dist-legends">
            <div class="dist-lbl-row"><span class="dist-dot" style="background:#3B82F6;"></span><span class="dist-lbl">CDI ({{ totalCount > 0 ? (cdiCount / totalCount * 100 | number:'1.0-0') : 0 }}%)</span></div>
            <div class="dist-lbl-row"><span class="dist-dot" style="background:#F87171;"></span><span class="dist-lbl">CDD ({{ totalCount > 0 ? (cddCount / totalCount * 100 | number:'1.0-0') : 0 }}%)</span></div>
            <div class="dist-lbl-row"><span class="dist-dot" style="background:#FBBF24;"></span><span class="dist-lbl">Stage ({{ totalCount > 0 ? (stageCount / totalCount * 100 | number:'1.0-0') : 0 }}%)</span></div>
            <div class="dist-lbl-row" style="margin-bottom:0;"><span class="dist-dot" style="background:#22C55E;"></span><span class="dist-lbl">Intérim ({{ totalCount > 0 ? (interimCount / totalCount * 100 | number:'1.0-0') : 0 }}%)</span></div>
          </div>
          <div class="dist-chart">
            <apx-chart [series]="donut.series" [chart]="donut.chart" [colors]="donut.colors"
              [labels]="donut.labels" [dataLabels]="donut.dataLabels" [legend]="donut.legend"
              [stroke]="donut.stroke" [plotOptions]="donut.plotOptions"></apx-chart>
          </div>
        </div>

        <!-- Insight KPIs (derived from real employee counts) -->
        <div class="insight-lbl">{{ 'SALARY.INSIGHT' | translate }}</div>
        <div class="kpi-row">
          <div class="kpi-box kpi-box--highlight">
            <div class="kpi-lbl">{{ 'SALARY.TOTAL_EMPLOYEES' | translate }}</div>
            <div class="kpi-val">{{ totalCount }}</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-lbl">CDI</div>
            <div class="kpi-val">{{ cdiCount }}</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-lbl">CDD</div>
            <div class="kpi-val">{{ cddCount }}</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-lbl">Stage / Intérim</div>
            <div class="kpi-val">{{ stageCount + interimCount }}</div>
          </div>
        </div>
      </div>

      <!-- Payroll Date -->
      <div class="payroll-card">
        <div class="payroll-illustration">
          <svg width="200" height="155" viewBox="0 0 200 155" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- desk -->
            <rect x="20" y="108" width="160" height="8" rx="4" fill="#CBD5E0"/>
            <!-- monitor/screen -->
            <rect x="54" y="60" width="80" height="52" rx="6" fill="#1E293B"/>
            <rect x="58" y="64" width="72" height="42" rx="4" fill="#E8F7F6"/>
            <!-- screen content lines -->
            <rect x="64" y="70" width="40" height="4" rx="2" fill="#2FA8A0" opacity=".6"/>
            <rect x="64" y="78" width="55" height="3" rx="1.5" fill="#94A3B8"/>
            <rect x="64" y="84" width="45" height="3" rx="1.5" fill="#94A3B8"/>
            <rect x="64" y="90" width="50" height="3" rx="1.5" fill="#94A3B8"/>
            <!-- checkmark badge on screen -->
            <circle cx="118" cy="70" r="9" fill="#22C55E"/>
            <polyline points="113,70 116,73 123,66" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- monitor stand -->
            <rect x="88" y="112" width="12" height="8" rx="2" fill="#94A3B8"/>
            <rect x="80" y="118" width="28" height="4" rx="2" fill="#94A3B8"/>
            <!-- plant pot -->
            <rect x="148" y="96" width="18" height="14" rx="3" fill="#FBBF24"/>
            <ellipse cx="157" cy="96" rx="9" ry="4" fill="#22C55E" opacity=".8"/>
            <rect x="155" y="78" width="3" height="20" rx="1.5" fill="#22C55E"/>
            <ellipse cx="163" cy="84" rx="7" ry="5" fill="#4ADE80" opacity=".7"/>
            <ellipse cx="149" cy="87" rx="6" ry="4" fill="#4ADE80" opacity=".7"/>
            <!-- person body -->
            <circle cx="38" cy="72" r="11" fill="#FBBF24"/>
            <rect x="27" y="85" width="22" height="28" rx="6" fill="#3B82F6"/>
            <!-- arms -->
            <rect x="19" y="88" width="10" height="18" rx="5" fill="#3B82F6"/>
            <rect x="49" y="88" width="10" height="18" rx="5" fill="#3B82F6"/>
            <!-- hand pointing at screen -->
            <ellipse cx="29" cy="106" rx="5" ry="4" fill="#FBBF24"/>
            <!-- star badge -->
            <circle cx="38" cy="56" r="8" fill="#FBBF24" opacity=".9"/>
            <text x="38" y="60" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">★</text>
          </svg>
        </div>
        <div class="payroll-lbl">{{ 'SALARY.NEXT_PAYROLL' | translate }}</div>
        <div class="payroll-date">—</div>
        <button class="payroll-btn">{{ 'SALARY.PAYROLL_DETAIL' | translate }}</button>
      </div>

    </div>

    <!-- Table -->
    <div class="table-card">
      <div class="tabs-bar">
        <button *ngFor="let t of tabs" class="tab" [class.active]="activeTab===t" (click)="activeTab=t">{{ t | translate }}</button>
        <span class="tabs-right"><i class="bx bx-refresh"></i> {{ rows.length }} {{ 'SALARY.EMPLOYEES_COUNT' | translate }}</span>
      </div>

      <!-- Loading -->
      <div style="padding:48px 0;text-align:center;color:#8FA3B8;font-size:14px;" *ngIf="loading">
        <div style="width:32px;height:32px;border:3px solid #E2E8F0;border-top-color:#2FA8A0;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 10px;"></div>
        {{ 'SALARY.LOADING_EMPLOYEES' | translate }}
      </div>

      <!-- Error -->
      <div style="padding:48px 0;text-align:center;color:#EF4444;font-size:14px;" *ngIf="!loading && error">
        <i class="bx bx-error-circle" style="font-size:36px;display:block;margin-bottom:10px;"></i>
        {{ error }}
      </div>

      <!-- Empty -->
      <div style="padding:48px 0;text-align:center;color:#8FA3B8;font-size:14px;" *ngIf="!loading && !error && rows.length === 0">
        <i class="bx bx-user-x" style="font-size:36px;display:block;margin-bottom:10px;"></i>
        {{ 'SALARY.NO_EMPLOYEES' | translate }}
      </div>

      <div style="overflow-x:auto" *ngIf="!loading && !error && rows.length > 0">
        <table>
          <thead>
            <tr>
              <th>{{ 'SALARY.EMPLOYEE_ID' | translate }}</th>
              <th>{{ 'SALARY.EMPLOYEE_NAME' | translate }}</th>
              <th>{{ 'SALARY.DEPARTMENT' | translate }}</th>
              <th>{{ 'SALARY.CONTRACT' | translate }}</th>
              <th>{{ 'SALARY.GROSS_PAY' | translate }}</th>
              <th>{{ 'SALARY.DEDUCTIONS' | translate }}</th>
              <th>{{ 'SALARY.NET_PAY' | translate }}</th>
              <th>{{ 'SALARY.STATUS' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of rows" (click)="openDetail(r)">
              <td class="td-id">{{ r.id }}</td>
              <td class="td-name">{{ r.name }}</td>
              <td>{{ r.department }}</td>
              <td>{{ r.contractType }}</td>
              <td class="td-amt">{{ r.gross }}</td>
              <td class="td-amt">{{ r.deductions }}</td>
              <td class="td-amt">{{ r.net }}</td>
              <td><span class="status-chip chip-unpaid">{{ 'SALARY.PENDING' | translate }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class SalaryComponent implements OnInit {
  today = new Date();
  tabs = ['SALARY.TAB_EMPLOYEE_SALARY', 'SALARY.TAB_BONUSES', 'SALARY.TAB_SETTLEMENT'];
  activeTab = 'SALARY.TAB_EMPLOYEE_SALARY';

  showDetail = false;
  selected: any = null;

  // State
  loading = false;
  error: string | null = null;

  // Loaded from API
  rows: any[] = [];

  // Computed from real data
  totalCount = 0;
  cdiCount = 0;
  cddCount = 0;
  stageCount = 0;
  interimCount = 0;

  donut: any = {};

  constructor(private collaborateurService: CollaborateurService, private translate: TranslateService) {}

  openDetail(r: any) { this.selected = r; this.showDetail = true; }
  closeAll() { this.showDetail = false; this.selected = null; }

  ngOnInit(): void {
    this.loading = true;
    this.error = null;
    this.collaborateurService.getAll().subscribe({
      next: data => {
        this.totalCount = data.length;
        this.cdiCount    = data.filter(e => (e.Type ?? '').toUpperCase() === 'CDI').length;
        this.cddCount    = data.filter(e => (e.Type ?? '').toUpperCase() === 'CDD').length;
        this.stageCount  = data.filter(e => (e.Type ?? '').toUpperCase() === 'STAGE').length;
        this.interimCount = this.totalCount - this.cdiCount - this.cddCount - this.stageCount;

        // Map real employees to salary rows (no payroll backend — financial fields are empty)
        this.rows = data.map(e => ({
          id:           String(e.matricule),
          empId:        String(e.matricule),
          name:         `${e.prenom ?? ''} ${e.nom ?? ''}`.trim(),
          role:         e.Fonction ?? e.Département ?? '—',
          department:   e.Département ?? '—',
          contractType: e.Type ?? '—',
          hours:        '—',
          gross:        '—',
          deductions:   '—',
          net:          '—',
          status:       'Pending',
          // Detail fields — no payroll data yet
          hourlyRate:       '—',
          annualSalary:     '—',
          overtimeRate:     '—',
          bonuses:          '—',
          deductionsAmount: '—',
          deductionTypes:   [],
          payFrequency:     'Monthly',
          history:          [],
        }));

        this.buildDonut();
        this.loading = false;
      },
      error: err => {
        this.error = err?.error?.message || this.translate.instant('SALARY.NO_EMPLOYEES');
        this.loading = false;
      }
    });
  }

  private buildDonut(): void {
    // Show contract type distribution using real employee data
    const other = Math.max(0, this.totalCount - this.cdiCount - this.cddCount - this.stageCount - this.interimCount);
    const seriesRaw = [this.cdiCount, this.cddCount, this.stageCount, this.interimCount].filter(v => v > 0);
    const labelsRaw = (['CDI', 'CDD', 'Stage', 'Intérim'] as const)
      .map((l, i) => [l, [this.cdiCount, this.cddCount, this.stageCount, this.interimCount][i]] as [string, number])
      .filter(([, v]) => v > 0)
      .map(([l]) => l);

    const series = seriesRaw.length > 0 ? seriesRaw : [1];
    const labels = labelsRaw.length > 0 ? labelsRaw : ['No data'];

    this.donut = {
      series,
      chart: { type: 'donut', height: 200, width: 240, fontFamily: 'Inter,sans-serif', sparkline: { enabled: true } },
      colors: ['#3B82F6', '#F87171', '#FBBF24', '#22C55E'],
      labels,
      dataLabels: { enabled: false },
      legend: { show: false },
      stroke: { width: 2, colors: ['#fff'] },
      plotOptions: {
        pie: {
          startAngle: -90, endAngle: 90, offsetY: 15,
          donut: { size: '60%', labels: { show: false } }
        }
      },
    };
  }
}
