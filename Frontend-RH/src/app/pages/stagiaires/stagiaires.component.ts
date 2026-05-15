import { Component, OnInit, Pipe, PipeTransform, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ConfirmService } from 'src/app/shared/confirm.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WallClockComponent } from 'src/app/shared/wall-clock/wall-clock.component';

interface Intern {
  id: number;
  version: number;
  firstName: string;
  lastName: string;
  cin: string;
  dateOfBirth: string;
  department: { id: number; name: string } | null;
  internshipSubject: string;
  supervisorName: string;
  school: string;
  internshipType: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  status: string;
  totalDocuments: number;
  submittedDocuments: number;
}

interface InternDocument {
  id: number;
  documentType: string;
  submitted: boolean;
  submittedDate: string | null;
  notes: string;
  version: number;
}

const STATUSES = ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXTENDED'];
const INTERNSHIP_TYPES = ['PFE', 'PFA', 'DECOUVERTE', 'IMMERSION', 'ALTERNANCE', 'SUMMER', 'OTHER'];

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b', ACTIVE: '#2FA8A0', COMPLETED: '#10b981',
  CANCELLED: '#ef4444', EXTENDED: '#6366f1'
};

const DOC_LABELS: Record<string, string> = {
  ATTESTATION_ASSURANCE: "Attestation d'assurance",
  CARTE_NATIONALE: 'Carte nationale',
  FICHE_ANTHROPOMETRIQUE: 'Fiche anthropométrique',
  COPIE_CERTIFIEE_DIPLOMES: 'Copie certifiée diplômes',
  RELEVE_IDENTITE_BANCAIRE: 'Relevé identité bancaire',
  CV: 'CV',
  CONVENTION_STAGE: 'Convention de stage',
  FICHE_EVALUATION: "Fiche d'évaluation",
  CHARTE_ENGAGEMENT: "Charte d'engagement",
  ATTESTATION_STAGE: 'Attestation de stage'
};

@Pipe({ name: 'docTypeLabel', standalone: true })
export class DocTypeLabelPipe implements PipeTransform {
  private translate = inject(TranslateService);
  transform(value: string): string {
    const key = 'INTERNS.DOC_' + value;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : (DOC_LABELS[value] ?? value);
  }
}

@Component({
  selector: 'app-stagiaires',
  standalone: true,
  imports: [CommonModule, FormsModule, DocTypeLabelPipe, TranslateModule, WallClockComponent],
  template: `
<div style="padding:0 24px 20px">

    <!-- Header -->
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
      <div class="page-header" style="flex:1;margin-bottom:0;">
        <h4 class="page-title">{{ 'INTERNS.TITLE' | translate }}</h4>
      </div>
      <app-wall-clock></app-wall-clock>
    </div>

    <!-- Action row -->
    <div class="action-row">
      <button class="big-action-btn" (click)="openCreate()">
        <i class="bx bx-plus"></i> {{ 'INTERNS.BTN_NEW' | translate }}
      </button>
    </div>

    <!-- Stats row -->
    <div class="row g-3 mb-3">
      <div class="col-sm-6 col-xl-3" *ngFor="let s of statCards">
        <div class="card stat-card" [style.border-left-color]="s.color">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="stat-icon" [style.background]="s.color + '22'">
              <i [class]="s.icon" [style.color]="s.color"></i>
            </div>
            <div>
              <div class="stat-value">{{ s.value }}</div>
              <div class="stat-label">{{ s.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-3">
      <div class="card-body py-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-5">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light border-end-0"><i class="bx bx-search text-muted"></i></span>
              <input type="text" class="form-control border-start-0 bg-light" [placeholder]="'INTERNS.SEARCH_PLACEHOLDER' | translate"
                [(ngModel)]="searchText" (ngModelChange)="onSearch()" />
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select form-select-sm" [(ngModel)]="filterStatus" (ngModelChange)="load()">
              <option value="">{{ 'INTERNS.FILTER_ALL_STATUSES' | translate }}</option>
              <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select form-select-sm" [(ngModel)]="filterType" (ngModelChange)="applyFilter()">
              <option value="">{{ 'INTERNS.FILTER_ALL_TYPES' | translate }}</option>
              <option *ngFor="let t of internshipTypes" [value]="t">{{ t }}</option>
            </select>
          </div>
          <div class="col-md-2 text-end">
            <span class="badge bg-light text-secondary">{{ 'INTERNS.RESULTS_COUNT' | translate:{count: filtered.length} }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="card-body p-0">
        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-primary" style="width:2rem;height:2rem"></div>
        </div>
        <div *ngIf="!loading && filtered.length === 0" class="text-center py-5 text-muted">
          <i class="bx bx-user-x" style="font-size:2.5rem"></i>
          <p class="mt-2">{{ 'INTERNS.NO_INTERNS' | translate }}</p>
        </div>
        <div class="table-responsive" *ngIf="!loading && filtered.length > 0">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4">{{ 'INTERNS.TABLE_INTERN' | translate }}</th>
                <th>{{ 'INTERNS.TABLE_SCHOOL_CIN' | translate }}</th>
                <th>{{ 'INTERNS.TABLE_TYPE' | translate }}</th>
                <th>{{ 'INTERNS.TABLE_DEPARTMENT' | translate }}</th>
                <th>{{ 'INTERNS.TABLE_PERIOD' | translate }}</th>
                <th>{{ 'INTERNS.TABLE_DOCUMENTS' | translate }}</th>
                <th>{{ 'INTERNS.TABLE_STATUS' | translate }}</th>
                <th class="text-center pe-4">{{ 'INTERNS.TABLE_ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let intern of filtered" (click)="openDetail(intern)" style="cursor:pointer">
                <td class="ps-4">
                  <div class="d-flex align-items-center gap-2">
                    <div class="avatar-circle" [style.background]="getColor(intern.status) + '22'">
                      <span [style.color]="getColor(intern.status)">{{ intern.firstName[0] }}{{ intern.lastName[0] }}</span>
                    </div>
                    <div>
                      <div class="fw-semibold" style="color:#1A2B3C">{{ intern.firstName }} {{ intern.lastName }}</div>
                      <div class="text-muted small">{{ intern.supervisorName || '—' }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="small">{{ intern.school || '—' }}</div>
                  <div class="text-muted small">{{ intern.cin || '—' }}</div>
                </td>
                <td><span class="badge" style="background:#1A2B3C22;color:#1A2B3C">{{ intern.internshipType }}</span></td>
                <td class="text-muted small">{{ intern.department?.name || '—' }}</td>
                <td class="small text-muted">
                  <div>{{ intern.startDate | date:'dd/MM/yy' }} → {{ intern.endDate | date:'dd/MM/yy' }}</div>
                  <div>{{ intern.durationMonths }} {{ 'INTERNS.MONTHS' | translate }}</div>
                </td>
                <td>
                  <div class="small">{{ intern.submittedDocuments }}/{{ intern.totalDocuments }}</div>
                  <div class="progress" style="height:4px;width:60px">
                    <div class="progress-bar" [style.width]="docPct(intern)+'%'" [style.background]="'#2FA8A0'"></div>
                  </div>
                </td>
                <td>
                  <span class="badge" [style.background]="getColor(intern.status) + '22'" [style.color]="getColor(intern.status)">
                    {{ intern.status }}
                  </span>
                </td>
                <td class="text-center pe-4" (click)="$event.stopPropagation()">
                  <div class="d-flex justify-content-center gap-1">
                    <button class="btn btn-xs btn-light" (click)="openEdit(intern)" [title]="'INTERNS.BTN_EDIT' | translate">
                      <i class="bx bx-edit"></i>
                    </button>
                    <button class="btn btn-xs btn-light" (click)="openDocs(intern)" [title]="'INTERNS.BTN_DOCUMENTS' | translate">
                      <i class="bx bx-file"></i>
                    </button>
                    <button class="btn btn-xs btn-light text-danger" (click)="deleteIntern(intern)" [title]="'INTERNS.BTN_DELETE' | translate">
                      <i class="bx bx-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center px-4 py-3" *ngIf="totalPages > 1">
          <span class="text-muted small">{{ 'INTERNS.PAGINATION' | translate:{current: currentPage+1, total: totalPages} }}</span>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-light" [disabled]="currentPage === 0" (click)="changePage(currentPage - 1)">
              <i class="bx bx-chevron-left"></i>
            </button>
            <button class="btn btn-sm btn-light" [disabled]="currentPage >= totalPages - 1" (click)="changePage(currentPage + 1)">
              <i class="bx bx-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

</div>

<!-- ── Detail / Create / Edit Panel ── -->
<div class="backdrop" *ngIf="panelOpen" (click)="closePanel()"></div>
<div class="rp" [class.open]="panelOpen">
  <div class="rp-header">
    <div>
      <h5 class="mb-0">{{ editMode ? ('INTERNS.PANEL_EDIT_TITLE' | translate) : (createMode ? ('INTERNS.PANEL_NEW_TITLE' | translate) : ('INTERNS.PANEL_DETAIL_TITLE' | translate)) }}</h5>
      <p class="text-muted small mb-0" *ngIf="selected">{{ selected.firstName }} {{ selected.lastName }}</p>
    </div>
    <button class="btn btn-sm btn-light" (click)="closePanel()"><i class="bx bx-x"></i></button>
  </div>
  <div class="rp-body" *ngIf="panelOpen">

    <!-- View mode -->
    <ng-container *ngIf="!editMode && !createMode && selected">
      <div class="section-title">{{ 'INTERNS.DETAIL_PERSONAL_INFO' | translate }}</div>
      <div class="row g-2 mb-3">
        <div class="col-6"><span class="label">{{ 'INTERNS.FIELD_FIRSTNAME' | translate }}</span><div class="value">{{ selected.firstName }}</div></div>
        <div class="col-6"><span class="label">{{ 'INTERNS.FIELD_LASTNAME' | translate }}</span><div class="value">{{ selected.lastName }}</div></div>
        <div class="col-6"><span class="label">{{ 'INTERNS.FIELD_CIN' | translate }}</span><div class="value">{{ selected.cin || '—' }}</div></div>
        <div class="col-6"><span class="label">{{ 'INTERNS.FIELD_DATE_OF_BIRTH' | translate }}</span><div class="value">{{ selected.dateOfBirth | date:'dd/MM/yyyy' }}</div></div>
      </div>
      <div class="section-title">{{ 'INTERNS.DETAIL_INTERNSHIP' | translate }}</div>
      <div class="row g-2 mb-3">
        <div class="col-6"><span class="label">{{ 'INTERNS.FIELD_SCHOOL' | translate }}</span><div class="value">{{ selected.school || '—' }}</div></div>
        <div class="col-6"><span class="label">{{ 'INTERNS.FIELD_TYPE' | translate }}</span><div class="value">{{ selected.internshipType }}</div></div>
        <div class="col-12"><span class="label">{{ 'INTERNS.FIELD_SUBJECT' | translate }}</span><div class="value">{{ selected.internshipSubject || '—' }}</div></div>
        <div class="col-6"><span class="label">{{ 'INTERNS.FIELD_SUPERVISOR' | translate }}</span><div class="value">{{ selected.supervisorName || '—' }}</div></div>
        <div class="col-6"><span class="label">{{ 'INTERNS.FIELD_DEPARTMENT' | translate }}</span><div class="value">{{ selected.department?.name || '—' }}</div></div>
        <div class="col-6"><span class="label">{{ 'INTERNS.FIELD_START' | translate }}</span><div class="value">{{ selected.startDate | date:'dd/MM/yyyy' }}</div></div>
        <div class="col-6"><span class="label">{{ 'INTERNS.FIELD_END' | translate }}</span><div class="value">{{ selected.endDate | date:'dd/MM/yyyy' }}</div></div>
        <div class="col-6"><span class="label">{{ 'INTERNS.FIELD_DURATION' | translate }}</span><div class="value">{{ selected.durationMonths }} {{ 'INTERNS.MONTHS' | translate }}</div></div>
      </div>
      <div class="section-title">{{ 'INTERNS.DETAIL_STATUS' | translate }}</div>
      <div class="d-flex gap-2 flex-wrap mb-4">
        <button *ngFor="let s of statuses" class="btn btn-xs"
          [style.background]="selected.status === s ? getColor(s) : getColor(s)+'22'"
          [style.color]="selected.status === s ? '#fff' : getColor(s)"
          [style.font-weight]="selected.status === s ? '600' : '400'"
          (click)="updateStatus(selected, s)">{{ s }}</button>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-primary flex-grow-1" (click)="openEdit(selected)">
          <i class="bx bx-edit me-1"></i>{{ 'INTERNS.BTN_EDIT' | translate }}
        </button>
        <button class="btn btn-sm btn-light flex-grow-1" (click)="openDocs(selected)">
          <i class="bx bx-file me-1"></i>{{ 'INTERNS.BTN_DOCUMENTS' | translate }}
        </button>
      </div>
    </ng-container>

    <!-- Create / Edit form -->
    <ng-container *ngIf="editMode || createMode">
      <form (ngSubmit)="saveIntern()">
        <div class="section-title">{{ 'INTERNS.FORM_PERSONAL_INFO' | translate }}</div>
        <div class="row g-2 mb-3">
          <div class="col-6">
            <label class="form-label-sm">{{ 'INTERNS.FORM_FIELD_FIRSTNAME' | translate }}</label>
            <input class="form-control form-control-sm" [(ngModel)]="form.firstName" name="firstName" required />
          </div>
          <div class="col-6">
            <label class="form-label-sm">{{ 'INTERNS.FORM_FIELD_LASTNAME' | translate }}</label>
            <input class="form-control form-control-sm" [(ngModel)]="form.lastName" name="lastName" required />
          </div>
          <div class="col-6">
            <label class="form-label-sm">{{ 'INTERNS.FORM_FIELD_CIN' | translate }}</label>
            <input class="form-control form-control-sm" [(ngModel)]="form.cin" name="cin" />
          </div>
          <div class="col-6">
            <label class="form-label-sm">{{ 'INTERNS.FORM_FIELD_DOB' | translate }}</label>
            <input type="date" class="form-control form-control-sm" [(ngModel)]="form.dateOfBirth" name="dateOfBirth" />
          </div>
        </div>
        <div class="section-title">{{ 'INTERNS.FORM_INTERNSHIP' | translate }}</div>
        <div class="row g-2 mb-3">
          <div class="col-12">
            <label class="form-label-sm">{{ 'INTERNS.FORM_FIELD_SCHOOL' | translate }}</label>
            <input class="form-control form-control-sm" [(ngModel)]="form.school" name="school" />
          </div>
          <div class="col-6">
            <label class="form-label-sm">{{ 'INTERNS.FORM_FIELD_TYPE' | translate }}</label>
            <select class="form-select form-select-sm" [(ngModel)]="form.internshipType" name="internshipType">
              <option value="">{{ 'INTERNS.SELECT_TYPE' | translate }}</option>
              <option *ngFor="let t of internshipTypes" [value]="t">{{ t }}</option>
            </select>
          </div>
          <div class="col-6">
            <label class="form-label-sm">{{ 'INTERNS.FORM_FIELD_DEPT' | translate }}</label>
            <select class="form-select form-select-sm" [(ngModel)]="form.departmentId" name="departmentId">
              <option [ngValue]="null">{{ 'INTERNS.SELECT_DEPT' | translate }}</option>
              <option *ngFor="let d of departments" [ngValue]="d.id">{{ d.name }}</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label-sm">{{ 'INTERNS.FORM_FIELD_SUBJECT' | translate }}</label>
            <textarea class="form-control form-control-sm" [(ngModel)]="form.internshipSubject" name="internshipSubject" rows="2"></textarea>
          </div>
          <div class="col-12">
            <label class="form-label-sm">{{ 'INTERNS.FORM_FIELD_SUPERVISOR' | translate }}</label>
            <input class="form-control form-control-sm" [(ngModel)]="form.supervisorName" name="supervisorName" />
          </div>
          <div class="col-6">
            <label class="form-label-sm">{{ 'INTERNS.FORM_FIELD_START' | translate }}</label>
            <input type="date" class="form-control form-control-sm" [(ngModel)]="form.startDate" name="startDate" required />
          </div>
          <div class="col-6">
            <label class="form-label-sm">{{ 'INTERNS.FORM_FIELD_END' | translate }}</label>
            <input type="date" class="form-control form-control-sm" [(ngModel)]="form.endDate" name="endDate" required />
          </div>
          <div class="col-6" *ngIf="editMode">
            <label class="form-label-sm">{{ 'INTERNS.FORM_FIELD_STATUS' | translate }}</label>
            <select class="form-select form-select-sm" [(ngModel)]="form.status" name="status">
              <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
            </select>
          </div>
        </div>
        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary btn-sm flex-grow-1" [disabled]="saving">
            <span *ngIf="saving" class="spinner-border spinner-border-sm me-1"></span>
            {{ editMode ? ('INTERNS.BTN_SAVE' | translate) : ('INTERNS.BTN_CREATE' | translate) }}
          </button>
          <button type="button" class="btn btn-light btn-sm" (click)="cancelEdit()">{{ 'INTERNS.BTN_CANCEL' | translate }}</button>
        </div>
      </form>
    </ng-container>

  </div>
</div>

<!-- ── Documents Panel ── -->
<div class="backdrop" *ngIf="docPanelOpen" (click)="closeDocPanel()"></div>
<div class="rp" [class.open]="docPanelOpen">
  <div class="rp-header">
    <div>
      <h5 class="mb-0">{{ 'INTERNS.DOCS_PANEL_TITLE' | translate }}</h5>
      <p class="text-muted small mb-0" *ngIf="selected">{{ selected.firstName }} {{ selected.lastName }}</p>
    </div>
    <button class="btn btn-sm btn-light" (click)="closeDocPanel()"><i class="bx bx-x"></i></button>
  </div>
  <div class="rp-body" *ngIf="docPanelOpen">
    <div *ngIf="docsLoading" class="text-center py-4">
      <div class="spinner-border spinner-border-sm text-primary"></div>
    </div>
    <div *ngIf="!docsLoading">
      <div class="mb-3" *ngFor="let doc of documents">
        <div class="doc-card">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <div class="fw-semibold small" style="color:#1A2B3C">{{ doc.documentType | docTypeLabel }}</div>
              <div class="text-muted small">{{ doc.submittedDate ? (doc.submittedDate | date:'dd/MM/yyyy') : '—' }}</div>
            </div>
            <span class="badge" [class.bg-success]="doc.submitted" [class.bg-secondary]="!doc.submitted">
              {{ doc.submitted ? ('INTERNS.SUBMITTED_LABEL' | translate) : ('INTERNS.PENDING_LABEL' | translate) }}
            </span>
          </div>
          <div class="d-flex gap-2 align-items-center flex-wrap">
            <input type="date" class="form-control form-control-sm" [(ngModel)]="doc.submittedDate" style="max-width:150px" />
            <input type="text" class="form-control form-control-sm" [(ngModel)]="doc.notes" [placeholder]="'INTERNS.NOTES_PLACEHOLDER' | translate" />
            <div class="form-check mb-0">
              <input class="form-check-input" type="checkbox" [(ngModel)]="doc.submitted" [id]="'doc-'+doc.id" />
              <label class="form-check-label small" [for]="'doc-'+doc.id">{{ 'INTERNS.SUBMITTED_LABEL' | translate }}</label>
            </div>
            <button class="btn btn-xs btn-primary" (click)="saveDoc(doc)">
              <i class="bx bx-save"></i>
            </button>
          </div>
        </div>
      </div>
      <div *ngIf="documents.length === 0" class="text-center text-muted py-4">
        <i class="bx bx-file" style="font-size:2rem"></i>
        <p class="mt-2 small">{{ 'INTERNS.NO_DOCUMENTS' | translate }}</p>
      </div>
    </div>
  </div>
</div>

<!-- Toast -->
<div class="toast-msg" *ngIf="toast" [class.toast-success]="toast.type==='success'" [class.toast-error]="toast.type==='error'">
  <i class="bx me-2" [class.bx-check-circle]="toast.type==='success'" [class.bx-x-circle]="toast.type==='error'"></i>
  {{ toast.msg }}
</div>
  `,
  styles: [`
    .page-header { display:flex; align-items:center; justify-content:space-between; padding:13px 20px; background:#fff; border-radius:12px; box-shadow:0 4px 20px rgba(22,34,51,.07); border-left:4px solid #2FA8A0; margin-bottom:0; }
    .page-title  { font-size:20px; font-weight:700; color:#1A2B3C; margin:0; }
    .header-meta { display:flex; align-items:center; gap:20px; }
    .header-date { font-size:13px; color:#8FA3B8; display:flex; align-items:center; gap:6px; }
    .action-row  { display:flex; justify-content:flex-end; margin-bottom:14px; }
    .big-action-btn { display:flex; align-items:center; justify-content:center; gap:8px; width:220px; padding:10px 16px; background:#1B7872; color:#fff; border:none; border-radius:10px; font-size:13.5px; font-weight:600; cursor:pointer; transition:background .15s; }
    .big-action-btn:hover { background:#155f5a; }
    .big-action-btn i { font-size:18px; }
    .stat-card { border-radius: 12px; box-shadow: 0 4px 20px rgba(22,34,51,.06); border-left: 4px solid transparent; }
    .stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #1A2B3C; }
    .stat-label { font-size: .75rem; color: #6c757d; }
    .avatar-circle { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: .85rem; flex-shrink: 0; }
    .btn-xs { padding: .2rem .45rem; font-size: .78rem; border-radius: 6px; }
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 1040; }
    .rp { position: fixed; top: 0; right: 0; width: 480px; height: 100vh; background: #fff; z-index: 1050; transform: translateX(100%); transition: transform .3s ease; display: flex; flex-direction: column; box-shadow: -8px 0 40px rgba(22,34,51,.15); }
    .rp.open { transform: translateX(0); }
    .rp-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f3f7; }
    .rp-body { flex: 1; overflow-y: auto; padding: 1.5rem; }
    .section-title { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #2FA8A0; margin-bottom: .75rem; margin-top: .5rem; }
    .label { font-size: .7rem; color: #9ca3af; display: block; }
    .value { font-size: .875rem; color: #1A2B3C; font-weight: 500; }
    .form-label-sm { font-size: .75rem; color: #6c757d; margin-bottom: .25rem; }
    .doc-card { background: #f8f9fc; border-radius: 10px; padding: 1rem; }
    .toast-msg { position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 9999; padding: .75rem 1.25rem; border-radius: 10px; color: #fff; font-size: .875rem; display: flex; align-items: center; box-shadow: 0 4px 20px rgba(0,0,0,.15); animation: fadeIn .3s ease; }
    .toast-success { background: #2FA8A0; }
    .toast-error { background: #ef4444; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .card { border-radius: 12px; border: none; box-shadow: 0 4px 20px rgba(22,34,51,.06); }
    .table thead th { font-size: .72rem; text-transform: uppercase; letter-spacing: .05em; color: #6c757d; font-weight: 600; border-bottom: 2px solid #f1f3f7; }
    .table tbody td { font-size: .85rem; vertical-align: middle; border-bottom: 1px solid #f8f9fc; }
    .table tbody tr:hover { background: #f8f9fc; }
  `]
})
export class StagiairesComponent implements OnInit {
  today = new Date();

  private readonly BASE = `${environment.apiUrl}/interns`;
  private readonly DEPT = `${environment.apiUrl}/departments`;

  interns: Intern[] = [];
  filtered: Intern[] = [];
  departments: { id: number; name: string }[] = [];

  loading = false;
  saving = false;
  docsLoading = false;

  searchText = '';
  filterStatus = '';
  filterType = '';

  currentPage = 0;
  pageSize = 20;
  totalPages = 0;

  panelOpen = false;
  editMode = false;
  createMode = false;
  docPanelOpen = false;

  selected: Intern | null = null;
  documents: InternDocument[] = [];

  toast: { msg: string; type: 'success' | 'error' } | null = null;

  form: any = this.emptyForm();

  readonly statuses = STATUSES;
  readonly internshipTypes = INTERNSHIP_TYPES;

  get statCards() {
    return [
      { label: this.translate.instant('INTERNS.STAT_TOTAL'), value: this.interns.length, icon: 'bx bx-group', color: '#1A2B3C' },
      { label: this.translate.instant('INTERNS.STAT_ACTIVE'), value: this.interns.filter(i => i.status === 'ACTIVE').length, icon: 'bx bx-user-check', color: '#2FA8A0' },
      { label: this.translate.instant('INTERNS.STAT_PENDING'), value: this.interns.filter(i => i.status === 'PENDING').length, icon: 'bx bx-time-five', color: '#f59e0b' },
      { label: this.translate.instant('INTERNS.STAT_COMPLETED'), value: this.interns.filter(i => i.status === 'COMPLETED').length, icon: 'bx bx-badge-check', color: '#10b981' },
    ];
  }

  constructor(private http: HttpClient, private confirmSvc: ConfirmService, private translate: TranslateService) {}

  ngOnInit(): void {
    forkJoin({
      depts: this.http.get<any>(this.DEPT).pipe(
        map(res => (res?.data ?? res?.content ?? (Array.isArray(res) ? res : []))),
        catchError(() => of([]))
      )
    }).subscribe(({ depts }) => {
      this.departments = depts;
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    let params = new HttpParams()
      .set('page', String(this.currentPage))
      .set('size', String(this.pageSize));
    if (this.searchText.trim()) params = params.set('search', this.searchText.trim());
    if (this.filterStatus) params = params.set('status', this.filterStatus);

    this.http.get<any>(this.BASE, { params }).pipe(
      map(res => res?.content ?? res?.data ?? (Array.isArray(res) ? res : [])),
      catchError(() => of([]))
    ).subscribe(items => {
      this.interns = items;
      this.applyFilter();
      this.loading = false;
    });
  }

  applyFilter(): void {
    let result = [...this.interns];
    if (this.filterType) result = result.filter(i => i.internshipType === this.filterType);
    this.filtered = result;
  }

  onSearch(): void {
    clearTimeout((this as any)._searchTimer);
    (this as any)._searchTimer = setTimeout(() => this.load(), 400);
  }

  changePage(p: number): void {
    this.currentPage = p;
    this.load();
  }

  docPct(i: Intern): number {
    return i.totalDocuments ? Math.round((i.submittedDocuments / i.totalDocuments) * 100) : 0;
  }

  getColor(status: string): string {
    return STATUS_COLORS[status] ?? '#6c757d';
  }

  openDetail(intern: Intern): void {
    this.selected = intern;
    this.editMode = false;
    this.createMode = false;
    this.panelOpen = true;
  }

  openEdit(intern: Intern): void {
    this.selected = intern;
    this.form = {
      firstName: intern.firstName,
      lastName: intern.lastName,
      cin: intern.cin,
      dateOfBirth: intern.dateOfBirth,
      departmentId: intern.department?.id ?? null,
      internshipSubject: intern.internshipSubject,
      supervisorName: intern.supervisorName,
      school: intern.school,
      internshipType: intern.internshipType,
      startDate: intern.startDate,
      endDate: intern.endDate,
      status: intern.status,
      version: intern.version
    };
    this.editMode = true;
    this.createMode = false;
    this.panelOpen = true;
  }

  openCreate(): void {
    this.selected = null;
    this.form = this.emptyForm();
    this.createMode = true;
    this.editMode = false;
    this.panelOpen = true;
  }

  cancelEdit(): void {
    if (this.selected) {
      this.editMode = false;
      this.createMode = false;
    } else {
      this.closePanel();
    }
  }

  closePanel(): void {
    this.panelOpen = false;
    this.editMode = false;
    this.createMode = false;
  }

  saveIntern(): void {
    if (!this.form.firstName || !this.form.lastName || !this.form.startDate || !this.form.endDate) {
      this.showToast(this.translate.instant('INTERNS.TOAST_MISSING_FIELDS'), 'error');
      return;
    }
    this.saving = true;
    const payload = { ...this.form };

    const req = this.editMode && this.selected
      ? this.http.put<any>(`${this.BASE}/${this.selected.id}`, payload)
      : this.http.post<any>(this.BASE, payload);

    req.pipe(
      map(res => res?.data ?? res),
      catchError(() => { this.saving = false; this.showToast(this.translate.instant('INTERNS.TOAST_SAVE_ERROR'), 'error'); return of(null); })
    ).subscribe(saved => {
      this.saving = false;
      if (!saved) return;
      this.showToast(this.translate.instant(this.editMode ? 'INTERNS.TOAST_UPDATED' : 'INTERNS.TOAST_CREATED'), 'success');
      this.closePanel();
      this.load();
    });
  }

  updateStatus(intern: Intern, status: string): void {
    const params = new HttpParams().set('status', status);
    this.http.patch<any>(`${this.BASE}/${intern.id}/status`, null, { params }).pipe(
      map(res => res?.data ?? res),
      catchError(() => { this.showToast(this.translate.instant('INTERNS.TOAST_STATUS_ERROR'), 'error'); return of(null); })
    ).subscribe(updated => {
      if (!updated) return;
      intern.status = status;
      if (this.selected?.id === intern.id) this.selected.status = status;
      this.applyFilter();
      this.showToast(this.translate.instant('INTERNS.TOAST_STATUS_UPDATED'), 'success');
    });
  }

  async deleteIntern(intern: Intern): Promise<void> {
    if (!(await this.confirmSvc.confirm(`${this.translate.instant('INTERNS.CONFIRM_DELETE_MSG').replace('{name}', `${intern.firstName} ${intern.lastName}`)}`, this.translate.instant('INTERNS.CONFIRM_DELETE_BTN')))) return;
    this.http.delete<any>(`${this.BASE}/${intern.id}`).pipe(
      catchError(() => { this.showToast(this.translate.instant('INTERNS.TOAST_DELETE_ERROR'), 'error'); return of(null); })
    ).subscribe(() => {
      this.showToast(this.translate.instant('INTERNS.TOAST_DELETED'), 'success');
      if (this.selected?.id === intern.id) this.closePanel();
      this.load();
    });
  }

  openDocs(intern: Intern): void {
    this.selected = intern;
    this.docPanelOpen = true;
    this.panelOpen = false;
    this.docsLoading = true;
    this.documents = [];
    this.http.get<any>(`${this.BASE}/${intern.id}/documents`).pipe(
      map(res => res?.data ?? (Array.isArray(res) ? res : [])),
      catchError(() => of([]))
    ).subscribe(docs => {
      this.documents = docs;
      this.docsLoading = false;
    });
  }

  closeDocPanel(): void {
    this.docPanelOpen = false;
  }

  saveDoc(doc: InternDocument): void {
    if (!this.selected) return;
    const payload = {
      documentType: doc.documentType,
      submitted: doc.submitted,
      submittedDate: doc.submittedDate || null,
      notes: doc.notes,
      version: doc.version
    };
    this.http.put<any>(`${this.BASE}/${this.selected.id}/documents`, payload).pipe(
      map(res => res?.data ?? res),
      catchError(() => { this.showToast(this.translate.instant('INTERNS.TOAST_DOC_ERROR'), 'error'); return of(null); })
    ).subscribe(saved => {
      if (!saved) return;
      doc.version = saved.version ?? doc.version;
      this.showToast(this.translate.instant('INTERNS.TOAST_DOC_UPDATED'), 'success');
    });
  }

  private emptyForm() {
    return {
      firstName: '', lastName: '', cin: '', dateOfBirth: '',
      departmentId: null, internshipSubject: '', supervisorName: '',
      school: '', internshipType: '', startDate: '', endDate: '',
      status: 'PENDING', version: null
    };
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toast = { msg, type };
    setTimeout(() => this.toast = null, 3500);
  }
}
