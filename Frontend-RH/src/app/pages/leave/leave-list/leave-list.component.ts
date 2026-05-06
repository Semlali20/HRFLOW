import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService, LeaveRequest } from '../leave.service';

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .page { padding:0 24px 40px; font-family:'Inter',sans-serif; animation:fadeIn .4s ease both; }
    @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}

    .page-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);margin-bottom:18px;}
    .page-title{font-size:22px;font-weight:700;color:#1A2B3C;margin:0;}
    .header-meta{display:flex;align-items:center;gap:20px;}
    .header-date{font-size:13px;color:#8FA3B8;display:flex;align-items:center;gap:6px;}

    .table-card{background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);overflow:hidden;}
    .tabs-bar{display:flex;align-items:center;gap:2px;padding:14px 20px 0;border-bottom:1px solid #F0F3F6;}
    .tab{padding:10px 18px;font-size:13px;font-weight:500;color:#8FA3B8;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;transition:all .15s;margin-bottom:-1px;}
    .tab.active{color:#2FA8A0;border-bottom-color:#2FA8A0;font-weight:600;}
    .tabs-right{margin-left:auto;font-size:12px;color:#8FA3B8;display:flex;align-items:center;gap:5px;}

    table{width:100%;border-collapse:collapse;}
    thead tr{background:#FAFBFC;}
    thead th{padding:11px 14px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8FA3B8;border-bottom:1px solid #F0F3F6;white-space:nowrap;}
    tbody tr{cursor:pointer;transition:background .15s;}
    tbody tr:hover{background:#FAFBFC;}
    tbody td{padding:11px 14px;font-size:13px;color:#4A6080;border-bottom:1px solid #F5F7FA;vertical-align:middle;}
    tbody tr:last-child td{border-bottom:none;}
    .td-id{font-weight:600;color:#4A6080;font-size:12px;}
    .td-name{font-weight:600;color:#1A2B3C;}
    .role-chip{display:inline-flex;padding:3px 9px;border-radius:6px;font-size:11.5px;font-weight:500;background:#F1F5F9;color:#4A6080;white-space:nowrap;}
    .status-chip{display:inline-flex;padding:4px 11px;border-radius:999px;font-size:11.5px;font-weight:700;white-space:nowrap;}
    .chip-pending  {background:#FEF3C7;color:#B45309;}
    .chip-approved {background:#DCFCE7;color:#15803D;}
    .chip-rejected {background:#FFE4E6;color:#BE123C;}
    .chip-cancelled{background:#F1F5F9;color:#8FA3B8;}

    .act-btn{width:30px;height:30px;border-radius:7px;border:none;background:#F1F5F9;color:#4A6080;font-size:14px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;margin-right:4px;transition:all .15s;}
    .act-btn:hover{background:#E2E8F0;}
    .act-btn.approve:hover{background:#DCFCE7;color:#15803D;}
    .act-btn.reject:hover{background:#FFE4E6;color:#BE123C;}

    .state-box{padding:48px 0;text-align:center;color:#8FA3B8;font-size:14px;}
    .state-box i{font-size:36px;display:block;margin-bottom:10px;}
    .state-box--error{color:#EF4444;}
    .spinner{width:32px;height:32px;border:3px solid #E2E8F0;border-top-color:#2FA8A0;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 10px;}
    @keyframes spin{to{transform:rotate(360deg)}}

    /* ── Detail Panel ── */
    .backdrop{position:fixed;inset:0;background:rgba(10,20,35,.35);z-index:1800;backdrop-filter:blur(1px);}
    .rp{position:fixed;top:70px;right:0;bottom:0;width:520px;background:#fff;box-shadow:-8px 0 40px rgba(10,20,35,.14);border-radius:16px 0 0 0;z-index:1801;display:flex;flex-direction:column;animation:rpIn .22s ease both;overflow:hidden;}
    @keyframes rpIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
    .rp-header{display:flex;align-items:center;justify-content:space-between;padding:18px 22px 16px;border-bottom:1px solid #F0F3F6;flex-shrink:0;}
    .rp-title{font-size:15px;font-weight:700;color:#1A2B3C;}
    .rp-close{width:30px;height:30px;border:none;background:#F1F5F9;border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:17px;color:#4A6080;}
    .rp-close:hover{background:#E2E8F0;}
    .rp-body{flex:1;overflow-y:auto;padding:20px 22px;}

    .dp-section{font-size:14px;font-weight:700;color:#1A2B3C;margin-bottom:12px;}
    .dp-field{display:grid;grid-template-columns:150px 1fr;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid #F5F7FA;}
    .dp-field:last-of-type{border-bottom:none;}
    .dp-lbl{display:flex;align-items:center;gap:7px;font-size:12px;color:#8FA3B8;}
    .dp-lbl i{font-size:14px;}
    .dp-val{font-size:13px;font-weight:600;color:#1A2B3C;}
    .dp-divider{border:none;border-top:1px solid #F0F3F6;margin:16px 0;}

    .rp-footer{padding:14px 22px;border-top:1px solid #F0F3F6;flex-shrink:0;display:flex;justify-content:flex-end;gap:10px;}
    .btn-reject {padding:10px 24px;background:#EF4444;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;}
    .btn-reject:disabled{opacity:.5;cursor:default;}
    .btn-approve{padding:10px 24px;background:#22C55E;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;}
    .btn-approve:disabled{opacity:.5;cursor:default;}

    .toast{position:fixed;bottom:24px;right:24px;z-index:9999;background:#1A2B3C;color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.18);animation:rpIn .22s ease both;}
  `],
  template: `
  <!-- Detail Panel -->
  <div class="backdrop" *ngIf="selected" (click)="selected=null"></div>
  <div class="rp" *ngIf="selected">
    <div class="rp-header">
      <span class="rp-title">Leave Request Detail</span>
      <button class="rp-close" (click)="selected=null"><i class="bx bx-x"></i></button>
    </div>
    <div class="rp-body">

      <div class="dp-section">Requester Information</div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-id-card"></i> User ID</span>
        <span class="dp-val">#{{ selected.requester.id }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-user"></i> Full Name</span>
        <span class="dp-val">{{ selected.requester.firstname }} {{ selected.requester.lastname }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-envelope"></i> Email</span>
        <span class="dp-val">{{ selected.requester.email }}</span>
      </div>

      <hr class="dp-divider">

      <div class="dp-section">Leave Details</div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-category"></i> Leave Type</span>
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
          <span class="status-chip" [ngClass]="chipClass(selected.status)">{{ selected.status }}</span>
        </span>
      </div>
      <div class="dp-field" *ngIf="selected.approverComment">
        <span class="dp-lbl"><i class="bx bx-comment"></i> Decision Note</span>
        <span class="dp-val" style="font-weight:400;color:#4A6080">{{ selected.approverComment }}</span>
      </div>
      <div class="dp-field">
        <span class="dp-lbl"><i class="bx bx-calendar-alt"></i> Submitted</span>
        <span class="dp-val">{{ selected.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
      </div>

    </div>
    <div class="rp-footer" *ngIf="selected.status === 'PENDING'">
      <button class="btn-reject"  [disabled]="saving" (click)="reject(selected)">
        <i class="bx bx-x-circle"></i> Reject
      </button>
      <button class="btn-approve" [disabled]="saving" (click)="approve(selected)">
        <i class="bx bx-check-circle"></i> Approve
      </button>
    </div>
  </div>

  <!-- Toast -->
  <div class="toast" *ngIf="toast">{{ toast }}</div>

  <!-- Page -->
  <div class="page">
    <div class="page-header">
      <h4 class="page-title">Leave Management</h4>
      <span class="header-date"><i class="bx bx-calendar-alt"></i> {{ today | date:'EEEE, MMMM d, y' }}</span>
    </div>

    <div class="table-card">
      <div class="tabs-bar">
        <button *ngFor="let t of tabs" class="tab" [class.active]="activeTab===t" (click)="activeTab=t">
          {{ t }} <span *ngIf="t !== 'All'" style="font-size:11px;opacity:.7">({{ countTab(t) }})</span>
        </button>
        <span class="tabs-right"><i class="bx bx-refresh"></i>&nbsp; {{ rows.length }} total</span>
      </div>

      <!-- Loading -->
      <div class="state-box" *ngIf="loading">
        <div class="spinner"></div>Loading leave requests…
      </div>

      <!-- Error -->
      <div class="state-box state-box--error" *ngIf="!loading && error">
        <i class="bx bx-error-circle"></i>{{ error }}
        <br><button style="margin-top:12px;padding:7px 18px;border:none;border-radius:8px;background:#2FA8A0;color:#fff;cursor:pointer;font-size:13px" (click)="load()">Retry</button>
      </div>

      <!-- Empty -->
      <div class="state-box" *ngIf="!loading && !error && filtered.length === 0">
        <i class="bx bx-door-open"></i>No leave requests found.
      </div>

      <!-- Table -->
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
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of filtered; let i = index" (click)="selected = r">
              <td class="td-id">{{ i + 1 }}</td>
              <td class="td-name">{{ r.requester.firstname }} {{ r.requester.lastname }}</td>
              <td><span class="role-chip">{{ r.leaveType.name }}</span></td>
              <td>{{ r.startDate | date:'dd/MM/yyyy' }}</td>
              <td>{{ r.endDate   | date:'dd/MM/yyyy' }}</td>
              <td style="font-weight:700;color:#1A2B3C">{{ r.durationDays }}d</td>
              <td style="font-size:12px">{{ r.createdAt | date:'dd/MM/yy' }}</td>
              <td><span class="status-chip" [ngClass]="chipClass(r.status)">{{ r.status }}</span></td>
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
export class LeaveListComponent implements OnInit {

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

  countTab(tab: string): number {
    return this.rows.filter(r => r.status === tab).length;
  }

  chipClass(s: string): Record<string, boolean> {
    return {
      'chip-pending':   s === 'PENDING',
      'chip-approved':  s === 'APPROVED',
      'chip-rejected':  s === 'REJECTED',
      'chip-cancelled': s === 'CANCELLED',
    };
  }

  approve(req: LeaveRequest): void {
    this.saving = true;
    this.leaveService.approve(req.id, '').subscribe({
      next: updated => {
        this.rows = this.rows.map(r => r.id === updated.id ? updated : r);
        if (this.selected?.id === updated.id) this.selected = updated;
        this.saving = false;
        this.showToast('Leave request approved.');
      },
      error: err => {
        this.saving = false;
        this.showToast(err?.error?.message || 'Failed to approve.');
      }
    });
  }

  reject(req: LeaveRequest): void {
    this.saving = true;
    this.leaveService.reject(req.id, '').subscribe({
      next: updated => {
        this.rows = this.rows.map(r => r.id === updated.id ? updated : r);
        if (this.selected?.id === updated.id) this.selected = updated;
        this.saving = false;
        this.showToast('Leave request rejected.');
      },
      error: err => {
        this.saving = false;
        this.showToast(err?.error?.message || 'Failed to reject.');
      }
    });
  }

  private showToast(msg: string): void {
    this.toast = msg;
    setTimeout(() => this.toast = null, 3000);
  }
}
