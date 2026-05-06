import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService, LeaveRequest } from '../leave/leave.service';

@Component({
  selector: 'app-dayoff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .page { padding: 0 24px 40px; animation: fadeIn .4s ease both; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none} }

    .page-header { display:flex; align-items:center; justify-content:space-between; padding:14px 20px; background:#fff; border-radius:12px; box-shadow:0 4px 20px rgba(22,34,51,.08); margin-bottom:18px; }
    .page-title { font-family:'Inter',sans-serif; font-size:22px; font-weight:700; color:#1A2B3C; margin:0; }
    .page-date  { font-size:13px; color:#8FA3B8; display:flex; align-items:center; gap:6px; }

    .stats-card { background:#fff; border-radius:12px; padding:22px 28px; box-shadow:0 4px 20px rgba(22,34,51,.08); margin-bottom:20px; }
    .stats-top  { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
    .stats-label { font-family:'Inter',sans-serif; font-size:15px; font-weight:700; color:#1A2B3C; }

    .stats-row { display:flex; align-items:center; gap:40px; }
    .stats-total-num { font-family:'Inter',sans-serif; font-size:48px; font-weight:800; color:#1A2B3C; line-height:1; }
    .stats-total-lbl { font-size:13px; color:#8FA3B8; margin-top:4px; }
    .stats-divider { width:1px; height:60px; background:#F0F3F6; }

    .stats-item { display:flex; flex-direction:column; gap:4px; }
    .stats-item-row { display:flex; align-items:center; gap:8px; }
    .stats-dot { width:10px; height:10px; border-radius:50%; }
    .stats-dot--blue  { background:#3B82F6; }
    .stats-dot--green { background:#22C55E; }
    .stats-dot--red   { background:#F43F5E; }
    .stats-item-num { font-family:'Inter',sans-serif; font-size:22px; font-weight:700; color:#1A2B3C; }
    .stats-item-lbl { font-size:11.5px; color:#8FA3B8; }

    .table-card { background:#fff; border-radius:12px; box-shadow:0 4px 20px rgba(22,34,51,.08); overflow:hidden; }
    .tabs-bar { display:flex; align-items:center; gap:2px; padding:16px 20px 0; border-bottom:1px solid #F0F3F6; flex-wrap:wrap; }
    .tab { padding:10px 18px; font-size:13px; font-weight:500; color:#8FA3B8; background:none; border:none; border-bottom:2px solid transparent; cursor:pointer; transition:all .15s; margin-bottom:-1px; white-space:nowrap; }
    .tab.active { color:#2FA8A0; border-bottom-color:#2FA8A0; font-weight:600; }

    table { width:100%; border-collapse:collapse; }
    thead tr { background:#FAFBFC; }
    thead th { padding:12px 18px; font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:#8FA3B8; border-bottom:1px solid #F0F3F6; white-space:nowrap; }
    tbody tr { cursor:pointer; transition:background .15s; }
    tbody tr:hover { background:#F8FFFE; }
    tbody td { padding:13px 18px; font-size:13.5px; color:#4A6080; border-bottom:1px solid #F5F7FA; vertical-align:middle; }
    tbody tr:last-child td { border-bottom:none; }
    .td-name { font-weight:500; color:#1A2B3C; }

    .status-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 12px; border-radius:999px; font-size:11.5px; font-weight:700; }
    .badge-pending  { background:#FEF3C7; color:#B45309; }
    .badge-approved { background:#DCFCE7; color:#15803D; }
    .badge-rejected { background:#FFE4E6; color:#BE123C; }

    .act-btn { width:30px; height:30px; border-radius:7px; border:none; background:#F1F5F9; color:#4A6080; font-size:14px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; margin-right:4px; transition:all .15s; }
    .act-btn.approve:hover { background:#DCFCE7; color:#15803D; }
    .act-btn.reject:hover  { background:#FFE4E6; color:#BE123C; }

    .state-box { padding:48px 0; text-align:center; color:#8FA3B8; font-size:14px; }
    .state-box i { font-size:36px; display:block; margin-bottom:10px; }
    .state-box--error { color:#EF4444; }
    .spinner { width:32px; height:32px; border:3px solid #E2E8F0; border-top-color:#2FA8A0; border-radius:50%; animation:spin .7s linear infinite; margin:0 auto 10px; }
    @keyframes spin { to { transform:rotate(360deg); } }

    .backdrop{position:fixed;inset:0;background:rgba(10,20,35,.35);z-index:1800;backdrop-filter:blur(1px);}
    .detail-panel{position:fixed;top:70px;right:0;bottom:0;width:500px;background:#fff;box-shadow:-8px 0 40px rgba(10,20,35,.14);border-radius:16px 0 0 0;z-index:1801;display:flex;flex-direction:column;animation:slideIn .22s ease both;overflow:hidden;}
    @keyframes slideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
    .dp-header{display:flex;align-items:center;justify-content:space-between;padding:18px 22px 16px;border-bottom:1px solid #F0F3F6;flex-shrink:0;}
    .dp-title{font-family:'Inter',sans-serif;font-size:16px;font-weight:700;color:#1A2B3C;}
    .dp-close{width:32px;height:32px;border:none;background:#F0F3F6;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#4A6080;}
    .dp-close:hover{background:#E2E8F0;}
    .dp-body{flex:1;overflow-y:auto;padding:20px 22px;}
    .dp-section{font-size:14px;font-weight:700;color:#1A2B3C;margin-bottom:12px;}
    .dp-field{display:grid;grid-template-columns:140px 1fr;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid #F5F7FA;}
    .dp-field:last-of-type{border-bottom:none;}
    .dp-lbl{display:flex;align-items:center;gap:7px;font-size:12px;color:#8FA3B8;}
    .dp-lbl i{font-size:14px;}
    .dp-val{font-size:13px;font-weight:600;color:#1A2B3C;}
    .dp-divider{border:none;border-top:1px solid #F0F3F6;margin:14px 0;}
    .dp-footer{padding:14px 22px;border-top:1px solid #F0F3F6;flex-shrink:0;display:flex;justify-content:flex-end;gap:10px;}
    .btn-decline{padding:10px 24px;background:#F97316;color:#fff;border:none;border-radius:10px;font-size:13.5px;font-weight:600;cursor:pointer;}
    .btn-decline:disabled{opacity:.5;cursor:default;}
    .btn-accept{padding:10px 24px;background:#22C55E;color:#fff;border:none;border-radius:10px;font-size:13.5px;font-weight:600;cursor:pointer;}
    .btn-accept:disabled{opacity:.5;cursor:default;}

    .toast{position:fixed;bottom:24px;right:24px;z-index:9999;background:#1A2B3C;color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.18);animation:slideIn .22s ease both;}
  `],
  template: `
  <div class="backdrop" *ngIf="selected" (click)="selected=null"></div>

  <!-- Detail Panel -->
  <div class="detail-panel" *ngIf="selected">
    <div class="dp-header">
      <span class="dp-title">Leave Request Detail</span>
      <button class="dp-close" (click)="selected=null"><i class="bx bx-x"></i></button>
    </div>
    <div class="dp-body">

      <div class="dp-section">Employee Information</div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-user"></i> Name</span>
        <span class="dp-val">{{ selected.requester.firstname }} {{ selected.requester.lastname }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-envelope"></i> Email</span>
        <span class="dp-val">{{ selected.requester.email }}</span>
      </div>

      <hr class="dp-divider">

      <div class="dp-section">Leave Information</div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-category"></i> Type</span>
        <span class="dp-val">{{ selected.leaveType.name }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-calendar"></i> Start Date</span>
        <span class="dp-val">{{ selected.startDate | date:'dd MMM yyyy' }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-calendar-check"></i> End Date</span>
        <span class="dp-val">{{ selected.endDate | date:'dd MMM yyyy' }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-time"></i> Duration</span>
        <span class="dp-val">{{ selected.durationDays }} day(s)</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-note"></i> Reason</span>
        <span class="dp-val" style="font-weight:400;color:#4A6080">{{ selected.reason || '—' }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-check-circle"></i> Status</span>
        <span class="dp-val">
          <span class="status-badge" [ngClass]="badgeClass(selected.status)">{{ selected.status }}</span>
        </span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-calendar-alt"></i> Submitted</span>
        <span class="dp-val">{{ selected.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
      </div>

    </div>
    <div class="dp-footer" *ngIf="selected.status === 'PENDING'">
      <button class="btn-decline" [disabled]="saving" (click)="reject(selected)">Reject</button>
      <button class="btn-accept"  [disabled]="saving" (click)="approve(selected)">Approve</button>
    </div>
  </div>

  <div class="toast" *ngIf="toast">{{ toast }}</div>

  <!-- Page -->
  <div class="page">
    <div class="page-header">
      <h4 class="page-title">Day-off Requests</h4>
      <span class="page-date"><i class="bx bx-calendar-alt"></i> {{ today | date:'EEEE, MMMM d, y' }}</span>
    </div>

    <!-- Stats -->
    <div class="stats-card">
      <div class="stats-top">
        <span class="stats-label">Total Requests</span>
      </div>
      <div class="stats-row">
        <div>
          <div class="stats-total-num">{{ rows.length }}</div>
          <div class="stats-total-lbl">Requests</div>
        </div>
        <div class="stats-divider"></div>
        <div class="stats-item">
          <div class="stats-item-row"><span class="stats-dot stats-dot--blue"></span><span style="font-size:13px;color:#8FA3B8">Pending</span></div>
          <div class="stats-item-num">{{ pending }}</div>
          <div class="stats-item-lbl">Requests</div>
        </div>
        <div class="stats-item">
          <div class="stats-item-row"><span class="stats-dot stats-dot--green"></span><span style="font-size:13px;color:#8FA3B8">Approved</span></div>
          <div class="stats-item-num">{{ approved }}</div>
          <div class="stats-item-lbl">Requests</div>
        </div>
        <div class="stats-item">
          <div class="stats-item-row"><span class="stats-dot stats-dot--red"></span><span style="font-size:13px;color:#8FA3B8">Rejected</span></div>
          <div class="stats-item-num">{{ rejected }}</div>
          <div class="stats-item-lbl">Requests</div>
        </div>
      </div>
    </div>

    <div class="table-card">
      <div class="tabs-bar">
        <button *ngFor="let t of tabs" class="tab" [class.active]="activeTab===t" (click)="activeTab=t">{{ t }}</button>
      </div>

      <div class="state-box" *ngIf="loading">
        <div class="spinner"></div>Loading requests…
      </div>

      <div class="state-box state-box--error" *ngIf="!loading && error">
        <i class="bx bx-error-circle"></i>{{ error }}
        <br><button style="margin-top:12px;padding:7px 18px;border:none;border-radius:8px;background:#2FA8A0;color:#fff;cursor:pointer;font-size:13px" (click)="load()">Retry</button>
      </div>

      <div class="state-box" *ngIf="!loading && !error && filtered.length === 0">
        <i class="bx bx-calendar-check"></i>No requests found.
      </div>

      <div style="overflow-x:auto" *ngIf="!loading && !error && filtered.length > 0">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Start</th>
              <th>End</th>
              <th>Days</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of filtered; let i = index"
                (click)="selected = r">
              <td style="color:#CBD5E0;font-size:12px">{{ i + 1 }}</td>
              <td class="td-name">{{ r.requester.firstname }} {{ r.requester.lastname }}</td>
              <td>{{ r.leaveType.name }}</td>
              <td>{{ r.startDate | date:'dd/MM/yyyy' }}</td>
              <td>{{ r.endDate   | date:'dd/MM/yyyy' }}</td>
              <td style="font-weight:700;color:#1A2B3C">{{ r.durationDays }}d</td>
              <td>
                <span class="status-badge" [ngClass]="badgeClass(r.status)">{{ r.status }}</span>
              </td>
              <td (click)="$event.stopPropagation()">
                <button class="act-btn approve" title="Approve" *ngIf="r.status==='PENDING'" (click)="approve(r)"><i class="bx bx-check"></i></button>
                <button class="act-btn reject"  title="Reject"  *ngIf="r.status==='PENDING'" (click)="reject(r)"><i class="bx bx-x"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class DayoffComponent implements OnInit {

  today = new Date();
  tabs = ['All', 'PENDING', 'APPROVED', 'REJECTED'];
  activeTab = 'All';

  rows: LeaveRequest[] = [];
  loading = false;
  error: string | null = null;
  saving = false;
  selected: LeaveRequest | null = null;
  toast: string | null = null;

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = null;
    this.leaveService.getAllRequests().subscribe({
      next: data => { this.rows = data; this.loading = false; },
      error: err => { this.error = err?.error?.message || 'Failed to load leave requests.'; this.loading = false; }
    });
  }

  get filtered(): LeaveRequest[] {
    if (this.activeTab === 'All') return this.rows;
    return this.rows.filter(r => r.status === this.activeTab);
  }

  get pending():  number { return this.rows.filter(r => r.status === 'PENDING').length; }
  get approved(): number { return this.rows.filter(r => r.status === 'APPROVED').length; }
  get rejected(): number { return this.rows.filter(r => r.status === 'REJECTED').length; }

  badgeClass(s: string): Record<string, boolean> {
    return { 'badge-pending': s==='PENDING', 'badge-approved': s==='APPROVED', 'badge-rejected': s==='REJECTED' };
  }

  approve(req: LeaveRequest): void {
    this.saving = true;
    this.leaveService.approve(req.id, '').subscribe({
      next: updated => {
        this.rows = this.rows.map(r => r.id === updated.id ? updated : r);
        if (this.selected?.id === updated.id) this.selected = updated;
        this.saving = false;
        this.showToast('Request approved.');
      },
      error: err => { this.saving = false; this.showToast(err?.error?.message || 'Failed to approve.'); }
    });
  }

  reject(req: LeaveRequest): void {
    this.saving = true;
    this.leaveService.reject(req.id, '').subscribe({
      next: updated => {
        this.rows = this.rows.map(r => r.id === updated.id ? updated : r);
        if (this.selected?.id === updated.id) this.selected = updated;
        this.saving = false;
        this.showToast('Request rejected.');
      },
      error: err => { this.saving = false; this.showToast(err?.error?.message || 'Failed to reject.'); }
    });
  }

  private showToast(msg: string): void {
    this.toast = msg;
    setTimeout(() => this.toast = null, 3000);
  }
}
