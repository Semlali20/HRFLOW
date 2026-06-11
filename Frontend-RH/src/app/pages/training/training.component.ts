import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TrainingService, TrainingSession } from './training.service';

const CATEGORY_CHIP: Record<string, string> = {
  TECHNICAL:   'chip-primary',
  SOFT_SKILLS: 'chip-success',
  COMPLIANCE:  'chip-warning',
  MANAGEMENT:  'chip-info',
  OTHER:       'chip-secondary',
};

const STATUS_CHIP: Record<string, string> = {
  PLANNED:   'chip-blue',
  ONGOING:   'chip-teal',
  COMPLETED: 'chip-green',
  CANCELLED: 'chip-red',
};

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  styles: [`
    :host { display: block }
    .page { padding: 0 24px 60px; font-family: 'Inter', sans-serif; animation: fadeIn .35s ease both }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }

    .page-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(22,34,51,.08); margin-bottom: 18px }
    .page-title { font-size: 22px; font-weight: 700; color: #1A2B3C; margin: 0 }

    .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; border: none; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background .15s }
    .btn:disabled { opacity: .5; cursor: default }
    .btn-primary { background: #1B7872 !important; color: #fff !important } .btn-primary:hover:not(:disabled) { background: #1A9690 !important }
    .btn-secondary { background: #F1F5F9; color: #4A6080 } .btn-secondary:hover:not(:disabled) { background: #E2E8F0 }
    .btn-danger { background: #FEE2E2; color: #BE123C } .btn-danger:hover:not(:disabled) { background: #FECACA }

    .card { background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(22,34,51,.08); overflow: hidden }
    .card-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid #F0F3F6 }
    .card-title { font-size: 14px; font-weight: 700; color: #1A2B3C }
    .count-badge { background: #E8F7F6; color: #1B7872; border-radius: 999px; padding: 2px 10px; font-size: 12px; font-weight: 700 }

    .filter-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(22,34,51,.08); padding: 12px 18px; margin-bottom: 18px }
    .filter-select { padding: 8px 32px 8px 12px; border: 1.5px solid #E2E8F0; border-radius: 9px; font-size: 13px; color: #4A6080; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238FA3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 10px center; appearance: none; outline: none; cursor: pointer }

    table { width: 100%; border-collapse: collapse }
    thead tr { background: #FAFBFC }
    thead th { padding: 10px 16px; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #8FA3B8; border-bottom: 1px solid #F0F3F6; text-align: left }
    tbody tr { cursor: pointer; transition: background .15s }
    tbody tr:hover { background: #F8FAFC }
    tbody td { padding: 12px 16px; font-size: 13px; color: #4A6080; border-bottom: 1px solid #F5F7FA; vertical-align: middle }
    tbody tr:last-child td { border-bottom: none }
    .td-title { font-weight: 600; color: #1A2B3C }

    .chip { display: inline-flex; padding: 3px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 700 }
    .chip-primary   { background: #DBEAFE; color: #1E40AF }
    .chip-success   { background: #DCFCE7; color: #15803D }
    .chip-warning   { background: #FEF3C7; color: #92400E }
    .chip-info      { background: #E0F2FE; color: #0369A1 }
    .chip-secondary { background: #F1F5F9; color: #475569 }
    .chip-blue      { background: #DBEAFE; color: #1E40AF }
    .chip-teal      { background: #E8F7F6; color: #1B7872 }
    .chip-green     { background: #DCFCE7; color: #15803D }
    .chip-red       { background: #FFE4E6; color: #BE123C }

    .act-btn { background: none; border: none; padding: 4px 7px; border-radius: 6px; cursor: pointer; font-size: 14px; color: #B0BEC5; transition: all .15s }
    .act-btn:hover { background: #F1F5F9; color: #4A6080 }
    .act-btn--del:hover { background: #FEE2E2; color: #BE123C }

    .state-box { padding: 48px 0; text-align: center; color: #8FA3B8; font-size: 14px }
    .state-box i { font-size: 36px; display: block; margin-bottom: 10px }
    .spinner { width: 30px; height: 30px; border: 3px solid #E2E8F0; border-top-color: #2FA8A0; border-radius: 50%; animation: spin .7s linear infinite; margin: 0 auto 10px }
    @keyframes spin { to { transform: rotate(360deg) } }

    .backdrop { position: fixed; inset: 0; background: rgba(10,20,35,.35); z-index: 1800; backdrop-filter: blur(1px) }
    .rp { position: fixed; top: 70px; right: 0; bottom: 0; width: 560px; background: #fff; box-shadow: -8px 0 40px rgba(10,20,35,.14); border-radius: 16px 0 0 0; z-index: 1801; display: flex; flex-direction: column; animation: rpIn .22s ease both; overflow: hidden }
    @keyframes rpIn { from { opacity: 0; transform: translateX(40px) } to { opacity: 1; transform: none } }
    .rp-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 18px; border-bottom: 1px solid #F0F3F6; flex-shrink: 0 }
    .rp-title { font-size: 16px; font-weight: 700; color: #1A2B3C }
    .rp-close { width: 32px; height: 32px; border: none; background: #F1F5F9; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; color: #4A6080 }
    .rp-close:hover { background: #E2E8F0 }
    .rp-body { flex: 1; overflow-y: auto; padding: 24px }
    .rp-footer { padding: 16px 24px; border-top: 1px solid #F0F3F6; flex-shrink: 0; display: flex; justify-content: flex-end; gap: 10px }

    .detail-section { font-size: 14px; font-weight: 700; color: #1A2B3C; margin: 0 0 12px }
    .detail-divider { border: none; border-top: 1px solid #F0F3F6; margin: 16px 0 }
    .detail-field { display: grid; grid-template-columns: 160px 1fr; align-items: flex-start; gap: 8px; padding: 9px 0; border-bottom: 1px solid #F5F7FA }
    .detail-field:last-of-type { border-bottom: none }
    .detail-lbl { display: flex; align-items: center; gap: 7px; font-size: 12px; color: #8FA3B8 }
    .detail-lbl i { font-size: 14px }
    .detail-val { font-size: 13px; font-weight: 600; color: #1A2B3C; line-height: 1.5 }

    .f-field { margin-bottom: 16px }
    .f-label { display: block; font-size: 13px; font-weight: 600; color: #1A2B3C; margin-bottom: 6px }
    .f-input, .f-select, .f-textarea { width: 100%; padding: 10px 14px; border: 1.5px solid #E2E8F0; border-radius: 9px; font-size: 13.5px; color: #1A2B3C; font-family: 'Inter', sans-serif; outline: none; transition: border .15s; box-sizing: border-box; background: #fff }
    .f-input:focus, .f-select:focus, .f-textarea:focus { border-color: #2FA8A0; box-shadow: 0 0 0 3px rgba(47,168,160,.1) }
    .f-select { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238FA3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px }
    .f-textarea { resize: vertical; min-height: 72px }
    .f-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px }

    .confirm-overlay { position: fixed; inset: 0; background: rgba(10,20,35,.5); z-index: 2000; display: flex; align-items: center; justify-content: center }
    .confirm-box { background: #fff; border-radius: 12px; padding: 28px 32px; max-width: 380px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,.2) }
    .confirm-icon { font-size: 38px; color: #F59E0B; display: block; margin-bottom: 10px }
    .confirm-title { font-size: 15px; font-weight: 700; color: #1A2B3C; margin: 0 0 8px }
    .confirm-msg { font-size: 13px; color: #4A6080; margin: 0 0 22px; line-height: 1.5 }
    .confirm-actions { display: flex; justify-content: flex-end; gap: 10px }

    .toast { position: fixed; bottom: 24px; right: 24px; z-index: 9999; background: #111 !important; color: #fff; padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 500; box-shadow: 0 8px 24px rgba(0,0,0,.18); animation: rpIn .22s ease both }
    .action-row { display: flex; justify-content: flex-end; margin-bottom: 18px }
    .big-action-btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; background: #1B7872; color: #fff; border: none; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background .15s }
    .big-action-btn:hover { background: #1A9690 }

    /* ── Dark Mode ── */
    :host-context([data-theme="dark"]) .page-header { background: #111 !important; box-shadow: none !important }
    :host-context([data-theme="dark"]) .page-title { color: #fff !important }
    :host-context([data-theme="dark"]) .filter-bar { background: #111 !important; box-shadow: none !important }
    :host-context([data-theme="dark"]) .filter-select { background-color: #1A1A1A !important; border-color: #2A2A2A !important; color: #A0A0A0 !important }
    :host-context([data-theme="dark"]) .card { background: #111 !important; box-shadow: none !important }
    :host-context([data-theme="dark"]) .card-head { border-bottom-color: #2A2A2A !important }
    :host-context([data-theme="dark"]) .card-title { color: #fff !important }
    :host-context([data-theme="dark"]) .count-badge { background: #1A1A1A !important; color: #2FA8A0 }
    :host-context([data-theme="dark"]) thead tr { background: #1A1A1A !important }
    :host-context([data-theme="dark"]) thead th { color: #6B6B6B !important; border-bottom: 1px solid #2A2A2A !important }
    :host-context([data-theme="dark"]) tbody tr { background: #111 !important }
    :host-context([data-theme="dark"]) tbody tr:hover { background: rgba(47,168,160,.06) !important }
    :host-context([data-theme="dark"]) tbody td { color: #A0A0A0 !important; border-bottom-color: #2A2A2A !important }
    :host-context([data-theme="dark"]) .td-title { color: #fff !important }
    :host-context([data-theme="dark"]) .rp { background: #111 !important }
    :host-context([data-theme="dark"]) .rp-header { border-bottom-color: #2A2A2A !important }
    :host-context([data-theme="dark"]) .rp-title { color: #fff !important }
    :host-context([data-theme="dark"]) .rp-close { background: #1A1A1A !important; color: #A0A0A0 !important }
    :host-context([data-theme="dark"]) .rp-footer { border-top-color: #2A2A2A !important }
    :host-context([data-theme="dark"]) .detail-section { color: #fff !important }
    :host-context([data-theme="dark"]) .detail-divider { border-top-color: #2A2A2A !important }
    :host-context([data-theme="dark"]) .detail-field { border-bottom-color: #2A2A2A !important }
    :host-context([data-theme="dark"]) .detail-lbl { color: #6B6B6B !important }
    :host-context([data-theme="dark"]) .detail-val { color: #fff !important }
    :host-context([data-theme="dark"]) .f-label { color: #fff !important }
    :host-context([data-theme="dark"]) .f-input { background: #1A1A1A !important; border-color: #2A2A2A !important; color: #fff !important }
    :host-context([data-theme="dark"]) .f-select { background-color: #1A1A1A !important; border-color: #2A2A2A !important; color: #fff !important }
    :host-context([data-theme="dark"]) .f-textarea { background: #1A1A1A !important; border-color: #2A2A2A !important; color: #fff !important }
    :host-context([data-theme="dark"]) .confirm-box { background: #111 !important }
    :host-context([data-theme="dark"]) .confirm-title { color: #fff !important }
    :host-context([data-theme="dark"]) .confirm-msg { color: #A0A0A0 !important }
    :host-context([data-theme="dark"]) .btn-secondary { background: #1A1A1A !important; color: #A0A0A0 !important }
    :host-context([data-theme="dark"]) .act-btn { color: #6B6B6B !important }
    :host-context([data-theme="dark"]) .act-btn:hover { background: #1A1A1A !important; color: #A0A0A0 !important }
    :host-context([data-theme="dark"]) .act-btn--del:hover { background: #3B1219; color: #FCA5A5 }
  `],
  template: `
  <div class="backdrop" *ngIf="showPanel || showForm || confirmItem" (click)="closeAll()"></div>

  <!-- Confirm Delete -->
  <div class="confirm-overlay" *ngIf="confirmItem" (click)="$event.stopPropagation()">
    <div class="confirm-box">
      <i class="bx bx-error confirm-icon"></i>
      <p class="confirm-title">{{ 'TRAINING.CONFIRM_DELETE_TITLE' | translate }}</p>
      <p class="confirm-msg">{{ 'TRAINING.CONFIRM_DELETE_MSG' | translate:{title: confirmItem?.title} }}</p>
      <div class="confirm-actions">
        <button class="btn btn-secondary" (click)="confirmItem=null">{{ 'TRAINING.CANCEL' | translate }}</button>
        <button class="btn btn-danger" (click)="execDelete()">{{ 'TRAINING.CONFIRM_DELETE' | translate }}</button>
      </div>
    </div>
  </div>

  <!-- Detail Panel -->
  <div class="rp" *ngIf="showPanel && selected">
    <div class="rp-header">
      <span class="rp-title">{{ 'TRAINING.DETAIL_TITLE' | translate }}</span>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary" style="padding:7px 14px;font-size:12px" (click)="openEdit(selected)">
          <i class="bx bx-edit-alt"></i> {{ 'TRAINING.BTN_EDIT' | translate }}
        </button>
        <button class="rp-close" (click)="closeAll()"><i class="bx bx-x"></i></button>
      </div>
    </div>
    <div class="rp-body">
      <p class="detail-section">{{ selected.title }}</p>
      <div class="detail-field">
        <span class="detail-lbl"><i class="bx bx-category"></i> {{ 'TRAINING.FIELD_CATEGORY' | translate }}</span>
        <span class="detail-val"><span class="chip {{categoryChip(selected.category)}}">{{ selected.category }}</span></span>
      </div>
      <div class="detail-field">
        <span class="detail-lbl"><i class="bx bx-calendar"></i> {{ 'TRAINING.FIELD_START_DATE' | translate }}</span>
        <span class="detail-val">{{ selected.startDate | date:'dd/MM/yyyy' }}</span>
      </div>
      <div class="detail-field">
        <span class="detail-lbl"><i class="bx bx-calendar-check"></i> {{ 'TRAINING.FIELD_END_DATE' | translate }}</span>
        <span class="detail-val">{{ selected.endDate | date:'dd/MM/yyyy' }}</span>
      </div>
      <div class="detail-field">
        <span class="detail-lbl"><i class="bx bx-map-pin"></i> {{ 'TRAINING.FIELD_LOCATION' | translate }}</span>
        <span class="detail-val">{{ selected.location }}</span>
      </div>
      <div class="detail-field" *ngIf="selected.trainerName">
        <span class="detail-lbl"><i class="bx bx-user"></i> {{ 'TRAINING.FIELD_TRAINER' | translate }}</span>
        <span class="detail-val">{{ selected.trainerName }}</span>
      </div>
      <div class="detail-field">
        <span class="detail-lbl"><i class="bx bx-group"></i> {{ 'TRAINING.FIELD_PARTICIPANTS' | translate }}</span>
        <span class="detail-val">{{ selected.participantCount }}<span *ngIf="selected.maxParticipants"> / {{ selected.maxParticipants }}</span></span>
      </div>
      <div class="detail-field" *ngIf="selected.cost">
        <span class="detail-lbl"><i class="bx bx-money"></i> {{ 'TRAINING.FIELD_COST' | translate }}</span>
        <span class="detail-val">{{ selected.cost | number:'1.2-2' }}</span>
      </div>
      <div class="detail-field">
        <span class="detail-lbl"><i class="bx bx-loader-circle"></i> {{ 'TRAINING.FIELD_STATUS' | translate }}</span>
        <span class="detail-val"><span class="chip {{statusChip(selected.status)}}">{{ statusLabel(selected.status) }}</span></span>
      </div>
      <div class="detail-field" *ngIf="selected.description">
        <span class="detail-lbl"><i class="bx bx-info-circle"></i> {{ 'TRAINING.FIELD_DESCRIPTION' | translate }}</span>
        <span class="detail-val" style="white-space:pre-wrap">{{ selected.description }}</span>
      </div>
      <div *ngIf="selected.participantNames?.length">
        <hr class="detail-divider">
        <p class="detail-section" style="font-size:13px">{{ 'TRAINING.PARTICIPANTS_LIST' | translate }}</p>
        <div *ngFor="let name of selected.participantNames" style="font-size:13px;color:#4A6080;padding:4px 0;border-bottom:1px solid #F5F7FA">
          <i class="bx bx-user-check" style="color:#2FA8A0;margin-right:6px"></i>{{ name }}
        </div>
      </div>
    </div>
    <div class="rp-footer">
      <select class="f-select" style="width:auto;min-width:160px" [(ngModel)]="statusUpdateVal" (change)="changeStatus(selected.id, statusUpdateVal)">
        <option value="PLANNED">{{ 'TRAINING.STATUS_PLANNED' | translate }}</option>
        <option value="ONGOING">{{ 'TRAINING.STATUS_ONGOING' | translate }}</option>
        <option value="COMPLETED">{{ 'TRAINING.STATUS_COMPLETED' | translate }}</option>
        <option value="CANCELLED">{{ 'TRAINING.STATUS_CANCELLED' | translate }}</option>
      </select>
    </div>
  </div>

  <!-- Create / Edit Form Panel -->
  <div class="rp" *ngIf="showForm">
    <div class="rp-header">
      <span class="rp-title">{{ editMode ? ('TRAINING.FORM_EDIT_TITLE' | translate) : ('TRAINING.FORM_NEW_TITLE' | translate) }}</span>
      <button class="rp-close" (click)="closeAll()"><i class="bx bx-x"></i></button>
    </div>
    <div class="rp-body">
      <div class="f-field">
        <label class="f-label">{{ 'TRAINING.FIELD_TITLE' | translate }} *</label>
        <input class="f-input" [(ngModel)]="form.title" [placeholder]="'TRAINING.FIELD_TITLE' | translate" />
      </div>
      <div class="f-field">
        <label class="f-label">{{ 'TRAINING.FIELD_DESCRIPTION' | translate }}</label>
        <textarea class="f-textarea" [(ngModel)]="form.description" [placeholder]="'TRAINING.FIELD_DESCRIPTION' | translate"></textarea>
      </div>
      <div class="f-row">
        <div class="f-field">
          <label class="f-label">{{ 'TRAINING.FIELD_CATEGORY' | translate }} *</label>
          <select class="f-select" [(ngModel)]="form.category">
            <option value="">-- {{ 'TRAINING.FIELD_CATEGORY' | translate }} --</option>
            <option value="TECHNICAL">{{ 'TRAINING.CAT_TECHNICAL' | translate }}</option>
            <option value="SOFT_SKILLS">{{ 'TRAINING.CAT_SOFT_SKILLS' | translate }}</option>
            <option value="COMPLIANCE">{{ 'TRAINING.CAT_COMPLIANCE' | translate }}</option>
            <option value="MANAGEMENT">{{ 'TRAINING.CAT_MANAGEMENT' | translate }}</option>
            <option value="OTHER">{{ 'TRAINING.CAT_OTHER' | translate }}</option>
          </select>
        </div>
        <div class="f-field">
          <label class="f-label">{{ 'TRAINING.FIELD_LOCATION' | translate }} *</label>
          <select class="f-select" [(ngModel)]="form.location">
            <option value="">-- {{ 'TRAINING.FIELD_LOCATION' | translate }} --</option>
            <option value="ONSITE">{{ 'TRAINING.LOC_ONSITE' | translate }}</option>
            <option value="ONLINE">{{ 'TRAINING.LOC_ONLINE' | translate }}</option>
            <option value="HYBRID">{{ 'TRAINING.LOC_HYBRID' | translate }}</option>
          </select>
        </div>
      </div>
      <div class="f-row">
        <div class="f-field">
          <label class="f-label">{{ 'TRAINING.FIELD_START_DATE' | translate }} *</label>
          <input class="f-input" type="date" [(ngModel)]="form.startDate" />
        </div>
        <div class="f-field">
          <label class="f-label">{{ 'TRAINING.FIELD_END_DATE' | translate }} *</label>
          <input class="f-input" type="date" [(ngModel)]="form.endDate" />
        </div>
      </div>
      <div class="f-row">
        <div class="f-field">
          <label class="f-label">{{ 'TRAINING.FIELD_TRAINER' | translate }}</label>
          <input class="f-input" [(ngModel)]="form.trainerName" [placeholder]="'TRAINING.FIELD_TRAINER' | translate" />
        </div>
        <div class="f-field">
          <label class="f-label">{{ 'TRAINING.FIELD_MAX_PARTICIPANTS' | translate }}</label>
          <input class="f-input" type="number" [(ngModel)]="form.maxParticipants" min="1" placeholder="—" />
        </div>
      </div>
      <div class="f-field">
        <label class="f-label">{{ 'TRAINING.FIELD_COST' | translate }}</label>
        <input class="f-input" type="number" [(ngModel)]="form.cost" min="0" step="0.01" placeholder="0.00" />
      </div>
    </div>
    <div class="rp-footer">
      <button class="btn btn-secondary" (click)="closeAll()">{{ 'TRAINING.CANCEL' | translate }}</button>
      <button class="btn btn-primary" [disabled]="saving" (click)="save()">
        {{ saving ? ('TRAINING.SAVING' | translate) : ('TRAINING.SAVE' | translate) }}
      </button>
    </div>
  </div>

  <div class="toast" *ngIf="toast">{{ toast }}</div>

  <div class="page">
    <div class="page-header">
      <h4 class="page-title"><i class="bx bxs-graduation" style="margin-right:8px;color:#1B7872"></i>{{ 'TRAINING.TITLE' | translate }}</h4>
    </div>

    <div class="action-row">
      <button class="big-action-btn" (click)="openCreate()">
        <i class="bx bx-plus"></i> {{ 'TRAINING.BTN_NEW' | translate }}
      </button>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <select class="filter-select" [(ngModel)]="filterCategory">
        <option value="">{{ 'TRAINING.FILTER_ALL_CATEGORIES' | translate }}</option>
        <option value="TECHNICAL">{{ 'TRAINING.CAT_TECHNICAL' | translate }}</option>
        <option value="SOFT_SKILLS">{{ 'TRAINING.CAT_SOFT_SKILLS' | translate }}</option>
        <option value="COMPLIANCE">{{ 'TRAINING.CAT_COMPLIANCE' | translate }}</option>
        <option value="MANAGEMENT">{{ 'TRAINING.CAT_MANAGEMENT' | translate }}</option>
        <option value="OTHER">{{ 'TRAINING.CAT_OTHER' | translate }}</option>
      </select>
      <select class="filter-select" [(ngModel)]="filterStatus">
        <option value="">{{ 'TRAINING.FILTER_ALL_STATUSES' | translate }}</option>
        <option value="PLANNED">{{ 'TRAINING.STATUS_PLANNED' | translate }}</option>
        <option value="ONGOING">{{ 'TRAINING.STATUS_ONGOING' | translate }}</option>
        <option value="COMPLETED">{{ 'TRAINING.STATUS_COMPLETED' | translate }}</option>
        <option value="CANCELLED">{{ 'TRAINING.STATUS_CANCELLED' | translate }}</option>
      </select>
    </div>

    <div class="card">
      <div class="card-head">
        <span class="card-title">{{ 'TRAINING.CARD_TITLE' | translate }}</span>
        <span class="count-badge">{{ filteredSessions.length }}</span>
      </div>

      <div class="state-box" *ngIf="loading"><div class="spinner"></div>{{ 'TRAINING.LOADING' | translate }}</div>
      <div class="state-box" style="color:#EF4444" *ngIf="!loading && error">
        <i class="bx bx-error-circle"></i>{{ error }}
      </div>
      <div class="state-box" *ngIf="!loading && !error && filteredSessions.length === 0">
        <i class="bx bxs-graduation"></i>{{ 'TRAINING.NO_SESSIONS' | translate }}
      </div>

      <div style="overflow-x:auto" *ngIf="!loading && !error && filteredSessions.length > 0">
        <table>
          <thead><tr>
            <th>{{ 'TRAINING.TABLE_TITLE' | translate }}</th>
            <th>{{ 'TRAINING.TABLE_CATEGORY' | translate }}</th>
            <th>{{ 'TRAINING.TABLE_DATES' | translate }}</th>
            <th>{{ 'TRAINING.TABLE_TRAINER' | translate }}</th>
            <th>{{ 'TRAINING.TABLE_CAPACITY' | translate }}</th>
            <th>{{ 'TRAINING.TABLE_STATUS' | translate }}</th>
            <th>{{ 'TRAINING.TABLE_ACTIONS' | translate }}</th>
          </tr></thead>
          <tbody>
            <tr *ngFor="let t of filteredSessions; trackBy: trackById" (click)="openDetail(t)">
              <td class="td-title">{{ t.title }}</td>
              <td><span class="chip {{categoryChip(t.category)}}">{{ t.category }}</span></td>
              <td>
                {{ t.startDate | date:'dd/MM/yyyy' }}<br>
                <span style="color:#8FA3B8;font-size:11px">→ {{ t.endDate | date:'dd/MM/yyyy' }}</span>
              </td>
              <td>{{ t.trainerName || '—' }}</td>
              <td>{{ t.participantCount }}<span *ngIf="t.maxParticipants"> / {{ t.maxParticipants }}</span></td>
              <td><span class="chip {{statusChip(t.status)}}">{{ statusLabel(t.status) }}</span></td>
              <td (click)="$event.stopPropagation()">
                <button class="act-btn" (click)="openEdit(t)"><i class="bx bx-edit-alt"></i></button>
                <button class="act-btn act-btn--del" (click)="confirmItem = t"><i class="bx bx-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class TrainingComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  sessions:  TrainingSession[] = [];
  loading  = false;
  error: string | null = null;

  filterCategory = '';
  filterStatus   = '';

  showPanel = false;
  showForm  = false;
  editMode  = false;
  editId: number | null = null;
  saving = false;
  selected: TrainingSession | null = null;
  confirmItem: TrainingSession | null = null;
  toast: string | null = null;
  statusUpdateVal = 'PLANNED';

  form: any = this.emptyForm();

  get filteredSessions(): TrainingSession[] {
    return this.sessions.filter(t => {
      const matchCat    = !this.filterCategory || t.category === this.filterCategory;
      const matchStatus = !this.filterStatus   || t.status   === this.filterStatus;
      return matchCat && matchStatus;
    });
  }

  constructor(
    private trainingService: TrainingService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void { this.load(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  load(): void {
    this.loading = true;
    this.error = null;
    this.trainingService.getAll(0, 200).pipe(
      map((r: any) => r?.content ?? r?.data ?? (Array.isArray(r) ? r : [])),
      catchError((e: any) => {
        this.error = e?.error?.message || this.translate.instant('TRAINING.LOAD_ERROR');
        this.loading = false;
        return [];
      }),
      takeUntil(this.destroy$)
    ).subscribe((data: TrainingSession[]) => {
      this.sessions = data;
      this.loading = false;
    });
  }

  trackById(_: number, item: any): any { return item.id ?? _; }

  categoryChip(cat: string): string { return CATEGORY_CHIP[cat] ?? 'chip-secondary'; }
  statusChip(s: string): string     { return STATUS_CHIP[s]    ?? 'chip-secondary'; }

  statusLabel(s: string): string {
    const keyMap: Record<string, string> = {
      PLANNED:   'TRAINING.STATUS_PLANNED',
      ONGOING:   'TRAINING.STATUS_ONGOING',
      COMPLETED: 'TRAINING.STATUS_COMPLETED',
      CANCELLED: 'TRAINING.STATUS_CANCELLED',
    };
    const key = keyMap[s];
    return key ? this.translate.instant(key) : s;
  }

  openDetail(t: TrainingSession): void {
    this.selected = t;
    this.statusUpdateVal = t.status ?? 'PLANNED';
    this.showPanel = true;
    this.showForm  = false;
  }

  openCreate(): void {
    this.editMode = false;
    this.editId   = null;
    this.form     = this.emptyForm();
    this.showForm  = true;
    this.showPanel = false;
  }

  openEdit(t: TrainingSession): void {
    this.editMode = true;
    this.editId   = t.id ?? null;
    this.form = {
      title:           t.title,
      description:     t.description || '',
      category:        t.category,
      startDate:       t.startDate,
      endDate:         t.endDate,
      location:        t.location,
      trainerName:     t.trainerName     || '',
      maxParticipants: t.maxParticipants ?? null,
      cost:            t.cost            ?? null,
    };
    this.showForm  = true;
    this.showPanel = false;
  }

  save(): void {
    this.saving = true;
    const req = this.editMode && this.editId
      ? this.trainingService.update(this.editId, this.form)
      : this.trainingService.create(this.form);

    req.pipe(takeUntil(this.destroy$)).subscribe({
      next: (saved: TrainingSession) => {
        if (this.editMode) {
          this.sessions = this.sessions.map(t => t.id === saved.id ? saved : t);
        } else {
          this.sessions = [saved, ...this.sessions];
        }
        this.saving = false;
        this.closeAll();
        this.showToast(this.translate.instant(this.editMode ? 'TRAINING.TOAST_UPDATED' : 'TRAINING.TOAST_CREATED'));
      },
      error: (e: any) => {
        this.saving = false;
        this.showToast(e?.error?.message || this.translate.instant('TRAINING.TOAST_ERROR'));
      }
    });
  }

  changeStatus(id: number | undefined, status: string): void {
    if (!id) return;
    this.trainingService.updateStatus(id, status).pipe(takeUntil(this.destroy$)).subscribe({
      next: (updated: TrainingSession) => {
        this.sessions = this.sessions.map(t => t.id === updated.id ? updated : t);
        if (this.selected?.id === updated.id) this.selected = updated;
        this.showToast(this.translate.instant('TRAINING.TOAST_STATUS_UPDATED'));
      },
      error: (e: any) => this.showToast(e?.error?.message || this.translate.instant('TRAINING.TOAST_ERROR'))
    });
  }

  execDelete(): void {
    const item = this.confirmItem!;
    this.confirmItem = null;
    this.trainingService.delete(item.id!).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.sessions = this.sessions.filter(t => t.id !== item.id);
        this.showToast(this.translate.instant('TRAINING.TOAST_DELETED'));
      },
      error: (e: any) => this.showToast(e?.error?.message || this.translate.instant('TRAINING.TOAST_ERROR'))
    });
  }

  closeAll(): void {
    this.showPanel = false;
    this.showForm  = false;
    this.selected  = null;
    this.confirmItem = null;
    this.saving    = false;
  }

  private showToast(msg: string): void {
    this.toast = msg;
    setTimeout(() => this.toast = null, 3500);
  }

  private emptyForm() {
    return {
      title: '', description: '', category: '', startDate: '', endDate: '',
      location: '', trainerName: '', maxParticipants: null as number | null, cost: null as number | null
    };
  }
}
