import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CollaborateurService } from 'src/app/core/services/collaborateur.service';
import { ConfirmService } from 'src/app/shared/confirm.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WallClockComponent } from 'src/app/shared/wall-clock/wall-clock.component';

@Component({
  selector: 'app-projects-hr',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule, TranslateModule, WallClockComponent],
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
    .top-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;margin-bottom:20px;align-items:start;}

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
    .add-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;background:#1B7872;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s;white-space:nowrap;}
    .add-btn:hover{background:#1A9690;}
    .add-btn i{font-size:18px;}

    /* ── Total period dropdown ── */
    .total-dd-wrap{position:relative;}
    .total-dd{position:absolute;top:calc(100% + 6px);right:0;background:#fff;border:1px solid #E2E8F0;border-radius:10px;box-shadow:0 8px 24px rgba(22,34,51,.12);z-index:500;min-width:140px;overflow:hidden;}
    .total-dd button{display:block;width:100%;text-align:left;padding:9px 16px;font-size:13px;color:#4A6080;background:none;border:none;cursor:pointer;transition:background .12s;}
    .total-dd button:hover{background:#F8FAFC;color:#1A2B3C;}
    .total-dd button.active{color:#1B7872;font-weight:700;background:#F0FDF9;}

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

    /* ── Multi-select employee dropdown ── */
    .ms-wrap{position:relative;}
    .ms-overlay{position:fixed;inset:0;z-index:299;}
    .ms-trigger{width:100%;padding:10px 14px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13.5px;color:#4A6080;font-family:'Inter',sans-serif;background:#fff;cursor:pointer;text-align:left;display:flex;align-items:center;justify-content:space-between;transition:border .15s;box-sizing:border-box;}
    .ms-trigger:hover,.ms-trigger:focus{border-color:#2FA8A0;outline:none;box-shadow:0 0 0 3px rgba(47,168,160,.1);}
    .ms-placeholder{color:#C0CDD8;}
    .ms-count{color:#1A2B3C;font-weight:500;}
    .ms-caret{font-size:16px;transition:transform .2s;flex-shrink:0;color:#8FA3B8;}
    .ms-caret.open{transform:rotate(180deg);}
    .ms-panel{position:fixed;background:#fff;border:1.5px solid #E2E8F0;border-radius:10px;box-shadow:0 8px 28px rgba(22,34,51,.13);z-index:9999;overflow:hidden;}
    .ms-search-wrap{padding:10px 12px;border-bottom:1px solid #F0F3F6;display:flex;align-items:center;gap:8px;background:#FAFBFC;}
    .ms-search-icon{font-size:15px;color:#8FA3B8;flex-shrink:0;}
    .ms-search-input{flex:1;border:none;outline:none;font-size:13px;color:#1A2B3C;font-family:'Inter',sans-serif;background:transparent;}
    .ms-search-input::placeholder{color:#C0CDD8;}
    .ms-list{max-height:210px;overflow-y:auto;}
    .ms-option{display:flex;align-items:center;gap:10px;padding:9px 14px;cursor:pointer;transition:background .12s;}
    .ms-option:hover{background:#F0FDF9;}
    .ms-option.selected{background:#F0FDF9;}
    .ms-checkbox{width:18px;height:18px;border-radius:5px;border:1.5px solid #D1D9E0;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;}
    .ms-checkbox.checked{background:#1B7872;border-color:#1B7872;color:#fff;}
    .ms-checkbox i{font-size:12px;line-height:1;}
    .ms-emp-avatar-sm{width:24px;height:24px;border-radius:50%;background:#E2E8F0;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#4A6080;flex-shrink:0;}
    .ms-emp-name{font-size:13px;color:#1A2B3C;flex:1;}
    .ms-empty{padding:20px;text-align:center;color:#8FA3B8;font-size:13px;}
    .ms-footer{padding:8px 14px;border-top:1px solid #F0F3F6;font-size:12px;color:#8FA3B8;background:#FAFBFC;}

    /* ── Dark Mode ── */
    :host-context([data-theme="dark"]) .rp{background:#111111 !important;box-shadow:-8px 0 40px rgba(0,0,0,.5) !important}
    :host-context([data-theme="dark"]) .rp-header{border-bottom-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .rp-title{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .rp-close{background:#1A1A1A !important;color:#A0A0A0 !important}
    :host-context([data-theme="dark"]) .rp-close:hover{background:#2A2A2A !important;color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .edit-project-btn{background:#2FA8A0 !important}
    :host-context([data-theme="dark"]) .dp-project-name{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .dp-field{border-bottom-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .dp-field-lbl{color:#6B6B6B !important}
    :host-context([data-theme="dark"]) .dp-field-val{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .dp-service-chip{background:#1A1A1A !important;color:#A0A0A0 !important}
    :host-context([data-theme="dark"]) .dp-tabs{border-bottom-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .dp-tab{color:#6B6B6B !important}
    :host-context([data-theme="dark"]) .dp-tab.active{color:#2FA8A0 !important;border-bottom-color:#2FA8A0 !important}
    :host-context([data-theme="dark"]) .dp-activity-table thead th{color:#6B6B6B !important;border-bottom-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .dp-activity-table tbody td{color:#A0A0A0 !important;border-bottom-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .dp-service-tag{background:#1A1A1A !important;color:#A0A0A0 !important}
    :host-context([data-theme="dark"]) .cp-section-title{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .cp-sub{color:#6B6B6B !important}
    :host-context([data-theme="dark"]) .cp-field-lbl{color:#A0A0A0 !important}
    :host-context([data-theme="dark"]) .cp-input{background:#1A1A1A !important;border-color:#2A2A2A !important;color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .cp-input:focus{border-color:#2FA8A0 !important;box-shadow:0 0 0 3px rgba(47,168,160,.15) !important}
    :host-context([data-theme="dark"]) .cp-input::placeholder{color:#555555 !important}
    :host-context([data-theme="dark"]) .cp-select{background-color:#1A1A1A !important;border-color:#2A2A2A !important;color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .cp-select:focus{border-color:#2FA8A0 !important}
    :host-context([data-theme="dark"]) .cp-chip{background:#1A1A1A !important;color:#A0A0A0 !important}
    :host-context([data-theme="dark"]) .cp-emp-chip{background:#1A1A1A !important;border-color:#2A2A2A !important;color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .cp-footer{border-top-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .ms-trigger{background:#1A1A1A !important;border-color:#2A2A2A !important;color:#A0A0A0 !important}
    :host-context([data-theme="dark"]) .ms-trigger:hover,:host-context([data-theme="dark"]) .ms-trigger:focus{border-color:#2FA8A0 !important;box-shadow:0 0 0 3px rgba(47,168,160,.15) !important}
    :host-context([data-theme="dark"]) .ms-count{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .ms-panel{background:#111111 !important;border-color:#2A2A2A !important;box-shadow:0 8px 28px rgba(0,0,0,.5) !important}
    :host-context([data-theme="dark"]) .ms-search-wrap{background:#0A0A0A !important;border-bottom-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .ms-search-input{color:#FFFFFF !important;background:transparent !important}
    :host-context([data-theme="dark"]) .ms-search-input::placeholder{color:#555555 !important}
    :host-context([data-theme="dark"]) .ms-option{color:#A0A0A0 !important}
    :host-context([data-theme="dark"]) .ms-option:hover{background:rgba(47,168,160,.08) !important}
    :host-context([data-theme="dark"]) .ms-option.selected{background:rgba(47,168,160,.1) !important}
    :host-context([data-theme="dark"]) .ms-checkbox{background:#1A1A1A !important;border-color:#3A3A3A !important}
    :host-context([data-theme="dark"]) .ms-checkbox.checked{background:#2FA8A0 !important;border-color:#2FA8A0 !important}
    :host-context([data-theme="dark"]) .ms-emp-name{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .ms-empty{color:#6B6B6B !important}
    :host-context([data-theme="dark"]) .ms-footer{background:#0A0A0A !important;border-top-color:#2A2A2A !important;color:#6B6B6B !important}
  `],
  template: `
  <!-- ══ Employee multi-select floating panel (outside .rp to escape overflow+transform) ══ -->
  <div class="ms-overlay" *ngIf="empDropOpen" (click)="empDropOpen=false"></div>
  <div class="ms-panel" *ngIf="empDropOpen"
       [style.top.px]="empDropTop"
       [style.left.px]="empDropLeft"
       [style.width.px]="empDropWidth"
       (click)="$event.stopPropagation()">
    <div class="ms-search-wrap">
      <i class="bx bx-search ms-search-icon"></i>
      <input class="ms-search-input" type="text" [(ngModel)]="empSearch" placeholder="Search employee..." />
    </div>
    <div class="ms-list">
      <div class="ms-option" *ngFor="let e of filteredEmployees"
           [class.selected]="isSelected(e.name)"
           (click)="toggleEmployee(e)">
        <span class="ms-checkbox" [class.checked]="isSelected(e.name)">
          <i class="bx bx-check" *ngIf="isSelected(e.name)"></i>
        </span>
        <span class="ms-emp-avatar-sm" [style.background]="e.bg">{{ e.initials }}</span>
        <span class="ms-emp-name">{{ e.name }}</span>
      </div>
      <div class="ms-empty" *ngIf="filteredEmployees.length === 0">No employees found</div>
    </div>
    <div class="ms-footer" *ngIf="createForm.assignees.length > 0">
      {{ createForm.assignees.length }} selected &nbsp;·&nbsp;
      <span style="color:#EF4444;cursor:pointer;" (click)="createForm.assignees=[]">Clear all</span>
    </div>
  </div>

  <!-- Backdrop -->
  <div class="backdrop" *ngIf="showDetail || showCreate" (click)="closeAll()"></div>

  <!-- ══ Project Detail Panel ══ -->
  <div class="rp" *ngIf="showDetail && selectedProject">
    <div class="rp-header">
      <span class="rp-title">{{ 'PROJECTS.DETAIL_TITLE' | translate }}</span>
      <div class="rp-head-right">
        <button class="edit-project-btn" (click)="openEdit()">
          <i class="bx bx-edit-alt"></i> {{ 'PROJECTS.BTN_EDIT_PROJECT' | translate }}
        </button>
        <button class="rp-close" (click)="closeAll()"><i class="bx bx-x"></i></button>
      </div>
    </div>
    <div class="rp-body">
      <div class="dp-project-name">{{ selectedProject.name }}</div>

      <div class="dp-field">
        <span class="dp-field-lbl"><i class="bx bx-purchase-tag-alt"></i> {{ 'PROJECTS.FIELD_PROJECT_ID' | translate }}</span>
        <span class="dp-field-val">#ID128472</span>
      </div>
      <div class="dp-field">
        <span class="dp-field-lbl"><i class="bx bx-user"></i> {{ 'PROJECTS.FIELD_PROJECT_MANAGER' | translate }}</span>
        <span class="dp-field-val">
          <span class="dp-manager-row">
            <span class="dp-manager-avatar">MS</span> Mrs. Mole Stewart
          </span>
        </span>
      </div>
      <div class="dp-field">
        <span class="dp-field-lbl"><i class="bx bx-group"></i> {{ 'PROJECTS.FIELD_ASSIGNEE' | translate }}</span>
        <span class="dp-field-val">
          <div class="avatar-group">
            <div class="avatar" *ngFor="let a of selectedProject.assignees" [style.background]="a.bg">{{ a.initials }}</div>
          </div>
        </span>
      </div>
      <div class="dp-field">
        <span class="dp-field-lbl"><i class="bx bx-loader-circle"></i> {{ 'PROJECTS.FIELD_STATUS' | translate }}</span>
        <span class="dp-field-val">
          <span class="dp-status-badge status-progress">
            <span style="width:7px;height:7px;border-radius:50%;background:#15803D;display:inline-block;"></span>
            On Progress
          </span>
        </span>
      </div>
      <div class="dp-field">
        <span class="dp-field-lbl"><i class="bx bx-calendar"></i> {{ 'PROJECTS.FIELD_TIMELINE' | translate }}</span>
        <span class="dp-field-val" style="font-weight:600;">May 12, 2024 - December 12, 2024</span>
      </div>
      <div class="dp-field">
        <span class="dp-field-lbl"><i class="bx bx-cube-alt"></i> {{ 'PROJECTS.FIELD_SERVICES' | translate }}</span>
        <span class="dp-field-val">
          <span class="dp-service-chip">UI Design</span>
          <span class="dp-service-chip">Website Develope</span>
          <span class="dp-service-chip">QA Testing</span>
        </span>
      </div>

      <!-- Tabs -->
      <div class="dp-tabs">
        <button class="dp-tab" [class.active]="detailTab==='activity'" (click)="detailTab='activity'">{{ 'PROJECTS.TAB_ACTIVITY' | translate }}</button>
        <button class="dp-tab" [class.active]="detailTab==='attachments'" (click)="detailTab='attachments'">{{ 'PROJECTS.TAB_ATTACHMENTS' | translate }}</button>
        <button class="dp-tab" [class.active]="detailTab==='feedback'" (click)="detailTab='feedback'">{{ 'PROJECTS.TAB_FEEDBACK' | translate }}</button>
        <button class="dp-tab" [class.active]="detailTab==='completed'" (click)="detailTab='completed'">{{ 'PROJECTS.TAB_COMPLETED' | translate }}</button>
      </div>

      <!-- Activity tab -->
      <div *ngIf="detailTab==='activity'">
        <table class="dp-activity-table">
          <thead>
            <tr>
              <th>{{ 'PROJECTS.ACTIVITY_DATE' | translate }}</th>
              <th>{{ 'PROJECTS.ACTIVITY_EMPLOYEE' | translate }}</th>
              <th>{{ 'PROJECTS.ACTIVITY_SERVICES' | translate }}</th>
              <th>{{ 'PROJECTS.ACTIVITY_HOURS' | translate }}</th>
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
        {{ 'PROJECTS.NO_TAB_DATA' | translate:{tab: detailTab} }}
      </div>
    </div>
  </div>

  <!-- ══ Create / Edit Panel ══ -->
  <div class="rp" *ngIf="showCreate">
    <div class="rp-header">
      <span class="rp-title">{{ isEditMode ? ('PROJECTS.EDIT_TITLE' | translate) : ('PROJECTS.CREATE_TITLE' | translate) }}</span>
      <div class="rp-head-right">
        <button class="rp-close" (click)="closeAll()"><i class="bx bx-x"></i></button>
      </div>
    </div>
    <div class="rp-body" style="padding-bottom:0;">

      <!-- Project Information -->
      <div class="cp-section-title">{{ 'PROJECTS.SECTION_PROJECT_INFO' | translate }}</div>

      <div class="cp-field">
        <div class="cp-field-lbl">{{ 'PROJECTS.FIELD_PROJECT_NAME' | translate }}</div>
        <input class="cp-input" type="text" [placeholder]="'PROJECTS.PROJECT_NAME_PH' | translate" [(ngModel)]="createForm.name" />
      </div>

      <div class="cp-field">
        <div class="cp-field-lbl">{{ 'PROJECTS.FIELD_TIMELINE_FORM' | translate }}</div>
        <div class="cp-date-input">
          <i class="bx bx-calendar"></i>
          <input class="cp-input" type="text" [placeholder]="'PROJECTS.TIMELINE_PH' | translate" [(ngModel)]="createForm.timeline" />
        </div>
      </div>

      <!-- Service -->
      <div class="cp-section-title">{{ 'PROJECTS.SECTION_SERVICE' | translate }}</div>
      <div class="cp-sub">{{ 'PROJECTS.SERVICE_DESC' | translate }}</div>

      <div class="cp-field">
        <div class="cp-field-lbl">{{ 'PROJECTS.FIELD_PROJECT_SERVICE' | translate }}</div>
        <select class="cp-select" (change)="addService($any($event.target).value); $any($event.target).value=''">
          <option value="">{{ 'PROJECTS.SELECT_SERVICE' | translate }}</option>
          <option *ngFor="let s of availableServices" [value]="s">{{ s }}</option>
        </select>
        <div class="cp-chips">
          <span class="cp-chip" *ngFor="let s of createForm.services">
            {{ s }} <button class="cp-chip-x" (click)="removeService(s)">×</button>
          </span>
        </div>
      </div>

      <!-- Assignee -->
      <div class="cp-section-title">{{ 'PROJECTS.SECTION_ASSIGNEE' | translate }}</div>
      <div class="cp-sub">{{ 'PROJECTS.ASSIGNEE_DESC' | translate }}</div>

      <div class="cp-field">
        <div class="cp-field-lbl">{{ 'PROJECTS.FIELD_MANAGER' | translate }}</div>
        <select class="cp-select" [(ngModel)]="createForm.manager">
          <option value="">{{ 'PROJECTS.SELECT_MANAGER' | translate }}</option>
          <option *ngFor="let m of managerOptions" [value]="m">{{ m }}</option>
        </select>
      </div>

      <div class="cp-field">
        <div class="cp-field-lbl">{{ 'PROJECTS.FIELD_ASSIGNEE_EMPLOYEE' | translate }}</div>

        <div class="ms-wrap">
          <!-- Trigger button -->
          <button type="button" class="ms-trigger" #empTrigger (click)="toggleEmpDrop(empTrigger)">
            <span class="ms-placeholder" *ngIf="createForm.assignees.length === 0">{{ 'PROJECTS.SELECT_EMPLOYEE' | translate }}</span>
            <span class="ms-count" *ngIf="createForm.assignees.length > 0">
              {{ createForm.assignees.length }} {{ createForm.assignees.length === 1 ? 'employee' : 'employees' }} selected
            </span>
            <i class="bx bx-chevron-down ms-caret" [class.open]="empDropOpen"></i>
          </button>
        </div>

        <!-- Selected chips -->
        <div class="cp-chips" style="margin-top:10px;" *ngIf="createForm.assignees.length > 0">
          <span class="cp-emp-chip" *ngFor="let e of createForm.assignees">
            <span class="cp-emp-avatar" [style.background]="e.bg">{{ e.initials }}</span>
            {{ e.name }} <button class="cp-chip-x" (click)="removeEmployee(e.name)">×</button>
          </span>
        </div>
      </div>

    </div>
    <div class="cp-footer">
      <button class="cp-submit-btn" (click)="submitCreate()">
        {{ isEditMode ? ('PROJECTS.BTN_SAVE_CHANGES' | translate) : ('PROJECTS.BTN_CREATE_PROJECT' | translate) }}
      </button>
    </div>
  </div>

  <!-- ══════════════ Page ══════════════ -->
  <div class="page">

    <!-- Header -->
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
      <div class="page-header" style="flex:1;margin-bottom:0;">
        <h4 class="page-title">{{ 'PROJECTS.TITLE' | translate }}</h4>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
        <app-wall-clock></app-wall-clock>
        <button class="add-btn" (click)="openCreate()"><i class="bx bx-plus"></i> {{ 'PROJECTS.BTN_ADD' | translate }}</button>
      </div>
    </div>

    <!-- Top row: 3 cards side by side -->
    <div class="top-row">

      <!-- Total Project card -->
      <div class="card total-card" (click)="showTotalDd=false">
        <div class="total-card-head">
          <div>
            <div class="total-label">{{ 'PROJECTS.TOTAL_LABEL' | translate }}</div>
            <div class="total-title">{{ 'PROJECTS.TOTAL_TITLE' | translate }}</div>
          </div>
          <div class="total-dd-wrap" (click)="$event.stopPropagation()">
            <button class="period-btn" (click)="showTotalDd=!showTotalDd">
              {{ totalPeriodLabel }} <i class="bx bx-chevron-down"></i>
            </button>
            <div class="total-dd" *ngIf="showTotalDd">
              <button [class.active]="totalPeriod==='week'"  (click)="setTotalPeriod('week')">This Week</button>
              <button [class.active]="totalPeriod==='month'" (click)="setTotalPeriod('month')">This Month</button>
              <button [class.active]="totalPeriod==='year'"  (click)="setTotalPeriod('year')">This Year</button>
            </div>
          </div>
        </div>
        <div class="kpi-row">
          <div class="kpi-box">
            <div class="kpi-lbl">{{ 'PROJECTS.ON_GOING' | translate }}</div>
            <div class="kpi-val">{{ periodOnGoing }}</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-lbl">{{ 'PROJECTS.ON_HOLD' | translate }}</div>
            <div class="kpi-val">{{ periodOnHold }}</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-lbl">{{ 'PROJECTS.COMPLETED' | translate }}</div>
            <div class="kpi-val">{{ periodCompleted }}</div>
          </div>
        </div>
        <div class="big-num-row">
          <span class="big-num">{{ periodTotal }}</span>
        </div>
        <div class="big-sub">{{ 'PROJECTS.TOTAL_PROJECTS_SUB' | translate }}</div>
        <apx-chart [series]="areaChart.series" [chart]="areaChart.chart" [colors]="areaChart.colors"
          [stroke]="areaChart.stroke" [fill]="areaChart.fill" [xaxis]="areaChart.xaxis"
          [grid]="areaChart.grid" [dataLabels]="areaChart.dataLabels" [tooltip]="areaChart.tooltip">
        </apx-chart>
      </div>

      <!-- Projects Overview card -->
      <div class="card time-card">
        <div class="time-card-head">
          <div>
            <div class="time-label">{{ 'PROJECTS.OVERVIEW_LABEL' | translate }}</div>
            <div class="time-val">{{ totalProjects }}</div>
          </div>
        </div>
        <apx-chart [series]="barChart.series" [chart]="barChart.chart" [colors]="barChart.colors"
          [plotOptions]="barChart.plotOptions" [xaxis]="barChart.xaxis" [yaxis]="barChart.yaxis"
          [grid]="barChart.grid" [dataLabels]="barChart.dataLabels" [tooltip]="barChart.tooltip">
        </apx-chart>
      </div>

      <!-- Upcoming Deadlines card -->
      <div class="card deadline-card">
        <div class="deadline-head">
          <div class="deadline-icon-wrap"><i class="bx bx-alarm" style="font-size:18px;color:#4A6080;"></i></div>
          <span class="deadline-head-title">{{ 'PROJECTS.DEADLINES_TITLE' | translate }}</span>
        </div>
        <div class="deadline-section-lbl">{{ 'PROJECTS.TODAY' | translate }}</div>
        <div *ngFor="let d of deadlines" class="deadline-item">
          <span class="deadline-name">{{ d.name }}</span>
          <span class="view-link">{{ 'PROJECTS.VIEW' | translate }} <i class="bx bx-right-arrow-alt"></i></span>
        </div>
        <div *ngIf="deadlines.length === 0" style="padding:24px 0;text-align:center;color:#8FA3B8;font-size:13px;">
          <i class="bx bx-check-circle" style="font-size:28px;display:block;margin-bottom:8px;color:#22C55E"></i>
          No upcoming deadlines
        </div>
      </div>

    </div>

    <!-- Table -->
    <div class="table-card">
      <div class="tabs-bar">
        <button *ngFor="let t of tabs" class="tab" [class.active]="activeTab===t" (click)="activeTab=t">{{ t | translate }}</button>
        <span class="tabs-right"><i class="bx bx-info-circle"></i>&nbsp;{{ totalProjects }} total</span>
      </div>

      <!-- Empty state -->
      <div style="padding:48px 0;text-align:center;color:#8FA3B8;font-size:14px;" *ngIf="filteredRows.length === 0">
        <i class="bx bx-folder-open" style="font-size:36px;display:block;margin-bottom:10px;"></i>
        {{ 'PROJECTS.NO_PROJECTS' | translate }}
      </div>

      <div style="overflow-x:auto" *ngIf="filteredRows.length > 0">
        <table>
          <thead>
            <tr>
              <th>{{ 'PROJECTS.TABLE_PROJECT_ID' | translate }}</th>
              <th>{{ 'PROJECTS.TABLE_PROJECT_NAME' | translate }}</th>
              <th>{{ 'PROJECTS.TABLE_ASSIGNEE' | translate }}</th>
              <th>{{ 'PROJECTS.TABLE_START_DATE' | translate }}</th>
              <th>{{ 'PROJECTS.TABLE_END_DATE' | translate }}</th>
              <th>{{ 'PROJECTS.TABLE_STATUS' | translate }}</th>
              <th>{{ 'PROJECTS.TABLE_ACTION' | translate }}</th>
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
  tabs = ['PROJECTS.TAB_ALL', 'PROJECTS.ON_GOING', 'PROJECTS.ON_HOLD', 'PROJECTS.COMPLETED'];
  activeTab = 'PROJECTS.TAB_ALL';
  private readonly tabStatusMap: Record<string, string> = {
    'PROJECTS.ON_GOING': 'On Going',
    'PROJECTS.ON_HOLD': 'On Hold',
    'PROJECTS.COMPLETED': 'Completed',
  };
  detailTab = 'activity';

  showDetail = false;
  showCreate = false;
  isEditMode = false;
  selectedProject: any = null;

  // Multi-select employee dropdown
  empDropOpen = false;
  empSearch = '';
  empDropTop = 0;
  empDropLeft = 0;
  empDropWidth = 0;

  toggleEmpDrop(trigger: HTMLElement): void {
    if (this.empDropOpen) { this.empDropOpen = false; return; }
    const rect = trigger.getBoundingClientRect();
    this.empDropTop   = rect.bottom + 6;
    this.empDropLeft  = rect.left;
    this.empDropWidth = rect.width;
    this.empDropOpen  = true;
  }

  get filteredEmployees(): { name: string; initials: string; bg: string }[] {
    const q = this.empSearch.toLowerCase().trim();
    if (!q) return this.employeeOptions;
    return this.employeeOptions.filter(e => e.name.toLowerCase().includes(q));
  }

  isSelected(name: string): boolean {
    return this.createForm.assignees.some((a: any) => a.name === name);
  }

  toggleEmployee(e: { name: string; initials: string; bg: string }): void {
    if (this.isSelected(e.name)) {
      this.createForm.assignees = this.createForm.assignees.filter((a: any) => a.name !== e.name);
    } else {
      this.createForm.assignees.push({ ...e });
    }
  }

  createForm = this.emptyForm();

  // Loaded from real API
  availableServices = ['UI Design', 'Website Development', 'QA Testing', 'Backend Development', 'DevOps', 'Mobile App', 'Data Analysis'];
  employeeOptions: { name: string; initials: string; bg: string }[] = [];
  managerOptions: string[] = [];

  // All projects created in-session (no backend endpoint for projects yet)
  rows: any[] = [];

  // ── Total Project period filter ──
  totalPeriod: 'week' | 'month' | 'year' = 'year';
  showTotalDd = false;

  get totalPeriodLabel(): string {
    return { week: 'This Week', month: 'This Month', year: 'This Year' }[this.totalPeriod];
  }

  setTotalPeriod(p: 'week' | 'month' | 'year'): void {
    this.totalPeriod = p;
    this.showTotalDd = false;
    this.buildAreaChart();
  }

  private get rowsInPeriod(): any[] {
    const now = new Date();
    if (this.totalPeriod === 'week') {
      const start = new Date(now);
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
      start.setHours(0, 0, 0, 0);
      return this.rows.filter(r => r.createdAt && new Date(r.createdAt) >= start);
    }
    if (this.totalPeriod === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return this.rows.filter(r => r.createdAt && new Date(r.createdAt) >= start);
    }
    const start = new Date(now.getFullYear(), 0, 1);
    return this.rows.filter(r => r.createdAt && new Date(r.createdAt) >= start);
  }

  get periodOnGoing():   number { return this.rowsInPeriod.filter(r => r.status === 'On Going').length; }
  get periodOnHold():    number { return this.rowsInPeriod.filter(r => r.status === 'On Hold').length; }
  get periodCompleted(): number { return this.rowsInPeriod.filter(r => r.status === 'Completed').length; }
  get periodTotal():     number { return this.rowsInPeriod.length; }

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

  constructor(private collaborateurService: CollaborateurService, private confirmSvc: ConfirmService, private translate: TranslateService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'create') this.openCreate();
    });
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
    if (this.activeTab === 'PROJECTS.TAB_ALL') return this.rows;
    const status = this.tabStatusMap[this.activeTab];
    return status ? this.rows.filter(r => r.status === status) : this.rows;
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
    this.empDropOpen = false;
    this.empSearch = '';
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
    this.empDropOpen = false;
    this.empSearch = '';
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
        createdAt: now,
        status:    'On Going',
        services:  [...this.createForm.services],
        manager:   this.createForm.manager,
        assignees: [...this.createForm.assignees],
      };
      this.rows = [newRow, ...this.rows];
      this.buildCharts(this.rows.length);
      this.buildAreaChart();
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

  async deleteRow(row: any): Promise<void> {
    if (!(await this.confirmSvc.confirm(this.translate.instant('PROJECTS.CONFIRM_DELETE_MSG', {name: row.name}), this.translate.instant('PROJECTS.CONFIRM_DELETE_BTN')))) return;
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

  private buildAreaChart(): void {
    const now = new Date();
    let categories: string[];
    let data: number[];

    if (this.totalPeriod === 'week') {
      categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
      weekStart.setHours(0, 0, 0, 0);
      data = categories.map((_, i) => {
        const s = new Date(weekStart); s.setDate(s.getDate() + i);
        const e = new Date(s);        e.setDate(e.getDate() + 1);
        return this.rows.filter(r => r.createdAt && new Date(r.createdAt) >= s && new Date(r.createdAt) < e).length;
      });
    } else if (this.totalPeriod === 'month') {
      categories = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      data = [0, 1, 2, 3].map(w => {
        const s = new Date(monthStart); s.setDate(s.getDate() + w * 7);
        const e = new Date(s);          e.setDate(e.getDate() + 7);
        return this.rows.filter(r => r.createdAt && new Date(r.createdAt) >= s && new Date(r.createdAt) < e).length;
      });
    } else {
      categories = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      data = categories.map((_, i) => {
        const s = new Date(now.getFullYear(), i, 1);
        const e = new Date(now.getFullYear(), i + 1, 1);
        return this.rows.filter(r => r.createdAt && new Date(r.createdAt) >= s && new Date(r.createdAt) < e).length;
      });
    }

    this.areaChart = {
      series: [{ name: 'Projects', data }],
      chart: { type: 'area', height: 110, toolbar: { show: false }, sparkline: { enabled: true } },
      colors: ['#2FA8A0'],
      stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'gradient', gradient: { opacityFrom: .35, opacityTo: .02 } },
      xaxis: { categories, labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
      grid: { show: false },
      dataLabels: { enabled: false },
      tooltip: {
        enabled: true,
        x: { show: true },
        y: { formatter: (val: number) => `${val} project(s)` },
      },
    };
  }

  private buildCharts(empCount: number): void {
    this.buildAreaChart();

    const onGoing   = this.onGoingCount;
    const onHold    = this.onHoldCount;
    const completed = this.completedCount;

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
