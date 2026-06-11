import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { forkJoin } from 'rxjs';
import { CollaborateurService } from 'src/app/core/services/collaborateur.service';
import { SalaryService } from './salary.service';
import { ReportService } from 'src/app/core/services/report.service';
import { downloadBlob, todayDateString } from 'src/app/core/utils/download.util';
import { ReferenceDataService } from 'src/app/core/services/reference-data.service';
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
    .filter-btn{display:flex;align-items:center;gap:5px;font-size:12.5px;color:#4A6080;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:5px 12px;cursor:pointer;white-space:nowrap;}
    .filter-btn:hover{background:#F0F3F6;}
    .period-nav{display:flex;align-items:center;gap:6px;position:relative;}
    .period-nav-lbl{font-size:12px;color:#1A2B3C;font-weight:600;white-space:nowrap;min-width:90px;text-align:center;}
    .period-arrow{width:26px;height:26px;border-radius:6px;border:1px solid #E2E8F0;background:#F8FAFC;color:#4A6080;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;transition:all .15s;flex-shrink:0;}
    .period-arrow:hover:not([disabled]){background:#E2E8F0;color:#1A2B3C;}
    .period-arrow[disabled]{opacity:.35;cursor:default;}
    .period-dd-wrap{position:relative;}
    .period-dd{position:absolute;top:calc(100% + 6px);right:0;background:#fff;border:1px solid #E2E8F0;border-radius:10px;box-shadow:0 8px 24px rgba(22,34,51,.12);z-index:200;min-width:130px;overflow:hidden;}
    .period-dd button{display:block;width:100%;text-align:left;padding:9px 16px;font-size:13px;color:#4A6080;background:none;border:none;cursor:pointer;transition:background .12s;}
    .period-dd button:hover{background:#F8FAFC;color:#1A2B3C;}
    .period-dd button.active{color:#1B7872;font-weight:700;background:#F0FDF9;}

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
    .payroll-btn:hover:not([disabled]){background:#1A9690;}
    .payroll-btn[disabled]{background:#CBD5E0;color:#fff;cursor:not-allowed;opacity:.7;}

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
    .chip-unpaid    {background:#FFE4E6;color:#BE123C;}
    .chip-paid      {background:#DCFCE7;color:#15803D;}
    .chip-validated {background:#FEF3C7;color:#B45309;}
    .eye-btn{background:#F1F5F9;border:none;color:#4A6080;font-size:15px;cursor:pointer;padding:0;width:32px;height:32px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;transition:all .15s;}
    .eye-btn:hover{background:#1B7872;color:#fff;}

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
    .dp-emp-banner{display:flex;gap:18px;margin-bottom:20px;align-items:center;}
    .dp-avatar{width:60px;height:60px;border-radius:14px;background:linear-gradient(135deg,#1B7872,#2FA8A0);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#fff;}
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

      <!-- Employee Banner -->
      <div class="dp-emp-banner">
        <div class="dp-avatar">{{ getInitials(selected.name) }}</div>
        <div style="flex:1;">
          <div style="font-size:17px;font-weight:700;color:#1A2B3C;margin-bottom:2px;">{{ selected.name }}</div>
          <div style="font-size:13px;color:#8FA3B8;margin-bottom:6px;">{{ selected.role }}</div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:12px;color:#4A6080;background:#F1F5F9;border-radius:6px;padding:3px 10px;">ID: {{ selected.empId }}</span>
            <span style="font-size:12px;color:#4A6080;background:#F1F5F9;border-radius:6px;padding:3px 10px;">{{ selected.department }}</span>
          </div>
        </div>
      </div>

      <hr class="dp-divider">

      <!-- Salary Information -->
      <div class="dp-section">{{ 'SALARY.SECTION_SALARY_INFO' | translate }}</div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-briefcase"></i> {{ 'SALARY.CONTRACT_TYPE' | translate }}</span>
        <span class="dp-val">{{ selected.contractType || '—' }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-dollar-circle"></i> {{ 'SALARY.HOURLY_RATE' | translate }}</span>
        <span class="dp-val">{{ selected.hourlyRate }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-trending-up"></i> {{ 'SALARY.ANNUAL_SALARY' | translate }}</span>
        <span class="dp-val">{{ selected.annualSalary }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-time-five"></i> {{ 'SALARY.OVERTIME_RATE' | translate }}</span>
        <span class="dp-val">{{ selected.overtimeRate }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-gift"></i> {{ 'SALARY.BONUSES' | translate }}</span>
        <span class="dp-val">{{ selected.bonuses }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-minus-circle"></i> {{ 'SALARY.DEDUCTIONS_AMOUNT' | translate }}</span>
        <span class="dp-val">{{ selected.deductionsAmount }}</span>
      </div>
      <div class="dp-field" style="align-items:flex-start;" *ngIf="selected.deductionTypes?.length > 0">
        <span class="dp-lbl" style="padding-top:6px;"><i class="bx bx-list-ul"></i> {{ 'SALARY.DEDUCTIONS_INCLUDED' | translate }}</span>
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

      <!-- Empty history state -->
      <div *ngIf="!selected.history || selected.history.length === 0"
           style="padding:32px 0;text-align:center;color:#8FA3B8;">
        <i class="bx bx-receipt" style="font-size:32px;display:block;margin-bottom:8px;"></i>
        <div style="font-size:13px;">{{ 'SALARY.NO_HISTORY' | translate }}</div>
      </div>

      <table class="ph-table" *ngIf="selected.history && selected.history.length > 0">
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
      <div class="overview-card" (click)="showPeriodDropdown=false">
        <div class="card-head">
          <span class="card-title">{{ 'SALARY.SECTION_OVERVIEW' | translate }}</span>
          <div class="period-nav" (click)="$event.stopPropagation()">
            <button class="period-arrow" (click)="overviewOffset=overviewOffset-1" title="Previous">
              <i class="bx bx-chevron-left"></i>
            </button>
            <span class="period-nav-lbl">{{ periodNavLabel }}</span>
            <button class="period-arrow" (click)="overviewOffset=overviewOffset+1" [disabled]="overviewOffset>=0" title="Next">
              <i class="bx bx-chevron-right"></i>
            </button>
            <div class="period-dd-wrap">
              <button class="filter-btn" (click)="showPeriodDropdown=!showPeriodDropdown">
                {{ periodTypeLabel | translate }} <i class="bx bx-chevron-down"></i>
              </button>
              <div class="period-dd" *ngIf="showPeriodDropdown">
                <button [class.active]="overviewPeriod==='today'"  (click)="setPeriodType('today')">{{ 'SALARY.PERIOD_TODAY' | translate }}</button>
                <button [class.active]="overviewPeriod==='week'"   (click)="setPeriodType('week')">{{ 'SALARY.PERIOD_WEEK' | translate }}</button>
                <button [class.active]="overviewPeriod==='month'"  (click)="setPeriodType('month')">{{ 'SALARY.PERIOD_MONTH' | translate }}</button>
                <button [class.active]="overviewPeriod==='year'"   (click)="setPeriodType('year')">{{ 'SALARY.PERIOD_YEAR' | translate }}</button>
              </div>
            </div>
          </div>
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
            <apx-chart *ngIf="donut.chart" [series]="donut.series" [chart]="donut.chart" [colors]="donut.colors"
              [labels]="donut.labels" [dataLabels]="donut.dataLabels" [legend]="donut.legend"
              [stroke]="donut.stroke" [plotOptions]="donut.plotOptions"></apx-chart>
          </div>
        </div>

        <!-- Insight KPIs (derived from real employee counts) -->
        <div class="insight-lbl">{{ 'SALARY.INSIGHT' | translate }}</div>
        <div class="kpi-row">
          <div class="kpi-box">
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
        <button class="payroll-btn" [disabled]="rows.length === 0" (click)="openDetail(rows[0])">{{ 'SALARY.PAYROLL_DETAIL' | translate }}</button>
      </div>

    </div>

    <!-- Table -->
    <div class="table-card">
      <div class="tabs-bar">
        <button *ngFor="let t of tabs" class="tab" [class.active]="activeTab===t" (click)="activeTab=t">{{ t | translate }}</button>
        <span class="tabs-right">
          <i class="bx bx-refresh"></i> {{ rows.length }} {{ 'SALARY.EMPLOYEES_COUNT' | translate }}
          &nbsp;
          <button (click)="exportExcel()" [disabled]="exportingExcel"
                  style="display:inline-flex;align-items:center;gap:5px;font-size:12px;color:#4A6080;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:7px;padding:5px 11px;cursor:pointer;margin-left:8px;"
                  title="Export payroll as Excel">
            <span *ngIf="exportingExcel" style="display:inline-block;width:10px;height:10px;border:2px solid #E2E8F0;border-top-color:#1B7872;border-radius:50%;animation:spin .7s linear infinite;"></span>
            <i *ngIf="!exportingExcel" class="bx bx-file-blank"></i> Excel
          </button>
          <button (click)="exportPdf()" [disabled]="exportingPdf"
                  style="display:inline-flex;align-items:center;gap:5px;font-size:12px;color:#4A6080;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:7px;padding:5px 11px;cursor:pointer;margin-left:6px;"
                  title="Export payroll as PDF">
            <span *ngIf="exportingPdf" style="display:inline-block;width:10px;height:10px;border:2px solid #E2E8F0;border-top-color:#BE123C;border-radius:50%;animation:spin .7s linear infinite;"></span>
            <i *ngIf="!exportingPdf" class="bx bx-file-pdf"></i> PDF
          </button>
        </span>
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of rows" (click)="openDetail(r)" style="cursor:pointer;">
              <td class="td-id">{{ r.id }}</td>
              <td class="td-name">{{ r.name }}</td>
              <td>{{ r.department }}</td>
              <td>{{ r.contractType }}</td>
              <td class="td-amt">{{ r.gross }}</td>
              <td class="td-amt">{{ r.deductions }}</td>
              <td class="td-amt">{{ r.net }}</td>
              <td><span class="status-chip" [ngClass]="r.statusClass">{{ r.statusLabel }}</span></td>
              <td (click)="$event.stopPropagation(); openDetail(r)">
                <button class="eye-btn" title="View details"><i class="bx bx-show"></i></button>
              </td>
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

  // ── Period navigator ──
  overviewPeriod: 'today' | 'week' | 'month' | 'year' = 'today';
  overviewOffset = 0;
  showPeriodDropdown = false;

  get periodTypeLabel(): string {
    return {
      today: 'SALARY.PERIOD_TODAY',
      week:  'SALARY.PERIOD_WEEK',
      month: 'SALARY.PERIOD_MONTH',
      year:  'SALARY.PERIOD_YEAR'
    }[this.overviewPeriod];
  }

  get periodNavLabel(): string {
    const now = new Date();
    const off = this.overviewOffset;
    if (this.overviewPeriod === 'today') {
      const d = new Date(now); d.setDate(d.getDate() + off);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    if (this.overviewPeriod === 'week') {
      const s = new Date(now); s.setDate(s.getDate() - ((s.getDay() + 6) % 7) + off * 7);
      const e = new Date(s); e.setDate(e.getDate() + 6);
      return `${s.toLocaleDateString('en-GB',{day:'2-digit',month:'short'})} – ${e.toLocaleDateString('en-GB',{day:'2-digit',month:'short'})}`;
    }
    if (this.overviewPeriod === 'month') {
      const d = new Date(now.getFullYear(), now.getMonth() + off, 1);
      return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    }
    if (this.overviewPeriod === 'year') {
      return String(now.getFullYear() + off);
    }
    return '';
  }

  setPeriodType(p: 'today' | 'week' | 'month' | 'year'): void {
    this.overviewPeriod = p;
    this.overviewOffset = 0;
    this.showPeriodDropdown = false;
  }

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

  exportingExcel = false;
  exportingPdf = false;

  constructor(
    private collaborateurService: CollaborateurService,
    private salaryService: SalaryService,
    private reportService: ReportService,
    private translate: TranslateService,
    private refData: ReferenceDataService,
  ) {}

  openDetail(r: any) { this.selected = r; this.showDetail = true; }
  closeAll() { this.showDetail = false; this.selected = null; }

  exportExcel(): void {
    const year = new Date().getFullYear();
    this.exportingExcel = true;
    this.reportService.getPayrollExcel(year).subscribe({
      next: (blob) => {
        downloadBlob(blob, `payroll_${year}_${todayDateString()}.xlsx`);
        this.exportingExcel = false;
      },
      error: () => { this.exportingExcel = false; }
    });
  }

  exportPdf(): void {
    const year = new Date().getFullYear();
    this.exportingPdf = true;
    this.reportService.getPayrollPdf(year).subscribe({
      next: (blob) => {
        downloadBlob(blob, `payroll_${year}_${todayDateString()}.pdf`);
        this.exportingPdf = false;
      },
      error: () => { this.exportingPdf = false; }
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  private statusClass(status: string): string {
    switch ((status ?? '').toUpperCase()) {
      case 'VALIDATED': return 'chip-validated';
      case 'PAID':      return 'chip-paid';
      default:          return 'chip-unpaid'; // DRAFT or unknown
    }
  }

  private statusLabel(status: string): string {
    switch ((status ?? '').toUpperCase()) {
      case 'VALIDATED': return 'Validated';
      case 'PAID':      return 'Paid';
      default:          return 'Draft';
    }
  }

  ngOnInit(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      collaborateurs: this.collaborateurService.getAll(),
      payslips: this.salaryService.getAll()
    }).subscribe({
      next: ({ collaborateurs, payslips }) => {
        // ── Contract distribution from real employee data ──
        this.totalCount   = collaborateurs.length;
        this.cdiCount     = collaborateurs.filter(e => (e.Type ?? '').toUpperCase() === 'CDI').length;
        this.cddCount     = collaborateurs.filter(e => (e.Type ?? '').toUpperCase() === 'CDD').length;
        this.stageCount   = collaborateurs.filter(e => (e.Type ?? '').toUpperCase() === 'STAGE').length;
        this.interimCount = this.totalCount - this.cdiCount - this.cddCount - this.stageCount;

        // ── Build a lookup map: collaborateurId → employee ──
        const empMap = new Map(collaborateurs.map(e => [e.matricule, e]));

        // ── Map real payslips to display rows ──
        this.rows = payslips.map(p => {
          const emp = empMap.get(p.collaborateurId);
          const grossAmt = (p.baseSalary ?? 0) + (p.bonuses ?? 0);
          const name = `${p.collaborateurPrenom ?? ''} ${p.collaborateurNom ?? ''}`.trim()
            || `${emp?.prenom ?? ''} ${emp?.nom ?? ''}`.trim()
            || `#${p.collaborateurId}`;
          return {
            // Table row fields
            id:           String(p.id),
            empId:        String(p.collaborateurId),
            name,
            role:         emp?.Fonction ?? emp?.Département ?? 'N/A',
            department:   emp?.Département ?? 'N/A',
            contractType: emp?.Type ?? 'N/A',
            gross:        grossAmt.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' }),
            deductions:   (p.deductions ?? 0).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' }),
            net:          (p.netSalary ?? 0).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' }),
            status:       p.status,
            statusClass:  this.statusClass(p.status),
            statusLabel:  this.statusLabel(p.status),
            // Detail panel fields
            hourlyRate:       'N/A', // TODO: not in Payslip DTO
            annualSalary:     ((p.baseSalary ?? 0) * 12).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' }),
            overtimeRate:     'N/A', // TODO: not in Payslip DTO
            bonuses:          (p.bonuses ?? 0).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' }),
            deductionsAmount: (p.deductions ?? 0).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' }),
            deductionTypes:   [],
            payFrequency:     'Monthly',
            history: [{
              date:       p.paymentDate ?? p.period ?? '—',
              hours:      'N/A', // TODO: not in Payslip DTO
              gross:      grossAmt.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' }),
              deductions: (p.deductions ?? 0).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' }),
              net:        (p.netSalary ?? 0).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' }),
              status:     this.statusLabel(p.status),
            }],
          };
        });

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
    const contractLabels = this.refData.contractTypes
      .filter(ct => ['CDI', 'CDD', 'STAGE', 'INTERIM'].includes(ct.value))
      .map(ct => ct.label);
    const contractCounts = [this.cdiCount, this.cddCount, this.stageCount, this.interimCount];
    const seriesRaw = contractCounts.filter(v => v > 0);
    const labelsRaw = contractLabels
      .map((l, i) => [l, contractCounts[i]] as [string, number])
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
