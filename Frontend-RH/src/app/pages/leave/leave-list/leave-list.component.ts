import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService, LeaveRequest } from '../leave.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  styles: [`
    .page { padding:0 24px 40px; font-family:'Inter',sans-serif; animation:fadeIn .4s ease both; }
    @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}

    .page-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);margin-bottom:18px;}
    .page-title{font-size:22px;font-weight:700;color:#1A2B3C;margin:0;}
    .header-meta{display:flex;align-items:center;gap:20px;}
    .header-date{font-size:13px;color:#8FA3B8;display:flex;align-items:center;gap:6px;}

    .table-card{background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);overflow:hidden;}
    .tabs-bar{display:flex;align-items:center;gap:2px;padding:14px 20px 0;border-bottom:1px solid #F0F3F6;flex-wrap:wrap;}
    .tab{padding:10px 18px;font-size:13px;font-weight:500;color:#8FA3B8;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;transition:all .15s;margin-bottom:-1px;}
    .tab.active{color:#2FA8A0;border-bottom-color:#2FA8A0;font-weight:600;}
    .tabs-right{margin-left:auto;display:flex;align-items:center;gap:10px;padding-bottom:4px;}
    .filter-select{padding:6px 30px 6px 10px;border:1.5px solid #E2E8F0;border-radius:8px;font-size:12px;color:#4A6080;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238FA3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 8px center;appearance:none;outline:none;cursor:pointer;}

    table{width:100%;border-collapse:collapse;}
    thead tr{background:#FAFBFC;}
    thead th{padding:11px 14px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8FA3B8;border-bottom:1px solid #F0F3F6;white-space:nowrap;}
    tbody tr{cursor:pointer;transition:background .15s;}
    tbody tr:hover{background:#FAFBFC;}
    tbody td{padding:11px 14px;font-size:13px;color:#4A6080;border-bottom:1px solid #F5F7FA;vertical-align:middle;}
    tbody tr:last-child td{border-bottom:none;}
    .td-id{font-weight:600;color:#4A6080;font-size:12px;}
    .td-name{font-weight:600;color:#1A2B3C;}
    .role-chip{display:inline-flex;padding:3px 9px;border-radius:6px;font-size:11.5px;font-weight:500;background:#F1F5F9;color:#4A6080;white-space:nowrap;}
    .status-chip{display:inline-flex;padding:4px 11px;border-radius:999px;font-size:11.5px;font-weight:700;white-space:nowrap;}
    .chip-pending  {background:#FEF3C7;color:#B45309;}
    .chip-approved {background:#DCFCE7;color:#15803D;}
    .chip-rejected {background:#FFE4E6;color:#BE123C;}
    .chip-cancelled{background:#F1F5F9;color:#8FA3B8;}

    .act-btn{width:30px;height:30px;border-radius:7px;border:none;background:#F1F5F9;color:#4A6080;font-size:14px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;margin-right:4px;transition:all .15s;}
    .act-btn:hover{background:#E2E8F0;}
    .act-btn.approve:hover{background:#DCFCE7;color:#15803D;}
    .act-btn.reject:hover{background:#FFE4E6;color:#BE123C;}

    .state-box{padding:48px 0;text-align:center;color:#8FA3B8;font-size:14px;}
    .state-box i{font-size:36px;display:block;margin-bottom:10px;}
    .state-box--error{color:#EF4444;}
    .spinner{width:32px;height:32px;border:3px solid #E2E8F0;border-top-color:#2FA8A0;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 10px;}
    @keyframes spin{to{transform:rotate(360deg)}}

    /* ── Detail Panel ── */
    .backdrop{position:fixed;inset:0;background:rgba(10,20,35,.35);z-index:1800;backdrop-filter:blur(1px);}
    .rp{position:fixed;top:70px;right:0;bottom:0;width:520px;background:#fff;box-shadow:-8px 0 40px rgba(10,20,35,.14);border-radius:16px 0 0 0;z-index:1801;display:flex;flex-direction:column;animation:rpIn .22s ease both;overflow:hidden;}
    @keyframes rpIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
    .rp-header{display:flex;align-items:center;justify-content:space-between;padding:18px 22px 16px;border-bottom:1px solid #F0F3F6;flex-shrink:0;}
    .rp-title{font-size:15px;font-weight:700;color:#1A2B3C;}
    .rp-close{width:30px;height:30px;border:none;background:#F1F5F9;border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:17px;color:#4A6080;}
    .rp-close:hover{background:#E2E8F0;}
    .rp-body{flex:1;overflow-y:auto;padding:20px 22px;}

    .dp-section{font-size:14px;font-weight:700;color:#1A2B3C;margin-bottom:12px;}
    .dp-field{display:grid;grid-template-columns:150px 1fr;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid #F5F7FA;}
    .dp-field:last-of-type{border-bottom:none;}
    .dp-lbl{display:flex;align-items:center;gap:7px;font-size:12px;color:#8FA3B8;}
    .dp-lbl i{font-size:14px;}
    .dp-val{font-size:13px;font-weight:600;color:#1A2B3C;}
    .dp-divider{border:none;border-top:1px solid #F0F3F6;margin:16px 0;}

    .rp-footer{padding:14px 22px;border-top:1px solid #F0F3F6;flex-shrink:0;display:flex;justify-content:flex-end;gap:10px;}
    .btn-reject {padding:10px 24px;background:#EF4444;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;}
    .btn-reject:disabled{opacity:.5;cursor:default;}
    .btn-approve{padding:10px 24px;background:#22C55E;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;}
    .btn-approve:disabled{opacity:.5;cursor:default;}

    .toast{position:fixed;bottom:24px;right:24px;z-index:9999;background:#1A2B3C;color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.18);animation:rpIn .22s ease both;}
    .big-action-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;background:#1B7872;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s;white-space:nowrap}
    .big-action-btn:hover{background:#1A9690}
    .big-action-btn i{font-size:15px}
    .action-row{display:flex;justify-content:flex-end;margin-bottom:18px}

    /* ── Create form ── */
    .f-field{margin-bottom:16px;}
    .f-lbl{display:block;font-size:13px;font-weight:600;color:#1A2B3C;margin-bottom:6px;}
    .f-input{width:100%;padding:10px 14px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:#1A2B3C;font-family:'Inter',sans-serif;box-sizing:border-box;outline:none;transition:border .15s;}
    .f-input:focus{border-color:#2FA8A0;box-shadow:0 0 0 3px rgba(47,168,160,.1);}
    .f-input::placeholder{color:#C0CDD8;}
    .f-select{width:100%;padding:10px 14px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:#4A6080;font-family:'Inter',sans-serif;appearance:none;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238FA3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 14px center;box-sizing:border-box;outline:none;cursor:pointer;}
    .f-select:focus{border-color:#2FA8A0;}
    .f-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
    .f-textarea{width:100%;padding:10px 14px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:#1A2B3C;font-family:'Inter',sans-serif;box-sizing:border-box;outline:none;resize:vertical;min-height:80px;transition:border .15s;}
    .f-textarea:focus{border-color:#2FA8A0;}
    .f-err{background:#FFF5F5;border:1px solid #FFE4E6;color:#BE123C;border-radius:8px;padding:9px 14px;font-size:12.5px;margin-bottom:14px;display:flex;align-items:center;gap:7px;}
    .f-info{background:#F0FDF9;border:1px solid #CCFBF1;color:#0D6E64;border-radius:8px;padding:9px 14px;font-size:12px;margin-bottom:14px;display:flex;align-items:center;gap:7px;}
    .days-preview{font-size:13px;font-weight:700;color:#1B7872;margin-top:4px;}
    .btn-cancel{padding:10px 20px;background:#F1F5F9;color:#4A6080;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;}
    .btn-submit{padding:10px 24px;background:#1B7872;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;}
    .btn-submit:hover{background:#1A9690;}
    .btn-submit:disabled{opacity:.5;cursor:default;}
    .type-spinner{width:18px;height:18px;border:2px solid #E2E8F0;border-top-color:#2FA8A0;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;vertical-align:middle;margin-right:6px;}

    /* ════════════════════════════════════════
       DARK MODE
       ════════════════════════════════════════ */
    :host-context([data-theme="dark"]) .page-header { background:#111111 !important; box-shadow:0 4px 20px rgba(0,0,0,.3); }
    :host-context([data-theme="dark"]) .page-title  { color:#FFFFFF !important; }

    :host-context([data-theme="dark"]) .table-card  { background:#111111 !important; box-shadow:0 4px 20px rgba(0,0,0,.3); }
    :host-context([data-theme="dark"]) .tabs-bar    { background:#111111 !important; border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .tab         { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .tab.active  { color:#2FA8A0 !important; border-bottom-color:#2FA8A0 !important; }

    /* All-employees dropdown */
    :host-context([data-theme="dark"]) .filter-select {
      background:#1A1A1A url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B6B6B' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 8px center !important;
      border-color:#2A2A2A !important;
      color:#A0A0A0 !important;
    }
    :host-context([data-theme="dark"]) .filter-select option { background:#1A1A1A; color:#A0A0A0; }

    /* Table */
    :host-context([data-theme="dark"]) thead tr { background:#1A1A1A !important; }
    :host-context([data-theme="dark"]) thead th { color:#6B6B6B !important; border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) tbody tr { background:#111111 !important; }
    :host-context([data-theme="dark"]) tbody tr:hover { background:rgba(47,168,160,.06) !important; }
    :host-context([data-theme="dark"]) tbody td { color:#A0A0A0 !important; border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) tbody tr:last-child td { border-bottom:none; }
    :host-context([data-theme="dark"]) .td-name { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .td-id   { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .role-chip { background:#1A1A1A !important; color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .act-btn  { background:#1A1A1A !important; color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .act-btn:hover { background:#2A2A2A !important; color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .act-btn.approve:hover { background:rgba(21,128,61,.15) !important; color:#4ade80 !important; }
    :host-context([data-theme="dark"]) .act-btn.reject:hover  { background:rgba(190,18,60,.15) !important; color:#f87171 !important; }

    /* Detail panel */
    :host-context([data-theme="dark"]) .rp { background:#111111 !important; box-shadow:-8px 0 40px rgba(0,0,0,.5); }
    :host-context([data-theme="dark"]) .rp-header { border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .rp-title  { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .rp-close  { background:#1A1A1A !important; color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .rp-close:hover { background:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .rp-footer { border-top-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .dp-section { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .dp-field  { border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .dp-lbl    { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .dp-val    { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .dp-divider { border-top-color:#2A2A2A !important; }

    /* Create form */
    :host-context([data-theme="dark"]) .f-lbl { color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .f-input,
    :host-context([data-theme="dark"]) .f-select,
    :host-context([data-theme="dark"]) .f-textarea {
      background:#1A1A1A !important;
      border-color:#2A2A2A !important;
      color:#FFFFFF !important;
    }
    :host-context([data-theme="dark"]) .f-select {
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B6B6B' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") !important;
    }
    :host-context([data-theme="dark"]) .f-select option { background:#1A1A1A; color:#FFFFFF; }
    :host-context([data-theme="dark"]) .f-input::placeholder { color:#444444 !important; }
    :host-context([data-theme="dark"]) .btn-cancel { background:#1A1A1A !important; color:#A0A0A0 !important; border:1px solid #2A2A2A; }
    :host-context([data-theme="dark"]) .state-box  { color:#6B6B6B !important; }
  `],
  template: `
  <!-- ── Create Panel ── -->
  <div class="backdrop" *ngIf="showCreate" (click)="closeCreate()"></div>
  <div class="rp" *ngIf="showCreate">
    <div class="rp-header">
      <span class="rp-title">{{ 'LEAVE.PANEL_NEW_TITLE' | translate }}</span>
      <button class="rp-close" (click)="closeCreate()"><i class="bx bx-x"></i></button>
    </div>
    <div class="rp-body">

      <div class="f-err" *ngIf="createError"><i class="bx bx-error-circle"></i> {{ createError }}</div>

      <div class="f-field">
        <label class="f-lbl">{{ 'LEAVE.FIELD_LEAVE_TYPE' | translate }}</label>
        <span *ngIf="loadingTypes"><span class="type-spinner"></span> {{ 'LEAVE.LOADING' | translate }}</span>
        <select class="f-select" [(ngModel)]="createForm.leaveTypeId" *ngIf="!loadingTypes">
          <option [ngValue]="null" disabled>{{ 'LEAVE.SELECT_TYPE' | translate }}</option>
          <option *ngFor="let t of leaveTypes" [ngValue]="t.id">
            {{ t.name }}{{ t.maxDaysPerYear ? ' (max ' + t.maxDaysPerYear + ' j/an)' : '' }}
          </option>
        </select>
        <div *ngIf="!loadingTypes && leaveTypes.length === 0" style="font-size:12.5px;color:#EF4444;margin-top:4px;">
          <i class="bx bx-info-circle"></i> {{ 'LEAVE.NO_TYPES' | translate }}
        </div>
      </div>

      <div class="f-row">
        <div class="f-field">
          <label class="f-lbl">{{ 'LEAVE.FIELD_START_DATE' | translate }}</label>
          <input class="f-input" type="date" [(ngModel)]="createForm.startDate" (ngModelChange)="onDateChange()" />
        </div>
        <div class="f-field">
          <label class="f-lbl">{{ 'LEAVE.FIELD_END_DATE' | translate }}</label>
          <input class="f-input" type="date" [(ngModel)]="createForm.endDate" (ngModelChange)="onDateChange()" />
        </div>
      </div>

      <div class="f-info" *ngIf="previewDays > 0">
        <i class="bx bx-calendar-check"></i>
        {{ 'LEAVE.ESTIMATED_DURATION' | translate }} <strong style="margin-left:4px;">{{ previewDays }} {{ 'LEAVE.WORKING_DAYS' | translate }}</strong>
      </div>

      <div class="f-field">
        <label class="f-lbl">{{ 'LEAVE.FIELD_REASON' | translate }}</label>
        <textarea class="f-textarea" [(ngModel)]="createForm.reason" [placeholder]="'LEAVE.REASON_PLACEHOLDER' | translate"></textarea>
      </div>

    </div>
    <div class="rp-footer">
      <button class="btn-cancel" (click)="closeCreate()">{{ 'LEAVE.CANCEL' | translate }}</button>
      <button class="btn-submit"
              [disabled]="saving || !createForm.leaveTypeId || !createForm.startDate || !createForm.endDate"
              (click)="submitCreate()">
        {{ saving ? ('LEAVE.SUBMITTING' | translate) : ('LEAVE.SUBMIT' | translate) }}
      </button>
    </div>
  </div>

  <!-- Detail Panel -->
  <div class="backdrop" *ngIf="selected" (click)="selected=null"></div>
  <div class="rp" *ngIf="selected">
    <div class="rp-header">
      <span class="rp-title">{{ 'LEAVE.DETAIL_TITLE' | translate }}</span>
      <button class="rp-close" (click)="selected=null"><i class="bx bx-x"></i></button>
    </div>
    <div class="rp-body">

      <div class="dp-section">{{ 'LEAVE.SECTION_REQUESTER' | translate }}</div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-id-card"></i> {{ 'LEAVE.USER_ID' | translate }}</span>
        <span class="dp-val">#{{ selected.requester.id }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-user"></i> {{ 'LEAVE.FULL_NAME' | translate }}</span>
        <span class="dp-val">{{ selected.requester.name }}</span>
      </div>

      <hr class="dp-divider">

      <div class="dp-section">{{ 'LEAVE.SECTION_LEAVE_DETAILS' | translate }}</div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-category"></i> {{ 'LEAVE.LEAVE_TYPE' | translate }}</span>
        <span class="dp-val">{{ selected.leaveType.name }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-calendar"></i> {{ 'LEAVE.START_DATE' | translate }}</span>
        <span class="dp-val">{{ selected.startDate | date:'dd MMM yyyy' }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-calendar-check"></i> {{ 'LEAVE.END_DATE' | translate }}</span>
        <span class="dp-val">{{ selected.endDate | date:'dd MMM yyyy' }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-time"></i> {{ 'LEAVE.DURATION' | translate }}</span>
        <span class="dp-val">{{ selected.durationDays }} {{ 'LEAVE.DAYS' | translate }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-note"></i> {{ 'LEAVE.REASON' | translate }}</span>
        <span class="dp-val" style="font-weight:400;color:#4A6080">{{ selected.reason || '—' }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-check-circle"></i> {{ 'LEAVE.TABLE_STATUS' | translate }}</span>
        <span class="dp-val">
          <span class="status-chip" [ngClass]="chipClass(selected.status)">{{ selected.status }}</span>
        </span>
      </div>
      <div class="dp-field" *ngIf="selected.approverComment">
        <span class="dp-lbl"><i class="bx bx-comment"></i> {{ 'LEAVE.DECISION_NOTE' | translate }}</span>
        <span class="dp-val" style="font-weight:400;color:#4A6080">{{ selected.approverComment }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-calendar-alt"></i> {{ 'LEAVE.SUBMITTED_DATE' | translate }}</span>
        <span class="dp-val">{{ selected.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
      </div>

    </div>
    <div class="rp-footer" *ngIf="selected.status === 'PENDING'">
      <button class="btn-reject"  [disabled]="saving" (click)="reject(selected)">
        <i class="bx bx-x-circle"></i> {{ 'LEAVE.BTN_REJECT' | translate }}
      </button>
      <button class="btn-approve" [disabled]="saving" (click)="approve(selected)">
        <i class="bx bx-check-circle"></i> {{ 'LEAVE.BTN_APPROVE' | translate }}
      </button>
    </div>
  </div>

  <!-- Toast -->
  <div class="toast" *ngIf="toast">{{ toast }}</div>

  <!-- Page -->
  <div class="page">
    <div class="page-header">
      <h4 class="page-title">{{ 'LEAVE.TITLE' | translate }}</h4>
    </div>
    <!-- Action row -->
    <div class="action-row">
      <button class="big-action-btn" (click)="openCreate()">
        <i class="bx bx-plus"></i> {{ 'LEAVE.BTN_NEW_REQUEST' | translate }}
      </button>
    </div>

    <div class="table-card">
      <div class="tabs-bar">
        <button *ngFor="let t of tabs" class="tab" [class.active]="activeTab===t" (click)="activeTab=t">
          {{ t | translate }} <span *ngIf="t !== 'LEAVE.TAB_ALL'" style="font-size:11px;opacity:.7">({{ countTab(t) }})</span>
        </button>
        <div class="tabs-right">
          <select class="filter-select" [(ngModel)]="filterRequesterId" (ngModelChange)="onRequesterFilter()">
            <option [ngValue]="null">{{ 'LEAVE.ALL_EMPLOYEES' | translate }}</option>
            <option *ngFor="let r of uniqueRequesters" [ngValue]="r.id">{{ r.name }}</option>
          </select>
          <span style="font-size:12px;color:#8FA3B8"><i class="bx bx-refresh"></i>&nbsp; {{ allRows.length }} total</span>
        </div>
      </div>

      <!-- Loading -->
      <div class="state-box" *ngIf="loading">
        <div class="spinner"></div>{{ 'LEAVE.LOADING_REQUESTS' | translate }}
      </div>

      <!-- Error -->
      <div class="state-box state-box--error" *ngIf="!loading && error">
        <i class="bx bx-error-circle"></i>{{ error }}
        <br><button style="margin-top:12px;padding:7px 18px;border:none;border-radius:8px;background:#2FA8A0;color:#fff;cursor:pointer;font-size:13px" (click)="load()">{{ 'LEAVE.RETRY' | translate }}</button>
      </div>

      <!-- Empty -->
      <div class="state-box" *ngIf="!loading && !error && filtered.length === 0">
        <i class="bx bx-door-open"></i>{{ 'LEAVE.NO_REQUESTS' | translate }}
      </div>

      <!-- Table -->
      <div style="overflow-x:auto" *ngIf="!loading && !error && filtered.length > 0">
        <table>
          <thead>
            <tr>
              <th>{{ 'LEAVE.TABLE_NUM' | translate }}</th>
              <th>{{ 'LEAVE.TABLE_EMPLOYEE' | translate }}</th>
              <th>{{ 'LEAVE.TABLE_LEAVE_TYPE' | translate }}</th>
              <th>{{ 'LEAVE.TABLE_START' | translate }}</th>
              <th>{{ 'LEAVE.TABLE_END' | translate }}</th>
              <th>{{ 'LEAVE.TABLE_DAYS' | translate }}</th>
              <th>{{ 'LEAVE.TABLE_SUBMITTED' | translate }}</th>
              <th>{{ 'LEAVE.TABLE_STATUS' | translate }}</th>
              <th>{{ 'LEAVE.TABLE_ACTIONS' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of filtered; let i = index" (click)="selected = r">
              <td class="td-id">{{ i + 1 }}</td>
              <td class="td-name">{{ r.requester.name }}</td>
              <td><span class="role-chip">{{ r.leaveType.name }}</span></td>
              <td>{{ r.startDate | date:'dd/MM/yyyy' }}</td>
              <td>{{ r.endDate   | date:'dd/MM/yyyy' }}</td>
              <td style="font-weight:700;color:#1A2B3C">{{ r.durationDays }}d</td>
              <td style="font-size:12px">{{ r.createdAt | date:'dd/MM/yy' }}</td>
              <td><span class="status-chip" [ngClass]="chipClass(r.status)">{{ r.status }}</span></td>
              <td (click)="$event.stopPropagation()">
                <button class="act-btn approve" [title]="'LEAVE.BTN_APPROVE' | translate" *ngIf="r.status==='PENDING'" (click)="approve(r)"><i class="bx bx-check"></i></button>
                <button class="act-btn reject"  [title]="'LEAVE.BTN_REJECT' | translate"  *ngIf="r.status==='PENDING'" (click)="reject(r)"><i class="bx bx-x"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class LeaveListComponent implements OnInit {

  today = new Date();
  tabs  = ['LEAVE.TAB_ALL', 'PENDING', 'APPROVED', 'REJECTED'];
  activeTab = 'LEAVE.TAB_ALL';
  filterRequesterId: number | null = null;
  filterSearch = '';

  allRows: LeaveRequest[] = [];
  loading = false;
  error: string | null = null;
  saving  = false;
  selected: LeaveRequest | null = null;
  toast: string | null = null;

  // ── Create form state ──
  showCreate   = false;
  leaveTypes:  any[] = [];
  loadingTypes = false;
  createError: string | null = null;
  createForm: { leaveTypeId: number | null; startDate: string; endDate: string; reason: string } = this.emptyForm();
  previewDays  = 0;

  constructor(private leaveService: LeaveService, private translate: TranslateService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error   = null;
    this.leaveService.getAllRequests().subscribe({
      next:  data  => { this.allRows = data; this.loading = false; },
      error: err   => { this.error = err?.error?.message || 'Failed to load leave requests.'; this.loading = false; }
    });
  }

  // ── Filtering ────────────────────────────────────────────────────────────

  /** Base after requester filter — used by both filtered getter and countTab */
  private get baseRows(): LeaveRequest[] {
    let r = this.allRows;
    if (this.filterRequesterId) r = r.filter(x => x.requester?.id === this.filterRequesterId);
    return r;
  }

  get filtered(): LeaveRequest[] {
    let r = this.baseRows;
    if (this.activeTab !== 'All') r = r.filter(x => x.status === this.activeTab);
    return r;
  }

  countTab(tab: string): number {
    const base = this.baseRows;
    return tab === 'All' ? base.length : base.filter(r => r.status === tab).length;
  }

  onRequesterFilter(): void { /* reactive — filtered getter recalculates automatically */ }

  get uniqueRequesters(): { id: number; name: string }[] {
    const seen = new Set<number>();
    const result: { id: number; name: string }[] = [];
    for (const r of this.allRows) {
      const id = r.requester?.id;
      if (id && !seen.has(id)) {
        seen.add(id);
        result.push({ id, name: r.requester?.name ?? String(id) });
      }
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  // ── Status helpers ────────────────────────────────────────────────────────

  chipClass(s: string): Record<string, boolean> {
    return {
      'chip-pending':   s === 'PENDING',
      'chip-approved':  s === 'APPROVED',
      'chip-rejected':  s === 'REJECTED',
      'chip-cancelled': s === 'CANCELLED',
    };
  }

  // ── Approve / Reject ─────────────────────────────────────────────────────

  private updateRow(updated: LeaveRequest): void {
    this.allRows = this.allRows.map(r => r.id === updated.id ? updated : r);
    if (this.selected?.id === updated.id) this.selected = updated;
  }

  approve(req: LeaveRequest): void {
    this.saving = true;
    this.leaveService.approve(req.id, '').subscribe({
      next:  updated => { this.saving = false; this.updateRow(updated); this.showToast(this.translate.instant('LEAVE.TOAST_APPROVED')); },
      error: err     => { this.saving = false; this.showToast(err?.error?.message || this.translate.instant('LEAVE.TOAST_APPROVED')); }
    });
  }

  reject(req: LeaveRequest): void {
    this.saving = true;
    this.leaveService.reject(req.id, '').subscribe({
      next:  updated => { this.saving = false; this.updateRow(updated); this.showToast(this.translate.instant('LEAVE.TOAST_REJECTED')); },
      error: err     => { this.saving = false; this.showToast(err?.error?.message || this.translate.instant('LEAVE.TOAST_REJECTED')); }
    });
  }

  // ── Create ───────────────────────────────────────────────────────────────

  openCreate(): void {
    this.createForm  = this.emptyForm();
    this.createError = null;
    this.previewDays = 0;
    this.showCreate  = true;
    this.selected    = null;

    if (this.leaveTypes.length === 0) {
      this.loadingTypes = true;
      this.leaveService.getLeaveTypes().subscribe({
        next:  types => { this.leaveTypes = types; this.loadingTypes = false; },
        error: ()    => { this.loadingTypes = false; }
      });
    }
  }

  closeCreate(): void {
    this.showCreate  = false;
    this.createError = null;
  }

  onDateChange(): void {
    const { startDate, endDate } = this.createForm;
    if (!startDate || !endDate) { this.previewDays = 0; return; }
    const start = new Date(startDate);
    const end   = new Date(endDate);
    if (end < start) { this.previewDays = 0; return; }
    // Count business days (Mon–Fri)
    let days = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const dow = cur.getDay();
      if (dow !== 0 && dow !== 6) days++;
      cur.setDate(cur.getDate() + 1);
    }
    this.previewDays = days;
  }

  submitCreate(): void {
    const { leaveTypeId, startDate, endDate, reason } = this.createForm;
    if (!leaveTypeId || !startDate || !endDate) {
      this.createError = this.translate.instant('LEAVE.ERR_REQUIRED_FIELDS');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      this.createError = this.translate.instant('LEAVE.ERR_DATE_ORDER');
      return;
    }
    this.saving      = true;
    this.createError = null;
    this.leaveService.submitRequest({ leaveTypeId, startDate, endDate, reason }).subscribe({
      next: created => {
        this.saving  = false;
        this.allRows = [created, ...this.allRows];
        this.closeCreate();
        this.showToast(this.translate.instant('LEAVE.TOAST_SUBMITTED'));
      },
      error: err => {
        this.saving      = false;
        this.createError = err?.error?.message || this.translate.instant('LEAVE.TOAST_SUBMIT_FAILED');
      }
    });
  }

  private emptyForm() {
    return { leaveTypeId: null as number | null, startDate: '', endDate: '', reason: '' };
  }

  private showToast(msg: string): void {
    this.toast = msg;
    setTimeout(() => this.toast = null, 3000);
  }
}
