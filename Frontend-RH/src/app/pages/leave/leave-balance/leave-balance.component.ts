import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ConfirmService } from 'src/app/shared/confirm.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

const BASE = `${environment.apiUrl}/leaves`;

@Component({
  selector: 'app-leave-balance',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  styles: [`
    :host{display:block}
    .page{padding:0 24px 60px;font-family:'Inter',sans-serif;animation:fadeIn .35s ease both}
    @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
    .page-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);margin-bottom:18px}
    .page-title{font-size:22px;font-weight:700;color:#1A2B3C;margin:0}
    .header-right{display:flex;gap:10px;align-items:center}
    .btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s}
    .btn:disabled{opacity:.5;cursor:default}
    .btn-primary{background:#1B7872 !important;color:#fff !important;border-color:#1B7872 !important}.btn-primary:hover:not(:disabled){background:#155f5a !important;border-color:#155f5a !important}
    .btn-secondary{background:#F1F5F9;color:#4A6080}.btn-secondary:hover:not(:disabled){background:#E2E8F0}
    .filter-bar{display:flex;gap:12px;align-items:center;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);padding:12px 18px;margin-bottom:18px}
    .yr-select{width:auto;padding:6px 28px 6px 12px;border:1.5px solid #E2E8F0;border-radius:999px;font-size:13px;font-weight:500;color:#4A6080;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238FA3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 10px center;appearance:none;outline:none;cursor:pointer;flex-shrink:0}
    .yr-select:focus{border-color:#2FA8A0;box-shadow:0 0 0 3px rgba(47,168,160,.1)}
    .f-label{font-size:13px;font-weight:600;color:#4A6080;white-space:nowrap}
    .card{background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);overflow:hidden}
    .card-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #F0F3F6}
    .card-title{font-size:14px;font-weight:700;color:#1A2B3C}
    table{width:100%;border-collapse:collapse}
    thead tr{background:#FAFBFC}
    thead th{padding:10px 16px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8FA3B8;border-bottom:1px solid #F0F3F6;text-align:left}
    tbody tr{transition:background .15s}
    tbody tr:hover{background:#F8FAFC}
    tbody td{padding:12px 16px;font-size:13px;color:#4A6080;border-bottom:1px solid #F5F7FA;vertical-align:middle}
    tbody tr:last-child td{border-bottom:none}
    .td-type{font-weight:600;color:#1A2B3C}
    .td-num{text-align:right;font-weight:700;color:#1A2B3C}
    .td-num--used{color:#F59E0B}
    .td-num--pend{color:#8FA3B8}
    .td-num--rem{color:#15803D}
    .bar-wrap{width:100%;max-width:140px;height:6px;background:#E2E8F0;border-radius:3px;overflow:hidden}
    .bar-fill{height:100%;border-radius:3px;background:#2FA8A0;transition:width .4s}
    .bar-fill--over{background:#EF4444}
    .state-box{padding:48px 0;text-align:center;color:#8FA3B8;font-size:14px}
    .state-box i{font-size:36px;display:block;margin-bottom:10px}
    .spinner{width:30px;height:30px;border:3px solid #E2E8F0;border-top-color:#2FA8A0;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 10px}
    @keyframes spin{to{transform:rotate(360deg)}}
    .backdrop{position:fixed;inset:0;background:rgba(10,20,35,.35);z-index:1800;backdrop-filter:blur(1px)}
    .rp{position:fixed;top:70px;right:0;bottom:0;width:440px;background:#fff;box-shadow:-8px 0 40px rgba(10,20,35,.14);border-radius:16px 0 0 0;z-index:1801;display:flex;flex-direction:column;animation:rpIn .22s ease both;overflow:hidden}
    @keyframes rpIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
    .rp-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px 18px;border-bottom:1px solid #F0F3F6;flex-shrink:0}
    .rp-title{font-size:16px;font-weight:700;color:#1A2B3C}
    .rp-close{width:32px;height:32px;border:none;background:#F1F5F9;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;color:#4A6080}
    .rp-close:hover{background:#E2E8F0}
    .rp-body{flex:1;overflow-y:auto;padding:24px}
    .rp-footer{padding:16px 24px;border-top:1px solid #F0F3F6;flex-shrink:0;display:flex;justify-content:flex-end;gap:10px}
    .f-field{margin-bottom:16px}
    .f-lbl{display:block;font-size:13px;font-weight:600;color:#1A2B3C;margin-bottom:6px}
    .f-input{width:100%;padding:10px 14px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:#1A2B3C;font-family:'Inter',sans-serif;outline:none;transition:border .15s;box-sizing:border-box}
    .f-input:focus{border-color:#2FA8A0;box-shadow:0 0 0 3px rgba(47,168,160,.1)}
    .info-box{background:#F0FDF4;border:1px solid #86EFAC;border-radius:10px;padding:14px 16px;font-size:13px;color:#15803D;margin-bottom:16px;display:flex;align-items:flex-start;gap:10px}
    .info-box i{font-size:18px;flex-shrink:0;margin-top:1px}
    .example-box{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;margin-bottom:20px}
    .example-box-title{font-size:12px;font-weight:700;color:#2FA8A0;margin-bottom:10px;display:flex;align-items:center;gap:6px;text-transform:uppercase;letter-spacing:.05em}
    .example-box-row{display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #F0F3F6}
    .example-box-row:last-child{border-bottom:none}
    .ex-lbl{font-size:11.5px;font-weight:600;color:#8FA3B8}
    .ex-val{font-size:12px;color:#1A2B3C;font-weight:500}
    .f-optional{font-size:11px;font-weight:400;color:#8FA3B8;margin-left:4px}
    .f-required{color:#EF4444;margin-left:2px}
    .f-hint{font-size:11.5px;color:#8FA3B8;margin-top:4px}
    .f-err-box{background:#FFF5F5;border:1px solid #FFE4E6;color:#BE123C;border-radius:8px;padding:9px 14px;font-size:12.5px;margin-top:8px;display:flex;align-items:center;gap:7px}
    .f-select{width:100%;padding:10px 14px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:#4A6080;font-family:'Inter',sans-serif;appearance:none;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238FA3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 14px center;box-sizing:border-box;outline:none;cursor:pointer}
    .f-select:focus{border-color:#2FA8A0;box-shadow:0 0 0 3px rgba(47,168,160,.1)}
    .toast{position:fixed;bottom:24px;right:24px;z-index:9999;background:#111111 !important;color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.18);animation:rpIn .22s ease both}
    .tab-bar{display:flex;gap:4px;background:#F1F5F9;border-radius:10px;padding:4px;margin-bottom:18px;width:fit-content}
    .tab-btn{padding:8px 20px;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;background:transparent;color:#4A6080;transition:all .15s}
    .tab-btn.active{background:#fff;color:#1A2B3C;box-shadow:0 2px 8px rgba(22,34,51,.08)}
    .btn-sm{padding:6px 13px;font-size:12px}
    .btn-danger{background:#FEE2E2;color:#BE123C}.btn-danger:hover:not(:disabled){background:#FECACA}
    .toggle-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #F5F7FA}
    .toggle-row:last-child{border-bottom:none}
    .toggle-lbl{font-size:13px;font-weight:600;color:#1A2B3C;flex:1}
    .toggle-sub{font-size:12px;color:#8FA3B8;margin-top:1px}
    .chip-bool-yes{display:inline-flex;padding:2px 9px;border-radius:5px;font-size:11px;font-weight:700;background:#DCFCE7;color:#15803D}
    .chip-bool-no{display:inline-flex;padding:2px 9px;border-radius:5px;font-size:11px;font-weight:700;background:#F1F5F9;color:#8FA3B8}
    .big-action-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;background:#1B7872;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s;white-space:nowrap}
    .big-action-btn:hover{background:#1A9690}
    .big-action-btn i{font-size:15px}
    .action-row{display:flex;justify-content:flex-end;margin-bottom:18px}

    /* ─── DARK MODE ─── */
    :host-context([data-theme="dark"]) { background:#0F1825; }
    :host-context([data-theme="dark"]) .page-header { background:#111111 !important; box-shadow:0 4px 20px rgba(0,0,0,.3); }
    :host-context([data-theme="dark"]) .page-title { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .btn-secondary { background:#1A1A1A !important; color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .btn-secondary:hover:not(:disabled) { background:#243E58; }
    :host-context([data-theme="dark"]) .filter-bar { background:#111111 !important; box-shadow:0 4px 20px rgba(0,0,0,.3); }
    :host-context([data-theme="dark"]) .f-label { color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .yr-select { background:#1A1A1A !important; border-color:#2A2A2A !important; color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .yr-select:focus { border-color:#2FA8A0; }
    :host-context([data-theme="dark"]) .tab-bar { background:#1A1A1A !important; }
    :host-context([data-theme="dark"]) .tab-btn { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .tab-btn.active { background:#111111 !important; color:#FFFFFF !important; box-shadow:0 2px 8px rgba(0,0,0,.3); }
    :host-context([data-theme="dark"]) .card { background:#111111 !important; box-shadow:0 4px 20px rgba(0,0,0,.3); }
    :host-context([data-theme="dark"]) .card-head { border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .card-title { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) thead tr { background:#1A1A1A !important; }
    :host-context([data-theme="dark"]) thead th { color:#6B6B6B !important; border-bottom:1px solid #2A2A2A !important; }
    :host-context([data-theme="dark"]) tbody tr { background:#111111 !important; }
    :host-context([data-theme="dark"]) tbody tr:hover { background:rgba(47,168,160,.06) !important; }
    :host-context([data-theme="dark"]) tbody td { color:#A0A0A0 !important; border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) tbody tr:last-child td { border-bottom:none; }
    :host-context([data-theme="dark"]) .td-type { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .td-num { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .td-num--used { color:#FCD34D; }
    :host-context([data-theme="dark"]) .td-num--rem  { color:#4ADE80; }
    :host-context([data-theme="dark"]) .bar-wrap { background:#1A1A1A !important; }
    :host-context([data-theme="dark"]) .state-box { color:#4A6080; }
    :host-context([data-theme="dark"]) .spinner { border-color:#2A2A2A !important; border-top-color:#2FA8A0; }
    :host-context([data-theme="dark"]) .toggle-row { border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .toggle-lbl { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .toggle-sub { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .chip-bool-yes { background:#052E16; color:#4ADE80; }
    :host-context([data-theme="dark"]) .chip-bool-no  { background:#1A1A1A !important; color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .rp { background:#111111 !important; box-shadow:-8px 0 40px rgba(0,0,0,.6) !important; }
    :host-context([data-theme="dark"]) .rp-header { border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .rp-title { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .rp-close { background:#1A1A1A !important; color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .rp-close:hover { background:#243E58; }
    :host-context([data-theme="dark"]) .rp-footer { border-top-color:#243E58; }
    :host-context([data-theme="dark"]) .f-lbl { color:#C8D6E5; }
    :host-context([data-theme="dark"]) .f-input { background:#1A1A1A !important; border-color:#2A2A2A !important; color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .f-select { background-color:#1A1A1A !important; border-color:#2A2A2A !important; color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .f-select option { background:#1A1A1A; color:#FFFFFF; }
    :host-context([data-theme="dark"]) .f-input:focus { border-color:#2FA8A0; box-shadow:0 0 0 3px rgba(47,168,160,.15); }
    :host-context([data-theme="dark"]) .info-box { background:#052E16; border-color:#166534; color:#4ADE80; }
    :host-context([data-theme="dark"]) .btn-danger { background:#3B0A0A; color:#F87171; }
    :host-context([data-theme="dark"]) .btn-danger:hover:not(:disabled) { background:#5B1818; }
    :host-context([data-theme="dark"]) .example-box { background:#1A1A1A !important; border-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .ex-lbl { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .ex-val { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .example-box-row { border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .f-hint { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .f-optional { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .f-err-box { background:#3B0A0A !important; border-color:#7F1D1D !important; color:#F87171 !important; }
  `],
  template: `
  <div class="backdrop" *ngIf="showInit || showTypeForm" (click)="showInit=false; closeTypeForm()"></div>

  <div class="rp" *ngIf="showInit">
    <div class="rp-header">
      <span class="rp-title">{{ 'LEAVE_BALANCE.PANEL_INIT_TITLE' | translate }}</span>
      <button class="rp-close" (click)="showInit=false"><i class="bx bx-x"></i></button>
    </div>
    <div class="rp-body">

      <!-- Example hint box -->
      <div class="example-box">
        <div class="example-box-title"><i class="bx bx-bulb"></i> Example</div>
        <div class="example-box-row"><span class="ex-lbl">Employee ID</span><span class="ex-val">Leave empty → all employees</span></div>
        <div class="example-box-row"><span class="ex-lbl">Leave Type</span><span class="ex-val">Annual Leave</span></div>
        <div class="example-box-row"><span class="ex-lbl">Year</span><span class="ex-val">{{ currentYear }}</span></div>
        <div class="example-box-row"><span class="ex-lbl">Days</span><span class="ex-val">30 days allocated</span></div>
      </div>

      <div class="f-field">
        <label class="f-lbl">Employee ID <span class="f-optional">(optional — leave empty for all)</span></label>
        <input class="f-input" type="number" [(ngModel)]="initForm.userId" placeholder="e.g. 12" />
      </div>
      <div class="f-field">
        <label class="f-lbl">Leave Type <span class="f-required">*</span></label>
        <select class="f-select" [(ngModel)]="initForm.leaveTypeId">
          <option [ngValue]="null">— Select a leave type —</option>
          <option *ngFor="let t of leaveTypes" [ngValue]="t.id">{{ t.name }}</option>
        </select>
      </div>
      <div class="f-field">
        <label class="f-lbl">Year <span class="f-required">*</span></label>
        <input class="f-input" type="number" [(ngModel)]="initForm.year" [min]="2020" [max]="2030" placeholder="e.g. {{ currentYear }}" />
      </div>
      <div class="f-field">
        <label class="f-lbl">Days Allocated <span class="f-required">*</span></label>
        <input class="f-input" type="number" [(ngModel)]="initForm.totalDays" [min]="1" [max]="365" placeholder="e.g. 30" />
        <div class="f-hint">Number of leave days granted for this year</div>
      </div>

      <div class="f-err-box" *ngIf="initError">
        <i class="bx bx-error-circle"></i> {{ initError }}
      </div>
    </div>
    <div class="rp-footer">
      <button class="btn btn-secondary" (click)="showInit=false">Cancel</button>
      <button class="btn btn-primary"
              [disabled]="initializing || !initForm.leaveTypeId || !initForm.year || initForm.totalDays < 1"
              (click)="initBalance()">
        <i class="bx" [class.bx-refresh]="!initializing" [class.bx-loader-alt]="initializing"
           [style.animation]="initializing ? 'spin .7s linear infinite' : 'none'"></i>
        {{ initializing ? 'Initializing…' : 'Initialize Balances' }}
      </button>
    </div>
  </div>

  <!-- Leave Type Form Panel -->
  <div class="rp" *ngIf="showTypeForm">
    <div class="rp-header">
      <span class="rp-title">{{ editingType ? ('LEAVE_BALANCE.PANEL_EDIT_TYPE' | translate) : ('LEAVE_BALANCE.PANEL_NEW_TYPE' | translate) }}</span>
      <button class="rp-close" (click)="closeTypeForm()"><i class="bx bx-x"></i></button>
    </div>
    <div class="rp-body">
      <div class="f-field">
        <label class="f-lbl">{{ 'LEAVE_BALANCE.FIELD_NAME' | translate }}</label>
        <input class="f-input" [(ngModel)]="typeForm.name" [placeholder]="'LEAVE_BALANCE.TYPE_NAME_PH' | translate" />
      </div>
      <div class="f-field">
        <label class="f-lbl">{{ 'LEAVE_BALANCE.FIELD_DESCRIPTION' | translate }}</label>
        <input class="f-input" [(ngModel)]="typeForm.description" [placeholder]="'LEAVE_BALANCE.FIELD_DESCRIPTION' | translate" />
      </div>
      <div class="f-field">
        <label class="f-lbl">{{ 'LEAVE_BALANCE.FIELD_DEFAULT_DAYS' | translate }}</label>
        <input class="f-input" type="number" [(ngModel)]="typeForm.defaultDaysPerYear" [min]="1" />
      </div>
      <div class="f-field">
        <label class="f-lbl">{{ 'LEAVE_BALANCE.FIELD_MAX_DAYS' | translate }}</label>
        <input class="f-input" type="number" [(ngModel)]="typeForm.maxDaysPerYear" />
      </div>
      <div class="toggle-row">
        <div><div class="toggle-lbl">{{ 'LEAVE_BALANCE.FIELD_CARRYOVER' | translate }}</div><div class="toggle-sub">{{ 'LEAVE_BALANCE.FIELD_CARRYOVER_DESC' | translate }}</div></div>
        <input type="checkbox" [(ngModel)]="typeForm.carryOver" style="width:16px;height:16px;accent-color:#1B7872;cursor:pointer" />
      </div>
      <div class="toggle-row">
        <div><div class="toggle-lbl">{{ 'LEAVE_BALANCE.FIELD_JUSTIFICATION_REQ' | translate }}</div><div class="toggle-sub">{{ 'LEAVE_BALANCE.FIELD_JUSTIFICATION_DESC' | translate }}</div></div>
        <input type="checkbox" [(ngModel)]="typeForm.requiresDocument" style="width:16px;height:16px;accent-color:#1B7872;cursor:pointer" />
      </div>
      <div class="toggle-row">
        <div><div class="toggle-lbl">{{ 'LEAVE_BALANCE.FIELD_ACTIVE' | translate }}</div><div class="toggle-sub">{{ 'LEAVE_BALANCE.FIELD_ACTIVE_DESC' | translate }}</div></div>
        <input type="checkbox" [(ngModel)]="typeForm.active" style="width:16px;height:16px;accent-color:#1B7872;cursor:pointer" />
      </div>
    </div>
    <div class="rp-footer">
      <button class="btn btn-secondary" (click)="closeTypeForm()">{{ 'LEAVE_BALANCE.CANCEL' | translate }}</button>
      <button class="btn btn-primary" [disabled]="savingType || !typeForm.name" (click)="saveType()">
        <i class="bx bx-save"></i>{{ savingType ? ('LEAVE_BALANCE.SAVING' | translate) : ('LEAVE_BALANCE.SAVE' | translate) }}
      </button>
    </div>
  </div>

  <div class="toast" *ngIf="toast">{{ toast }}</div>

  <div class="page">
    <div class="page-header">
      <h4 class="page-title">{{ 'LEAVE_BALANCE.TITLE' | translate }}</h4>
    </div>
    <div class="action-row">
      <button class="big-action-btn" *ngIf="activeTab==='balances'" (click)="openInit()">
        <i class="bx bx-plus"></i> {{ 'LEAVE_BALANCE.BTN_INIT_BALANCES' | translate }}
      </button>
      <button class="big-action-btn" *ngIf="activeTab==='types'" (click)="openTypeCreate()">
        <i class="bx bx-plus"></i> {{ 'LEAVE_BALANCE.BTN_NEW_TYPE' | translate }}
      </button>
    </div>

    <div class="tab-bar">
      <button class="tab-btn" [class.active]="activeTab==='balances'" (click)="activeTab='balances'">
        <i class="bx bx-wallet"></i> {{ 'LEAVE_BALANCE.TAB_BALANCES' | translate }}
      </button>
      <button class="tab-btn" [class.active]="activeTab==='types'" (click)="activeTab='types'">
        <i class="bx bx-category"></i> {{ 'LEAVE_BALANCE.TAB_TYPES' | translate }}
      </button>
    </div>

    <!-- ══ TAB: BALANCES ══ -->
    <ng-container *ngIf="activeTab==='balances'">
      <div class="filter-bar">
        <span class="f-label">{{ 'LEAVE_BALANCE.YEAR_LABEL' | translate }}</span>
        <select class="yr-select" [(ngModel)]="selectedYear" (change)="load()">
          <option *ngFor="let y of years" [value]="y">{{ y }}</option>
        </select>
      </div>

      <div class="card">
        <div class="card-head">
          <span class="card-title">{{ 'LEAVE_BALANCE.MY_BALANCES_TITLE' | translate }} {{ selectedYear }}</span>
        </div>

        <div class="state-box" *ngIf="loading"><div class="spinner"></div>{{ 'LEAVE_BALANCE.LOADING' | translate }}</div>
        <div class="state-box" style="color:#EF4444" *ngIf="!loading && error">
          <i class="bx bx-error-circle"></i>{{ error }}
        </div>
        <div class="state-box" *ngIf="!loading && !error && balances.length===0">
          <i class="bx bx-calendar-minus"></i>{{ 'LEAVE_BALANCE.NO_BALANCES' | translate }} {{ selectedYear }}
          <br><small style="margin-top:8px;display:block">{{ 'LEAVE_BALANCE.NO_BALANCES_HINT' | translate }}</small>
        </div>

        <div style="overflow-x:auto" *ngIf="!loading && !error && balances.length>0">
          <table>
            <thead><tr>
              <th>{{ 'LEAVE_BALANCE.TABLE_LEAVE_TYPE' | translate }}</th><th>{{ 'LEAVE_BALANCE.TABLE_YEAR' | translate }}</th>
              <th style="text-align:right">{{ 'LEAVE_BALANCE.TABLE_TOTAL' | translate }}</th>
              <th style="text-align:right">{{ 'LEAVE_BALANCE.TABLE_USED' | translate }}</th>
              <th style="text-align:right">{{ 'LEAVE_BALANCE.TABLE_PENDING' | translate }}</th>
              <th style="text-align:right">{{ 'LEAVE_BALANCE.TABLE_REMAINING' | translate }}</th>
              <th>{{ 'LEAVE_BALANCE.TABLE_PROGRESS' | translate }}</th>
            </tr></thead>
            <tbody>
              <tr *ngFor="let b of balances">
                <td class="td-type">{{ b.leaveType?.name || '—' }}</td>
                <td>{{ b.year }}</td>
                <td class="td-num">{{ b.totalDays }}</td>
                <td class="td-num td-num--used">{{ b.usedDays }}</td>
                <td class="td-num td-num--pend">{{ b.pendingDays ?? 0 }}</td>
                <td class="td-num td-num--rem">{{ b.remainingDays }}</td>
                <td>
                  <div class="bar-wrap">
                    <div class="bar-fill"
                      [class.bar-fill--over]="usedPct(b) > 100"
                      [style.width.%]="min100(usedPct(b))"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ng-container>

    <!-- ══ TAB: TYPES ══ -->
    <ng-container *ngIf="activeTab==='types'">
      <div class="card">
        <div class="card-head">
          <span class="card-title">{{ 'LEAVE_BALANCE.TYPES_TITLE' | translate:{count: leaveTypes.length} }}</span>
        </div>
        <div class="state-box" *ngIf="typesLoading"><div class="spinner"></div>{{ 'LEAVE_BALANCE.LOADING' | translate }}</div>
        <div style="overflow-x:auto" *ngIf="!typesLoading && leaveTypes.length>0">
          <table>
            <thead><tr>
              <th>{{ 'LEAVE_BALANCE.TABLE_NAME' | translate }}</th><th>{{ 'LEAVE_BALANCE.TABLE_DESCRIPTION' | translate }}</th>
              <th style="text-align:right">{{ 'LEAVE_BALANCE.TABLE_DAYS_YEAR' | translate }}</th>
              <th style="text-align:right">{{ 'LEAVE_BALANCE.TABLE_MAX' | translate }}</th>
              <th>{{ 'LEAVE_BALANCE.TABLE_CARRYOVER' | translate }}</th><th>{{ 'LEAVE_BALANCE.TABLE_JUSTIFICATION' | translate }}</th><th>{{ 'LEAVE_BALANCE.TABLE_STATUS' | translate }}</th><th>{{ 'LEAVE_BALANCE.TABLE_ACTIONS' | translate }}</th>
            </tr></thead>
            <tbody>
              <tr *ngFor="let t of leaveTypes">
                <td style="font-weight:600;color:#1A2B3C">{{ t.name }}</td>
                <td style="color:#6B6B6B !important;font-size:12.5px">{{ t.description || '—' }}</td>
                <td class="td-num">{{ t.defaultDaysPerYear }}</td>
                <td class="td-num">{{ t.maxDaysPerYear ?? '—' }}</td>
                <td><span [class]="t.carryOver ? 'chip-bool-yes' : 'chip-bool-no'">{{ t.carryOver ? ('LEAVE_BALANCE.YES' | translate) : ('LEAVE_BALANCE.NO' | translate) }}</span></td>
                <td><span [class]="t.requiresDocument ? 'chip-bool-yes' : 'chip-bool-no'">{{ t.requiresDocument ? ('LEAVE_BALANCE.YES' | translate) : ('LEAVE_BALANCE.NO' | translate) }}</span></td>
                <td><span [class]="t.active ? 'chip-bool-yes' : 'chip-bool-no'">{{ t.active ? ('LEAVE_BALANCE.ACTIVE' | translate) : ('LEAVE_BALANCE.INACTIVE' | translate) }}</span></td>
                <td style="white-space:nowrap">
                  <button class="btn btn-secondary btn-sm" style="margin-right:6px" (click)="openTypeEdit(t)"><i class="bx bx-edit-alt"></i></button>
                  <button class="btn btn-danger btn-sm" (click)="deleteType(t)"><i class="bx bx-trash"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="state-box" *ngIf="!typesLoading && leaveTypes.length===0">
          <i class="bx bx-category"></i>{{ 'LEAVE_BALANCE.NO_TYPES' | translate }}
        </div>
      </div>
    </ng-container>
  </div>
  `
})
export class LeaveBalanceComponent implements OnInit {

  activeTab: 'balances' | 'types' = 'balances';

  balances: any[]   = [];
  leaveTypes: any[] = [];
  loading      = false;
  typesLoading = false;
  error: string | null = null;

  currentYear  = new Date().getFullYear();
  selectedYear = new Date().getFullYear();
  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  showInit     = false;
  initializing = false;
  initError: string | null = null;
  initForm     = {
    userId:      null as number | null,
    leaveTypeId: null as number | null,
    year:        new Date().getFullYear(),
    totalDays:   0,
  };

  showTypeForm  = false;
  savingType    = false;
  editingType: any = null;
  typeForm: any = this.emptyTypeForm();

  toast: string | null = null;

  constructor(private http: HttpClient, private confirmSvc: ConfirmService, private translate: TranslateService) {}

  ngOnInit(): void {
    this.loadTypes();
    this.load();
  }

  loadTypes(): void {
    this.typesLoading = true;
    this.http.get<any>(`${BASE}/types`).pipe(
      map(r => r?.data ?? (Array.isArray(r) ? r : []))
    ).subscribe({
      next: types => { this.leaveTypes = types; this.typesLoading = false; },
      error: () => { this.typesLoading = false; }
    });
  }

  load(): void {
    this.loading = true;
    this.error   = null;
    const params = new HttpParams().set('year', String(this.selectedYear));
    this.http.get<any>(`${BASE}/balance`, { params }).pipe(
      map(r => r?.data ?? (Array.isArray(r) ? r : [])),
      catchError(e => { this.error = e?.error?.message || 'Erreur de chargement'; this.loading = false; return []; })
    ).subscribe(d => { this.balances = Array.isArray(d) ? d : []; this.loading = false; });
  }

  initBalance(): void {
    this.initError = null;
    if (!this.initForm.leaveTypeId || !this.initForm.year || this.initForm.totalDays < 1) {
      this.initError = 'Please fill in Leave Type, Year, and Days Allocated.';
      return;
    }
    this.initializing = true;
    let params = new HttpParams()
      .set('leaveTypeId', String(this.initForm.leaveTypeId))
      .set('year', String(this.initForm.year))
      .set('totalDays', String(this.initForm.totalDays));
    if (this.initForm.userId) params = params.set('userId', String(this.initForm.userId));

    this.http.post<any>(`${BASE}/balance/init`, null, { params }).subscribe({
      next: () => {
        this.initializing = false;
        this.showInit = false;
        this.initError = null;
        this.selectedYear = this.initForm.year;
        this.load();
        this.showToast('Balances initialized successfully!');
      },
      error: e => { this.initializing = false; this.initError = e?.error?.message || 'Failed to initialize balances. Please try again.'; }
    });
  }

  usedPct(b: any): number {
    if (!b.totalDays) return 0;
    return Math.round(((b.usedDays + (b.pendingDays ?? 0)) / b.totalDays) * 100);
  }

  min100(v: number): number { return Math.min(v, 100); }

  openInit(): void {
    this.initForm = { userId: null, leaveTypeId: null, year: this.currentYear, totalDays: 0 };
    this.initError = null;
    this.showInit = true;
  }

  openTypeCreate(): void { this.editingType = null; this.typeForm = this.emptyTypeForm(); this.showTypeForm = true; }
  openTypeEdit(t: any): void { this.editingType = t; this.typeForm = { ...t }; this.showTypeForm = true; }
  closeTypeForm(): void { this.showTypeForm = false; this.editingType = null; this.savingType = false; }

  saveType(): void {
    if (!this.typeForm.name) return;
    this.savingType = true;
    const call = this.editingType
      ? this.http.put<any>(`${BASE}/types/${this.editingType.id}`, this.typeForm)
      : this.http.post<any>(`${BASE}/types`, this.typeForm);
    call.pipe(map(r => r?.data ?? r)).subscribe({
      next: saved => {
        if (this.editingType) {
          this.leaveTypes = this.leaveTypes.map(t => t.id === saved.id ? saved : t);
        } else {
          this.leaveTypes = [...this.leaveTypes, saved];
        }
        this.closeTypeForm();
        this.showToast(this.translate.instant(this.editingType ? 'LEAVE_BALANCE.TOAST_TYPE_UPDATED' : 'LEAVE_BALANCE.TOAST_TYPE_CREATED'));
      },
      error: e => { this.savingType = false; this.showToast(e?.error?.message || this.translate.instant('LEAVE_BALANCE.TOAST_ERROR')); }
    });
  }

  async deleteType(t: any): Promise<void> {
    if (!(await this.confirmSvc.confirm(`${this.translate.instant('LEAVE_BALANCE.CONFIRM_DELETE_TYPE').replace('{name}', t.name)}`, this.translate.instant('LEAVE_BALANCE.CONFIRM_DELETE_BTN')))) return;
    this.http.delete<void>(`${BASE}/types/${t.id}`).subscribe({
      next: () => { this.leaveTypes = this.leaveTypes.filter(x => x.id !== t.id); this.showToast(this.translate.instant('LEAVE_BALANCE.TOAST_TYPE_DELETED')); },
      error: e => this.showToast(e?.error?.message || this.translate.instant('LEAVE_BALANCE.TOAST_ERROR'))
    });
  }

  private emptyTypeForm() {
    return { name: '', description: '', defaultDaysPerYear: 0, maxDaysPerYear: null, carryOver: false, requiresDocument: false, active: true };
  }

  private showToast(msg: string): void { this.toast = msg; setTimeout(() => this.toast = null, 3500); }
}
