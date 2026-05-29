import { Component, OnInit, Pipe, PipeTransform, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
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
<div class="int-container">

  <!-- Header -->
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:18px;">
    <div class="page-header" style="flex:1;margin-bottom:0;">
      <h4 class="page-title">{{ 'INTERNS.TITLE' | translate }}</h4>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
      <app-wall-clock></app-wall-clock>
      <button class="int-add-btn" (click)="openCreate()">
        <i class="bx bx-plus"></i> {{ 'INTERNS.BTN_NEW' | translate }}
      </button>
    </div>
  </div>

  <!-- Stats row -->
  <div class="stat-row">
    <div class="stat-card" *ngFor="let s of statCards">
      <div class="stat-icon-wrap" [style.background]="s.color + '18'">
        <i [class]="s.icon" [style.color]="s.color"></i>
      </div>
      <div class="stat-body">
        <div class="stat-value">{{ s.value }}</div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </div>
  </div>

  <!-- Table Card -->
  <div class="int-table-card">

    <!-- Filter bar -->
    <div class="int-filter-bar">
      <div class="int-search-wrap">
        <i class="bx bx-search int-search-icon"></i>
        <input class="int-search-input" [placeholder]="'INTERNS.SEARCH_PLACEHOLDER' | translate"
          [(ngModel)]="searchText" (ngModelChange)="onSearch()" />
      </div>
      <div class="int-select-wrap">
        <select class="int-select" [(ngModel)]="filterStatus" (ngModelChange)="load()">
          <option value="">{{ 'INTERNS.FILTER_ALL_STATUSES' | translate }}</option>
          <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
        </select>
        <i class="bx bx-chevron-down int-select-arrow"></i>
      </div>
      <div class="int-select-wrap">
        <select class="int-select" [(ngModel)]="filterType" (ngModelChange)="applyFilter()">
          <option value="">{{ 'INTERNS.FILTER_ALL_TYPES' | translate }}</option>
          <option *ngFor="let t of internshipTypes" [value]="t">{{ t }}</option>
        </select>
        <i class="bx bx-chevron-down int-select-arrow"></i>
      </div>
      <span class="int-count-badge">{{ filtered.length }} résultats</span>
      <span class="int-updated"><i class="bx bx-refresh"></i> Updated recently</span>
    </div>

    <!-- Loading -->
    <div class="int-state-box" *ngIf="loading">
      <div class="int-spinner"></div>
      Chargement...
    </div>

    <!-- Empty -->
    <div class="int-state-box" *ngIf="!loading && filtered.length === 0">
      <i class="bx bx-user-x"></i>
      {{ 'INTERNS.NO_INTERNS' | translate }}
    </div>

    <!-- Table -->
    <div style="overflow-x:auto" *ngIf="!loading && filtered.length > 0">
      <table class="int-table">
        <thead>
          <tr>
            <th>{{ 'INTERNS.TABLE_INTERN' | translate }}</th>
            <th>{{ 'INTERNS.TABLE_SCHOOL_CIN' | translate }}</th>
            <th>{{ 'INTERNS.TABLE_TYPE' | translate }}</th>
            <th>{{ 'INTERNS.TABLE_DEPARTMENT' | translate }}</th>
            <th>{{ 'INTERNS.TABLE_PERIOD' | translate }}</th>
            <th>{{ 'INTERNS.TABLE_DOCUMENTS' | translate }}</th>
            <th>{{ 'INTERNS.TABLE_STATUS' | translate }}</th>
            <th>{{ 'INTERNS.TABLE_ACTIONS' | translate }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let intern of filtered" (click)="openDetail(intern)">
            <td>
              <div class="int-name-cell">
                <div class="int-avatar" [style.background]="getColor(intern.status)+'18'" [style.color]="getColor(intern.status)">
                  {{ intern.firstName[0] }}{{ intern.lastName[0] }}
                </div>
                <div>
                  <div class="int-name">{{ intern.firstName }} {{ intern.lastName }}</div>
                  <div class="int-sub-text">{{ intern.supervisorName || '—' }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="int-main-text">{{ intern.school || '—' }}</div>
              <div class="int-sub-text">{{ intern.cin || '—' }}</div>
            </td>
            <td><span class="int-type-chip">{{ intern.internshipType }}</span></td>
            <td class="int-sub-text">{{ intern.department?.name || '—' }}</td>
            <td>
              <div class="int-main-text">{{ intern.startDate | date:'dd/MM/yy' }} → {{ intern.endDate | date:'dd/MM/yy' }}</div>
              <div class="int-sub-text">{{ intern.durationMonths }} {{ 'INTERNS.MONTHS' | translate }}</div>
            </td>
            <td>
              <div class="int-doc-cell">
                <span class="int-main-text">{{ intern.submittedDocuments }}/{{ intern.totalDocuments }}</span>
                <div class="int-progress-bar">
                  <div class="int-progress-fill" [style.width]="docPct(intern)+'%'"></div>
                </div>
              </div>
            </td>
            <td>
              <span class="int-status-chip" [style.background]="getColor(intern.status)+'18'" [style.color]="getColor(intern.status)">
                {{ intern.status }}
              </span>
            </td>
            <td (click)="$event.stopPropagation()">
              <div class="int-actions">
                <button class="int-act-btn" (click)="openEdit(intern)" [title]="'INTERNS.BTN_EDIT' | translate"><i class="bx bx-pencil"></i></button>
                <button class="int-act-btn" (click)="openDocs(intern)" [title]="'INTERNS.BTN_DOCUMENTS' | translate"><i class="bx bx-file"></i></button>
                <button class="int-act-btn int-act-btn--del" (click)="deleteIntern(intern)" [title]="'INTERNS.BTN_DELETE' | translate"><i class="bx bx-trash"></i></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="int-pagination" *ngIf="totalPages > 1">
      <span class="int-page-info">{{ 'INTERNS.PAGINATION' | translate:{current: currentPage+1, total: totalPages} }}</span>
      <div class="int-page-btns">
        <button class="int-page-btn" [disabled]="currentPage === 0" (click)="changePage(currentPage - 1)"><i class="bx bx-chevron-left"></i></button>
        <button class="int-page-btn" [disabled]="currentPage >= totalPages - 1" (click)="changePage(currentPage + 1)"><i class="bx bx-chevron-right"></i></button>
      </div>
    </div>

  </div>

</div>

<!-- ── Detail / Create / Edit Panel ── -->
<div class="backdrop" *ngIf="panelOpen" (click)="closePanel()"></div>
<div class="rp" [class.open]="panelOpen">

  <!-- White header -->
  <div class="rp-white-header">
    <span class="rp-wh-title">
      {{ editMode ? ('INTERNS.PANEL_EDIT_TITLE' | translate) : (createMode ? ('INTERNS.PANEL_NEW_TITLE' | translate) : ('INTERNS.PANEL_DETAIL_TITLE' | translate)) }}
    </span>
    <button class="rp-wh-close" (click)="closePanel()"><i class="bx bx-x"></i></button>
  </div>

  <div class="rp-body" *ngIf="panelOpen">

    <!-- View mode -->
    <ng-container *ngIf="!editMode && !createMode && selected">
      <div class="dr-section-title">{{ 'INTERNS.DETAIL_PERSONAL_INFO' | translate }}</div>
      <div class="dr-form-grid mb-4">
        <div class="dr-field"><span class="dr-label">{{ 'INTERNS.FIELD_FIRSTNAME' | translate }}</span><div class="dr-value">{{ selected.firstName }}</div></div>
        <div class="dr-field"><span class="dr-label">{{ 'INTERNS.FIELD_LASTNAME' | translate }}</span><div class="dr-value">{{ selected.lastName }}</div></div>
        <div class="dr-field"><span class="dr-label">{{ 'INTERNS.FIELD_CIN' | translate }}</span><div class="dr-value">{{ selected.cin || '—' }}</div></div>
        <div class="dr-field"><span class="dr-label">{{ 'INTERNS.FIELD_DATE_OF_BIRTH' | translate }}</span><div class="dr-value">{{ selected.dateOfBirth | date:'dd/MM/yyyy' }}</div></div>
      </div>
      <div class="dr-section-title">{{ 'INTERNS.DETAIL_INTERNSHIP' | translate }}</div>
      <div class="dr-form-grid mb-4">
        <div class="dr-field"><span class="dr-label">{{ 'INTERNS.FIELD_SCHOOL' | translate }}</span><div class="dr-value">{{ selected.school || '—' }}</div></div>
        <div class="dr-field"><span class="dr-label">{{ 'INTERNS.FIELD_TYPE' | translate }}</span><div class="dr-value">{{ selected.internshipType }}</div></div>
        <div class="dr-field dr-field--full"><span class="dr-label">{{ 'INTERNS.FIELD_SUBJECT' | translate }}</span><div class="dr-value">{{ selected.internshipSubject || '—' }}</div></div>
        <div class="dr-field"><span class="dr-label">{{ 'INTERNS.FIELD_SUPERVISOR' | translate }}</span><div class="dr-value">{{ selected.supervisorName || '—' }}</div></div>
        <div class="dr-field"><span class="dr-label">{{ 'INTERNS.FIELD_DEPARTMENT' | translate }}</span><div class="dr-value">{{ selected.department?.name || '—' }}</div></div>
        <div class="dr-field"><span class="dr-label">{{ 'INTERNS.FIELD_START' | translate }}</span><div class="dr-value">{{ selected.startDate | date:'dd/MM/yyyy' }}</div></div>
        <div class="dr-field"><span class="dr-label">{{ 'INTERNS.FIELD_END' | translate }}</span><div class="dr-value">{{ selected.endDate | date:'dd/MM/yyyy' }}</div></div>
        <div class="dr-field"><span class="dr-label">{{ 'INTERNS.FIELD_DURATION' | translate }}</span><div class="dr-value">{{ selected.durationMonths }} {{ 'INTERNS.MONTHS' | translate }}</div></div>
      </div>
      <div class="dr-section-title">{{ 'INTERNS.DETAIL_STATUS' | translate }}</div>
      <div class="d-flex gap-2 flex-wrap mb-4">
        <button *ngFor="let s of statuses" class="dr-status-btn"
          [style.background]="selected.status === s ? getColor(s) : getColor(s)+'18'"
          [style.color]="selected.status === s ? '#fff' : getColor(s)"
          [style.border-color]="selected.status === s ? getColor(s) : getColor(s)+'44'"
          [style.font-weight]="selected.status === s ? '700' : '500'"
          (click)="updateStatus(selected, s)">{{ s }}</button>
      </div>
      <div class="dr-footer">
        <button class="dr-btn-cancel" (click)="openDocs(selected)"><i class="bx bx-file"></i> {{ 'INTERNS.BTN_DOCUMENTS' | translate }}</button>
        <button class="dr-btn-create" (click)="openEdit(selected)"><i class="bx bx-edit"></i> {{ 'INTERNS.BTN_EDIT' | translate }}</button>
      </div>
    </ng-container>

    <!-- Create / Edit form -->
    <ng-container *ngIf="editMode || createMode">
      <form (ngSubmit)="saveIntern()">

        <div class="dr-section-title">{{ 'INTERNS.FORM_PERSONAL_INFO' | translate }}</div>
        <div class="dr-form-grid mb-4">
          <div class="dr-field">
            <label class="dr-field-label">{{ 'INTERNS.FORM_FIELD_FIRSTNAME' | translate }} <span class="dr-required">*</span></label>
            <input class="dr-input" [(ngModel)]="form.firstName" name="firstName" required placeholder="Enter first name" />
          </div>
          <div class="dr-field">
            <label class="dr-field-label">{{ 'INTERNS.FORM_FIELD_LASTNAME' | translate }} <span class="dr-required">*</span></label>
            <input class="dr-input" [(ngModel)]="form.lastName" name="lastName" required placeholder="Enter last name" />
          </div>
          <div class="dr-field">
            <label class="dr-field-label">{{ 'INTERNS.FORM_FIELD_CIN' | translate }}</label>
            <input class="dr-input" [(ngModel)]="form.cin" name="cin" placeholder="National ID" />
          </div>
          <div class="dr-field">
            <label class="dr-field-label">{{ 'INTERNS.FORM_FIELD_DOB' | translate }}</label>
            <input type="date" class="dr-input" [(ngModel)]="form.dateOfBirth" name="dateOfBirth" />
          </div>
        </div>

        <div class="dr-section-title">{{ 'INTERNS.FORM_INTERNSHIP' | translate }}</div>
        <div class="dr-form-grid mb-4">
          <div class="dr-field dr-field--full">
            <label class="dr-field-label">{{ 'INTERNS.FORM_FIELD_SCHOOL' | translate }}</label>
            <input class="dr-input" [(ngModel)]="form.school" name="school" placeholder="School / University" />
          </div>
          <div class="dr-field">
            <label class="dr-field-label">{{ 'INTERNS.FORM_FIELD_TYPE' | translate }}</label>
            <select class="dr-input" [(ngModel)]="form.internshipType" name="internshipType">
              <option value="">Select type</option>
              <option *ngFor="let t of internshipTypes" [value]="t">{{ t }}</option>
            </select>
          </div>
          <div class="dr-field">
            <label class="dr-field-label">{{ 'INTERNS.FORM_FIELD_DEPT' | translate }}</label>
            <select class="dr-input" [(ngModel)]="form.departmentId" name="departmentId">
              <option [ngValue]="null">Select department</option>
              <option *ngFor="let d of departments" [ngValue]="d.id">{{ d.name }}</option>
            </select>
          </div>
          <div class="dr-field dr-field--full">
            <label class="dr-field-label">{{ 'INTERNS.FORM_FIELD_SUBJECT' | translate }}</label>
            <textarea class="dr-input" style="resize:vertical;min-height:68px" [(ngModel)]="form.internshipSubject" name="internshipSubject" rows="2" placeholder="Internship subject / topic"></textarea>
          </div>
          <div class="dr-field dr-field--full">
            <label class="dr-field-label">{{ 'INTERNS.FORM_FIELD_SUPERVISOR' | translate }}</label>
            <input class="dr-input" [(ngModel)]="form.supervisorName" name="supervisorName" placeholder="Supervisor name" />
          </div>
          <div class="dr-field">
            <label class="dr-field-label">{{ 'INTERNS.FORM_FIELD_START' | translate }} <span class="dr-required">*</span></label>
            <input type="date" class="dr-input" [(ngModel)]="form.startDate" name="startDate" required />
          </div>
          <div class="dr-field">
            <label class="dr-field-label">{{ 'INTERNS.FORM_FIELD_END' | translate }} <span class="dr-required">*</span></label>
            <input type="date" class="dr-input" [(ngModel)]="form.endDate" name="endDate" required />
          </div>
          <div class="dr-field" *ngIf="editMode">
            <label class="dr-field-label">{{ 'INTERNS.FORM_FIELD_STATUS' | translate }}</label>
            <select class="dr-input" [(ngModel)]="form.status" name="status">
              <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
            </select>
          </div>
        </div>

        <div class="dr-footer">
          <button type="button" class="dr-btn-cancel" (click)="cancelEdit()">{{ 'INTERNS.BTN_CANCEL' | translate }}</button>
          <button type="submit" class="dr-btn-create" [disabled]="saving">
            <span *ngIf="saving" class="dr-spinner"></span>
            {{ editMode ? ('INTERNS.BTN_SAVE' | translate) : ('INTERNS.BTN_CREATE' | translate) }}
          </button>
        </div>
      </form>
    </ng-container>

  </div>
</div>

<!-- ── Documents Panel ── -->
<div class="backdrop" *ngIf="docPanelOpen" (click)="closeDocPanel()"></div>
<div class="rp" [class.open]="docPanelOpen">
  <div class="rp-white-header">
    <span class="rp-wh-title">{{ 'INTERNS.DOCS_PANEL_TITLE' | translate }}<span *ngIf="selected" style="font-weight:400;color:#8FA3B8;font-size:13px;margin-left:8px;">— {{ selected.firstName }} {{ selected.lastName }}</span></span>
    <button class="rp-wh-close" (click)="closeDocPanel()"><i class="bx bx-x"></i></button>
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
    /* ── Container ── */
    .int-container { padding:0 24px 40px; animation:fadeIn .4s ease both; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }

    /* ── Header ── */
    .int-header { display:flex; align-items:center; justify-content:space-between; padding:14px 20px; background:#fff; border-radius:12px; box-shadow:0 4px 20px rgba(22,34,51,.08); }
    .int-header__title { font-family:'Inter',sans-serif; font-size:22px; font-weight:700; color:#1A2B3C; margin:0; }
    .int-add-btn { display:inline-flex; align-items:center; gap:8px; padding:10px 20px; background:#1B7872; color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; transition:background .15s; white-space:nowrap; }
    .int-add-btn:hover { background:#155f5a; }

    /* ── Stats ── */
    .stat-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:20px; }
    .stat-card { background:#fff; border-radius:14px; box-shadow:0 2px 12px rgba(22,34,51,.07); padding:18px 20px; display:flex; align-items:center; gap:16px; border:1px solid #f0f3f6; }
    .stat-icon-wrap { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; flex-shrink:0; }
    .stat-body { display:flex; flex-direction:column; gap:2px; }
    .stat-value { font-size:1.75rem; font-weight:800; color:#1A2B3C; line-height:1; }
    .stat-label { font-size:.775rem; color:#8FA3B8; margin-top:4px; }

    /* ── Table Card ── */
    .int-table-card { background:#fff; border-radius:12px; box-shadow:0 4px 20px rgba(22,34,51,.08); overflow:hidden; }

    /* ── Filter bar ── */
    .int-filter-bar { display:flex; align-items:center; gap:12px; padding:14px 20px; border-bottom:1px solid #f0f3f6; flex-wrap:wrap; }
    .int-search-wrap { position:relative; flex:1; min-width:180px; max-width:300px; }
    .int-search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#8FA3B8; font-size:15px; pointer-events:none; }
    .int-search-input { width:100%; padding:8px 12px 8px 34px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; color:#1A2B3C; outline:none; transition:border .15s; box-sizing:border-box; }
    .int-search-input:focus { border-color:#2FA8A0; }
    .int-select-wrap { position:relative; }
    .int-select { padding:8px 30px 8px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; color:#1A2B3C; background:#fff; appearance:none; outline:none; cursor:pointer; transition:border .15s; }
    .int-select:focus { border-color:#2FA8A0; }
    .int-select-arrow { position:absolute; right:8px; top:50%; transform:translateY(-50%); font-size:14px; color:#8FA3B8; pointer-events:none; }
    .int-count-badge { font-size:12px; color:#8FA3B8; background:#f8fafc; border:1px solid #e2e8f0; border-radius:20px; padding:4px 12px; white-space:nowrap; }
    .int-updated { margin-left:auto; font-size:12px; color:#8FA3B8; display:flex; align-items:center; gap:4px; }

    /* ── State boxes ── */
    .int-state-box { padding:56px 0; text-align:center; color:#8FA3B8; font-size:14px; }
    .int-state-box i { font-size:36px; display:block; margin-bottom:10px; }
    .int-spinner { width:30px; height:30px; border:3px solid #e2e8f0; border-top-color:#2FA8A0; border-radius:50%; animation:spin .7s linear infinite; margin:0 auto 12px; }
    @keyframes spin { to{transform:rotate(360deg)} }

    /* ── Table ── */
    .int-table { width:100%; border-collapse:collapse; table-layout:auto; }
    .int-table thead tr { background:#fafbfc; }
    .int-table thead th { padding:11px 16px; font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:#8FA3B8; border-bottom:1px solid #f0f3f6; white-space:nowrap; }
    .int-table tbody tr { cursor:pointer; transition:background .15s; }
    .int-table tbody tr:hover { background:#f8fffe; }
    .int-table tbody td { padding:12px 16px; font-size:13px; color:#4A6080; border-bottom:1px solid #f5f7fa; vertical-align:middle; }
    .int-table tbody tr:last-child td { border-bottom:none; }

    /* ── Cell helpers ── */
    .int-name-cell { display:flex; align-items:center; gap:10px; }
    .int-avatar { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:.82rem; flex-shrink:0; }
    .int-name { font-weight:600; color:#1A2B3C; font-size:13px; }
    .int-main-text { font-size:13px; color:#1A2B3C; font-weight:500; }
    .int-sub-text { font-size:11.5px; color:#8FA3B8; margin-top:1px; }
    .int-type-chip { display:inline-block; padding:3px 10px; border-radius:6px; font-size:11.5px; font-weight:600; background:#f1f5f9; color:#4A6080; }
    .int-status-chip { display:inline-block; padding:4px 12px; border-radius:20px; font-size:11.5px; font-weight:600; white-space:nowrap; }
    .int-doc-cell { display:flex; flex-direction:column; gap:5px; }
    .int-progress-bar { width:64px; height:4px; background:#f0f3f6; border-radius:4px; overflow:hidden; }
    .int-progress-fill { height:100%; background:#2FA8A0; border-radius:4px; transition:width .3s; }
    .int-actions { display:flex; align-items:center; gap:6px; }
    .int-act-btn { width:30px; height:30px; border-radius:6px; border:1px solid #e2e8f0; background:#fff; color:#8FA3B8; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:14px; transition:all .15s; }
    .int-act-btn:hover { background:#f1f5f9; color:#4A6080; border-color:#cbd5e1; }
    .int-act-btn--del:hover { background:#fee2e2; color:#ef4444; border-color:#fca5a5; }

    /* ── Pagination ── */
    .int-pagination { display:flex; align-items:center; justify-content:space-between; padding:12px 20px; border-top:1px solid #f0f3f6; }
    .int-page-info { font-size:12.5px; color:#8FA3B8; }
    .int-page-btns { display:flex; gap:6px; }
    .int-page-btn { width:32px; height:32px; border-radius:6px; border:1px solid #e2e8f0; background:#fff; color:#4A6080; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px; transition:all .15s; }
    .int-page-btn:hover:not([disabled]) { background:#f8fafc; border-color:#cbd5e1; }
    .int-page-btn[disabled] { opacity:.4; cursor:default; }

    /* ── Side Panel ── */
    .backdrop { position:fixed; inset:0; background:rgba(0,0,0,.35); backdrop-filter:blur(2px); z-index:1040; }
    .rp { position:fixed; top:0; right:0; width:520px; height:100vh; background:#fff; z-index:1050; transform:translateX(100%); transition:transform .3s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column; box-shadow:-4px 0 30px rgba(22,34,51,.12); }
    .rp.open { transform:translateX(0); }
    .rp-white-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 16px; border-bottom:1px solid #eef1f6; flex-shrink:0; }
    .rp-wh-title { font-family:'Inter',sans-serif; font-size:17px; font-weight:700; color:#1A2B3C; }
    .rp-wh-close { width:32px; height:32px; border-radius:8px; background:#f1f3f7; border:none; color:#6c757d; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:18px; transition:all .15s; }
    .rp-wh-close:hover { background:#e2e6ea; color:#1A2B3C; }
    .rp-body { flex:1; overflow-y:auto; padding:24px; scrollbar-width:thin; scrollbar-color:#e2e8f0 transparent; }

    /* ── Panel sections ── */
    .dr-section-title { font-family:'Inter',sans-serif; font-size:13px; font-weight:700; color:#1A2B3C; margin:0 0 14px; padding-bottom:10px; border-bottom:1px solid #eef1f6; text-transform:uppercase; letter-spacing:.05em; }
    .dr-label { font-size:.75rem; color:#8FA3B8; display:block; margin-bottom:3px; }
    .dr-value { font-size:.875rem; color:#1A2B3C; font-weight:500; }
    .dr-status-btn { padding:5px 13px; border-radius:20px; border:1.5px solid; font-size:.75rem; cursor:pointer; transition:all .15s; }
    .dr-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .dr-field { display:flex; flex-direction:column; gap:6px; }
    .dr-field--full { grid-column:1/-1; }
    .dr-field-label { font-size:13px; font-weight:500; color:#1A2B3C; }
    .dr-required { color:#ef4444; margin-left:2px; }
    .dr-input { width:100%; border:1.5px solid #dde3ec; border-radius:8px; padding:10px 13px; font-size:13px; color:#1A2B3C; font-family:'Inter',sans-serif; outline:none; transition:border-color .15s,box-shadow .15s; background:#fff; box-sizing:border-box; }
    .dr-input:focus { border-color:#2FA8A0; box-shadow:0 0 0 3px rgba(47,168,160,.1); }
    .dr-input::placeholder { color:#b0bec5; }
    .dr-footer { display:flex; justify-content:flex-end; gap:10px; padding-top:16px; margin-top:8px; border-top:1px solid #eef1f6; }
    .dr-btn-cancel { padding:10px 22px; background:#fff; color:#4A6080; border:1.5px solid #dde3ec; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; transition:all .15s; }
    .dr-btn-cancel:hover { border-color:#b0bec5; }
    .dr-btn-create { display:flex; align-items:center; gap:7px; padding:10px 24px; background:#162233; color:#fff; border:none; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; transition:background .15s; }
    .dr-btn-create:hover:not(:disabled) { background:#2FA8A0; }
    .dr-btn-create:disabled { opacity:.6; cursor:not-allowed; }
    .dr-spinner { width:13px; height:13px; border:2px solid rgba(255,255,255,.35); border-top-color:#fff; border-radius:50%; animation:spin .6s linear infinite; display:inline-block; }

    /* ── Doc card ── */
    .doc-card { background:#f8fafc; border-radius:10px; padding:14px 16px; border:1px solid #eef1f6; margin-bottom:10px; }

    /* ── Toast ── */
    .toast-msg { position:fixed; bottom:1.5rem; right:1.5rem; z-index:9999; padding:.75rem 1.25rem; border-radius:10px; color:#fff; font-size:.875rem; display:flex; align-items:center; box-shadow:0 4px 20px rgba(0,0,0,.15); animation:fadeIn .3s ease; }
    .toast-success { background:#2FA8A0; }
    .toast-error   { background:#ef4444; }

    /* ─── DARK MODE ─── */
    :host-context([data-theme="dark"]) .int-header { background:#111111 !important; box-shadow:0 4px 20px rgba(0,0,0,.3); }
    :host-context([data-theme="dark"]) .int-header__title { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .stat-card { background:#111111 !important; border-color:#2A2A2A !important; box-shadow:0 2px 12px rgba(0,0,0,.3); }
    :host-context([data-theme="dark"]) .stat-value { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .stat-label { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .int-table-card { background:#111111 !important; box-shadow:0 4px 20px rgba(0,0,0,.3); }
    :host-context([data-theme="dark"]) .int-filter-bar { border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .int-search-input { background:#1A1A1A !important; border-color:#2A2A2A !important; color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .int-search-input::placeholder { color:#3A5170; }
    :host-context([data-theme="dark"]) .int-select { background:#1A1A1A !important; border-color:#2A2A2A !important; color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .int-count-badge { background:#1A1A1A !important; border-color:#2A2A2A !important; color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .int-updated { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .int-table thead tr { background:#1A1A1A !important; }
    :host-context([data-theme="dark"]) .int-table thead th { color:#6B6B6B !important; border-bottom:2px solid #2FA8A0; }
    :host-context([data-theme="dark"]) .int-table tbody tr:hover { background:rgba(47,168,160,.06) !important; }
    :host-context([data-theme="dark"]) .int-table tbody td { color:#A0A0A0 !important; border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .int-table tbody tr:last-child td { border-bottom:none; }
    :host-context([data-theme="dark"]) .int-name { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .int-main-text { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .int-sub-text { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .int-type-chip { background:#1A1A1A !important; color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .int-progress-bar { background:#1A1A1A !important; }
    :host-context([data-theme="dark"]) .int-act-btn { background:#111111 !important; border-color:#2A2A2A !important; color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .int-act-btn:hover { background:#1A1A1A !important; color:#A0A0A0 !important; border-color:#2FA8A0; }
    :host-context([data-theme="dark"]) .int-act-btn--del:hover { background:#3B0A0A; color:#F87171; border-color:#F87171; }
    :host-context([data-theme="dark"]) .int-pagination { border-top-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .int-page-info { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .int-page-btn { background:#1A1A1A !important; border-color:#2A2A2A !important; color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .int-page-btn:hover:not([disabled]) { background:#1A1A1A !important; border-color:#2FA8A0; }
    :host-context([data-theme="dark"]) .rp { background:#111111 !important; }
    :host-context([data-theme="dark"]) .rp-white-header { border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .rp-wh-title { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .rp-wh-close { background:#1A1A1A !important; color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .rp-wh-close:hover { background:#2A2A2A !important; color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .dr-section-title { color:#FFFFFF !important; border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .dr-label { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .dr-value { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .dr-field-label { color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .dr-input { background:#1A1A1A !important; border-color:#2A2A2A !important; color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .dr-input::placeholder { color:#555555; }
    :host-context([data-theme="dark"]) .dr-input:focus { border-color:#2FA8A0 !important; box-shadow:0 0 0 3px rgba(47,168,160,.15) !important; }
    :host-context([data-theme="dark"]) .dr-footer { border-top-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .dr-btn-cancel { background:#1A1A1A !important; border-color:#2A2A2A !important; color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .dr-btn-cancel:hover { background:#2A2A2A !important; border-color:#3A3A3A !important; }
    :host-context([data-theme="dark"]) .dr-btn-create { background:#2FA8A0 !important; color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .dr-btn-create:hover:not(:disabled) { background:#1B7872 !important; }
    :host-context([data-theme="dark"]) .doc-card { background:#1A1A1A !important; border-color:#2A2A2A !important; }
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

  constructor(private http: HttpClient, private confirmSvc: ConfirmService, private translate: TranslateService, private router: Router) {}

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const prefill = nav?.extras?.state?.['prefill'] ?? history.state?.prefill;

    forkJoin({
      depts: this.http.get<any>(this.DEPT).pipe(
        map(res => (res?.data ?? res?.content ?? (Array.isArray(res) ? res : []))),
        catchError(() => of([]))
      )
    }).subscribe(({ depts }) => {
      this.departments = depts;
      this.load();
      if (prefill) {
        this.form = { ...this.emptyForm(), ...prefill };
        this.createMode = true;
        this.editMode = false;
        this.selected = null;
        this.panelOpen = true;
      }
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
