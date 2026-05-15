import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WallClockComponent } from 'src/app/shared/wall-clock/wall-clock.component';

const BASE_DEPT = `${environment.apiUrl}/departments`;
const BASE_POS  = `${environment.apiUrl}/positions`;

@Component({
  selector: 'app-org',
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
    .btn-primary{background:#1B7872;color:#fff}.btn-primary:hover:not(:disabled){background:#1A9690}
    .btn-secondary{background:#F1F5F9;color:#4A6080}.btn-secondary:hover:not(:disabled){background:#E2E8F0}
    .btn-danger{background:#FEE2E2;color:#BE123C}.btn-danger:hover:not(:disabled){background:#FECACA}
    .btn-sm{padding:6px 13px;font-size:12px}

    .tabs-bar{display:flex;gap:0;border-bottom:2px solid #F0F3F6;background:#fff;padding:0 20px;margin-bottom:18px;border-radius:12px 12px 0 0;box-shadow:0 2px 8px rgba(22,34,51,.04)}
    .tab-btn{background:none;border:none;padding:13px 20px;font-size:13.5px;font-weight:500;color:#8FA3B8;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .15s}
    .tab-btn.active{color:#1A2B3C;font-weight:700;border-bottom-color:#2FA8A0}
    .tab-btn:hover:not(.active){color:#4A6080}

    .panel-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}

    .card{background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);overflow:hidden}
    .card-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #F0F3F6}
    .card-title{font-size:14px;font-weight:700;color:#1A2B3C}
    .count-badge{background:#E8F7F6;color:#1B7872;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:700}

    table{width:100%;border-collapse:collapse}
    thead tr{background:#FAFBFC}
    thead th{padding:10px 14px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8FA3B8;border-bottom:1px solid #F0F3F6;text-align:left}
    tbody tr{transition:background .15s;cursor:pointer}
    tbody tr:hover{background:#F8FAFC}
    tbody td{padding:11px 14px;font-size:13px;color:#4A6080;border-bottom:1px solid #F5F7FA;vertical-align:middle}
    tbody tr:last-child td{border-bottom:none}
    .td-name{font-weight:600;color:#1A2B3C}
    .td-code{font-family:monospace;font-size:12px;background:#F1F5F9;padding:2px 7px;border-radius:5px;color:#4A6080}
    .chip-active{background:#DCFCE7;color:#15803D;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:700}
    .chip-inactive{background:#F1F5F9;color:#8FA3B8;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:700}
    .act-btn{background:none;border:none;padding:4px 7px;border-radius:6px;cursor:pointer;font-size:14px;color:#B0BEC5;transition:all .15s}
    .act-btn:hover{background:#F1F5F9;color:#4A6080}
    .act-btn--del:hover{background:#FEE2E2;color:#BE123C}

    .state-box{padding:48px 0;text-align:center;color:#8FA3B8;font-size:14px}
    .state-box i{font-size:36px;display:block;margin-bottom:10px}
    .spinner{width:30px;height:30px;border:3px solid #E2E8F0;border-top-color:#2FA8A0;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 10px}
    @keyframes spin{to{transform:rotate(360deg)}}
    .error-txt{color:#EF4444}

    /* Backdrop + Panel */
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
    .f-input,.f-select,.f-textarea{width:100%;padding:10px 14px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:#1A2B3C;font-family:'Inter',sans-serif;outline:none;transition:border .15s;box-sizing:border-box;background:#fff}
    .f-input:focus,.f-select:focus,.f-textarea:focus{border-color:#2FA8A0;box-shadow:0 0 0 3px rgba(47,168,160,.1)}
    .f-select{appearance:none;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238FA3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px}
    .f-textarea{resize:vertical;min-height:72px}
    .f-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .f-check-row{display:flex;align-items:center;gap:10px;font-size:13.5px;color:#4A6080}
    .f-check-row input[type=checkbox]{width:16px;height:16px;accent-color:#1B7872;cursor:pointer}

    .toast{position:fixed;bottom:24px;right:24px;z-index:9999;background:#1A2B3C;color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.18);animation:rpIn .22s ease both}

    /* confirm */
    .confirm-overlay{position:fixed;inset:0;background:rgba(10,20,35,.5);z-index:2000;display:flex;align-items:center;justify-content:center}
    .confirm-box{background:#fff;border-radius:12px;padding:28px 32px;max-width:380px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.2)}
    .confirm-icon{font-size:38px;color:#F59E0B;display:block;margin-bottom:10px}
    .confirm-title{font-size:15px;font-weight:700;color:#1A2B3C;margin:0 0 8px}
    .confirm-msg{font-size:13px;color:#4A6080;margin:0 0 22px;line-height:1.5}
    .confirm-actions{display:flex;justify-content:flex-end;gap:10px}
    .big-action-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:290px;padding:14px;background:#1B7872;color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s;white-space:nowrap}
    .big-action-btn:hover{background:#1A9690}
    .big-action-btn i{font-size:18px}
    .action-row{display:flex;justify-content:flex-end;margin-bottom:18px}
  `],
  template: `
  <div class="backdrop" *ngIf="showPanel || confirmItem" (click)="closeAll()"></div>

  <!-- Confirm delete dialog -->
  <div class="confirm-overlay" *ngIf="confirmItem" (click)="$event.stopPropagation()">
    <div class="confirm-box">
      <i class="bx bx-error confirm-icon"></i>
      <p class="confirm-title">{{ 'ORG.CONFIRM_DELETE_TITLE' | translate }}</p>
      <p class="confirm-msg">{{ 'ORG.CONFIRM_DELETE_MSG' | translate:{name: confirmItem?.name || confirmItem?.title} }}</p>
      <div class="confirm-actions">
        <button class="btn btn-secondary" (click)="confirmItem=null">{{ 'ORG.CONFIRM_CANCEL' | translate }}</button>
        <button class="btn btn-danger" (click)="execDelete()">{{ 'ORG.CONFIRM_DELETE' | translate }}</button>
      </div>
    </div>
  </div>

  <!-- Side panel -->
  <div class="rp" *ngIf="showPanel">
    <div class="rp-header">
      <span class="rp-title">{{ editMode ? (activeTab==='dept' ? ('ORG.PANEL_EDIT_DEPT' | translate) : ('ORG.PANEL_EDIT_POS' | translate)) : (activeTab==='dept' ? ('ORG.PANEL_NEW_DEPT' | translate) : ('ORG.PANEL_NEW_POS' | translate)) }}</span>
      <button class="rp-close" (click)="closeAll()"><i class="bx bx-x"></i></button>
    </div>
    <div class="rp-body">

      <!-- DEPT FORM -->
      <ng-container *ngIf="activeTab==='dept'">
        <div class="f-field"><label class="f-label">{{ 'ORG.FIELD_NAME' | translate }}</label>
          <input class="f-input" [(ngModel)]="deptForm.name" [placeholder]="'ORG.DEPT_NAME_PH' | translate" /></div>
        <div class="f-row">
          <div class="f-field"><label class="f-label">{{ 'ORG.FIELD_CODE' | translate }}</label>
            <input class="f-input" [(ngModel)]="deptForm.code" [placeholder]="'ORG.DEPT_CODE_PH' | translate" /></div>
          <div class="f-field"><label class="f-label">{{ 'ORG.FIELD_STATUS' | translate }}</label>
            <select class="f-select" [(ngModel)]="deptForm.active">
              <option [ngValue]="true">{{ 'ORG.STATUS_ACTIVE' | translate }}</option>
              <option [ngValue]="false">{{ 'ORG.STATUS_INACTIVE' | translate }}</option>
            </select></div>
        </div>
        <div class="f-field"><label class="f-label">{{ 'ORG.FIELD_DESCRIPTION' | translate }}</label>
          <textarea class="f-textarea" [(ngModel)]="deptForm.description" [placeholder]="'ORG.FIELD_DESCRIPTION' | translate"></textarea></div>
      </ng-container>

      <!-- POSITION FORM -->
      <ng-container *ngIf="activeTab==='pos'">
        <div class="f-field"><label class="f-label">{{ 'ORG.FIELD_TITLE' | translate }}</label>
          <input class="f-input" [(ngModel)]="posForm.title" [placeholder]="'ORG.POS_TITLE_PH' | translate" /></div>
        <div class="f-row">
          <div class="f-field"><label class="f-label">{{ 'ORG.FIELD_POS_CODE' | translate }}</label>
            <input class="f-input" [(ngModel)]="posForm.code" [placeholder]="'ORG.POS_CODE_PH' | translate" /></div>
          <div class="f-field"><label class="f-label">{{ 'ORG.FIELD_DEPT' | translate }}</label>
            <select class="f-select" [(ngModel)]="posForm.departmentId">
              <option [ngValue]="null">{{ 'ORG.DEPT_SELECT' | translate }}</option>
              <option *ngFor="let d of departments" [ngValue]="d.id">{{ d.name }}</option>
            </select></div>
        </div>
        <div class="f-field"><label class="f-label">{{ 'ORG.FIELD_DESCRIPTION' | translate }}</label>
          <textarea class="f-textarea" [(ngModel)]="posForm.description" [placeholder]="'ORG.FIELD_DESCRIPTION' | translate"></textarea></div>
        <div class="f-field">
          <label class="f-check-row">
            <input type="checkbox" [(ngModel)]="posForm.active" />
            {{ 'ORG.FIELD_POS_ACTIVE' | translate }}
          </label>
        </div>
      </ng-container>

    </div>
    <div class="rp-footer">
      <button class="btn btn-secondary" (click)="closeAll()">{{ 'ORG.CANCEL' | translate }}</button>
      <button class="btn btn-primary" [disabled]="saving" (click)="save()">
        <i class="bx" [class.bx-save]="!saving" [class.bx-loader-alt]="saving"></i>
        {{ saving ? ('ORG.SAVING' | translate) : ('ORG.SAVE' | translate) }}
      </button>
    </div>
  </div>

  <div class="toast" *ngIf="toast">{{ toast }}</div>

  <!-- ════ Page ════ -->
  <div class="page">
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
      <div class="page-header" style="flex:1;margin-bottom:0;">
        <h4 class="page-title">{{ 'ORG.TITLE' | translate }}</h4>
      </div>
      <app-wall-clock></app-wall-clock>
    </div>
    <!-- Action row -->
    <div class="action-row">
      <button class="big-action-btn" (click)="openCreate()">
        <i class="bx bx-plus"></i> {{ activeTab==='dept' ? ('ORG.BTN_NEW_DEPT' | translate) : ('ORG.BTN_NEW_POS' | translate) }}
      </button>
    </div>

    <div class="tabs-bar">
      <button class="tab-btn" [class.active]="activeTab==='dept'" (click)="setTab('dept')">
        <i class="bx bx-building-house"></i> {{ 'ORG.TAB_DEPARTMENTS' | translate:{count: departments.length} }}
      </button>
      <button class="tab-btn" [class.active]="activeTab==='pos'" (click)="setTab('pos')">
        <i class="bx bx-briefcase"></i> {{ 'ORG.TAB_POSITIONS' | translate:{count: positions.length} }}
      </button>
    </div>

    <!-- DEPARTMENTS TABLE -->
    <div class="card" *ngIf="activeTab==='dept'">
      <div class="card-head">
        <span class="card-title">{{ 'ORG.CARD_DEPARTMENTS' | translate }}</span>
        <span class="count-badge">{{ departments.length }}</span>
      </div>

      <div class="state-box" *ngIf="loadingDept">
        <div class="spinner"></div>{{ 'ORG.LOADING' | translate }}
      </div>
      <div class="state-box error-txt" *ngIf="!loadingDept && errorDept">
        <i class="bx bx-error-circle"></i>{{ errorDept }}
      </div>
      <div class="state-box" *ngIf="!loadingDept && !errorDept && departments.length===0">
        <i class="bx bx-building"></i>{{ 'ORG.NO_DEPARTMENTS' | translate }}
      </div>

      <div style="overflow-x:auto" *ngIf="!loadingDept && !errorDept && departments.length>0">
        <table>
          <thead><tr>
            <th>{{ 'ORG.TABLE_NAME' | translate }}</th><th>{{ 'ORG.TABLE_CODE' | translate }}</th><th>{{ 'ORG.TABLE_MANAGER' | translate }}</th><th>{{ 'ORG.TABLE_EMPLOYEES' | translate }}</th><th>{{ 'ORG.TABLE_STATUS' | translate }}</th><th>{{ 'ORG.TABLE_ACTIONS' | translate }}</th>
          </tr></thead>
          <tbody>
            <tr *ngFor="let d of departments">
              <td class="td-name">{{ d.name }}</td>
              <td><span class="td-code">{{ d.code }}</span></td>
              <td>{{ d.manager?.name || '—' }}</td>
              <td>{{ d.employeeCount ?? 0 }}</td>
              <td>
                <span [class]="d.active ? 'chip-active' : 'chip-inactive'">{{ d.active ? ('ORG.STATUS_ACTIVE' | translate) : ('ORG.STATUS_INACTIVE' | translate) }}</span>
              </td>
              <td (click)="$event.stopPropagation()">
                <button class="act-btn" (click)="openEdit(d, 'dept')"><i class="bx bx-edit-alt"></i></button>
                <button class="act-btn act-btn--del" (click)="askDelete(d, 'dept')"><i class="bx bx-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- POSITIONS TABLE -->
    <div class="card" *ngIf="activeTab==='pos'">
      <div class="card-head">
        <span class="card-title">{{ 'ORG.CARD_POSITIONS' | translate }}</span>
        <span class="count-badge">{{ positions.length }}</span>
      </div>

      <div class="state-box" *ngIf="loadingPos">
        <div class="spinner"></div>{{ 'ORG.LOADING' | translate }}
      </div>
      <div class="state-box error-txt" *ngIf="!loadingPos && errorPos">
        <i class="bx bx-error-circle"></i>{{ errorPos }}
      </div>
      <div class="state-box" *ngIf="!loadingPos && !errorPos && positions.length===0">
        <i class="bx bx-briefcase"></i>{{ 'ORG.NO_POSITIONS' | translate }}
      </div>

      <div style="overflow-x:auto" *ngIf="!loadingPos && !errorPos && positions.length>0">
        <table>
          <thead><tr>
            <th>{{ 'ORG.TABLE_TITLE' | translate }}</th><th>{{ 'ORG.TABLE_CODE' | translate }}</th><th>{{ 'ORG.TABLE_DEPARTMENT' | translate }}</th><th>{{ 'ORG.TABLE_STATUS' | translate }}</th><th>{{ 'ORG.TABLE_ACTIONS' | translate }}</th>
          </tr></thead>
          <tbody>
            <tr *ngFor="let p of positions">
              <td class="td-name">{{ p.title }}</td>
              <td><span class="td-code" *ngIf="p.code">{{ p.code }}</span><span *ngIf="!p.code">—</span></td>
              <td>{{ p.department?.name || '—' }}</td>
              <td>
                <span [class]="p.active ? 'chip-active' : 'chip-inactive'">{{ p.active ? ('ORG.STATUS_ACTIVE' | translate) : ('ORG.STATUS_INACTIVE' | translate) }}</span>
              </td>
              <td (click)="$event.stopPropagation()">
                <button class="act-btn" (click)="openEdit(p, 'pos')"><i class="bx bx-edit-alt"></i></button>
                <button class="act-btn act-btn--del" (click)="askDelete(p, 'pos')"><i class="bx bx-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class OrgComponent implements OnInit {

  activeTab: 'dept' | 'pos' = 'dept';

  departments: any[] = [];
  positions:   any[] = [];

  loadingDept = false;
  loadingPos  = false;
  errorDept: string | null = null;
  errorPos:  string | null = null;

  showPanel = false;
  editMode  = false;
  saving    = false;
  editId: number | null = null;
  editVersion: number | null = null;

  confirmItem: any = null;
  confirmType: 'dept' | 'pos' = 'dept';

  toast: string | null = null;

  deptForm: any = this.emptyDept();
  posForm:  any = this.emptyPos();

  constructor(private http: HttpClient, private translate: TranslateService) {}

  ngOnInit(): void {
    this.loadDepts();
    this.loadPositions();
  }

  setTab(tab: 'dept' | 'pos'): void { this.activeTab = tab; this.closeAll(); }

  loadDepts(): void {
    this.loadingDept = true;
    this.http.get<any>(`${BASE_DEPT}?size=200`).pipe(
      map(r => r?.content ?? r?.data ?? (Array.isArray(r) ? r : [])),
      catchError(e => { this.errorDept = e?.error?.message || 'Erreur de chargement'; this.loadingDept = false; return []; })
    ).subscribe(d => { this.departments = d; this.loadingDept = false; });
  }

  loadPositions(): void {
    this.loadingPos = true;
    this.http.get<any>(`${BASE_POS}?size=200`).pipe(
      map(r => r?.content ?? r?.data ?? (Array.isArray(r) ? r : [])),
      catchError(e => { this.errorPos = e?.error?.message || 'Erreur de chargement'; this.loadingPos = false; return []; })
    ).subscribe(d => { this.positions = d; this.loadingPos = false; });
  }

  openCreate(): void {
    this.editMode = false;
    this.editId   = null;
    this.editVersion = null;
    if (this.activeTab === 'dept') this.deptForm = this.emptyDept();
    else this.posForm = this.emptyPos();
    this.showPanel = true;
  }

  openEdit(item: any, type: 'dept' | 'pos'): void {
    this.editMode = true;
    this.editId   = item.id;
    this.editVersion = item.version ?? null;
    this.activeTab = type;
    if (type === 'dept') {
      this.deptForm = { name: item.name, code: item.code, description: item.description || '', active: item.active, version: item.version };
    } else {
      this.posForm = { title: item.title, code: item.code || '', description: item.description || '', departmentId: item.department?.id ?? null, active: item.active, version: item.version };
    }
    this.showPanel = true;
  }

  save(): void {
    this.saving = true;
    const isEdit = this.editMode && this.editId;

    if (this.activeTab === 'dept') {
      const body = { ...this.deptForm, version: this.editVersion };
      const req = isEdit
        ? this.http.put<any>(`${BASE_DEPT}/${this.editId}`, body)
        : this.http.post<any>(BASE_DEPT, body);
      req.pipe(map(r => r?.data ?? r)).subscribe({
        next: d => {
          if (isEdit) this.departments = this.departments.map(x => x.id === d.id ? d : x);
          else this.departments = [d, ...this.departments];
          this.saving = false;
          this.closeAll();
          this.showToast(this.translate.instant(isEdit ? 'ORG.TOAST_DEPT_UPDATED' : 'ORG.TOAST_DEPT_CREATED'));
        },
        error: e => { this.saving = false; this.showToast(e?.error?.message || this.translate.instant('ORG.TOAST_ERROR')); }
      });
    } else {
      const body = { ...this.posForm, version: this.editVersion };
      const req = isEdit
        ? this.http.put<any>(`${BASE_POS}/${this.editId}`, body)
        : this.http.post<any>(BASE_POS, body);
      req.pipe(map(r => r?.data ?? r)).subscribe({
        next: p => {
          if (isEdit) this.positions = this.positions.map(x => x.id === p.id ? p : x);
          else this.positions = [p, ...this.positions];
          this.saving = false;
          this.closeAll();
          this.showToast(this.translate.instant(isEdit ? 'ORG.TOAST_POS_UPDATED' : 'ORG.TOAST_POS_CREATED'));
          this.loadDepts(); // refresh dept employee counts
        },
        error: e => { this.saving = false; this.showToast(e?.error?.message || this.translate.instant('ORG.TOAST_ERROR')); }
      });
    }
  }

  askDelete(item: any, type: 'dept' | 'pos'): void {
    this.confirmItem = item;
    this.confirmType = type;
  }

  execDelete(): void {
    const item = this.confirmItem;
    const type = this.confirmType;
    this.confirmItem = null;
    const url = type === 'dept' ? `${BASE_DEPT}/${item.id}` : `${BASE_POS}/${item.id}`;
    this.http.delete<void>(url).subscribe({
      next: () => {
        if (type === 'dept') this.departments = this.departments.filter(d => d.id !== item.id);
        else this.positions = this.positions.filter(p => p.id !== item.id);
        this.showToast(this.translate.instant('ORG.TOAST_DELETED'));
      },
      error: e => this.showToast(e?.error?.message || this.translate.instant('ORG.TOAST_DELETE_ERROR'))
    });
  }

  closeAll(): void { this.showPanel = false; this.confirmItem = null; this.saving = false; }

  private showToast(msg: string): void {
    this.toast = msg;
    setTimeout(() => this.toast = null, 3500);
  }

  private emptyDept() { return { name: '', code: '', description: '', active: true }; }
  private emptyPos()  { return { title: '', code: '', description: '', departmentId: null, active: true }; }
}
