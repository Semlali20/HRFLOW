import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, catchError, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { StagiaireService } from 'src/app/core/services/stagiaire.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WallClockComponent } from 'src/app/shared/wall-clock/wall-clock.component';

const BASE = `${environment.apiUrl}/meetings`;

const STATUS_CHIP: Record<string,string> = {
  SCHEDULED:'chip-blue', IN_PROGRESS:'chip-teal',
  COMPLETED:'chip-green', CANCELLED:'chip-red', POSTPONED:'chip-amber'
};

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, WallClockComponent],
  styles: [`
    :host{display:block}
    .page{padding:0 24px 60px;font-family:'Inter',sans-serif;animation:fadeIn .35s ease both}
    @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

    .page-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);margin-bottom:18px}
    .page-title{font-size:22px;font-weight:700;color:#1A2B3C;margin:0}
    .header-right{display:flex;gap:10px}

    .btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s}
    .btn:disabled{opacity:.5;cursor:default}
    .btn-primary{background:#1B7872 !important;color:#fff !important;border-color:#1B7872 !important}.btn-primary:hover:not(:disabled){background:#1A9690 !important;border-color:#1A9690 !important}
    .btn-secondary{background:#F1F5F9;color:#4A6080}.btn-secondary:hover:not(:disabled){background:#E2E8F0}
    .btn-danger{background:#FEE2E2;color:#BE123C}.btn-danger:hover:not(:disabled){background:#FECACA}

    .card{background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);overflow:hidden}
    .card-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #F0F3F6}
    .card-title{font-size:14px;font-weight:700;color:#1A2B3C}
    .count-badge{background:#E8F7F6;color:#1B7872;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:700}
    .filter-bar{display:flex;align-items:center;gap:12px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);padding:12px 18px;margin-bottom:18px}
    .filter-select{padding:8px 32px 8px 12px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13px;color:#4A6080;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238FA3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 10px center;appearance:none;outline:none;cursor:pointer}

    table{width:100%;border-collapse:collapse}
    thead tr{background:#FAFBFC}
    thead th{padding:10px 16px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8FA3B8;border-bottom:1px solid #F0F3F6;text-align:left}
    tbody tr{cursor:pointer;transition:background .15s}
    tbody tr:hover{background:#F8FAFC}
    tbody td{padding:12px 16px;font-size:13px;color:#4A6080;border-bottom:1px solid #F5F7FA;vertical-align:middle}
    tbody tr:last-child td{border-bottom:none}
    .td-title{font-weight:600;color:#1A2B3C}
    .chip{display:inline-flex;padding:3px 10px;border-radius:999px;font-size:11.5px;font-weight:700}
    .chip-blue{background:#DBEAFE;color:#1E40AF}
    .chip-teal{background:#E8F7F6;color:#1B7872}
    .chip-green{background:#DCFCE7;color:#15803D}
    .chip-red{background:#FFE4E6;color:#BE123C}
    .chip-amber{background:#FEF3C7;color:#92400E}
    .act-btn{background:none;border:none;padding:4px 7px;border-radius:6px;cursor:pointer;font-size:14px;color:#B0BEC5;transition:all .15s}
    .act-btn:hover{background:#F1F5F9;color:#4A6080}
    .act-btn--del:hover{background:#FEE2E2;color:#BE123C}

    .state-box{padding:48px 0;text-align:center;color:#8FA3B8;font-size:14px}
    .state-box i{font-size:36px;display:block;margin-bottom:10px}
    .spinner{width:30px;height:30px;border:3px solid #E2E8F0;border-top-color:#2FA8A0;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 10px}
    @keyframes spin{to{transform:rotate(360deg)}}

    .backdrop{position:fixed;inset:0;background:rgba(10,20,35,.35);z-index:1800;backdrop-filter:blur(1px)}
    .rp{position:fixed;top:70px;right:0;bottom:0;width:520px;background:#fff;box-shadow:-8px 0 40px rgba(10,20,35,.14);border-radius:16px 0 0 0;z-index:1801;display:flex;flex-direction:column;animation:rpIn .22s ease both;overflow:hidden}
    @keyframes rpIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
    .rp-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px 18px;border-bottom:1px solid #F0F3F6;flex-shrink:0}
    .rp-title{font-size:16px;font-weight:700;color:#1A2B3C}
    .rp-close{width:32px;height:32px;border:none;background:#F1F5F9;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;color:#4A6080}
    .rp-close:hover{background:#E2E8F0}
    .rp-body{flex:1;overflow-y:auto;padding:24px}
    .rp-footer{padding:16px 24px;border-top:1px solid #F0F3F6;flex-shrink:0;display:flex;justify-content:flex-end;gap:10px}

    .detail-section{font-size:14px;font-weight:700;color:#1A2B3C;margin:0 0 12px}
    .detail-divider{border:none;border-top:1px solid #F0F3F6;margin:16px 0}
    .detail-field{display:grid;grid-template-columns:150px 1fr;align-items:flex-start;gap:8px;padding:9px 0;border-bottom:1px solid #F5F7FA}
    .detail-field:last-of-type{border-bottom:none}
    .detail-lbl{display:flex;align-items:center;gap:7px;font-size:12px;color:#8FA3B8;padding-top:2px}
    .detail-lbl i{font-size:14px}
    .detail-val{font-size:13px;font-weight:600;color:#1A2B3C;line-height:1.5}

    .f-field{margin-bottom:16px}
    .f-label{display:block;font-size:13px;font-weight:600;color:#1A2B3C;margin-bottom:6px}
    .f-input,.f-select,.f-textarea{width:100%;padding:10px 14px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:#1A2B3C;font-family:'Inter',sans-serif;outline:none;transition:border .15s;box-sizing:border-box;background:#fff}
    .f-input:focus,.f-select:focus,.f-textarea:focus{border-color:#2FA8A0;box-shadow:0 0 0 3px rgba(47,168,160,.1)}
    .f-select{appearance:none;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238FA3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px}
    .f-textarea{resize:vertical;min-height:72px}
    .f-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}

    .confirm-overlay{position:fixed;inset:0;background:rgba(10,20,35,.5);z-index:2000;display:flex;align-items:center;justify-content:center}
    .confirm-box{background:#fff;border-radius:12px;padding:28px 32px;max-width:380px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.2)}
    .confirm-icon{font-size:38px;color:#F59E0B;display:block;margin-bottom:10px}
    .confirm-title{font-size:15px;font-weight:700;color:#1A2B3C;margin:0 0 8px}
    .confirm-msg{font-size:13px;color:#4A6080;margin:0 0 22px;line-height:1.5}
    .confirm-actions{display:flex;justify-content:flex-end;gap:10px}

    .toast{position:fixed;bottom:24px;right:24px;z-index:9999;background:#111111 !important;color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.18);animation:rpIn .22s ease both}
    .big-action-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;background:#1B7872;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s;white-space:nowrap}
    .big-action-btn:hover{background:#1A9690}
    .big-action-btn i{font-size:15px}
    .action-row{display:flex;justify-content:flex-end;margin-bottom:18px}

    /* ── Dark Mode ── */
    :host-context([data-theme="dark"]) .page-header{background:#111111 !important;box-shadow:none !important}
    :host-context([data-theme="dark"]) .page-title{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .filter-bar{background:#111111 !important;box-shadow:none !important}
    :host-context([data-theme="dark"]) .filter-select{background-color:#1A1A1A !important;border-color:#2A2A2A !important;color:#A0A0A0 !important}
    :host-context([data-theme="dark"]) .card{background:#111111 !important;box-shadow:none !important}
    :host-context([data-theme="dark"]) .card-head{border-bottom-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .card-title{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .count-badge{background:#1A1A1A !important;color:#2FA8A0}
    :host-context([data-theme="dark"]) thead tr{background:#1A1A1A !important}
    :host-context([data-theme="dark"]) thead th{color:#6B6B6B !important;border-bottom:1px solid #2A2A2A !important}
    :host-context([data-theme="dark"]) tbody tr{background:#111111 !important}
    :host-context([data-theme="dark"]) tbody tr:hover{background:rgba(47,168,160,.06) !important}
    :host-context([data-theme="dark"]) tbody td{color:#A0A0A0 !important;border-bottom-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .td-title{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .chip-blue{background:#1E3A5F;color:#93C5FD}
    :host-context([data-theme="dark"]) .chip-teal{background:rgba(47,168,160,.15) !important;color:#5EEAD4}
    :host-context([data-theme="dark"]) .chip-green{background:#14291F;color:#6EE7B7}
    :host-context([data-theme="dark"]) .chip-red{background:#3B1219;color:#FCA5A5}
    :host-context([data-theme="dark"]) .chip-amber{background:#2D2210;color:#FCD34D}
    :host-context([data-theme="dark"]) .rp{background:#111111 !important;box-shadow:-8px 0 40px rgba(0,0,0,.6) !important}
    :host-context([data-theme="dark"]) .rp-header{border-bottom-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .rp-title{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .rp-close{background:#1A1A1A !important;color:#A0A0A0 !important}
    :host-context([data-theme="dark"]) .rp-footer{border-top-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .detail-section{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .detail-divider{border-top-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .detail-field{border-bottom-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .detail-lbl{color:#6B6B6B !important}
    :host-context([data-theme="dark"]) .detail-val{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .f-label{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .f-input{background:#1A1A1A !important;border-color:#2A2A2A !important;color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .f-select{background-color:#1A1A1A !important;border-color:#2A2A2A !important;color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .f-textarea{background:#1A1A1A !important;border-color:#2A2A2A !important;color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .confirm-box{background:#111111 !important}
    :host-context([data-theme="dark"]) .confirm-title{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .confirm-msg{color:#A0A0A0 !important}
    :host-context([data-theme="dark"]) .btn-secondary{background:#1A1A1A !important;color:#A0A0A0 !important}
    :host-context([data-theme="dark"]) .act-btn{color:#6B6B6B !important}
    :host-context([data-theme="dark"]) .act-btn:hover{background:#1A1A1A !important;color:#A0A0A0 !important}
    :host-context([data-theme="dark"]) .act-btn--del:hover{background:#3B1219;color:#FCA5A5}
  `],
  template: `
  <div class="backdrop" *ngIf="showPanel || showForm || confirmItem" (click)="closeAll()"></div>

  <div class="confirm-overlay" *ngIf="confirmItem" (click)="$event.stopPropagation()">
    <div class="confirm-box">
      <i class="bx bx-error confirm-icon"></i>
      <p class="confirm-title">{{ 'MEETINGS.CONFIRM_DELETE_TITLE' | translate }}</p>
      <p class="confirm-msg">{{ 'MEETINGS.CONFIRM_DELETE_MSG' | translate:{title: confirmItem?.title} }}</p>
      <div class="confirm-actions">
        <button class="btn btn-secondary" (click)="confirmItem=null">{{ 'MEETINGS.CONFIRM_CANCEL' | translate }}</button>
        <button class="btn btn-danger" (click)="execDelete()">{{ 'MEETINGS.CONFIRM_DELETE' | translate }}</button>
      </div>
    </div>
  </div>

  <!-- Detail Panel -->
  <div class="rp" *ngIf="showPanel && selected">
    <div class="rp-header">
      <span class="rp-title">{{ 'MEETINGS.DETAIL_TITLE' | translate }}</span>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary" style="padding:7px 14px;font-size:12px" (click)="openEdit(selected)">
          <i class="bx bx-edit-alt"></i> {{ 'MEETINGS.BTN_EDIT' | translate }}
        </button>
        <button class="rp-close" (click)="closeAll()"><i class="bx bx-x"></i></button>
      </div>
    </div>
    <div class="rp-body">
      <p class="detail-section">{{ selected.title }}</p>
      <div class="detail-field">
        <span class="detail-lbl"><i class="bx bx-calendar"></i> {{ 'MEETINGS.FIELD_DATE' | translate }}</span>
        <span class="detail-val">{{ selected.scheduledAt | date:'dd/MM/yyyy HH:mm' }}</span>
      </div>
      <div class="detail-field" *ngIf="selected.durationMinutes">
        <span class="detail-lbl"><i class="bx bx-time"></i> {{ 'MEETINGS.FIELD_DURATION' | translate }}</span>
        <span class="detail-val">{{ selected.durationMinutes }} min</span>
      </div>
      <div class="detail-field" *ngIf="selected.location">
        <span class="detail-lbl"><i class="bx bx-map-pin"></i> {{ 'MEETINGS.FIELD_LOCATION' | translate }}</span>
        <span class="detail-val">{{ selected.location }}</span>
      </div>
      <div class="detail-field">
        <span class="detail-lbl"><i class="bx bx-loader-circle"></i> {{ 'MEETINGS.FIELD_STATUS' | translate }}</span>
        <span class="detail-val">
          <span class="chip {{statusChip(selected.status)}}">{{ statusLabel(selected.status) }}</span>
        </span>
      </div>
      <div class="detail-field" *ngIf="selected.meetingType">
        <span class="detail-lbl"><i class="bx bx-category"></i> {{ 'MEETINGS.FIELD_TYPE' | translate }}</span>
        <span class="detail-val">{{ selected.meetingType }}</span>
      </div>
      <div class="detail-field" *ngIf="selected.organizer">
        <span class="detail-lbl"><i class="bx bx-user"></i> {{ 'MEETINGS.FIELD_ORGANIZER' | translate }}</span>
        <span class="detail-val">{{ selected.organizer.name }}</span>
      </div>
      <div class="detail-field" *ngIf="selected.intern">
        <span class="detail-lbl"><i class="bx bx-id-card"></i> {{ 'MEETINGS.FIELD_INTERN' | translate }}</span>
        <span class="detail-val">{{ selected.intern.name }}</span>
      </div>
      <div class="detail-field" *ngIf="selected.description">
        <span class="detail-lbl"><i class="bx bx-info-circle"></i> {{ 'MEETINGS.FIELD_DESCRIPTION' | translate }}</span>
        <span class="detail-val">{{ selected.description }}</span>
      </div>
      <div class="detail-field" *ngIf="selected.onlineLink">
        <span class="detail-lbl"><i class="bx bx-link"></i> {{ 'MEETINGS.FIELD_LINK' | translate }}</span>
        <span class="detail-val" style="word-break:break-all">{{ selected.onlineLink }}</span>
      </div>
      <div class="detail-field" *ngIf="selected.notes">
        <span class="detail-lbl"><i class="bx bx-note"></i> {{ 'MEETINGS.FIELD_NOTES' | translate }}</span>
        <span class="detail-val">{{ selected.notes }}</span>
      </div>
    </div>
  </div>

  <!-- Create / Edit Form Panel -->
  <div class="rp" *ngIf="showForm">
    <div class="rp-header">
      <span class="rp-title">{{ editMode ? ('MEETINGS.FORM_EDIT_TITLE' | translate) : ('MEETINGS.FORM_NEW_TITLE' | translate) }}</span>
      <button class="rp-close" (click)="closeAll()"><i class="bx bx-x"></i></button>
    </div>
    <div class="rp-body">
      <div class="f-field">
        <label class="f-label">{{ 'MEETINGS.FIELD_MEETING_TITLE' | translate }}</label>
        <input class="f-input" [(ngModel)]="form.title" [placeholder]="'MEETINGS.FIELD_MEETING_TITLE' | translate" />
      </div>
      <div class="f-row">
        <div class="f-field">
          <label class="f-label">{{ 'MEETINGS.FIELD_DATETIME' | translate }}</label>
          <input class="f-input" type="datetime-local" [(ngModel)]="form.scheduledAt" />
        </div>
        <div class="f-field">
          <label class="f-label">{{ 'MEETINGS.FIELD_DURATION_MIN' | translate }}</label>
          <input class="f-input" type="number" [(ngModel)]="form.durationMinutes" placeholder="60" min="5" />
        </div>
      </div>
      <div class="f-row">
        <div class="f-field">
          <label class="f-label">{{ 'MEETINGS.FIELD_MEETING_LOCATION' | translate }}</label>
          <input class="f-input" [(ngModel)]="form.location" [placeholder]="'MEETINGS.FIELD_MEETING_LOCATION' | translate" />
        </div>
        <div class="f-field">
          <label class="f-label">{{ 'MEETINGS.FIELD_MEETING_TYPE' | translate }}</label>
          <input class="f-input" [(ngModel)]="form.meetingType" placeholder="SUIVI, BILAN…" />
        </div>
      </div>
      <div class="f-row">
        <div class="f-field">
          <label class="f-label">{{ 'MEETINGS.FIELD_MEETING_STATUS' | translate }}</label>
          <select class="f-select" [(ngModel)]="form.status">
            <option value="SCHEDULED">{{ 'MEETINGS.STATUS_PLANNED' | translate }}</option>
            <option value="IN_PROGRESS">{{ 'MEETINGS.STATUS_IN_PROGRESS' | translate }}</option>
            <option value="COMPLETED">{{ 'MEETINGS.STATUS_DONE' | translate }}</option>
            <option value="POSTPONED">{{ 'MEETINGS.STATUS_POSTPONED' | translate }}</option>
            <option value="CANCELLED">{{ 'MEETINGS.STATUS_CANCELLED' | translate }}</option>
          </select>
        </div>
        <div class="f-field">
          <label class="f-label">{{ 'MEETINGS.FIELD_INTERN_OPTIONAL' | translate }}</label>
          <select class="f-select" [(ngModel)]="form.internId">
            <option [ngValue]="null">{{ 'MEETINGS.INTERN_NONE' | translate }}</option>
            <option *ngFor="let s of interns; trackBy: trackById" [ngValue]="s._backendId ?? s.matricule">
              {{ s.prenom }} {{ s.nom }}
            </option>
          </select>
        </div>
      </div>
      <div class="f-field">
        <label class="f-label">{{ 'MEETINGS.FIELD_ONLINE_LINK' | translate }}</label>
        <input class="f-input" [(ngModel)]="form.onlineLink" placeholder="https://meet.google.com/…" />
      </div>
      <div class="f-field">
        <label class="f-label">{{ 'MEETINGS.FIELD_MEETING_DESC' | translate }}</label>
        <textarea class="f-textarea" [(ngModel)]="form.description" [placeholder]="'MEETINGS.FIELD_MEETING_DESC' | translate"></textarea>
      </div>
      <div class="f-field">
        <label class="f-label">{{ 'MEETINGS.FIELD_MEETING_NOTES' | translate }}</label>
        <textarea class="f-textarea" [(ngModel)]="form.notes" [placeholder]="'MEETINGS.FIELD_MEETING_NOTES' | translate"></textarea>
      </div>
    </div>
    <div class="rp-footer">
      <button class="btn btn-secondary" (click)="closeAll()">{{ 'MEETINGS.CANCEL' | translate }}</button>
      <button class="btn btn-primary" [disabled]="saving" (click)="save()">
        {{ saving ? ('MEETINGS.SAVING' | translate) : ('MEETINGS.SAVE' | translate) }}
      </button>
    </div>
  </div>

  <div class="toast" *ngIf="toast">{{ toast }}</div>

  <div class="page">
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
      <div class="page-header" style="flex:1;margin-bottom:0;">
        <h4 class="page-title">{{ 'MEETINGS.TITLE' | translate }}</h4>
      </div>
      <app-wall-clock></app-wall-clock>
    </div>
    <!-- Action row -->
    <div class="action-row">
      <button class="big-action-btn" (click)="openCreate()">
        <i class="bx bx-plus"></i> {{ 'MEETINGS.BTN_NEW' | translate }}
      </button>
    </div>

    <div class="filter-bar">
      <select class="filter-select" [(ngModel)]="filterInternId">
        <option [ngValue]="null">{{ 'MEETINGS.FILTER_ALL_INTERNS' | translate }}</option>
        <option *ngFor="let s of interns; trackBy: trackById" [ngValue]="s._backendId ?? s.matricule">
          {{ s.prenom }} {{ s.nom }}
        </option>
      </select>
      <select class="filter-select" [(ngModel)]="filterStatus">
        <option value="">{{ 'MEETINGS.FILTER_ALL_STATUSES' | translate }}</option>
        <option value="SCHEDULED">{{ 'MEETINGS.STATUS_PLANNED' | translate }}</option>
        <option value="IN_PROGRESS">{{ 'MEETINGS.STATUS_IN_PROGRESS' | translate }}</option>
        <option value="COMPLETED">{{ 'MEETINGS.STATUS_DONE' | translate }}</option>
        <option value="POSTPONED">{{ 'MEETINGS.STATUS_POSTPONED' | translate }}</option>
        <option value="CANCELLED">{{ 'MEETINGS.STATUS_CANCELLED' | translate }}</option>
      </select>
    </div>

    <div class="card">
      <div class="card-head">
        <span class="card-title">{{ 'MEETINGS.CARD_TITLE' | translate }}</span>
        <span class="count-badge">{{ filteredMeetings.length }}</span>
      </div>

      <div class="state-box" *ngIf="loading"><div class="spinner"></div>{{ 'MEETINGS.LOADING' | translate }}</div>
      <div class="state-box" style="color:#EF4444" *ngIf="!loading && error">
        <i class="bx bx-error-circle"></i>{{ error }}
      </div>
      <div class="state-box" *ngIf="!loading && !error && filteredMeetings.length===0">
        <i class="bx bx-calendar"></i>{{ 'MEETINGS.NO_MEETINGS' | translate }}
      </div>

      <div style="overflow-x:auto" *ngIf="!loading && !error && filteredMeetings.length>0">
        <table>
          <thead><tr>
            <th>{{ 'MEETINGS.TABLE_TITLE' | translate }}</th><th>{{ 'MEETINGS.TABLE_DATE' | translate }}</th><th>{{ 'MEETINGS.TABLE_DURATION' | translate }}</th><th>{{ 'MEETINGS.TABLE_LOCATION' | translate }}</th>
            <th>{{ 'MEETINGS.TABLE_INTERN' | translate }}</th><th>{{ 'MEETINGS.TABLE_STATUS' | translate }}</th><th>{{ 'MEETINGS.TABLE_ACTIONS' | translate }}</th>
          </tr></thead>
          <tbody>
            <tr *ngFor="let m of filteredMeetings; trackBy: trackById" (click)="openDetail(m)">
              <td class="td-title">{{ m.title }}</td>
              <td>{{ m.scheduledAt | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ m.durationMinutes ? m.durationMinutes + ' min' : '—' }}</td>
              <td>{{ m.location || '—' }}</td>
              <td>{{ m.intern?.name || '—' }}</td>
              <td><span class="chip {{statusChip(m.status)}}">{{ statusLabel(m.status) }}</span></td>
              <td (click)="$event.stopPropagation()">
                <button class="act-btn" (click)="openEdit(m)"><i class="bx bx-edit-alt"></i></button>
                <button class="act-btn act-btn--del" (click)="confirmItem=m"><i class="bx bx-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class MeetingsComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  meetings: any[] = [];
  interns:  any[] = [];
  loading  = false;
  error: string | null = null;

  filterInternId: number | null = null;
  filterStatus = '';

  get filteredMeetings(): any[] {
    return this.meetings.filter(m => {
      const matchIntern = !this.filterInternId || m.intern?.id === this.filterInternId;
      const matchStatus = !this.filterStatus || m.status === this.filterStatus;
      return matchIntern && matchStatus;
    });
  }

  showPanel = false;
  showForm  = false;
  editMode  = false;
  editId: number | null = null;
  editVersion: number | null = null;
  saving = false;
  selected: any = null;
  confirmItem: any = null;
  toast: string | null = null;

  form: any = this.emptyForm();

  constructor(private http: HttpClient, private stagiaireService: StagiaireService, private translate: TranslateService) {}

  ngOnInit(): void {
    this.load();
    this.stagiaireService.getAll().pipe(takeUntil(this.destroy$)).subscribe({ next: d => this.interns = d, error: () => {} });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  load(): void {
    this.loading = true;
    this.http.get<any>(`${BASE}?size=200`).pipe(
      map(r => r?.content ?? r?.data ?? (Array.isArray(r) ? r : [])),
      catchError(e => { this.error = e?.error?.message || 'Erreur de chargement'; this.loading = false; return []; }),
      takeUntil(this.destroy$)
    ).subscribe(d => { this.meetings = d; this.loading = false; });
  }

  trackById(_: number, item: any): any { return item.id ?? item._backendId ?? item.matricule ?? _; }
  trackByIndex(index: number): number { return index; }

  statusLabel(s: string): string {
    const keyMap: Record<string,string> = {
      SCHEDULED:'MEETINGS.STATUS_PLANNED', IN_PROGRESS:'MEETINGS.STATUS_IN_PROGRESS',
      COMPLETED:'MEETINGS.STATUS_DONE', CANCELLED:'MEETINGS.STATUS_CANCELLED', POSTPONED:'MEETINGS.STATUS_POSTPONED'
    };
    const key = keyMap[s];
    return key ? this.translate.instant(key) : s;
  }
  statusChip(s: string): string  { return STATUS_CHIP[s] ?? 'chip-gray'; }

  openDetail(m: any): void { this.selected = m; this.showPanel = true; this.showForm = false; }

  openCreate(): void {
    this.editMode = false; this.editId = null; this.editVersion = null;
    this.form = this.emptyForm();
    this.showForm = true; this.showPanel = false;
  }

  openEdit(m: any): void {
    this.editMode = true; this.editId = m.id; this.editVersion = m.version;
    this.form = {
      title: m.title, scheduledAt: m.scheduledAt?.substring(0,16) ?? '',
      durationMinutes: m.durationMinutes, location: m.location || '',
      meetingType: m.meetingType || '', status: m.status || 'SCHEDULED',
      internId: m.intern?.id ?? null, onlineLink: m.onlineLink || '',
      description: m.description || '', notes: m.notes || '', version: m.version
    };
    this.showForm = true; this.showPanel = false;
  }

  save(): void {
    this.saving = true;
    const body = { ...this.form, version: this.editVersion ?? this.form.version };
    const req = this.editMode && this.editId
      ? this.http.put<any>(`${BASE}/${this.editId}`, body)
      : this.http.post<any>(BASE, body);
    req.pipe(map(r => r?.data ?? r)).subscribe({
      next: m => {
        if (this.editMode) this.meetings = this.meetings.map(x => x.id === m.id ? m : x);
        else this.meetings = [m, ...this.meetings];
        this.saving = false; this.closeAll();
        this.showToast(this.translate.instant(this.editMode ? 'MEETINGS.TOAST_UPDATED' : 'MEETINGS.TOAST_CREATED'));
      },
      error: e => { this.saving = false; this.showToast(e?.error?.message || this.translate.instant('MEETINGS.TOAST_ERROR')); }
    });
  }

  execDelete(): void {
    const item = this.confirmItem; this.confirmItem = null;
    this.http.delete<void>(`${BASE}/${item.id}`).subscribe({
      next: () => { this.meetings = this.meetings.filter(m => m.id !== item.id); this.showToast(this.translate.instant('MEETINGS.TOAST_DELETED')); },
      error: e => this.showToast(e?.error?.message || this.translate.instant('MEETINGS.TOAST_ERROR'))
    });
  }

  closeAll(): void { this.showPanel = false; this.showForm = false; this.selected = null; this.confirmItem = null; this.saving = false; }

  private showToast(msg: string): void { this.toast = msg; setTimeout(() => this.toast = null, 3500); }
  private emptyForm() {
    return { title:'', scheduledAt:'', durationMinutes:60, location:'', meetingType:'',
             status:'SCHEDULED', internId:null as number|null, onlineLink:'', description:'', notes:'' };
  }
}
