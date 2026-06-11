import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, catchError, takeUntil } from 'rxjs/operators';
import { throwError, Subject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WallClockComponent } from 'src/app/shared/wall-clock/wall-clock.component';

const BASE = `${environment.apiUrl}/public-holidays`;

@Component({
  selector: 'app-public-holidays',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, WallClockComponent],
  styles: [`
    :host{display:block}
    .page{padding:0 24px 60px;font-family:'Inter',sans-serif;animation:fadeIn .35s ease both}
    @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

    .page-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);margin-bottom:18px}
    .page-title{font-size:22px;font-weight:700;color:#1A2B3C;margin:0}
    .header-right{display:flex;gap:10px;align-items:center}

    .btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s}
    .btn:disabled{opacity:.5;cursor:default}
    .btn-primary{background:#1B7872 !important;color:#fff !important;border-color:#1B7872 !important}.btn-primary:hover:not(:disabled){background:#1A9690 !important;border-color:#1A9690 !important}
    .btn-secondary{background:#F1F5F9;color:#4A6080}.btn-secondary:hover:not(:disabled){background:#E2E8F0}
    .btn-danger{background:#FEE2E2;color:#BE123C}.btn-danger:hover:not(:disabled){background:#FECACA}

    .card{background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);overflow:hidden}
    .card-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #F0F3F6}
    .card-title{font-size:14px;font-weight:700;color:#1A2B3C}
    .count-badge{background:#E8F7F6;color:#1B7872;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:700}

    table{width:100%;border-collapse:collapse}
    thead tr{background:#FAFBFC}
    thead th{padding:10px 16px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8FA3B8;border-bottom:1px solid #F0F3F6;text-align:left}
    tbody tr{transition:background .15s}
    tbody tr:hover{background:#F8FAFC}
    tbody td{padding:12px 16px;font-size:13px;color:#4A6080;border-bottom:1px solid #F5F7FA;vertical-align:middle}
    tbody tr:last-child td{border-bottom:none}
    .td-name{font-weight:600;color:#1A2B3C}
    .chip-rec{background:#DCFCE7;color:#15803D;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:700}
    .chip-one{background:#FEF3C7;color:#92400E;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:700}
    .act-btn{background:none;border:none;padding:4px 7px;border-radius:6px;cursor:pointer;font-size:14px;color:#B0BEC5;transition:all .15s}
    .act-btn:hover{background:#F1F5F9;color:#4A6080}
    .act-btn--del:hover{background:#FEE2E2;color:#BE123C}

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
    .f-label{display:block;font-size:13px;font-weight:600;color:#1A2B3C;margin-bottom:6px}
    .f-input,.f-select{width:100%;padding:10px 14px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:#1A2B3C;font-family:'Inter',sans-serif;outline:none;transition:border .15s;box-sizing:border-box}
    .f-input:focus,.f-select:focus{border-color:#2FA8A0;box-shadow:0 0 0 3px rgba(47,168,160,.1)}
    .f-select{appearance:none;cursor:pointer;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238FA3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 14px center;padding-right:36px}
    .f-check-row{display:flex;align-items:center;gap:10px;font-size:13.5px;color:#4A6080}
    .f-check-row input[type=checkbox]{width:16px;height:16px;accent-color:#1B7872;cursor:pointer}

    .confirm-overlay{position:fixed;inset:0;background:rgba(10,20,35,.5);z-index:2000;display:flex;align-items:center;justify-content:center}
    .confirm-box{background:#fff;border-radius:12px;padding:28px 32px;max-width:380px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.2)}
    .confirm-icon{font-size:38px;color:#F59E0B;display:block;margin-bottom:10px}
    .confirm-title{font-size:15px;font-weight:700;color:#1A2B3C;margin:0 0 8px}
    .confirm-msg{font-size:13px;color:#4A6080;margin:0 0 22px;line-height:1.5}
    .confirm-actions{display:flex;justify-content:flex-end;gap:10px}

    .toast{position:fixed;bottom:24px;right:24px;z-index:9999;background:#1A2B3C;color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.18);animation:rpIn .22s ease both}
    .big-action-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;background:#1B7872;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s;white-space:nowrap}
    .big-action-btn:hover{background:#1A9690}
    .big-action-btn i{font-size:15px}
    .action-row{display:flex;justify-content:flex-end;margin-bottom:18px}

    /* ── Dark Mode ── */
    :host-context([data-theme="dark"]) .count-badge{background:rgba(47,168,160,.15) !important;color:#2FA8A0 !important}
    :host-context([data-theme="dark"]) .td-name{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .chip-rec{background:rgba(21,128,61,.2) !important;color:#4ade80 !important}
    :host-context([data-theme="dark"]) .chip-one{background:rgba(146,64,14,.2) !important;color:#fbbf24 !important}
    :host-context([data-theme="dark"]) .act-btn{color:#6B6B6B !important}
    :host-context([data-theme="dark"]) .act-btn:hover{background:#1A1A1A !important;color:#A0A0A0 !important}
    :host-context([data-theme="dark"]) .act-btn--del:hover{background:#3B0A0A !important;color:#F87171 !important}
    :host-context([data-theme="dark"]) .state-box{color:#6B6B6B !important}
    :host-context([data-theme="dark"]) .rp{background:#111111 !important;box-shadow:-8px 0 40px rgba(0,0,0,.5) !important}
    :host-context([data-theme="dark"]) .rp-header{border-bottom-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .rp-title{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .rp-close{background:#1A1A1A !important;color:#A0A0A0 !important}
    :host-context([data-theme="dark"]) .rp-close:hover{background:#2A2A2A !important;color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .rp-footer{border-top-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .f-label{color:#A0A0A0 !important}
    :host-context([data-theme="dark"]) .f-input{background:#1A1A1A !important;border-color:#2A2A2A !important;color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .f-select{background-color:#1A1A1A !important;border-color:#2A2A2A !important;color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .f-input:focus{border-color:#2FA8A0 !important;box-shadow:0 0 0 3px rgba(47,168,160,.15) !important}
    :host-context([data-theme="dark"]) .f-select:focus{border-color:#2FA8A0 !important;box-shadow:0 0 0 3px rgba(47,168,160,.15) !important}
    :host-context([data-theme="dark"]) .f-check-row{color:#A0A0A0 !important}
    :host-context([data-theme="dark"]) .confirm-box{background:#111111 !important;box-shadow:0 20px 60px rgba(0,0,0,.6) !important}
    :host-context([data-theme="dark"]) .confirm-title{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .confirm-msg{color:#A0A0A0 !important}
    :host-context([data-theme="dark"]) .btn-secondary{background:#1A1A1A !important;border:1px solid #2A2A2A !important;color:#A0A0A0 !important}
    :host-context([data-theme="dark"]) .btn-secondary:hover:not(:disabled){background:#2A2A2A !important}
  `],
  template: `
  <div class="backdrop" *ngIf="showPanel || confirmItem" (click)="closeAll()"></div>

  <div class="confirm-overlay" *ngIf="confirmItem" (click)="$event.stopPropagation()">
    <div class="confirm-box">
      <i class="bx bx-error confirm-icon"></i>
      <p class="confirm-title">{{ 'PUBLIC_HOLIDAYS.CONFIRM_DELETE_TITLE' | translate }}</p>
      <p class="confirm-msg">{{ 'PUBLIC_HOLIDAYS.CONFIRM_DELETE_MSG' | translate:{name: confirmItem?.name} }}</p>
      <div class="confirm-actions">
        <button class="btn btn-secondary" (click)="confirmItem=null">{{ 'PUBLIC_HOLIDAYS.CONFIRM_CANCEL' | translate }}</button>
        <button class="btn btn-danger" (click)="execDelete()">{{ 'PUBLIC_HOLIDAYS.CONFIRM_DELETE' | translate }}</button>
      </div>
    </div>
  </div>

  <!-- Side panel -->
  <div class="rp" *ngIf="showPanel">
    <div class="rp-header">
      <span class="rp-title">{{ editMode ? ('PUBLIC_HOLIDAYS.PANEL_EDIT_TITLE' | translate) : ('PUBLIC_HOLIDAYS.PANEL_NEW_TITLE' | translate) }}</span>
      <button class="rp-close" (click)="closeAll()"><i class="bx bx-x"></i></button>
    </div>
    <div class="rp-body">
      <div class="f-field">
        <label class="f-label">{{ 'PUBLIC_HOLIDAYS.FIELD_NAME' | translate }}</label>
        <input class="f-input" [(ngModel)]="form.name" [placeholder]="'PUBLIC_HOLIDAYS.NAME_PH' | translate" />
      </div>
      <div class="f-field">
        <label class="f-label">{{ 'PUBLIC_HOLIDAYS.FIELD_DATE' | translate }}</label>
        <input class="f-input" type="date" [(ngModel)]="form.holidayDate" />
      </div>
      <div class="f-field">
        <label class="f-label">{{ 'PUBLIC_HOLIDAYS.FIELD_COUNTRY_CODE' | translate }}</label>
        <input class="f-input" [(ngModel)]="form.countryCode" [placeholder]="'PUBLIC_HOLIDAYS.COUNTRY_CODE_PH' | translate" maxlength="5" />
      </div>
      <div class="f-field">
        <label class="f-check-row">
          <input type="checkbox" [(ngModel)]="form.recurring" />
          {{ 'PUBLIC_HOLIDAYS.FIELD_RECURRING' | translate }}
        </label>
      </div>
    </div>
    <div class="rp-footer">
      <button class="btn btn-secondary" (click)="closeAll()">{{ 'PUBLIC_HOLIDAYS.CANCEL' | translate }}</button>
      <button class="btn btn-primary" [disabled]="saving" (click)="save()">
        {{ saving ? ('PUBLIC_HOLIDAYS.SAVING' | translate) : ('PUBLIC_HOLIDAYS.SAVE' | translate) }}
      </button>
    </div>
  </div>

  <div class="toast" *ngIf="toast">{{ toast }}</div>

  <div class="page">
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
      <div class="page-header" style="flex:1;margin-bottom:0;">
        <h4 class="page-title">{{ 'PUBLIC_HOLIDAYS.TITLE' | translate }}</h4>
      </div>
      <app-wall-clock></app-wall-clock>
    </div>
    <!-- Action row -->
    <div class="action-row">
      <button class="big-action-btn" (click)="openCreate()">
        <i class="bx bx-plus"></i> {{ 'PUBLIC_HOLIDAYS.BTN_NEW' | translate }}
      </button>
    </div>

    <div class="card">
      <div class="card-head">
        <span class="card-title">{{ 'PUBLIC_HOLIDAYS.CARD_TITLE' | translate }}</span>
        <span class="count-badge">{{ holidays.length }}</span>
      </div>

      <div class="state-box" *ngIf="loading"><div class="spinner"></div>{{ 'PUBLIC_HOLIDAYS.LOADING' | translate }}</div>
      <div class="state-box" style="color:#EF4444" *ngIf="!loading && error">
        <i class="bx bx-error-circle"></i>{{ error }}
      </div>
      <div class="state-box" *ngIf="!loading && !error && holidays.length===0">
        <i class="bx bx-calendar-x"></i>{{ 'PUBLIC_HOLIDAYS.NO_HOLIDAYS' | translate }}
      </div>

      <div style="overflow-x:auto" *ngIf="!loading && !error && holidays.length>0">
        <table>
          <thead><tr>
            <th>{{ 'PUBLIC_HOLIDAYS.TABLE_NAME' | translate }}</th><th>{{ 'PUBLIC_HOLIDAYS.TABLE_DATE' | translate }}</th><th>{{ 'PUBLIC_HOLIDAYS.TABLE_COUNTRY_CODE' | translate }}</th><th>{{ 'PUBLIC_HOLIDAYS.TABLE_TYPE' | translate }}</th><th>{{ 'PUBLIC_HOLIDAYS.TABLE_ACTIONS' | translate }}</th>
          </tr></thead>
          <tbody>
            <tr *ngFor="let h of holidays; trackBy: trackById">
              <td class="td-name">{{ h.name }}</td>
              <td>{{ h.holidayDate | date:'dd/MM/yyyy' }}</td>
              <td>{{ h.countryCode || 'MA' }}</td>
              <td>
                <span [class]="h.recurring ? 'chip-rec' : 'chip-one'">
                  {{ h.recurring ? ('PUBLIC_HOLIDAYS.TYPE_ANNUAL' | translate) : ('PUBLIC_HOLIDAYS.TYPE_PUNCTUAL' | translate) }}
                </span>
              </td>
              <td (click)="$event.stopPropagation()">
                <button class="act-btn" (click)="openEdit(h)"><i class="bx bx-edit-alt"></i></button>
                <button class="act-btn act-btn--del" (click)="confirmItem=h"><i class="bx bx-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class PublicHolidaysComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  holidays: any[] = [];
  loading  = false;
  error: string | null = null;

  showPanel = false;
  editMode  = false;
  editId: number | null = null;
  saving = false;
  confirmItem: any = null;
  toast: string | null = null;

  form: any = this.emptyForm();

  constructor(private http: HttpClient, private translate: TranslateService) {}

  ngOnInit(): void { this.load(); }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  load(): void {
    this.loading = true;
    this.http.get<any>(BASE).pipe(
      map(r => r?.content ?? r?.data ?? (Array.isArray(r) ? r : [])),
      catchError(e => { this.error = e?.error?.message || 'Erreur de chargement'; this.loading = false; return []; }),
      takeUntil(this.destroy$)
    ).subscribe(d => { this.holidays = d; this.loading = false; });
  }

  trackById(_: number, item: any): any { return item.id ?? _; }
  trackByIndex(index: number): number { return index; }

  openCreate(): void { this.editMode = false; this.editId = null; this.form = this.emptyForm(); this.showPanel = true; }

  openEdit(item: any): void {
    this.editMode = true;
    this.editId = item.id;
    this.form = { name: item.name, holidayDate: item.holidayDate, countryCode: item.countryCode || 'MA', recurring: item.recurring };
    this.showPanel = true;
  }

  save(): void {
    this.saving = true;
    const req = this.editMode && this.editId
      ? this.http.put<any>(`${BASE}/${this.editId}`, this.form)
      : this.http.post<any>(BASE, this.form);
    req.pipe(map(r => r?.data ?? r)).subscribe({
      next: h => {
        if (this.editMode) this.holidays = this.holidays.map(x => x.id === h.id ? h : x);
        else this.holidays = [h, ...this.holidays];
        this.saving = false; this.closeAll();
        this.showToast(this.translate.instant(this.editMode ? 'PUBLIC_HOLIDAYS.TOAST_UPDATED' : 'PUBLIC_HOLIDAYS.TOAST_CREATED'));
      },
      error: e => { this.saving = false; this.showToast(e?.error?.message || this.translate.instant('PUBLIC_HOLIDAYS.TOAST_ERROR')); }
    });
  }

  execDelete(): void {
    const item = this.confirmItem;
    this.confirmItem = null;
    this.http.delete<void>(`${BASE}/${item.id}`).subscribe({
      next: () => { this.holidays = this.holidays.filter(h => h.id !== item.id); this.showToast(this.translate.instant('PUBLIC_HOLIDAYS.TOAST_DELETED')); },
      error: e => this.showToast(e?.error?.message || this.translate.instant('PUBLIC_HOLIDAYS.TOAST_ERROR'))
    });
  }

  closeAll(): void { this.showPanel = false; this.confirmItem = null; this.saving = false; }

  private showToast(msg: string): void { this.toast = msg; setTimeout(() => this.toast = null, 3500); }
  private emptyForm() { return { name: '', holidayDate: '', countryCode: 'MA', recurring: true }; }
}
