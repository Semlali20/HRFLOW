import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CollaborateurService } from 'src/app/core/services/collaborateur.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WallClockComponent } from 'src/app/shared/wall-clock/wall-clock.component';

const BASE_DOCS = `${environment.apiUrl}/documents`;

const CATEGORIES = ['CONTRACT','IDENTITY','DIPLOMA','MEDICAL','PAYSLIP','EVALUATION','OTHER'];
const CAT_LABELS: Record<string,string> = {
  CONTRACT:'Contrat', IDENTITY:'Identité', DIPLOMA:'Diplôme',
  MEDICAL:'Médical', PAYSLIP:'Bulletin', EVALUATION:'Évaluation', OTHER:'Autre'
};

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, WallClockComponent],
  styles: [`
    :host{display:block}
    .page{padding:0 24px 60px;font-family:'Inter',sans-serif;animation:fadeIn .35s ease both}
    @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

    .page-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);margin-bottom:18px}
    .page-title{font-size:22px;font-weight:700;color:#1A2B3C;margin:0}
    .header-right{display:flex;gap:10px;align-items:center}

    .filter-bar{display:flex;align-items:center;gap:12px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);padding:12px 18px;margin-bottom:18px}
    .search-wrap{display:flex;align-items:center;gap:8px;border:1.5px solid #E2E8F0;border-radius:9px;padding:8px 14px;flex:1;max-width:320px}
    .search-wrap i{color:#8FA3B8;font-size:16px;flex-shrink:0}
    .search-wrap input{border:none;outline:none;font-size:13px;color:#1A2B3C;width:100%;background:transparent}
    .search-wrap input::placeholder{color:#C0CDD8}
    .filter-select{padding:8px 32px 8px 12px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13px;color:#4A6080;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238FA3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 10px center;appearance:none;outline:none;cursor:pointer}
    .filter-select:focus{border-color:#2FA8A0}

    .btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s}
    .btn:disabled{opacity:.5;cursor:default}
    .btn-primary{background:#1B7872;color:#fff}.btn-primary:hover:not(:disabled){background:#1A9690}
    .btn-secondary{background:#F1F5F9;color:#4A6080}.btn-secondary:hover:not(:disabled){background:#E2E8F0}
    .btn-danger{background:#FEE2E2;color:#BE123C}.btn-danger:hover:not(:disabled){background:#FECACA}

    .card{background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);overflow:hidden}
    .card-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #F0F3F6}
    .card-title{font-size:14px;font-weight:700;color:#1A2B3C}

    .alert-banner{background:#FEF3C7;border:1px solid #F59E0B;border-radius:10px;padding:12px 16px;margin-bottom:18px;display:flex;align-items:center;gap:10px;font-size:13px;color:#92400E}
    .alert-banner i{font-size:18px;color:#F59E0B;flex-shrink:0}

    table{width:100%;border-collapse:collapse}
    thead tr{background:#FAFBFC}
    thead th{padding:10px 16px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8FA3B8;border-bottom:1px solid #F0F3F6;text-align:left}
    tbody tr{transition:background .15s}
    tbody tr:hover{background:#F8FAFC}
    tbody td{padding:12px 16px;font-size:13px;color:#4A6080;border-bottom:1px solid #F5F7FA;vertical-align:middle}
    tbody tr:last-child td{border-bottom:none}
    .td-name{font-weight:600;color:#1A2B3C}
    .td-file{font-size:12px;color:#8FA3B8;font-style:italic}
    .chip{display:inline-flex;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:700}
    .chip-CONTRACT{background:#DBEAFE;color:#1E40AF}
    .chip-IDENTITY{background:#EDE9FE;color:#6D28D9}
    .chip-DIPLOMA{background:#D1FAE5;color:#065F46}
    .chip-MEDICAL{background:#FFE4E6;color:#BE123C}
    .chip-PAYSLIP{background:#FEF3C7;color:#92400E}
    .chip-EVALUATION{background:#E8F7F6;color:#1B7872}
    .chip-OTHER{background:#F1F5F9;color:#4A6080}
    .chip-expired{background:#FFE4E6;color:#BE123C;margin-left:6px}
    .act-btn{background:none;border:none;padding:4px 7px;border-radius:6px;cursor:pointer;font-size:14px;color:#B0BEC5;transition:all .15s}
    .act-btn:hover{background:#F1F5F9;color:#4A6080}
    .act-btn--del:hover{background:#FEE2E2;color:#BE123C}

    .state-box{padding:48px 0;text-align:center;color:#8FA3B8;font-size:14px}
    .state-box i{font-size:36px;display:block;margin-bottom:10px}
    .spinner{width:30px;height:30px;border:3px solid #E2E8F0;border-top-color:#2FA8A0;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 10px}
    @keyframes spin{to{transform:rotate(360deg)}}

    .backdrop{position:fixed;inset:0;background:rgba(10,20,35,.35);z-index:1800;backdrop-filter:blur(1px)}
    .rp{position:fixed;top:70px;right:0;bottom:0;width:480px;background:#fff;box-shadow:-8px 0 40px rgba(10,20,35,.14);border-radius:16px 0 0 0;z-index:1801;display:flex;flex-direction:column;animation:rpIn .22s ease both;overflow:hidden}
    @keyframes rpIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
    .rp-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px 18px;border-bottom:1px solid #F0F3F6;flex-shrink:0}
    .rp-title{font-size:16px;font-weight:700;color:#1A2B3C}
    .rp-close{width:32px;height:32px;border:none;background:#F1F5F9;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;color:#4A6080}
    .rp-close:hover{background:#E2E8F0}
    .rp-body{flex:1;overflow-y:auto;padding:24px}
    .rp-footer{padding:16px 24px;border-top:1px solid #F0F3F6;flex-shrink:0;display:flex;justify-content:flex-end;gap:10px}

    .f-field{margin-bottom:16px}
    .f-label{display:block;font-size:13px;font-weight:600;color:#1A2B3C;margin-bottom:6px}
    .f-input,.f-select{width:100%;padding:10px 14px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:#1A2B3C;font-family:'Inter',sans-serif;outline:none;transition:border .15s;box-sizing:border-box;background:#fff}
    .f-input:focus,.f-select:focus{border-color:#2FA8A0;box-shadow:0 0 0 3px rgba(47,168,160,.1)}
    .f-select{appearance:none;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238FA3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px}
    .file-drop{border:2px dashed #D1D5DB;border-radius:10px;padding:22px;text-align:center;cursor:pointer;color:#8FA3B8;font-size:13px;transition:border .15s}
    .file-drop:hover{border-color:#2FA8A0;color:#2FA8A0}
    .file-selected{font-size:12.5px;color:#1B7872;font-weight:600;margin-top:6px}

    .confirm-overlay{position:fixed;inset:0;background:rgba(10,20,35,.5);z-index:2000;display:flex;align-items:center;justify-content:center}
    .confirm-box{background:#fff;border-radius:12px;padding:28px 32px;max-width:380px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.2)}
    .confirm-icon{font-size:38px;color:#F59E0B;display:block;margin-bottom:10px}
    .confirm-title{font-size:15px;font-weight:700;color:#1A2B3C;margin:0 0 8px}
    .confirm-msg{font-size:13px;color:#4A6080;margin:0 0 22px;line-height:1.5}
    .confirm-actions{display:flex;justify-content:flex-end;gap:10px}

    .toast{position:fixed;bottom:24px;right:24px;z-index:9999;background:#1A2B3C;color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.18);animation:rpIn .22s ease both}
    .big-action-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:290px;padding:14px;background:#1B7872;color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s;white-space:nowrap}
    .big-action-btn:hover{background:#1A9690}
    .big-action-btn i{font-size:18px}
    .action-row{display:flex;justify-content:flex-end;margin-bottom:18px}
  `],
  template: `
  <div class="backdrop" *ngIf="showPanel || confirmItem" (click)="closeAll()"></div>

  <div class="confirm-overlay" *ngIf="confirmItem" (click)="$event.stopPropagation()">
    <div class="confirm-box">
      <i class="bx bx-error confirm-icon"></i>
      <p class="confirm-title">{{ 'DOCUMENTS.CONFIRM_DELETE_TITLE' | translate }}</p>
      <p class="confirm-msg">{{ 'DOCUMENTS.CONFIRM_DELETE_MSG' | translate:{filename: confirmItem?.originalFilename} }}</p>
      <div class="confirm-actions">
        <button class="btn btn-secondary" (click)="confirmItem=null">{{ 'DOCUMENTS.CONFIRM_CANCEL' | translate }}</button>
        <button class="btn btn-danger" (click)="execDelete()">{{ 'DOCUMENTS.CONFIRM_DELETE' | translate }}</button>
      </div>
    </div>
  </div>

  <!-- Upload Panel -->
  <div class="rp" *ngIf="showPanel">
    <div class="rp-header">
      <span class="rp-title">{{ 'DOCUMENTS.PANEL_TITLE' | translate }}</span>
      <button class="rp-close" (click)="closeAll()"><i class="bx bx-x"></i></button>
    </div>
    <div class="rp-body">
      <div class="f-field">
        <label class="f-label">{{ 'DOCUMENTS.FIELD_EMPLOYEE' | translate }}</label>
        <select class="f-select" [(ngModel)]="form.employeeId">
          <option [ngValue]="null">{{ 'DOCUMENTS.SELECT_EMPLOYEE' | translate }}</option>
          <option *ngFor="let e of employees" [ngValue]="e._backendId ?? e.matricule">
            {{ e.prenom }} {{ e.nom }}
          </option>
        </select>
      </div>
      <div class="f-field">
        <label class="f-label">{{ 'DOCUMENTS.FIELD_CATEGORY' | translate }}</label>
        <select class="f-select" [(ngModel)]="form.category">
          <option value="">{{ 'DOCUMENTS.SELECT_CATEGORY' | translate }}</option>
          <option *ngFor="let c of categories" [value]="c">{{ catLabel(c) }}</option>
        </select>
      </div>
      <div class="f-field">
        <label class="f-label">{{ 'DOCUMENTS.FIELD_DESCRIPTION' | translate }}</label>
        <input class="f-input" [(ngModel)]="form.description" [placeholder]="'DOCUMENTS.FIELD_DESCRIPTION' | translate" />
      </div>
      <div class="f-field">
        <label class="f-label">{{ 'DOCUMENTS.FIELD_EXPIRY' | translate }}</label>
        <input class="f-input" type="date" [(ngModel)]="form.expiryDate" />
      </div>
      <div class="f-field">
        <label class="f-label">{{ 'DOCUMENTS.FIELD_FILE' | translate }}</label>
        <label class="file-drop">
          <i class="bx bx-upload" style="font-size:28px;display:block;margin-bottom:8px"></i>
          {{ 'DOCUMENTS.CLICK_TO_SELECT' | translate }}
          <input type="file" style="display:none" (change)="onFile($event)" />
        </label>
        <div class="file-selected" *ngIf="form.file">{{ form.file.name }}</div>
      </div>
    </div>
    <div class="rp-footer">
      <button class="btn btn-secondary" (click)="closeAll()">{{ 'DOCUMENTS.CANCEL' | translate }}</button>
      <button class="btn btn-primary"
        [disabled]="uploading || !form.file || !form.employeeId || !form.category"
        (click)="upload()">
        <i class="bx bx-upload"></i>{{ uploading ? ('DOCUMENTS.UPLOADING' | translate) : ('DOCUMENTS.UPLOAD' | translate) }}
      </button>
    </div>
  </div>

  <div class="toast" *ngIf="toast">{{ toast }}</div>

  <div class="page">
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
      <div class="page-header" style="flex:1;margin-bottom:0;">
        <h4 class="page-title">{{ 'DOCUMENTS.TITLE' | translate }}</h4>
      </div>
      <app-wall-clock></app-wall-clock>
    </div>
    <!-- Action row -->
    <div class="action-row">
      <button class="big-action-btn" (click)="showPanel=true">
        <i class="bx bx-upload"></i> {{ 'DOCUMENTS.BTN_UPLOAD' | translate }}
      </button>
    </div>

    <!-- Expiry alert -->
    <div class="alert-banner" *ngIf="expiringCount > 0">
      <i class="bx bx-alarm-exclamation"></i>
      {{ 'DOCUMENTS.EXPIRY_ALERT' | translate:{count: expiringCount} }}
    </div>

    <div class="filter-bar">
      <div class="search-wrap">
        <i class="bx bx-search"></i>
        <input [(ngModel)]="search" [placeholder]="'DOCUMENTS.SEARCH_PLACEHOLDER' | translate" />
      </div>
      <select class="filter-select" [(ngModel)]="filterCategory">
        <option value="">{{ 'DOCUMENTS.FILTER_ALL_CATEGORIES' | translate }}</option>
        <option *ngFor="let c of categories" [value]="c">{{ catLabel(c) }}</option>
      </select>
      <select class="filter-select" [(ngModel)]="filterEmployeeId" (ngModelChange)="onEmployeeFilter($event)">
        <option [ngValue]="null">{{ 'DOCUMENTS.FILTER_ALL_EMPLOYEES' | translate }}</option>
        <option *ngFor="let e of employees" [ngValue]="e._backendId ?? e.matricule">
          {{ e.prenom }} {{ e.nom }}
        </option>
      </select>
    </div>

    <div class="card">
      <div class="card-head">
        <span class="card-title">{{ 'DOCUMENTS.CARD_TITLE' | translate }}</span>
      </div>

      <div class="state-box" *ngIf="loading"><div class="spinner"></div>{{ 'DOCUMENTS.LOADING' | translate }}</div>
      <div class="state-box" style="color:#EF4444" *ngIf="!loading && error">
        <i class="bx bx-error-circle"></i>{{ error }}
      </div>
      <div class="state-box" *ngIf="!loading && !error && filteredDocs.length===0">
        <i class="bx bx-folder-open"></i>{{ 'DOCUMENTS.NO_DOCUMENTS' | translate }}
      </div>

      <div style="overflow-x:auto" *ngIf="!loading && !error && filteredDocs.length>0">
        <table>
          <thead><tr>
            <th>{{ 'DOCUMENTS.TABLE_EMPLOYEE' | translate }}</th><th>{{ 'DOCUMENTS.TABLE_FILE' | translate }}</th><th>{{ 'DOCUMENTS.TABLE_CATEGORY' | translate }}</th><th>{{ 'DOCUMENTS.TABLE_DESCRIPTION' | translate }}</th>
            <th>{{ 'DOCUMENTS.TABLE_EXPIRY' | translate }}</th><th>{{ 'DOCUMENTS.TABLE_ACTIONS' | translate }}</th>
          </tr></thead>
          <tbody>
            <tr *ngFor="let d of filteredDocs">
              <td class="td-name">{{ d.employee?.name || '—' }}</td>
              <td class="td-file">{{ d.originalFilename }}</td>
              <td><span class="chip chip-{{d.category}}">{{ catLabel(d.category) }}</span></td>
              <td>{{ d.description || '—' }}</td>
              <td>
                <span *ngIf="d.expiryDate">{{ d.expiryDate | date:'dd/MM/yyyy' }}</span>
                <span class="chip chip-expired" *ngIf="d.expired">{{ 'DOCUMENTS.CHIP_EXPIRED' | translate }}</span>
                <span *ngIf="!d.expiryDate">—</span>
              </td>
              <td (click)="$event.stopPropagation()">
                <button class="act-btn act-btn--del" (click)="confirmItem=d" [title]="'DOCUMENTS.CONFIRM_DELETE' | translate">
                  <i class="bx bx-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class DocumentsComponent implements OnInit {

  documents: any[] = [];
  employees: any[] = [];
  loading  = false;
  error: string | null = null;

  search = '';
  filterCategory = '';
  filterEmployeeId: number | null = null;
  expiringCount = 0;
  categories = CATEGORIES;

  showPanel = false;
  uploading = false;
  confirmItem: any = null;
  toast: string | null = null;

  form: any = this.emptyForm();

  constructor(private http: HttpClient, private collabService: CollaborateurService, private translate: TranslateService) {}

  ngOnInit(): void {
    forkJoin({
      docs:      this.http.get<any>(BASE_DOCS).pipe(map(r => r?.content ?? r?.data ?? (Array.isArray(r) ? r : []))),
      expiring:  this.http.get<any>(`${BASE_DOCS}/expiring`).pipe(map(r => r?.content ?? r?.data ?? (Array.isArray(r) ? r : []))),
      employees: this.collabService.getAll(),
    }).subscribe({
      next: ({ docs, expiring, employees }) => {
        this.documents    = docs;
        this.expiringCount = expiring.length;
        this.employees    = employees;
        this.loading      = false;
      },
      error: () => { this.loading = false; }
    });
    this.loading = true;
  }

  load(): void {
    this.loading = true;
    const url = this.filterEmployeeId
      ? `${BASE_DOCS}/employee/${this.filterEmployeeId}`
      : BASE_DOCS;
    this.http.get<any>(url).pipe(
      map(r => r?.content ?? r?.data ?? (Array.isArray(r) ? r : [])),
      catchError(e => { this.error = e?.error?.message || 'Erreur de chargement'; this.loading = false; return []; })
    ).subscribe(d => { this.documents = d; this.loading = false; });
  }

  onEmployeeFilter(employeeId: number | null): void {
    this.filterEmployeeId = employeeId;
    this.load();
  }

  get filteredDocs(): any[] {
    return this.documents.filter(d => {
      const s = this.search.toLowerCase();
      const matchSearch = !s ||
        (d.employee?.name ?? '').toLowerCase().includes(s) ||
        (d.originalFilename ?? '').toLowerCase().includes(s);
      const matchCat = !this.filterCategory || d.category === this.filterCategory;
      return matchSearch && matchCat;
    });
  }

  catLabel(c: string): string { return this.translate.instant('DOCUMENTS.CAT_' + c) || c; }

  onFile(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) this.form.file = input.files[0];
  }

  upload(): void {
    if (!this.form.file || !this.form.employeeId || !this.form.category) return;
    this.uploading = true;
    const fd = new FormData();
    fd.append('file', this.form.file);
    fd.append('employeeId', String(this.form.employeeId));
    fd.append('category', this.form.category);
    if (this.form.description) fd.append('description', this.form.description);
    if (this.form.expiryDate)  fd.append('expiryDate', this.form.expiryDate);

    this.http.post<any>(`${BASE_DOCS}/upload`, fd).pipe(map(r => r?.data ?? r)).subscribe({
      next: doc => {
        this.documents = [doc, ...this.documents];
        this.uploading = false;
        this.closeAll();
        this.showToast(this.translate.instant('DOCUMENTS.TOAST_UPLOADED'));
      },
      error: e => { this.uploading = false; this.showToast(e?.error?.message || this.translate.instant('DOCUMENTS.TOAST_ERROR')); }
    });
  }

  execDelete(): void {
    const item = this.confirmItem;
    this.confirmItem = null;
    this.http.delete<void>(`${BASE_DOCS}/${item.id}`).subscribe({
      next: () => { this.documents = this.documents.filter(d => d.id !== item.id); this.showToast(this.translate.instant('DOCUMENTS.TOAST_DELETED')); },
      error: e => this.showToast(e?.error?.message || this.translate.instant('DOCUMENTS.TOAST_ERROR'))
    });
  }

  closeAll(): void { this.showPanel = false; this.form = this.emptyForm(); this.uploading = false; this.confirmItem = null; }

  private showToast(msg: string): void { this.toast = msg; setTimeout(() => this.toast = null, 3500); }
  private emptyForm() { return { employeeId: null, category: '', description: '', expiryDate: '', file: null as File | null }; }
}
