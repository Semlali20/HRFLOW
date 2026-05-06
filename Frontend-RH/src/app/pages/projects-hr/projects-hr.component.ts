import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CollaborateurService } from 'src/app/core/services/collaborateur.service';

@Component({
  selector: 'app-projects-hr',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  styles: [`
    .page { padding:0 24px 40px; font-family:'Inter',sans-serif; animation:fadeIn .4s ease both; }
    @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}

    /* ── Header ── */
    .page-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);margin-bottom:18px;}
    .page-title{font-size:22px;font-weight:700;color:#1A2B3C;margin:0;}
    .header-meta{display:flex;align-items:center;gap:20px;}
    .header-date{font-size:13px;color:#8FA3B8;display:flex;align-items:center;gap:6px;}
    .header-lang{font-size:13px;color:#4A6080;display:flex;align-items:center;gap:6px;cursor:pointer;border-left:1px solid #E2E8F0;padding-left:16px;}

    /* ── Top row ── */
    .top-row{display:grid;grid-template-columns:1fr 1fr 290px;gap:18px;margin-bottom:20px;align-items:start;}

    /* ── Card base ── */
    .card{background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);}

    /* ── Total Project card ── */
    .total-card{padding:22px;}
    .total-card-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;}
    .total-label{font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#8FA3B8;margin-bottom:2px;}
    .total-title{font-size:20px;font-weight:800;color:#1A2B3C;}
    .period-btn{display:flex;align-items:center;gap:5px;font-size:12.5px;color:#4A6080;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:5px 12px;cursor:pointer;white-space:nowrap;}

    .kpi-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:18px;}
    .kpi-box{background:#F8FAFC;border-radius:10px;padding:14px 16px;}
    .kpi-lbl{font-size:11px;color:#8FA3B8;margin-bottom:4px;}
    .kpi-val{font-size:22px;font-weight:800;color:#1A2B3C;}

    .big-num-row{display:flex;align-items:baseline;gap:10px;margin-bottom:4px;}
    .big-num{font-size:34px;font-weight:800;color:#1A2B3C;}
    .big-badge{background:#DCFCE7;color:#15803D;font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;}
    .big-sub{font-size:12px;color:#8FA3B8;margin-bottom:10px;}

    /* ── Average Time Spent card ── */
    .time-card{padding:22px;}
    .time-card-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:4px;}
    .time-label{font-size:13px;color:#8FA3B8;margin-bottom:2px;}
    .time-val{font-size:28px;font-weight:800;color:#1A2B3C;}
    .time-filter{display:flex;align-items:center;gap:5px;font-size:12px;color:#4A6080;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:5px 12px;cursor:pointer;white-space:nowrap;}

    /* ── Right column ── */
    .right-col{display:flex;flex-direction:column;gap:14px;}
    .add-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px;background:#1B7872;color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s;}
    .add-btn:hover{background:#1A9690;}
    .add-btn i{font-size:18px;}

    .deadline-card{padding:18px 20px;}
    .deadline-head{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
    .deadline-icon-wrap{width:36px;height:36px;border-radius:9px;background:#F0F3F6;display:flex;align-items:center;justify-content:center;}
    .deadline-head-title{font-size:14px;font-weight:700;color:#1A2B3C;}
    .deadline-section-lbl{font-size:11px;font-weight:700;color:#EF4444;letter-spacing:.05em;margin-bottom:10px;}
    .deadline-item{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px;}
    .deadline-item:last-child{margin-bottom:0;}
    .deadline-name{font-size:13px;font-weight:500;color:#1A2B3C;}
    .view-link{font-size:12.5px;color:#2FA8A0;font-weight:600;display:flex;align-items:center;gap:3px;cursor:pointer;white-space:nowrap;}

    /* ── Table ── */
    .table-card{border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(22,34,51,.08);}
    .tabs-bar{display:flex;align-items:center;gap:2px;padding:14px 20px 0;border-bottom:1px solid #F0F3F6;}
    .tab{padding:10px 18px;font-size:13px;font-weight:500;color:#8FA3B8;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;transition:all .15s;margin-bottom:-1px;}
    .tab.active{color:#2FA8A0;border-bottom-color:#2FA8A0;font-weight:600;}
    .tabs-right{margin-left:auto;font-size:12px;color:#8FA3B8;display:flex;align-items:center;gap:5px;}
    table{width:100%;border-collapse:collapse;}
    thead tr{background:#FAFBFC;}
    thead th{padding:11px 16px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8FA3B8;border-bottom:1px solid #F0F3F6;white-space:nowrap;}
    tbody tr{cursor:pointer;transition:background .15s;}
    tbody tr:hover{background:#FAFBFC;}
    tbody td{padding:12px 16px;font-size:13px;color:#4A6080;border-bottom:1px solid #F5F7FA;vertical-align:middle;}
    tbody tr:last-child td{border-bottom:none;}
    .td-id{font-weight:600;color:#4A6080;font-size:12.5px;}
    .td-name{font-weight:600;color:#1A2B3C;}
    .avatar-group{display:flex;}
    .avatar{width:26px;height:26px;border-radius:50%;border:2px solid #fff;margin-left:-6px;background:#E2E8F0;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#4A6080;flex-shrink:0;}
    .avatar:first-child{margin-left:0;}
    .status-chip{display:inline-flex;align-items:center;padding:4px 11px;border-radius:999px;font-size:11.5px;font-weight:700;}
    .chip-ongoing{background:#DCFCE7;color:#15803D;}
    .chip-hold{background:#FEF3C7;color:#B45309;}
    .chip-done{background:#DBEAFE;color:#1D4ED8;}
    .chip-cancelled{background:#FFE4E6;color:#BE123C;}
    .act-icon{font-size:15px;color:#B0BEC5;cursor:pointer;margin-right:8px;}
    .act-icon:hover{color:#4A6080;}
    .act-icon--del:hover{color:#EF4444;}

    /* ── Backdrop ── */
    .backdrop{position:fixed;inset:0;background:rgba(10,20,35,.35);z-index:1800;backdrop-filter:blur(1px);}

    /* ── Right panel base ── */
    .rp{position:fixed;top:70px;right:0;bottom:0;width:560px;background:#fff;box-shadow:-8px 0 40px rgba(10,20,35,.14);border-radius:16px 0 0 0;z-index:1801;display:flex;flex-direction:column;animation:rpIn .22s ease both;overflow:hidden;}
    @keyframes rpIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
    .rp-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px 18px;border-bottom:1px solid #F0F3F6;flex-shrink:0;}
    .rp-title{font-size:16px;font-weight:700;color:#1A2B3C;}
    .rp-head-right{display:flex;align-items:center;gap:10px;}
    .rp-close{width:32px;height:32px;border:none;background:#F1F5F9;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;color:#4A6080;}
    .rp-close:hover{background:#E2E8F0;}
    .rp-body{flex:1;overflow-y:auto;padding:24px;}

    /* ── Edit project button ── */
    .edit-project-btn{display:flex;align-items:center;gap:7px;padding:9px 18px;background:#1B7872;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;}
    .edit-project-btn:hover{background:#1A9690;}

    /* ── Detail panel fields ── */
    .dp-project-name{font-size:20px;font-weight:700;color:#1A2B3C;margin-bottom:20px;}
    .dp-field{display:grid;grid-template-columns:130px 1fr;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid #F5F7FA;}
    .dp-field:last-of-type{border-bottom:none;}
    .dp-field-lbl{display:flex;align-items:center;gap:7px;font-size:13px;color:#8FA3B8;}
    .dp-field-lbl i{font-size:15px;}
    .dp-field-val{font-size:13px;color:#1A2B3C;font-weight:500;}
    .dp-manager-row{display:flex;align-items:center;gap:8px;}
    .dp-manager-avatar{width:26px;height:26px;border-radius:50%;background:#E2E8F0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#4A6080;}
    .dp-status-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;}
    .status-progress{background:#DCFCE7;color:#15803D;}
    .dp-service-chip{display:inline-flex;align-items:center;padding:4px 10px;border-radius:6px;background:#F1F5F9;color:#4A6080;font-size:12px;font-weight:500;margin-right:6px;}

    /* ── Detail tabs ── */
    .dp-tabs{display:flex;gap:0;border-bottom:1px solid #F0F3F6;margin:20px 0 16px;}
    .dp-tab{padding:9px 16px;font-size:13px;font-weight:500;color:#8FA3B8;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;margin-bottom:-1px;}
    .dp-tab.active{color:#2FA8A0;border-bottom-color:#2FA8A0;font-weight:600;}
    .dp-activity-table{width:100%;border-collapse:collapse;}
    .dp-activity-table thead th{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#8FA3B8;padding:8px 10px;border-bottom:1px solid #F0F3F6;text-align:left;}
    .dp-activity-table tbody td{padding:10px 10px;font-size:12.5px;color:#4A6080;border-bottom:1px solid #F5F7FA;vertical-align:middle;}
    .dp-activity-table tbody tr:last-child td{border-bottom:none;}
    .dp-emp-row{display:flex;align-items:center;gap:7px;}
    .dp-emp-avatar{width:22px;height:22px;border-radius:50%;background:#E2E8F0;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#4A6080;flex-shrink:0;}
    .dp-service-tag{display:inline-flex;padding:3px 8px;border-radius:5px;font-size:11px;background:#F1F5F9;color:#4A6080;}

    /* ── Create panel form ── */
    .cp-section-title{font-size:15px;font-weight:700;color:#1A2B3C;margin:20px 0 6px;}
    .cp-section-title:first-child{margin-top:0;}
    .cp-sub{font-size:12.5px;color:#8FA3B8;margin-bottom:14px;}
    .cp-field-lbl{font-size:13px;font-weight:600;color:#1A2B3C;margin-bottom:6px;}
    .cp-input{width:100%;padding:10px 14px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:#1A2B3C;font-family:'Inter',sans-serif;box-sizing:border-box;outline:none;transition:border .15s;}
    .cp-input:focus{border-color:#2FA8A0;box-shadow:0 0 0 3px rgba(47,168,160,.1);}
    .cp-input::placeholder{color:#C0CDD8;}
    .cp-select{width:100%;padding:10px 14px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:#4A6080;font-family:'Inter',sans-serif;appearance:none;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238FA3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 14px center;box-sizing:border-box;outline:none;cursor:pointer;}
    .cp-select:focus{border-color:#2FA8A0;}
    .cp-field{margin-bottom:16px;}
    .cp-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px;}
    .cp-chip{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;background:#F1F5F9;border-radius:999px;font-size:12.5px;color:#4A6080;font-weight:500;}
    .cp-chip-x{background:none;border:none;font-size:14px;color:#8FA3B8;cursor:pointer;padding:0;line-height:1;display:flex;align-items:center;}
    .cp-chip-x:hover{color:#EF4444;}
    .cp-emp-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:999px;font-size:12.5px;color:#1A2B3C;font-weight:500;}
    .cp-emp-avatar{width:20px;height:20px;border-radius:50%;background:#E2E8F0;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#4A6080;flex-shrink:0;}
    .cp-footer{padding:16px 24px;border-top:1px solid #F0F3F6;flex-shrink:0;display:flex;justify-content:flex-end;}
    .cp-submit-btn{padding:11px 28px;background:#1B7872;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;}
    .cp-submit-btn:hover{background:#1A9690;}
    .cp-date-input{position:relative;display:flex;align-items:center;}
    .cp-date-input i{position:absolute;left:13px;font-size:16px;color:#8FA3B8;}
    .cp-date-input input{padding-left:36px;}
  `],
  template: `
  <!-- Backdrop -->
  <div class="backdrop" *ngIf="showDetail || showCreate" (click)="closeAll()"></div>

  <!-- ══ Project Detail Panel ══ -->
  <div class="rp" *ngIf="showDetail && selectedProject">
    <div class="rp-header">
      <span class="rp-title">Project Detail</span>
      <div class="rp-head-right">
        <button class="edit-project-btn" (click)="openEdit()">
          <i class="bx bx-edit-alt"></i> Edit Project
        </button>
        <button class="rp-close" (click)="closeAll()"><i class="bx bx-x"></i></button>
      </div>
    </div>
    <div class="rp-body">
      <div class="dp-project-name">{{ selectedProject.name }}</div>

      <div class="dp-field">
        <span class="dp-field-lbl"><i class="bx bx-purchase-tag-alt"></i> Project ID</span>
        <span class="dp-field-val">#ID128472</span>
      </div>
      <div class="dp-field">
        <span class="dp-field-lbl"><i class="bx bx-user"></i> Project Manager</span>
        <span class="dp-field-val">
          <span class="dp-manager-row">
            <span class="dp-manager-avatar">MS</span> Mrs. Mole Stewart
          </span>
        </span>
      </div>
      <div class="dp-field">
        <span class="dp-field-lbl"><i class="bx bx-group"></i> Assignee</span>
        <span class="dp-field-val">
          <div class="avatar-group">
            <div class="avatar" *ngFor="let a of selectedProject.assignees" [style.background]="a.bg">{{ a.initials }}</div>
          </div>
        </span>
      </div>
      <div class="dp-field">
        <span class="dp-field-lbl"><i class="bx bx-loader-circle"></i> Status</span>
        <span class="dp-field-val">
          <span class="dp-status-badge status-progress">
            <span style="width:7px;height:7px;border-radius:50%;background:#15803D;display:inline-block;"></span>
            On Progress
          </span>
        </span>
      </div>
      <div class="dp-field">
        <span class="dp-field-lbl"><i class="bx bx-calendar"></i> Timeline</span>
        <span class="dp-field-val" style="font-weight:600;">May 12, 2024 - December 12, 2024</span>
      </div>
      <div class="dp-field">
        <span class="dp-field-lbl"><i class="bx bx-cube-alt"></i> Services</span>
        <span class="dp-field-val">
          <span class="dp-service-chip">UI Design</span>
          <span class="dp-service-chip">Website Develope</span>
          <span class="dp-service-chip">QA Testing</span>
        </span>
      </div>

      <!-- Tabs -->
      <div class="dp-tabs">
        <button class="dp-tab" [class.active]="detailTab==='activity'" (click)="detailTab='activity'">Activity</button>
        <button class="dp-tab" [class.active]="detailTab==='attachments'" (click)="detailTab='attachments'">Attachments</button>
        <button class="dp-tab" [class.active]="detailTab==='feedback'" (click)="detailTab='feedback'">Feedback</button>
        <button class="dp-tab" [class.active]="detailTab==='completed'" (click)="detailTab='completed'">Completed</button>
      </div>

      <!-- Activity tab -->
      <div *ngIf="detailTab==='activity'">
        <table class="dp-activity-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Services</th>
              <th>Hour Worked</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of activityRows">
              <td>{{ a.date }}</td>
              <td>
                <div class="dp-emp-row">
                  <div class="dp-emp-avatar">{{ a.initials }}</div>
                  {{ a.employee }}
                </div>
              </td>
              <td><span class="dp-service-tag">{{ a.service }}</span></td>
              <td>{{ a.hours }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div *ngIf="detailTab!=='activity'" style="padding:40px 0;text-align:center;color:#8FA3B8;font-size:13px;">
        No {{ detailTab }} data yet.
      </div>
    </div>
  </div>

  <!-- ══ Create / Edit Panel ══ -->
  <div class="rp" *ngIf="showCreate">
    <div class="rp-header">
      <span class="rp-title">{{ isEditMode ? 'Edit Project' : 'Create New Project' }}</span>
      <div class="rp-head-right">
        <button class="rp-close" (click)="closeAll()"><i class="bx bx-x"></i></button>
      </div>
    </div>
    <div class="rp-body" style="padding-bottom:0;">

      <!-- Project Information -->
      <div class="cp-section-title">Project Information</div>

      <div class="cp-field">
        <div class="cp-field-lbl">Project Name</div>
        <input class="cp-input" type="text" placeholder="Enter project name" [(ngModel)]="createForm.name" />
      </div>

      <div class="cp-field">
        <div class="cp-field-lbl">Timeline</div>
        <div class="cp-date-input">
          <i class="bx bx-calendar"></i>
          <input class="cp-input" type="text" placeholder="Select range date of project" [(ngModel)]="createForm.timeline" />
        </div>
      </div>

      <!-- Service -->
      <div class="cp-section-title">Service</div>
      <div class="cp-sub">Select the project service to organize your project effectively.</div>

      <div class="cp-field">
        <div class="cp-field-lbl">Project Service</div>
        <select class="cp-select" (change)="addService($any($event.target).value); $any($event.target).value=''">
          <option value="">Select project service</option>
          <option *ngFor="let s of availableServices" [value]="s">{{ s }}</option>
        </select>
        <div class="cp-chips">
          <span class="cp-chip" *ngFor="let s of createForm.services">
            {{ s }} <button class="cp-chip-x" (click)="removeService(s)">×</button>
          </span>
        </div>
      </div>

      <!-- Assignee -->
      <div class="cp-section-title">Assignee</div>
      <div class="cp-sub">Select employees to assign to this project. You can choose more than one.</div>

      <div class="cp-field">
        <div class="cp-field-lbl">Project Manager</div>
        <select class="cp-select" [(ngModel)]="createForm.manager">
          <option value="">Select project manager</option>
          <option *ngFor="let m of managerOptions" [value]="m">{{ m }}</option>
        </select>
      </div>

      <div class="cp-field">
        <div class="cp-field-lbl">Assignee Employee</div>
        <select class="cp-select" (change)="addEmployee($any($event.target).value); $any($event.target).value=''">
          <option value="">Select employee</option>
          <option *ngFor="let e of employeeOptions" [value]="e.name">{{ e.name }}</option>
        </select>
        <div class="cp-chips" style="margin-top:10px;">
          <span class="cp-emp-chip" *ngFor="let e of createForm.assignees">
            <span class="cp-emp-avatar">{{ e.initials }}</span>
            {{ e.name }} <button class="cp-chip-x" (click)="removeEmployee(e.name)">×</button>
          </span>
        </div>
      </div>

    </div>
    <div class="cp-footer">
      <button class="cp-submit-btn" (click)="submitCreate()">
        {{ isEditMode ? 'Save Changes' : 'Create Project' }}
      </button>
    </div>
  </div>

  <!-- ══════════════ Page ══════════════ -->
  <div class="page">

    <!-- Header -->
    <div class="page-header">
      <h4 class="page-title">Projects</h4>
      <div class="header-meta">
        <span class="header-date"><i class="bx bx-calendar-alt"></i> {{ today | date:'EEEE, MMMM d, y' }}</span>
        <span class="header-lang"><i class="bx bx-flag"></i> English <i class="bx bx-chevron-down"></i></span>
      </div>
    </div>

    <!-- Top row -->
    <div class="top-row">

      <!-- Total Project card -->
      <div class="card total-card">
        <div class="total-card-head">
          <div>
            <div class="total-label">TOTAL</div>
            <div class="total-title">Project</div>
          </div>
          <button class="period-btn">This year <i class="bx bx-chevron-down"></i></button>
        </div>
        <div class="kpi-row">
          <div class="kpi-box">
            <div class="kpi-lbl">On Going</div>
            <div class="kpi-val">{{ onGoingCount }}</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-lbl">On Hold</div>
            <div class="kpi-val">{{ onHoldCount }}</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-lbl">Completed</div>
            <div class="kpi-val">{{ completedCount }}</div>
          </div>
        </div>
        <div class="big-num-row">
          <span class="big-num">{{ totalProjects }}</span>
        </div>
        <div class="big-sub">Total projects created.</div>
        <apx-chart [series]="areaChart.series" [chart]="areaChart.chart" [colors]="areaChart.colors"
          [stroke]="areaChart.stroke" [fill]="areaChart.fill" [xaxis]="areaChart.xaxis"
          [grid]="areaChart.grid" [dataLabels]="areaChart.dataLabels" [tooltip]="areaChart.tooltip">
        </apx-chart>
      </div>

      <!-- Average Time Spent card -->
      <div class="card time-card">
        <div class="time-card-head">
          <div>
            <div class="time-label">Projects Overview</div>
            <div class="time-val">{{ totalProjects }}</div>
          </div>
          <button class="time-filter">All project <i class="bx bx-chevron-down"></i></button>
        </div>
        <apx-chart [series]="barChart.series" [chart]="barChart.chart" [colors]="barChart.colors"
          [plotOptions]="barChart.plotOptions" [xaxis]="barChart.xaxis" [yaxis]="barChart.yaxis"
          [grid]="barChart.grid" [dataLabels]="barChart.dataLabels" [tooltip]="barChart.tooltip">
        </apx-chart>
      </div>

      <!-- Right column -->
      <div class="right-col">
        <button class="add-btn" (click)="openCreate()"><i class="bx bx-plus"></i> Add New Project</button>

        <div class="card deadline-card">
          <div class="deadline-head">
            <div class="deadline-icon-wrap"><i class="bx bx-alarm" style="font-size:18px;color:#4A6080;"></i></div>
            <span class="deadline-head-title">Upcoming<br>Deadlines</span>
          </div>
          <div class="deadline-section-lbl">Today</div>
          <div *ngFor="let d of deadlines" class="deadline-item">
            <span class="deadline-name">{{ d.name }}</span>
            <span class="view-link">View <i class="bx bx-right-arrow-alt"></i></span>
          </div>
        </div>
      </div>

    </div>

    <!-- Table -->
    <div class="table-card">
      <div class="tabs-bar">
        <button *ngFor="let t of tabs" class="tab" [class.active]="activeTab===t" (click)="activeTab=t">{{ t }}</button>
        <span class="tabs-right"><i class="bx bx-info-circle"></i>&nbsp;{{ totalProjects }} total</span>
      </div>

      <!-- Empty state -->
      <div style="padding:48px 0;text-align:center;color:#8FA3B8;font-size:14px;" *ngIf="filteredRows.length === 0">
        <i class="bx bx-folder-open" style="font-size:36px;display:block;margin-bottom:10px;"></i>
        No projects yet. Click <strong>Add New Project</strong> to create one.
      </div>

      <div style="overflow-x:auto" *ngIf="filteredRows.length > 0">
        <table>
          <thead>
            <tr>
              <th>Project ID</th>
              <th>Project Name</th>
              <th>Assignee</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of filteredRows" (click)="openDetail(r)">
              <td class="td-id">{{ r.id }}</td>
              <td class="td-name">{{ r.name }}</td>
              <td>
                <div class="avatar-group">
                  <div class="avatar" *ngFor="let a of r.assignees.slice(0,5)" [style.background]="a.bg">{{ a.initials }}</div>
                  <div class="avatar" *ngIf="r.assignees.length > 5" style="background:#F0F3F6">+{{ r.assignees.length - 5 }}</div>
                </div>
              </td>
              <td>{{ r.start }}</td>
              <td>{{ r.end }}</td>
              <td><span class="status-chip" [ngClass]="chipClass(r.status)">{{ r.status }}</span></td>
              <td (click)="$event.stopPropagation()">
                <i class="bx bx-pencil act-icon" (click)="openDetail(r); openEdit()"></i>
                <i class="bx bx-trash act-icon act-icon--del" (click)="deleteRow(r)"></i>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class ProjectsHrComponent implements OnInit {
  today = new Date();
  tabs = ['All', 'On Going', 'On Hold', 'Completed'];
  activeTab = 'All';
  detailTab = 'activity';

  showDetail = false;
  showCreate = false;
  isEditMode = false;
  selectedProject: any = null;

  createForm = this.emptyForm();

  // Loaded from real API
  availableServices = ['UI Design', 'Website Development', 'QA Testing', 'Backend Development', 'DevOps', 'Mobile App', 'Data Analysis'];
  employeeOptions: { name: string; initials: string; bg: string }[] = [];
  managerOptions: string[] = [];

  // All projects created in-session (no backend endpoint for projects yet)
  rows: any[] = [];

  // Upcoming deadlines derived from projects with approaching end dates
  get deadlines(): any[] {
    const today = new Date();
    const soon  = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    return this.rows
      .filter(r => r.endRaw && new Date(r.endRaw) <= soon && r.status !== 'Completed')
      .slice(0, 5)
      .map(r => ({ name: r.name }));
  }

  // Activity rows derived from project assignees (no timesheets backend yet)
  activityRows: any[] = [];

  // KPI counters from real project list
  get onGoingCount()   { return this.rows.filter(r => r.status === 'On Going').length; }
  get onHoldCount()    { return this.rows.filter(r => r.status === 'On Hold').length; }
  get completedCount() { return this.rows.filter(r => r.status === 'Completed').length; }
  get totalProjects()  { return this.rows.length; }

  areaChart: any = {};
  barChart: any = {};

  // Background colors for avatar chips
  private readonly BG_COLORS = ['#BFDBFE','#DDD6FE','#FDE68A','#BBF7D0','#FECACA','#E0F2FE','#FCE7F3'];

  constructor(private collaborateurService: CollaborateurService) {}

  ngOnInit(): void {
    // Load real employees for assignee / manager dropdowns
    this.collaborateurService.getAll().subscribe({
      next: data => {
        this.employeeOptions = data.map((e, i) => ({
          name:     `${e.prenom ?? ''} ${e.nom ?? ''}`.trim(),
          initials: `${(e.prenom?.[0] ?? '').toUpperCase()}${(e.nom?.[0] ?? '').toUpperCase()}`,
          bg:       this.BG_COLORS[i % this.BG_COLORS.length],
        }));
        this.managerOptions = data
          .filter(e => (e.Ancienneté ?? 0) >= 3 || (e.Fonction ?? '').toLowerCase().includes('manager') || (e.Fonction ?? '').toLowerCase().includes('chef'))
          .map(e => `${e.prenom ?? ''} ${e.nom ?? ''}`.trim())
          .slice(0, 20);
        if (this.managerOptions.length === 0) {
          this.managerOptions = this.employeeOptions.slice(0, 5).map(e => e.name);
        }
        this.buildCharts(data.length);
      },
      error: () => { this.buildCharts(0); }
    });
  }

  get filteredRows(): any[] {
    if (this.activeTab === 'All') return this.rows;
    return this.rows.filter(r => r.status === this.activeTab);
  }

  openDetail(row: any) {
    this.selectedProject = row;
    this.activityRows = (row.assignees ?? []).map((a: any) => ({
      date:     new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }),
      employee: a.name,
      initials: a.initials,
      service:  row.services?.[0] ?? '—',
      hours:    '—',
    }));
    this.showDetail = true;
    this.showCreate = false;
    this.isEditMode = false;
    this.detailTab = 'activity';
  }

  openCreate() {
    this.showCreate = true;
    this.showDetail = false;
    this.isEditMode = false;
    this.createForm = this.emptyForm();
  }

  openEdit() {
    this.isEditMode = true;
    this.showCreate = true;
    this.showDetail = false;
    if (this.selectedProject) {
      this.createForm = {
        name:      this.selectedProject.name,
        timeline:  `${this.selectedProject.start} - ${this.selectedProject.end}`,
        services:  [...(this.selectedProject.services ?? [])],
        manager:   this.selectedProject.manager ?? '',
        assignees: [...(this.selectedProject.assignees ?? [])],
        status:    this.selectedProject.status ?? 'On Going',
      };
    }
  }

  closeAll() {
    this.showDetail = false;
    this.showCreate = false;
    this.selectedProject = null;
    this.isEditMode = false;
  }

  submitCreate() {
    if (!this.createForm.name) return;
    const [startStr, endStr] = (this.createForm.timeline ?? '').split(' - ');
    const now = new Date();

    if (this.isEditMode && this.selectedProject) {
      const idx = this.rows.findIndex(r => r === this.selectedProject);
      if (idx !== -1) {
        this.rows[idx] = {
          ...this.rows[idx],
          name:      this.createForm.name,
          start:     startStr?.trim() ?? this.rows[idx].start,
          end:       endStr?.trim()   ?? this.rows[idx].end,
          endRaw:    endStr?.trim()   ?? this.rows[idx].endRaw,
          services:  [...this.createForm.services],
          manager:   this.createForm.manager,
          assignees: [...this.createForm.assignees],
          status:    this.createForm.status,
        };
      }
    } else {
      const newRow = {
        id:        `P${String(this.rows.length + 1).padStart(4, '0')}`,
        name:      this.createForm.name,
        start:     now.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }),
        end:       endStr?.trim() ?? '—',
        endRaw:    endStr?.trim() ?? '',
        status:    'On Going',
        services:  [...this.createForm.services],
        manager:   this.createForm.manager,
        assignees: [...this.createForm.assignees],
      };
      this.rows = [newRow, ...this.rows];
      this.buildCharts(this.rows.length);
    }
    this.closeAll();
  }

  addService(s: string) {
    if (s && !this.createForm.services.includes(s)) this.createForm.services.push(s);
  }
  removeService(s: string) {
    this.createForm.services = this.createForm.services.filter((x: string) => x !== s);
  }

  addEmployee(name: string) {
    if (!name) return;
    const emp = this.employeeOptions.find(e => e.name === name);
    if (emp && !this.createForm.assignees.find((a: any) => a.name === name)) {
      this.createForm.assignees.push({ ...emp });
    }
  }
  removeEmployee(name: string) {
    this.createForm.assignees = this.createForm.assignees.filter((a: any) => a.name !== name);
  }

  deleteRow(row: any): void {
    if (!confirm(`Delete project "${row.name}"?`)) return;
    this.rows = this.rows.filter(r => r !== row);
    this.buildCharts(this.employeeOptions.length);
  }

  chipClass(s: string) {
    return {
      'chip-ongoing':   s === 'On Going',
      'chip-hold':      s === 'On Hold',
      'chip-done':      s === 'Completed',
      'chip-cancelled': s === 'Cancelled',
    };
  }

  private emptyForm() {
    return { name: '', timeline: '', services: [] as string[], manager: '', assignees: [] as any[], status: 'On Going' };
  }

  private buildCharts(empCount: number): void {
    // Area chart: show project counts per status (no historical data without backend)
    const onGoing   = this.onGoingCount;
    const onHold    = this.onHoldCount;
    const completed = this.completedCount;
    const total     = this.totalProjects;

    this.areaChart = {
      series: [{ name: 'Projects', data: total > 0 ? [0, total] : [0, 0] }],
      chart: { type: 'area', height: 110, toolbar: { show: false }, sparkline: { enabled: true } },
      colors: ['#2FA8A0'],
      stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'gradient', gradient: { opacityFrom: .35, opacityTo: .02 } },
      xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
      grid: { show: false },
      dataLabels: { enabled: false },
      tooltip: { enabled: false },
    };

    this.barChart = {
      series: [{ name: 'Employees', data: [
        { x: 'On Going',   y: onGoing,   fillColor: '#3B82F6' },
        { x: 'On Hold',    y: onHold,    fillColor: '#BFDBFE' },
        { x: 'Completed',  y: completed, fillColor: '#BFDBFE' },
        { x: 'Total Staff',y: empCount,  fillColor: '#BFDBFE' },
      ]}],
      chart: { type: 'bar', height: 200, toolbar: { show: false }, fontFamily: 'Inter,sans-serif' },
      colors: ['#3B82F6'],
      plotOptions: { bar: { borderRadius: 6, columnWidth: '50%', distributed: true } },
      xaxis: {
        categories: ['On Going', 'On Hold', 'Completed', 'Total Staff'],
        labels: { style: { fontSize:'11px', colors:'#8FA3B8', fontFamily:'Inter,sans-serif' } },
        axisBorder: { show: false }, axisTicks: { show: false },
      },
      yaxis: { show: false },
      grid: { show: false },
      dataLabels: { enabled: false },
      legend: { show: false },
      tooltip: { y: { formatter: (val: number) => String(val) }, marker: { show: false } },
    };
  }
}
