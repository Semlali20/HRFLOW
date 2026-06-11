import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OnboardingService } from './onboarding.service';
import { CollaborateurService } from 'src/app/core/services/collaborateur.service';
import { WallClockComponent } from 'src/app/shared/wall-clock/wall-clock.component';
import { ConfirmService } from 'src/app/shared/confirm.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, TranslateModule, WallClockComponent],
  styles: [`
    /* ── Page wrapper ── */
    .page { padding:0 24px 40px; animation:fadeIn .4s ease both; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none} }

    /* ── Toolbar ── */
    .toolbar { display:flex; align-items:center; justify-content:flex-end; margin-bottom:18px; flex-wrap:wrap; gap:10px; }
    .toolbar-info { font-size:13px; color:var(--hr-text-muted); }
    .btn-new { padding:9px 20px; background:var(--hr-teal); color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; font-family:var(--hr-font-body); transition:background .2s; }
    .btn-new:hover { background:#228880; }

    /* ── Table card ── */
    .table-card { background:var(--hr-card-bg); border-radius:var(--hr-radius); box-shadow:var(--hr-shadow-md); overflow:hidden; }
    table { width:100%; border-collapse:collapse; }
    thead tr { background:var(--hr-page-bg); }
    thead th { padding:12px 16px; font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--hr-text-muted); border-bottom:1px solid var(--hr-border); white-space:nowrap; font-family:var(--hr-font-display); }
    tbody tr { transition:background .15s; cursor:pointer; }
    tbody tr:hover { background:var(--hr-teal-bg); }
    tbody td { padding:12px 16px; font-size:13px; color:var(--hr-text-secondary); border-bottom:1px solid var(--hr-border); vertical-align:middle; font-family:var(--hr-font-body); }
    tbody tr:last-child td { border-bottom:none; }

    /* ── Progress bar ── */
    .prog-bar-wrap { display:flex; align-items:center; gap:8px; }
    .prog-bar { flex:1; height:6px; background:var(--hr-border); border-radius:3px; overflow:hidden; min-width:80px; }
    .prog-bar-fill { height:100%; background:var(--hr-teal); border-radius:3px; transition:width .3s; }
    .prog-pct { font-size:12px; color:var(--hr-text-muted); min-width:32px; }

    /* ── Badges (semantic — keep stable across themes) ── */
    .badge { display:inline-flex; padding:3px 10px; border-radius:6px; font-size:11.5px; font-weight:700; font-family:var(--hr-font-body); }
    .badge-onboarding  { background:#DCFCE7; color:#15803D; }
    .badge-offboarding { background:#FFE4E6; color:#BE123C; }
    .badge-in-progress { background:#DBEAFE; color:#1E40AF; }
    .badge-completed   { background:#DCFCE7; color:#15803D; }
    .badge-cancelled   { background:#F1F5F9; color:#4A6080; }
    .badge-hr          { background:#FEF3C7; color:#92400E; }
    .badge-it          { background:#EDE9FE; color:#6D28D9; }
    .badge-manager     { background:#DBEAFE; color:#1E40AF; }
    .badge-employee    { background:#E8F7F6; color:#1B7872; }

    /* ── States ── */
    .state-box { padding:48px 0; text-align:center; color:var(--hr-text-muted); font-size:14px; }
    .state-box i { font-size:36px; display:block; margin-bottom:10px; color:var(--hr-border); }
    .state-box--error { color:#EF4444; }
    .state-box--error i { color:#EF4444; }
    .spinner { width:32px; height:32px; border:3px solid var(--hr-border); border-top-color:var(--hr-teal); border-radius:50%; animation:spin .7s linear infinite; margin:0 auto 10px; }
    @keyframes spin { to { transform:rotate(360deg); } }

    /* ── Pagination ── */
    .pagination-row  { display:flex; align-items:center; justify-content:space-between; padding:12px 20px; border-top:1px solid var(--hr-border); }
    .pagination-info { font-size:12.5px; color:var(--hr-text-muted); }
    .pagination-btns { display:flex; gap:4px; }
    .page-btn { padding:5px 12px; border-radius:6px; border:1px solid var(--hr-border); background:var(--hr-card-bg); font-size:13px; color:var(--hr-text-secondary); cursor:pointer; transition:all .15s; }
    .page-btn.active { background:var(--hr-teal); color:#fff; border-color:var(--hr-teal); }
    .page-btn:hover:not(.active):not(:disabled) { background:var(--hr-teal-bg); border-color:var(--hr-teal); }
    .page-btn:disabled { opacity:.4; cursor:default; }

    /* ── Side panel ── */
    .panel-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.3); z-index:1000; animation:fadeOverlay .2s ease; }
    @keyframes fadeOverlay { from{opacity:0}to{opacity:1} }
    .side-panel { position:fixed; top:0; right:0; bottom:0; width:440px; background:var(--hr-card-bg); box-shadow:-4px 0 24px rgba(22,34,51,.12); z-index:1001; display:flex; flex-direction:column; animation:slideIn .25s ease; overflow:hidden; }
    @keyframes slideIn { from{transform:translateX(100%)}to{transform:none} }

    .panel-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 16px; border-bottom:1px solid var(--hr-border); }
    .panel-title  { font-size:16px; font-weight:700; color:var(--hr-text-primary); font-family:var(--hr-font-display); }
    .panel-close  { width:30px; height:30px; border-radius:8px; border:none; background:var(--hr-page-bg); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:18px; color:var(--hr-text-secondary); transition:background .15s; }
    .panel-close:hover { background:var(--hr-border); }

    .panel-meta      { padding:16px 24px; background:var(--hr-page-bg); border-bottom:1px solid var(--hr-border); display:flex; flex-wrap:wrap; gap:8px 16px; }
    .panel-meta-item { font-size:12.5px; color:var(--hr-text-secondary); display:flex; gap:4px; align-items:center; }
    .panel-meta-item strong { color:var(--hr-text-primary); }

    .panel-body { flex:1; overflow-y:auto; padding:16px 24px; }

    /* ── Task list ── */
    .task-item  { display:flex; align-items:flex-start; gap:12px; padding:12px 0; border-bottom:1px solid var(--hr-border); }
    .task-item:last-child { border-bottom:none; }
    .task-check { flex-shrink:0; width:20px; height:20px; border-radius:50%; border:2px solid var(--hr-border); cursor:pointer; display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; transition:all .2s; }
    .task-check.done  { background:var(--hr-teal); border-color:var(--hr-teal); }
    .task-check:hover { border-color:var(--hr-teal); }
    .task-content     { flex:1; }
    .task-title       { font-size:13.5px; font-weight:600; color:var(--hr-text-primary); }
    .task-title.done  { text-decoration:line-through; color:var(--hr-text-muted); }
    .task-meta  { display:flex; gap:8px; align-items:center; margin-top:4px; flex-wrap:wrap; }
    .task-due   { font-size:11.5px; color:var(--hr-text-muted); }
    .task-due.overdue { color:#EF4444; font-weight:600; }
    .task-notes { font-size:12px; color:var(--hr-text-secondary); margin-top:4px; font-style:italic; }

    /* ── New Process Modal ── */
    .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:2000; display:flex; align-items:center; justify-content:center; animation:fadeOverlay .2s ease; }
    .modal-card     { background:var(--hr-card-bg); border-radius:16px; padding:28px 32px; width:480px; max-width:96vw; box-shadow:var(--hr-shadow-lg); }
    .modal-title    { font-size:18px; font-weight:700; color:var(--hr-text-primary); margin:0 0 20px; font-family:var(--hr-font-display); }
    .form-group     { margin-bottom:16px; }
    .form-label     { display:block; font-size:12px; font-weight:600; color:var(--hr-text-muted); margin-bottom:5px; font-family:var(--hr-font-display); }
    .form-control   { width:100%; padding:9px 12px; border:1.5px solid var(--hr-border); border-radius:8px; font-size:13px; color:var(--hr-text-primary); background:var(--hr-card-bg); font-family:var(--hr-font-body); box-sizing:border-box; transition:border-color .15s; }
    .form-control:focus { outline:none; border-color:var(--hr-teal); box-shadow:0 0 0 3px rgba(47,168,160,.1); }
    .modal-actions  { display:flex; gap:10px; justify-content:flex-end; margin-top:20px; }
    .btn-cancel     { padding:9px 20px; background:var(--hr-page-bg); color:var(--hr-text-secondary); border:1.5px solid var(--hr-border); border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; font-family:var(--hr-font-body); transition:background .15s; }
    .btn-cancel:hover { background:var(--hr-border); }
    .btn-submit     { padding:9px 20px; background:var(--hr-teal); color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; font-family:var(--hr-font-body); transition:background .2s; }
    .btn-submit:hover { background:#228880; }
    .btn-submit:disabled { opacity:.5; cursor:default; }
    .btn-cancel-process { padding:4px 12px; border:1.5px solid #EF4444; color:#EF4444; border-radius:6px; background:none; cursor:pointer; font-size:12px; font-weight:600; transition:background .15s; }
    .btn-cancel-process:hover { background:#FFF5F5; }

    /* ── Panel footer (create form) ── */
    .panel-footer { padding:16px 24px; border-top:1px solid var(--hr-border); display:flex; gap:10px; justify-content:flex-end; }

    /* ── Panel section label ── */
    .panel-section-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--hr-text-muted); margin-bottom:10px; display:flex; align-items:center; gap:6px; font-family:var(--hr-font-display); }
    .panel-section-title i { font-size:14px; color:var(--hr-teal); }

    /* ── KPI Cards ── */
    .ob-kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
    @media(max-width:900px){ .ob-kpi-row{ grid-template-columns:repeat(2,1fr); } }
    @media(max-width:520px){ .ob-kpi-row{ grid-template-columns:1fr; } }

    .ob-kpi { background:var(--hr-card-bg); border-radius:var(--hr-radius); box-shadow:var(--hr-shadow-md); padding:18px 20px; display:flex; align-items:center; gap:16px; border-left:4px solid transparent; transition:transform .15s,box-shadow .15s; }
    .ob-kpi:hover { transform:translateY(-2px); box-shadow:var(--hr-shadow-lg); }
    .ob-kpi--teal    { border-left-color:#2FA8A0; }
    .ob-kpi--amber   { border-left-color:#F59E0B; }
    .ob-kpi--blue    { border-left-color:#3B82F6; }
    .ob-kpi--emerald { border-left-color:#10B981; }

    .ob-kpi-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
    .ob-kpi--teal    .ob-kpi-icon { background:rgba(47,168,160,.12); color:#2FA8A0; }
    .ob-kpi--amber   .ob-kpi-icon { background:rgba(245,158,11,.12);  color:#F59E0B; }
    .ob-kpi--blue    .ob-kpi-icon { background:rgba(59,130,246,.12);  color:#3B82F6; }
    .ob-kpi--emerald .ob-kpi-icon { background:rgba(16,185,129,.12);  color:#10B981; }

    .ob-kpi-body {}
    .ob-kpi-value { font-size:28px; font-weight:800; color:var(--hr-text-primary); line-height:1; font-family:var(--hr-font-display); }
    .ob-kpi-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:var(--hr-text-muted); margin-top:4px; font-family:var(--hr-font-display); }

    /* dark/teal KPI overrides */
    :host-context([data-theme="dark"]) .ob-kpi { background:#111 !important; }
    :host-context([data-theme="teal"]) .ob-kpi { border-left:none !important; border-top:2px solid #00B5AE !important; }
    :host-context([data-theme="teal"]) .ob-kpi--amber   { border-top-color:#F59E0B !important; }
    :host-context([data-theme="teal"]) .ob-kpi--blue    { border-top-color:#3B82F6 !important; }
    :host-context([data-theme="teal"]) .ob-kpi--emerald { border-top-color:#10B981 !important; }

    /* ── Dark Mode extra overrides (CSS vars handle most; these add depth) ── */
    :host-context([data-theme="dark"]) .side-panel { box-shadow:-4px 0 24px rgba(0,0,0,.5) !important; }
    :host-context([data-theme="dark"]) .badge-cancelled { background:#1A1A1A !important; color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .task-check { border-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .task-check.done { background:#2FA8A0 !important; border-color:#2FA8A0 !important; }
    :host-context([data-theme="dark"]) .page-btn.active { background:#2FA8A0 !important; border-color:#2FA8A0 !important; color:#fff !important; }
    :host-context([data-theme="dark"]) tbody tr { background:var(--hr-card-bg) !important; }
    :host-context([data-theme="dark"]) .btn-cancel-process:hover { background:rgba(239,68,68,.1) !important; }

    /* ── Teal Mode ── */
    :host-context([data-theme="teal"]) .table-card { border-top:2px solid #00B5AE !important; }
    :host-context([data-theme="teal"]) .btn-new { background:#00B5AE !important; }
    :host-context([data-theme="teal"]) .btn-new:hover { background:#009E97 !important; }
    :host-context([data-theme="teal"]) .btn-submit { background:#00B5AE !important; }
    :host-context([data-theme="teal"]) .btn-submit:hover { background:#009E97 !important; }
    :host-context([data-theme="teal"]) .page-btn.active { background:#00B5AE !important; border-color:#00B5AE !important; }
    :host-context([data-theme="teal"]) .prog-bar-fill { background:#00B5AE !important; }
    :host-context([data-theme="teal"]) .task-check.done { background:#00B5AE !important; border-color:#00B5AE !important; }
    :host-context([data-theme="teal"]) .task-check:hover { border-color:#00B5AE !important; }
    :host-context([data-theme="teal"]) .form-control:focus { border-color:#00B5AE !important; }
    :host-context([data-theme="teal"]) .spinner { border-top-color:#00B5AE !important; }
    :host-context([data-theme="teal"]) .side-panel { box-shadow:-4px 0 24px rgba(27,120,114,.15) !important; }
    :host-context([data-theme="teal"]) tbody tr:hover { background:rgba(0,181,174,.06) !important; }
  `],
  template: `
  <div class="page">

    <!-- Header row -->
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
      <div class="page-header" style="flex:1;margin-bottom:0;">
        <h4 class="page-title">{{ 'ONBOARDING.TITLE' | translate }}</h4>
      </div>
      <app-wall-clock></app-wall-clock>
    </div>

    <!-- KPI Cards -->
    <div class="ob-kpi-row">
      <div class="ob-kpi ob-kpi--teal">
        <div class="ob-kpi-icon"><i class="bx bxs-user-check"></i></div>
        <div class="ob-kpi-body">
          <div class="ob-kpi-value">{{ totalElements }}</div>
          <div class="ob-kpi-label">{{ 'ONBOARDING.KPI_TOTAL' | translate }}</div>
        </div>
      </div>
      <div class="ob-kpi ob-kpi--amber">
        <div class="ob-kpi-icon"><i class="bx bxs-user-plus"></i></div>
        <div class="ob-kpi-body">
          <div class="ob-kpi-value">{{ onboardingCount }}</div>
          <div class="ob-kpi-label">{{ 'ONBOARDING.KPI_ONBOARDING' | translate }}</div>
        </div>
      </div>
      <div class="ob-kpi ob-kpi--blue">
        <div class="ob-kpi-icon"><i class="bx bxs-user-minus"></i></div>
        <div class="ob-kpi-body">
          <div class="ob-kpi-value">{{ offboardingCount }}</div>
          <div class="ob-kpi-label">{{ 'ONBOARDING.KPI_OFFBOARDING' | translate }}</div>
        </div>
      </div>
      <div class="ob-kpi ob-kpi--emerald">
        <div class="ob-kpi-icon"><i class="bx bx-check-circle"></i></div>
        <div class="ob-kpi-body">
          <div class="ob-kpi-value">{{ completedCount }}</div>
          <div class="ob-kpi-label">{{ 'ONBOARDING.KPI_COMPLETED' | translate }}</div>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <button class="btn-new" (click)="openNewForm()">
        <i class="bx bx-plus"></i> {{ 'ONBOARDING.START_PROCESS' | translate }}
      </button>
    </div>

    <!-- Table -->
    <div class="table-card">

      <div class="state-box" *ngIf="loading">
        <div class="spinner"></div>Loading...
      </div>
      <div class="state-box state-box--error" *ngIf="!loading && error">
        <i class="bx bx-error-circle"></i>{{ 'ONBOARDING.LOAD_ERROR' | translate }}
        <br><button style="margin-top:12px;padding:7px 18px;border:none;border-radius:8px;background:#2FA8A0;color:#fff;cursor:pointer;font-size:13px" (click)="loadPage(currentPage)">Retry</button>
      </div>
      <div class="state-box" *ngIf="!loading && !error && processes.length === 0">
        <i class="bx bxs-user-check"></i>No onboarding processes yet.
      </div>

      <div style="overflow-x:auto" *ngIf="!loading && !error && processes.length > 0">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Employee</th>
              <th>Type</th>
              <th>Start Date</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of processes; let i = index" (click)="openPanel(p)">
              <td style="color:var(--hr-border);font-size:12px">{{ currentPage * pageSize + i + 1 }}</td>
              <td style="font-weight:600;color:var(--hr-text-primary)">{{ p.collaborateurName }}</td>
              <td>
                <span class="badge" [ngClass]="p.type === 'ONBOARDING' ? 'badge-onboarding' : 'badge-offboarding'">
                  {{ p.type }}
                </span>
              </td>
              <td style="font-size:12.5px">{{ p.startDate | date:'dd/MM/yyyy' }}</td>
              <td>
                <div class="prog-bar-wrap">
                  <div class="prog-bar">
                    <div class="prog-bar-fill" [style.width.%]="p.progressPercent"></div>
                  </div>
                  <span class="prog-pct">{{ p.completedCount }}/{{ p.totalCount }}</span>
                </div>
              </td>
              <td>
                <span class="badge"
                  [ngClass]="{
                    'badge-in-progress': p.status === 'IN_PROGRESS',
                    'badge-completed':   p.status === 'COMPLETED',
                    'badge-cancelled':   p.status === 'CANCELLED'
                  }">
                  {{ p.status | titlecase }}
                </span>
              </td>
              <td (click)="$event.stopPropagation()">
                <button class="btn-cancel-process"
                  *ngIf="p.status === 'IN_PROGRESS'"
                  (click)="cancelProcess(p)">
                  Cancel
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-row" *ngIf="!loading && !error && totalPages > 1">
        <span class="pagination-info">Page {{ currentPage + 1 }} of {{ totalPages }} ({{ totalElements }} total)</span>
        <div class="pagination-btns">
          <button class="page-btn" (click)="loadPage(currentPage - 1)" [disabled]="currentPage === 0">
            <i class="bx bx-chevron-left"></i>
          </button>
          <button class="page-btn"
            *ngFor="let p of pageRange()"
            [class.active]="p === currentPage"
            (click)="loadPage(p)">{{ p + 1 }}</button>
          <button class="page-btn" (click)="loadPage(currentPage + 1)" [disabled]="currentPage >= totalPages - 1">
            <i class="bx bx-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

  </div>

  <!-- ── Side Panel ── -->
  <ng-container *ngIf="selectedProcess">
    <div class="panel-backdrop" (click)="closePanel()"></div>
    <div class="side-panel">
      <div class="panel-header">
        <span class="panel-title">{{ selectedProcess.collaborateurName }}</span>
        <button class="panel-close" (click)="closePanel()"><i class="bx bx-x"></i></button>
      </div>
      <div class="panel-meta">
        <span class="panel-meta-item">
          <i class="bx bxs-calendar" style="color:var(--hr-teal)"></i>
          <strong>Start:</strong> {{ selectedProcess.startDate | date:'dd MMM yyyy' }}
        </span>
        <span class="panel-meta-item" *ngIf="selectedProcess.targetEndDate">
          <i class="bx bxs-flag" style="color:#EF4444"></i>
          <strong>Target:</strong> {{ selectedProcess.targetEndDate | date:'dd MMM yyyy' }}
        </span>
        <span class="panel-meta-item">
          <span class="badge"
            [ngClass]="selectedProcess.type === 'ONBOARDING' ? 'badge-onboarding' : 'badge-offboarding'">
            {{ selectedProcess.type }}
          </span>
        </span>
        <span class="panel-meta-item">
          <div class="prog-bar" style="min-width:120px">
            <div class="prog-bar-fill" [style.width.%]="selectedProcess.progressPercent"></div>
          </div>
          <span class="prog-pct">{{ selectedProcess.progressPercent }}%</span>
        </span>
      </div>
      <div class="panel-body">
        <div *ngIf="panelLoading" class="state-box"><div class="spinner"></div></div>
        <div *ngIf="!panelLoading">
          <div class="task-item" *ngFor="let t of selectedProcess.tasks">
            <div class="task-check" [class.done]="t.completed"
              (click)="toggleTask(t)"
              title="{{ t.completed ? 'Mark incomplete' : 'Mark complete' }}">
              <i class="bx bx-check" *ngIf="t.completed"></i>
            </div>
            <div class="task-content">
              <div class="task-title" [class.done]="t.completed">{{ t.title }}</div>
              <div class="task-meta">
                <span class="badge"
                  [ngClass]="{
                    'badge-hr':      t.assignedTo === 'HR',
                    'badge-it':      t.assignedTo === 'IT',
                    'badge-manager': t.assignedTo === 'MANAGER',
                    'badge-employee':t.assignedTo === 'EMPLOYEE'
                  }">{{ t.assignedTo }}</span>
                <span class="task-due" [class.overdue]="t.overdue">
                  <i class="bx bx-calendar-alt"></i>
                  Due {{ t.dueDate | date:'dd MMM' }}
                  <span *ngIf="t.overdue"> (Overdue)</span>
                </span>
                <span *ngIf="t.completedAt" style="font-size:11.5px;color:#2FA8A0">
                  <i class="bx bx-check-circle"></i> {{ t.completedAt | date:'dd/MM HH:mm' }}
                </span>
              </div>
              <div class="task-notes" *ngIf="t.notes">{{ t.notes }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ng-container>

  <!-- ── New Process Side Panel ── -->
  <ng-container *ngIf="showForm">
    <div class="panel-backdrop" style="z-index:1999" (click)="closeForm()"></div>
    <div class="side-panel" style="z-index:2000">

      <div class="panel-header">
        <span class="panel-title">
          <i class="bx bx-user-plus" style="color:var(--hr-teal);font-size:20px"></i>
          {{ 'ONBOARDING.FORM_TITLE' | translate }}
        </span>
        <button class="panel-close" (click)="closeForm()"><i class="bx bx-x"></i></button>
      </div>

      <div class="panel-body">

        <!-- Employee -->
        <div class="form-group">
          <div class="panel-section-title">
            <i class="bx bxs-user"></i>{{ 'ONBOARDING.FIELD_EMPLOYEE' | translate }}
            <span style="color:#EF4444;font-size:14px;font-weight:700"> *</span>
          </div>
          <select class="form-control" [(ngModel)]="form.collaborateurId">
            <option [ngValue]="null">{{ 'ONBOARDING.SELECT_EMPLOYEE' | translate }}</option>
            <option *ngFor="let c of collaborateurs" [ngValue]="c.id">{{ c.firstName }} {{ c.lastName }}</option>
          </select>
        </div>

        <!-- Type -->
        <div class="form-group">
          <div class="panel-section-title">
            <i class="bx bxs-category"></i>{{ 'ONBOARDING.FIELD_TYPE' | translate }}
            <span style="color:#EF4444;font-size:14px;font-weight:700"> *</span>
          </div>
          <select class="form-control" [(ngModel)]="form.type">
            <option value="ONBOARDING">{{ 'ONBOARDING.TYPE_ONBOARDING' | translate }}</option>
            <option value="OFFBOARDING">{{ 'ONBOARDING.TYPE_OFFBOARDING' | translate }}</option>
          </select>
        </div>

        <!-- Dates -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div class="form-group">
            <div class="panel-section-title">
              <i class="bx bx-calendar"></i>{{ 'ONBOARDING.FIELD_START_DATE' | translate }}
              <span style="color:#EF4444;font-size:14px;font-weight:700"> *</span>
            </div>
            <input type="date" class="form-control" [(ngModel)]="form.startDate" />
          </div>
          <div class="form-group">
            <div class="panel-section-title">
              <i class="bx bx-calendar-check"></i>{{ 'ONBOARDING.FIELD_END_DATE' | translate }}
            </div>
            <input type="date" class="form-control" [(ngModel)]="form.targetEndDate" />
          </div>
        </div>

      </div>

      <div class="panel-footer">
        <button class="btn-cancel" (click)="closeForm()">{{ 'ONBOARDING.CANCEL' | translate }}</button>
        <button class="btn-submit"
          [disabled]="submitting || !form.collaborateurId || !form.startDate"
          (click)="submitForm()">
          <i class="bx" [ngClass]="submitting ? 'bx-loader-alt bx-spin' : 'bx-check'"></i>
          {{ submitting ? ('ONBOARDING.STARTING' | translate) : ('ONBOARDING.START_PROCESS' | translate) }}
        </button>
      </div>

    </div>
  </ng-container>
  `
})
export class OnboardingComponent implements OnInit {

  processes: any[] = [];
  allProcesses: any[] = [];   // full list for KPI counts
  loading = false;
  error: string | null = null;

  currentPage = 0;
  pageSize = 20;
  totalPages = 0;
  totalElements = 0;

  get onboardingCount(): number  { return this.allProcesses.filter(p => p.type === 'ONBOARDING').length; }
  get offboardingCount(): number { return this.allProcesses.filter(p => p.type === 'OFFBOARDING').length; }
  get completedCount(): number   { return this.allProcesses.filter(p => p.status === 'COMPLETED').length; }

  selectedProcess: any = null;
  panelLoading = false;

  showForm = false;
  submitting = false;
  form: any = { collaborateurId: null, type: 'ONBOARDING', startDate: '', targetEndDate: '' };

  collaborateurs: any[] = [];

  constructor(
    private onboardingService: OnboardingService,
    private collaborateurService: CollaborateurService,
    private translate: TranslateService,
    private confirmSvc: ConfirmService
  ) {}

  ngOnInit(): void {
    this.loadPage(0);
    this.loadCollaborateurs();
    this.loadAllForStats();
  }

  loadPage(page: number): void {
    this.currentPage = page;
    this.loading = true;
    this.error = null;
    this.onboardingService.getAll(page, this.pageSize).subscribe({
      next: (res: any) => {
        this.processes     = Array.isArray(res) ? res : (res.content ?? res.data ?? []);
        this.totalElements = res.totalElements ?? this.processes.length;
        this.totalPages    = res.totalPages ?? 1;
        this.currentPage   = res.number ?? page;
        this.loading       = false;
      },
      error: () => {
        this.error   = 'ONBOARDING.LOAD_ERROR';
        this.loading = false;
      }
    });
  }

  loadAllForStats(): void {
    this.onboardingService.getAll(0, 1000).subscribe({
      next: (res: any) => {
        this.allProcesses = Array.isArray(res) ? res : (res.content ?? res.data ?? []);
      },
      error: () => {}
    });
  }

  loadCollaborateurs(): void {
    this.collaborateurService.getAll().subscribe({
      next: (list: any[]) => {
        // Mapped objects use matricule for id, prenom/nom for names
        this.collaborateurs = list.map((c: any) => ({
          id:        c.matricule ?? c._backendId ?? c.id,
          firstName: c.prenom    ?? c.firstName ?? '',
          lastName:  c.nom       ?? c.lastName  ?? '',
        }));
      },
      error: () => {}
    });
  }

  openPanel(process: any): void {
    this.panelLoading = true;
    this.selectedProcess = process;
    this.onboardingService.getById(process.id).subscribe({
      next: (full: any) => {
        this.selectedProcess = full;
        this.panelLoading = false;
      },
      error: () => {
        this.panelLoading = false;
      }
    });
  }

  closePanel(): void {
    this.selectedProcess = null;
  }

  toggleTask(task: any): void {
    if (!this.selectedProcess) return;
    const obs = task.completed
      ? this.onboardingService.uncompleteTask(this.selectedProcess.id, task.id)
      : this.onboardingService.completeTask(this.selectedProcess.id, task.id);

    obs.subscribe({
      next: (updated: any) => {
        this.selectedProcess = updated;
        this.loadPage(this.currentPage);
      }
    });
  }

  async cancelProcess(process: any): Promise<void> {
    const name = process.collaborateurName ?? '';
    const lang = this.translate.currentLang ?? 'fr';
    const title   = lang === 'fr' ? 'Annuler le processus'           : 'Cancel Process';
    const message = lang === 'fr'
      ? `Êtes-vous sûr de vouloir annuler le processus pour ${name} ? Cette action est irréversible.`
      : `Are you sure you want to cancel the onboarding process for ${name}? This action cannot be undone.`;

    const confirmed = await this.confirmSvc.confirm(message, title);
    if (!confirmed) return;
    this.onboardingService.cancel(process.id).subscribe({
      next: () => this.loadPage(this.currentPage)
    });
  }

  openNewForm(): void {
    this.form = { collaborateurId: null, type: 'ONBOARDING', startDate: '', targetEndDate: '' };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  submitForm(): void {
    this.submitting = true;
    const req: any = {
      collaborateurId: this.form.collaborateurId,
      type:            this.form.type,
      startDate:       this.form.startDate,
    };
    if (this.form.targetEndDate) {
      req.targetEndDate = this.form.targetEndDate;
    }
    this.onboardingService.start(req).subscribe({
      next: () => {
        this.submitting = false;
        this.showForm   = false;
        this.loadPage(0);
        this.loadAllForStats();
      },
      error: () => {
        this.submitting = false;
      }
    });
  }

  pageRange(): number[] {
    const start = Math.max(0, this.currentPage - 2);
    const end   = Math.min(this.totalPages - 1, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
