import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService, AuditLog } from './audit.service';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  styles: [`
    .page { padding: 0 24px 40px; animation: fadeIn .4s ease both; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none} }

    .page-header { display:flex; align-items:center; justify-content:space-between; padding:14px 20px; background:#fff; border-radius:12px; box-shadow:0 4px 20px rgba(22,34,51,.08); margin-bottom:18px; }
    .page-title { font-family:'Inter',sans-serif; font-size:22px; font-weight:700; color:#1A2B3C; margin:0; }
    .page-date  { font-size:13px; color:#8FA3B8; display:flex; align-items:center; gap:6px; }

    /* ── Filters ── */
    .filters-card { background:#fff; border-radius:12px; padding:16px 20px; box-shadow:0 4px 20px rgba(22,34,51,.08); margin-bottom:18px; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
    .filter-group { display:flex; flex-direction:column; gap:4px; }
    .filter-label { font-size:11.5px; font-weight:600; color:#8FA3B8; }
    .filter-input { padding:8px 12px; border:1.5px solid #E2E8F0; border-radius:8px; font-size:13px; color:#1A2B3C; font-family:'Inter',sans-serif; min-width:160px; }
    .filter-input:focus { outline:none; border-color:#2FA8A0; }
    .filter-btn { padding:9px 20px; background:#2FA8A0; color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; align-self:flex-end; }
    .filter-btn:hover { background:#1A9690; }
    .reset-btn  { padding:9px 16px; background:#F8FAFC; color:#4A6080; border:1.5px solid #E2E8F0; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; align-self:flex-end; }
    .reset-btn:hover { background:#E2E8F0; }

    /* ── Table ── */
    .table-card { background:#fff; border-radius:12px; box-shadow:0 4px 20px rgba(22,34,51,.08); overflow:hidden; }
    table { width:100%; border-collapse:collapse; }
    thead tr { background:#FAFBFC; }
    thead th { padding:12px 16px; font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:#8FA3B8; border-bottom:1px solid #F0F3F6; white-space:nowrap; }
    tbody tr { transition:background .15s; }
    tbody tr:hover { background:#F8FFFE; }
    tbody td { padding:12px 16px; font-size:13px; color:#4A6080; border-bottom:1px solid #F5F7FA; vertical-align:middle; }
    tbody tr:last-child td { border-bottom:none; }

    .action-badge { display:inline-flex; padding:3px 10px; border-radius:6px; font-size:11.5px; font-weight:700; }
    .action-CREATE { background:#DCFCE7; color:#15803D; }
    .action-UPDATE { background:#DBEAFE; color:#1E40AF; }
    .action-DELETE { background:#FFE4E6; color:#BE123C; }
    .action-IMPORT { background:#FEF3C7; color:#92400E; }
    .action-LOGIN  { background:#E8F7F6; color:#1B7872; }
    .action-LOGOUT { background:#F1F5F9; color:#4A6080; }
    .action-STAGE_CHANGE { background:#EDE9FE; color:#6D28D9; }
    .action-UPDATE_ROLES { background:#FEF3C7; color:#92400E; }
    .action-UPDATE_PERMISSIONS { background:#FFF7ED; color:#C2410C; }

    .module-badge { display:inline-flex; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600; background:#F1F5F9; color:#4A6080; }

    /* ── Loading / Error / Empty ── */
    .state-box { padding:48px 0; text-align:center; color:#8FA3B8; font-size:14px; }
    .state-box i { font-size:36px; display:block; margin-bottom:10px; }
    .state-box--error { color:#EF4444; }
    .spinner { width:32px; height:32px; border:3px solid #E2E8F0; border-top-color:#2FA8A0; border-radius:50%; animation:spin .7s linear infinite; margin:0 auto 10px; }
    @keyframes spin { to { transform:rotate(360deg); } }

    /* ── Pagination ── */
    .pagination-row { display:flex; align-items:center; justify-content:space-between; padding:12px 20px; border-top:1px solid #F0F3F6; }
    .pagination-info { font-size:12.5px; color:#8FA3B8; }
    .pagination-btns { display:flex; gap:4px; }
    .page-btn { padding:5px 12px; border-radius:6px; border:1px solid #E2E8F0; background:#fff; font-size:13px; color:#4A6080; cursor:pointer; }
    .page-btn.active { background:#2FA8A0; color:#fff; border-color:#2FA8A0; }
    .page-btn:hover:not(.active) { background:#F8FAFC; }
    .page-btn:disabled { opacity:.4; cursor:default; }
  `],
  template: `
  <div class="page">

    <!-- Header -->
    <div class="page-header">
      <h4 class="page-title">Audit Log</h4>
      <span class="page-date"><i class="bx bx-calendar-alt"></i> {{ today | date:'EEEE, MMMM d, y' }}</span>
    </div>

    <!-- Filters -->
    <div class="filters-card">
      <div class="filter-group">
        <label class="filter-label">Filter by Email</label>
        <input class="filter-input" [(ngModel)]="filterEmail" placeholder="user@example.com" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Filter by Module</label>
        <select class="filter-input" [(ngModel)]="filterModule">
          <option value="">All Modules</option>
          <option *ngFor="let m of modules">{{ m }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">From</label>
        <input class="filter-input" type="datetime-local" [(ngModel)]="filterFrom" />
      </div>
      <div class="filter-group">
        <label class="filter-label">To</label>
        <input class="filter-input" type="datetime-local" [(ngModel)]="filterTo" />
      </div>
      <button class="filter-btn" (click)="applyFilter()"><i class="bx bx-filter-alt"></i> Apply</button>
      <button class="reset-btn" (click)="resetFilter()"><i class="bx bx-reset"></i> Reset</button>
    </div>

    <!-- Table -->
    <div class="table-card">

      <!-- Loading -->
      <div class="state-box" *ngIf="loading">
        <div class="spinner"></div>Loading audit logs…
      </div>

      <!-- Error -->
      <div class="state-box state-box--error" *ngIf="!loading && error">
        <i class="bx bx-error-circle"></i>{{ error }}
        <br><button style="margin-top:12px;padding:7px 18px;border:none;border-radius:8px;background:#2FA8A0;color:#fff;cursor:pointer;font-size:13px" (click)="loadPage(currentPage)">Retry</button>
      </div>

      <!-- Empty -->
      <div class="state-box" *ngIf="!loading && !error && logs.length === 0">
        <i class="bx bx-history"></i>No audit logs found.
      </div>

      <!-- Table -->
      <div style="overflow-x:auto" *ngIf="!loading && !error && logs.length > 0">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Timestamp</th>
              <th>User Email</th>
              <th>Action</th>
              <th>Module</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of logs; let i = index">
              <td style="color:#CBD5E0;font-size:12px">{{ (currentPage * pageSize) + i + 1 }}</td>
              <td style="white-space:nowrap;font-size:12px">{{ log.timestamp | date:'dd/MM/yy HH:mm:ss' }}</td>
              <td style="font-size:12.5px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ log.userEmail }}</td>
              <td><span class="action-badge action-{{ log.action }}">{{ log.action }}</span></td>
              <td><span class="module-badge">{{ log.module }}</span></td>
              <td style="max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#1A2B3C">{{ log.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination (only for paginated mode) -->
      <div class="pagination-row" *ngIf="!loading && !error && totalPages > 1 && !filterActive">
        <span class="pagination-info">Page {{ currentPage + 1 }} of {{ totalPages }} ({{ totalElements }} entries)</span>
        <div class="pagination-btns">
          <button class="page-btn" (click)="loadPage(currentPage - 1)" [disabled]="currentPage === 0">
            <i class="bx bx-chevron-left"></i>
          </button>
          <button class="page-btn" *ngFor="let p of pageRange()" [class.active]="p === currentPage" (click)="loadPage(p)">{{ p + 1 }}</button>
          <button class="page-btn" (click)="loadPage(currentPage + 1)" [disabled]="currentPage >= totalPages - 1">
            <i class="bx bx-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

  </div>
  `
})
export class AuditLogComponent implements OnInit {

  today = new Date();

  logs: AuditLog[] = [];
  loading = false;
  error: string | null = null;

  currentPage = 0;
  pageSize = 50;
  totalPages = 0;
  totalElements = 0;

  filterEmail = '';
  filterModule = '';
  filterFrom = '';
  filterTo = '';
  filterActive = false;

  modules = ['EMPLOYEE', 'STAGIAIRE', 'PLANNING', 'CV', 'ADMIN', 'LEAVE'];

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(page: number): void {
    this.loading = true;
    this.error = null;
    this.filterActive = false;
    this.auditService.getLogs(page, this.pageSize).subscribe({
      next: resp => {
        this.logs = resp.content;
        this.totalPages = resp.totalPages;
        this.totalElements = resp.totalElements;
        this.currentPage = resp.number;
        this.loading = false;
      },
      error: err => {
        this.error = err?.error?.message || 'Failed to load audit logs.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    this.loading = true;
    this.error = null;
    this.filterActive = true;

    if (this.filterFrom && this.filterTo) {
      this.auditService.getByDateRange(this.filterFrom + ':00', this.filterTo + ':00').subscribe({
        next: data => { this.logs = data; this.loading = false; },
        error: err => { this.error = err?.error?.message || 'Filter failed.'; this.loading = false; }
      });
    } else if (this.filterEmail) {
      this.auditService.getByUser(this.filterEmail).subscribe({
        next: data => { this.logs = data; this.loading = false; },
        error: err => { this.error = err?.error?.message || 'Filter failed.'; this.loading = false; }
      });
    } else if (this.filterModule) {
      this.auditService.getByModule(this.filterModule).subscribe({
        next: data => { this.logs = data; this.loading = false; },
        error: err => { this.error = err?.error?.message || 'Filter failed.'; this.loading = false; }
      });
    } else {
      this.loadPage(0);
    }
  }

  resetFilter(): void {
    this.filterEmail = '';
    this.filterModule = '';
    this.filterFrom = '';
    this.filterTo = '';
    this.loadPage(0);
  }

  pageRange(): number[] {
    const start = Math.max(0, this.currentPage - 2);
    const end   = Math.min(this.totalPages - 1, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
