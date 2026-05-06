import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { forkJoin } from 'rxjs';
import { PlanningService } from './planning.service';
import { CollaborateurService } from 'src/app/core/services/collaborateur.service';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  styles: [`
    /* ═══════════════════════════════════════════
       WIKO HR — Planning Page (Sidebar Layout)
       ═══════════════════════════════════════════ */
    :host { display:block; font-family:'Inter',sans-serif; }

    /* ── Outer wrapper: planning sidebar + content ── */
    .planning-wrapper {
      display: flex;
      min-height: calc(100vh - 70px);
      background: #F4F7FB;
      animation: fadeIn .35s ease both;
    }
    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }

    /* ══════════════════════════════════════
       PLANNING SIDEBAR
       ══════════════════════════════════════ */
    .plan-sidebar {
      width: 248px;
      min-width: 248px;
      background: #fff;
      border-right: 1px solid #EDF0F5;
      display: flex;
      flex-direction: column;
      padding-bottom: 20px;
      box-shadow: 2px 0 12px rgba(22,34,51,.06);
      position: sticky;
      top: 70px;
      height: calc(100vh - 70px);
      overflow-y: auto;
    }

    .ps-header {
      padding: 20px 18px 14px;
      border-bottom: 1px solid #EDF0F5;
    }
    .ps-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 4px;
    }
    .ps-logo-icon {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      background: linear-gradient(135deg,#1B7872,#2FA8A0);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 16px;
      flex-shrink: 0;
    }
    .ps-title { font-size: 15px; font-weight: 800; color: #1A2B3C; }
    .ps-subtitle { font-size: 11.5px; color: #8FA3B8; margin-top: 2px; }

    .ps-search {
      margin: 14px 18px 0;
      position: relative;
    }
    .ps-search input {
      width: 100%;
      padding: 8px 12px 8px 34px;
      border: 1.5px solid #EDF0F5;
      border-radius: 8px;
      font-size: 12.5px;
      color: #1A2B3C;
      font-family: 'Inter', sans-serif;
      background: #F8FAFC;
      box-sizing: border-box;
      outline: none;
      transition: border .15s;
    }
    .ps-search input:focus { border-color: #2FA8A0; background: #fff; }
    .ps-search input::placeholder { color: #B0BEC5; }
    .ps-search i {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 15px;
      color: #B0BEC5;
    }

    /* Module groups */
    .ps-nav { padding: 12px 10px; flex: 1; }

    .ps-group { margin-bottom: 6px; }

    .ps-module-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      border: none;
      border-radius: 9px;
      background: none;
      cursor: pointer;
      transition: all .15s;
      text-align: left;
    }
    .ps-module-btn:hover { background: #F4F7FB; }
    .ps-module-btn.active { background: #E8F7F6; }

    .ps-module-icon {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      flex-shrink: 0;
      transition: all .15s;
    }
    .icon-workforce  { background: #E8F7F6; color: #1B7872; }
    .icon-training   { background: #DBEAFE; color: #1E40AF; }
    .icon-career     { background: #EDE9FE; color: #6D28D9; }
    .icon-recruitment{ background: #FEF3C7; color: #B45309; }

    .ps-module-btn.active .icon-workforce  { background: #1B7872; color: #fff; }
    .ps-module-btn.active .icon-training   { background: #1E40AF; color: #fff; }
    .ps-module-btn.active .icon-career     { background: #6D28D9; color: #fff; }
    .ps-module-btn.active .icon-recruitment{ background: #B45309; color: #fff; }

    .ps-module-label {
      flex: 1;
      font-size: 13px;
      font-weight: 600;
      color: #4A6080;
      transition: color .15s;
    }
    .ps-module-btn.active .ps-module-label { color: #1A2B3C; }

    .ps-chevron {
      font-size: 14px;
      color: #C0CDD8;
      transition: transform .2s;
    }
    .ps-module-btn.active .ps-chevron { transform: rotate(90deg); color: #1B7872; }

    /* Sub-items */
    .ps-sub-list {
      margin: 2px 0 4px 40px;
      display: flex;
      flex-direction: column;
      gap: 1px;
      overflow: hidden;
      max-height: 0;
      transition: max-height .25s ease;
    }
    .ps-sub-list.open { max-height: 300px; }

    .ps-sub-btn {
      width: 100%;
      text-align: left;
      border: none;
      background: none;
      padding: 6px 10px;
      font-size: 12.5px;
      font-weight: 500;
      color: #8FA3B8;
      border-radius: 7px;
      cursor: pointer;
      transition: all .12s;
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .ps-sub-btn::before {
      content: '';
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #CBD5E0;
      flex-shrink: 0;
      transition: background .12s;
    }
    .ps-sub-btn:hover { background: #F4F7FB; color: #4A6080; }
    .ps-sub-btn.active { color: #1B7872; font-weight: 700; background: #F0FDF9; }
    .ps-sub-btn.active::before { background: #1B7872; }

    /* Divider */
    .ps-divider { height: 1px; background: #EDF0F5; margin: 10px 12px; }

    /* Footer stat */
    .ps-footer {
      padding: 14px 18px;
      border-top: 1px solid #EDF0F5;
    }
    .ps-stat-row { display: flex; gap: 8px; }
    .ps-stat { flex: 1; text-align: center; }
    .ps-stat-num { font-size: 18px; font-weight: 800; color: #1A2B3C; }
    .ps-stat-lbl { font-size: 10.5px; color: #8FA3B8; }

    /* ══════════════════════════════════════
       MAIN CONTENT AREA
       ══════════════════════════════════════ */
    .plan-main {
      flex: 1;
      min-width: 0;
      padding: 20px 22px 40px;
      overflow-x: hidden;
    }

    /* ── Header ── */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(22,34,51,.08);
      margin-bottom: 18px;
    }
    .page-header-left { display: flex; align-items: center; gap: 14px; }
    .page-breadcrumb { font-size: 12px; color: #8FA3B8; }
    .page-breadcrumb span { color: #1B7872; font-weight: 600; }
    .page-title { font-size: 20px; font-weight: 800; color: #1A2B3C; margin: 0; }
    .header-right { display: flex; align-items: center; gap: 12px; }
    .header-date { font-size: 12.5px; color: #8FA3B8; display: flex; align-items: center; gap: 5px; }
    .btn-solid {
      background: #1B7872; color: #fff; border: none; border-radius: 9px;
      padding: 9px 18px; font-size: 13px; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; gap: 6px; transition: background .15s;
    }
    .btn-solid:hover { background: #1A9690; }
    .btn-outline {
      background: #fff; color: #4A6080; border: 1.5px solid #E2E8F0; border-radius: 9px;
      padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; gap: 6px; transition: all .15s;
    }
    .btn-outline:hover { border-color: #2FA8A0; color: #1B7872; }

    /* ── Card base ── */
    .card { background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(22,34,51,.08); }
    .card-pad { padding: 20px 22px; }
    .card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .card-title { font-size: 15px; font-weight: 700; color: #1A2B3C; }
    .card-badge { font-size: 12px; color: #2FA8A0; background: #E8F7F6; padding: 4px 12px; border-radius: 999px; cursor: pointer; font-weight: 600; }

    /* ── KPI row ── */
    .kpi-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 18px; }
    .kpi-box { background: #fff; border-radius: 12px; padding: 18px 20px; box-shadow: 0 4px 20px rgba(22,34,51,.08); }
    .kpi-box-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .kpi-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
    .kpi-icon--teal   { background: #E8F7F6; color: #1B7872; }
    .kpi-icon--blue   { background: #DBEAFE; color: #1E40AF; }
    .kpi-icon--amber  { background: #FEF3C7; color: #92400E; }
    .kpi-icon--rose   { background: #FFE4E6; color: #BE123C; }
    .kpi-icon--purple { background: #EDE9FE; color: #6D28D9; }
    .kpi-val { font-size: 28px; font-weight: 800; color: #1A2B3C; line-height: 1; margin-bottom: 4px; }
    .kpi-lbl { font-size: 12px; color: #8FA3B8; }
    .kpi-trend { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; margin-top: 6px; }
    .trend-up      { background: #DCFCE7; color: #15803D; }
    .trend-dn      { background: #FFE4E6; color: #BE123C; }
    .trend-neutral { background: #F1F5F9; color: #4A6080; }

    /* ── Grid layouts ── */
    .two-col   { display: grid; grid-template-columns: 1fr 340px; gap: 18px; margin-bottom: 18px; align-items: start; }
    .three-col { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 18px; }
    .full-card { margin-bottom: 18px; }

    /* ── Tables ── */
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #FAFBFC; }
    thead th { padding: 11px 16px; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #8FA3B8; border-bottom: 1px solid #F0F3F6; white-space: nowrap; }
    tbody tr { cursor: pointer; transition: background .12s; }
    tbody tr:hover { background: #F8FFFE; }
    tbody td { padding: 11px 16px; font-size: 13px; color: #4A6080; border-bottom: 1px solid #F5F7FA; vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    .td-bold { font-weight: 600; color: #1A2B3C; }
    .td-id   { font-size: 12px; font-weight: 600; color: #4A6080; }

    /* ── Chips / Status ── */
    .chip { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 700; white-space: nowrap; }
    .chip--approved   { background: #DCFCE7; color: #15803D; }
    .chip--pending    { background: #FEF3C7; color: #B45309; }
    .chip--draft      { background: #F1F5F9; color: #64748B; }
    .chip--rejected   { background: #FFE4E6; color: #BE123C; }
    .chip--active     { background: #DBEAFE; color: #1E40AF; }
    .chip--completed  { background: #F0FDF4; color: #166534; }
    .chip--critical   { background: #FFE4E6; color: #BE123C; }
    .chip--high       { background: #FEF3C7; color: #B45309; }
    .chip--medium     { background: #DBEAFE; color: #1E40AF; }
    .chip--low        { background: #F1F5F9; color: #64748B; }
    .chip--open       { background: #E8F7F6; color: #1B7872; }
    .chip--inprogress { background: #EDE9FE; color: #6D28D9; }

    /* ── Progress bar ── */
    .prog-wrap { background: #F1F5F9; border-radius: 999px; height: 6px; overflow: hidden; margin-top: 6px; }
    .prog-fill { height: 100%; border-radius: 999px; }
    .prog-teal  { background: #1B7872; }
    .prog-blue  { background: #3B82F6; }
    .prog-amber { background: #F59E0B; }
    .prog-rose  { background: #F43F5E; }

    /* ── Action buttons ── */
    .act-btn          { background: none; border: none; font-size: 15px; color: #B0BEC5; cursor: pointer; padding: 0 2px; }
    .act-btn:hover         { color: #4A6080; }
    .act-btn--del:hover    { color: #EF4444; }
    .act-btn--green:hover  { color: #1B7872; }

    /* ── Inner tabs ── */
    .inner-tabs { display: flex; gap: 2px; padding: 14px 20px 0; border-bottom: 1px solid #F0F3F6; flex-wrap: wrap; }
    .inner-tab { padding: 8px 16px; font-size: 13px; font-weight: 500; color: #8FA3B8; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; margin-bottom: -1px; transition: all .15s; }
    .inner-tab.active { color: #2FA8A0; border-bottom-color: #2FA8A0; font-weight: 600; }
    .inner-tab:hover:not(.active) { color: #4A6080; }

    /* ═════════ WORKFORCE ═════════ */
    .scenario-list { display: flex; flex-direction: column; gap: 10px; }
    .scenario-item { border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 12px 14px; cursor: pointer; transition: all .15s; }
    .scenario-item:hover, .scenario-item.active { border-color: #1B7872; background: #F0FDF9; }
    .scenario-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    .scenario-name { font-size: 13px; font-weight: 700; color: #1A2B3C; }
    .scenario-desc { font-size: 12px; color: #8FA3B8; line-height: 1.5; }
    .scenario-meta { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
    .scenario-meta-item { font-size: 11px; color: #4A6080; display: flex; align-items: center; gap: 4px; }

    .budget-item { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid #F5F7FA; }
    .budget-item:last-child { border-bottom: none; }
    .budget-dept { font-size: 13px; font-weight: 600; color: #1A2B3C; flex: 1; min-width: 0; }
    .budget-bar-wrap { flex: 2; }
    .budget-pct { font-size: 12px; font-weight: 700; color: #1A2B3C; width: 36px; text-align: right; flex-shrink: 0; }

    /* ═════════ TRAINING ═════════ */
    .training-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 18px; }
    .t-stat-box { background: #fff; border-radius: 12px; padding: 16px 18px; box-shadow: 0 4px 20px rgba(22,34,51,.08); }
    .t-stat-num { font-size: 28px; font-weight: 800; color: #1A2B3C; line-height: 1; margin-bottom: 3px; }
    .t-stat-lbl { font-size: 12px; color: #8FA3B8; }
    .t-stat-sub { font-size: 11px; color: #2FA8A0; font-weight: 600; margin-top: 4px; }

    .session-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F5F7FA; }
    .session-item:last-child { border-bottom: none; }
    .session-date-box { width: 42px; height: 42px; border-radius: 10px; background: #E8F7F6; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
    .session-day { font-size: 15px; font-weight: 800; color: #1B7872; line-height: 1; }
    .session-month { font-size: 9px; font-weight: 700; color: #2FA8A0; text-transform: uppercase; }
    .session-info { flex: 1; }
    .session-name { font-size: 13px; font-weight: 600; color: #1A2B3C; margin-bottom: 2px; }
    .session-meta { font-size: 11.5px; color: #8FA3B8; }
    .session-spots { font-size: 11.5px; font-weight: 700; color: #4A6080; white-space: nowrap; }

    .pdi-row { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid #F5F7FA; }
    .pdi-row:last-child { border-bottom: none; }
    .pdi-name { font-size: 13px; font-weight: 600; color: #1A2B3C; }
    .pdi-role { font-size: 11.5px; color: #8FA3B8; }
    .pdi-pct  { font-size: 13px; font-weight: 700; color: #1B7872; white-space: nowrap; }

    /* ═════════ CAREER ═════════ */
    .career-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 18px; }

    .milestone-item { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid #F5F7FA; }
    .milestone-item:last-child { border-bottom: none; }
    .milestone-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
    .milestone-dot--done    { background: #22C55E; }
    .milestone-dot--active  { background: #1B7872; }
    .milestone-dot--pending { background: #E2E8F0; }
    .milestone-title { font-size: 13px; font-weight: 600; color: #1A2B3C; flex: 1; }
    .milestone-date  { font-size: 11.5px; color: #8FA3B8; white-space: nowrap; }
    .milestone-status { font-size: 11px; font-weight: 700; }
    .ms-done    { color: #15803D; }
    .ms-active  { color: #1B7872; }
    .ms-pending { color: #8FA3B8; }

    .mentor-item { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid #F5F7FA; }
    .mentor-item:last-child { border-bottom: none; }
    .mentor-avatar { width: 34px; height: 34px; border-radius: 50%; background: #E8F7F6; color: #1B7872; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .mentor-name { font-size: 13px; font-weight: 600; color: #1A2B3C; }
    .mentor-meta { font-size: 11.5px; color: #8FA3B8; }
    .mentor-arrow { font-size: 14px; color: #CBD5E0; }
    .mentee-name  { font-size: 13px; font-weight: 500; color: #4A6080; }

    /* ═════════ RECRUITMENT ═════════ */
    .pipeline-funnel { display: grid; grid-template-columns: repeat(5,1fr); gap: 12px; margin-bottom: 18px; }
    .funnel-stage { background: #fff; border-radius: 12px; padding: 16px 14px; box-shadow: 0 4px 20px rgba(22,34,51,.08); text-align: center; }
    .funnel-count { font-size: 28px; font-weight: 800; color: #1A2B3C; line-height: 1; margin-bottom: 4px; }
    .funnel-lbl   { font-size: 11.5px; color: #8FA3B8; margin-bottom: 8px; }
    .funnel-bar   { height: 4px; border-radius: 999px; }

    /* ══════════════════════════════════════
       RIGHT PANEL (DETAIL / CREATE)
       ══════════════════════════════════════ */
    .backdrop { position: fixed; inset: 0; background: rgba(10,20,35,.35); z-index: 1800; backdrop-filter: blur(1px); }
    .rp {
      position: fixed; top: 70px; right: 0; bottom: 0; width: 520px;
      background: #fff; box-shadow: -8px 0 40px rgba(10,20,35,.14);
      border-radius: 16px 0 0 0; z-index: 1801;
      display: flex; flex-direction: column;
      animation: rpIn .22s ease both; overflow: hidden;
    }
    @keyframes rpIn { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:none} }
    .rp-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px 16px; border-bottom: 1px solid #F0F3F6; flex-shrink: 0; }
    .rp-title    { font-size: 15px; font-weight: 700; color: #1A2B3C; }
    .rp-head-right { display: flex; align-items: center; gap: 10px; }
    .rp-close { width: 30px; height: 30px; border: none; background: #F1F5F9; border-radius: 7px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; color: #4A6080; }
    .rp-close:hover { background: #E2E8F0; }
    .rp-body { flex: 1; overflow-y: auto; padding: 22px; }
    .rp-section { font-size: 13px; font-weight: 700; color: #1A2B3C; margin: 18px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #F0F3F6; }
    .rp-section:first-child { margin-top: 0; }
    .rp-field { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px solid #F8FAFC; }
    .rp-field:last-of-type { border-bottom: none; }
    .rp-lbl { font-size: 12px; color: #8FA3B8; min-width: 140px; display: flex; align-items: center; gap: 6px; }
    .rp-lbl i { font-size: 14px; }
    .rp-val { font-size: 13px; font-weight: 600; color: #1A2B3C; }
    .rp-edit-btn { display: flex; align-items: center; gap: 7px; padding: 9px 18px; background: #1B7872; color: #fff; border: none; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .rp-edit-btn:hover { background: #1A9690; }

    /* ── Create Panel ── */
    .cp-field { margin-bottom: 16px; }
    .cp-lbl { font-size: 13px; font-weight: 600; color: #1A2B3C; margin-bottom: 6px; }
    .cp-input { width: 100%; padding: 10px 14px; border: 1.5px solid #E2E8F0; border-radius: 9px; font-size: 13.5px; color: #1A2B3C; font-family: 'Inter',sans-serif; box-sizing: border-box; outline: none; transition: border .15s; }
    .cp-input:focus { border-color: #2FA8A0; box-shadow: 0 0 0 3px rgba(47,168,160,.1); }
    .cp-input::placeholder { color: #C0CDD8; }
    .cp-select { width: 100%; padding: 10px 14px; border: 1.5px solid #E2E8F0; border-radius: 9px; font-size: 13.5px; color: #4A6080; font-family: 'Inter',sans-serif; appearance: none; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238FA3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 14px center; box-sizing: border-box; outline: none; cursor: pointer; }
    .cp-select:focus { border-color: #2FA8A0; }
    .cp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .cp-textarea { width: 100%; padding: 10px 14px; border: 1.5px solid #E2E8F0; border-radius: 9px; font-size: 13.5px; color: #1A2B3C; font-family: 'Inter',sans-serif; box-sizing: border-box; outline: none; resize: vertical; min-height: 80px; transition: border .15s; }
    .cp-textarea:focus { border-color: #2FA8A0; }
    .cp-footer { padding: 14px 22px; border-top: 1px solid #F0F3F6; flex-shrink: 0; display: flex; justify-content: flex-end; gap: 10px; }
    .cp-cancel { padding: 10px 20px; background: #F1F5F9; color: #4A6080; border: none; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .cp-submit { padding: 10px 24px; background: #1B7872; color: #fff; border: none; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .cp-submit:hover { background: #1A9690; }
  `],
  template: `
  <!-- Backdrop -->
  <div class="backdrop" *ngIf="showPanel" (click)="closePanel()"></div>

  <!-- ══ Right Panel ══ -->
  <div class="rp" *ngIf="showPanel && (selected || panelType==='create')">

    <!-- Workforce detail -->
    <ng-container *ngIf="panelType==='workforce'">
      <div class="rp-header">
        <span class="rp-title">Headcount Plan Detail</span>
        <div class="rp-head-right">
          <button class="rp-edit-btn"><i class="bx bx-edit-alt"></i> Edit Plan</button>
          <button class="rp-close" (click)="closePanel()"><i class="bx bx-x"></i></button>
        </div>
      </div>
      <div class="rp-body">
        <div class="rp-section">Plan Information</div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-buildings"></i> Department</span><span class="rp-val">{{ selected.dept }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-group"></i> Current HC</span><span class="rp-val">{{ selected.current }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-target-lock"></i> Planned HC</span><span class="rp-val">{{ selected.planned }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-trending-up"></i> Gap</span><span class="rp-val" [style.color]="selected.gap>0?'#15803D':'#BE123C'">{{ selected.gap > 0 ? '+' : '' }}{{ selected.gap }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-dollar-circle"></i> Budget</span><span class="rp-val">{{ selected.budget }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-calendar"></i> Review Date</span><span class="rp-val">{{ selected.reviewDate }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-check-circle"></i> Status</span><span class="chip chip--{{ selected.statusClass }}">{{ selected.status }}</span></div>
        <div class="rp-section">Workforce Scenarios</div>
        <div *ngFor="let s of workforceScenarios" class="scenario-item" style="margin-bottom:10px;">
          <div class="scenario-head">
            <span class="scenario-name">{{ s.name }}</span>
            <span class="chip chip--{{ s.chipClass }}">{{ s.label }}</span>
          </div>
          <div class="scenario-desc">{{ s.desc }}</div>
          <div class="scenario-meta">
            <span class="scenario-meta-item"><i class="bx bx-group"></i> +{{ s.hc }} HC</span>
            <span class="scenario-meta-item"><i class="bx bx-dollar"></i> {{ s.cost }}</span>
          </div>
        </div>
      </div>
    </ng-container>

    <!-- Training detail -->
    <ng-container *ngIf="panelType==='training'">
      <div class="rp-header">
        <span class="rp-title">Training Need Detail</span>
        <div class="rp-head-right">
          <button class="rp-edit-btn"><i class="bx bx-edit-alt"></i> Edit</button>
          <button class="rp-close" (click)="closePanel()"><i class="bx bx-x"></i></button>
        </div>
      </div>
      <div class="rp-body">
        <div class="rp-section">Training Need</div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-user"></i> Employee</span><span class="rp-val">{{ selected.employee }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-briefcase"></i> Role</span><span class="rp-val">{{ selected.role }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-book-bookmark"></i> Skill Gap</span><span class="rp-val">{{ selected.skill }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-bar-chart"></i> Current Level</span><span class="rp-val">{{ selected.currentLevel }}/5</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-target-lock"></i> Target Level</span><span class="rp-val">{{ selected.targetLevel }}/5</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-flag"></i> Priority</span><span class="chip chip--{{ selected.priorityClass }}">{{ selected.priority }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-check-circle"></i> Status</span><span class="chip chip--{{ selected.statusClass }}">{{ selected.status }}</span></div>
        <div class="rp-section">Development Plan</div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-calendar"></i> Deadline</span><span class="rp-val">{{ selected.deadline }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-chalkboard"></i> Training</span><span class="rp-val">{{ selected.assignedTraining || 'Not assigned' }}</span></div>
      </div>
    </ng-container>

    <!-- Career / IDP detail -->
    <ng-container *ngIf="panelType==='career'">
      <div class="rp-header">
        <span class="rp-title">Individual Development Plan</span>
        <div class="rp-head-right">
          <button class="rp-edit-btn"><i class="bx bx-edit-alt"></i> Edit IDP</button>
          <button class="rp-close" (click)="closePanel()"><i class="bx bx-x"></i></button>
        </div>
      </div>
      <div class="rp-body">
        <div class="rp-section">Employee</div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-user"></i> Name</span><span class="rp-val">{{ selected.employee }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-briefcase"></i> Current Role</span><span class="rp-val">{{ selected.currentRole }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-trending-up"></i> Target Role</span><span class="rp-val">{{ selected.targetRole }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-calendar"></i> Timeline</span><span class="rp-val">{{ selected.timeline }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-check-circle"></i> Status</span><span class="chip chip--{{ selected.statusClass }}">{{ selected.status }}</span></div>
        <div class="rp-section">Career Milestones</div>
        <div *ngFor="let m of careerMilestones" class="milestone-item">
          <span class="milestone-dot milestone-dot--{{ m.dotClass }}"></span>
          <span class="milestone-title">{{ m.title }}</span>
          <span class="milestone-date">{{ m.date }}</span>
          <span class="milestone-status ms-{{ m.dotClass }}">{{ m.status }}</span>
        </div>
        <div class="rp-section">Mentorship</div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-user-check"></i> Mentor</span><span class="rp-val">{{ selected.mentor }}</span></div>
      </div>
    </ng-container>

    <!-- Hiring Request detail -->
    <ng-container *ngIf="panelType==='recruitment'">
      <div class="rp-header">
        <span class="rp-title">Hiring Request Detail</span>
        <div class="rp-head-right">
          <button class="rp-edit-btn"><i class="bx bx-send"></i> Send to HR Core</button>
          <button class="rp-close" (click)="closePanel()"><i class="bx bx-x"></i></button>
        </div>
      </div>
      <div class="rp-body">
        <div class="rp-section">Job Requisition</div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-id-card"></i> Req ID</span><span class="rp-val">{{ selected.reqId }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-briefcase"></i> Position</span><span class="rp-val">{{ selected.position }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-buildings"></i> Department</span><span class="rp-val">{{ selected.dept }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-group"></i> Headcount</span><span class="rp-val">{{ selected.hc }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-calendar"></i> Target Date</span><span class="rp-val">{{ selected.targetDate }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-dollar-circle"></i> Budget</span><span class="rp-val">{{ selected.budget }}</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-check-circle"></i> Stage</span><span class="chip chip--{{ selected.stageClass }}">{{ selected.stage }}</span></div>
        <div class="rp-section">Source</div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-link"></i> Event</span><span class="rp-val" style="font-size:12px;font-family:monospace;">planning.headcount.approved</span></div>
        <div class="rp-field"><span class="rp-lbl"><i class="bx bx-server"></i> Plan Ref</span><span class="rp-val">{{ selected.planRef }}</span></div>
        <div class="rp-section">Pipeline Breakdown</div>
        <div *ngFor="let s of recruitPipeline" style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #F8FAFC;">
          <span class="chip chip--{{ s.cls }}" style="min-width:90px;justify-content:center;">{{ s.name }}</span>
          <div style="flex:1;"><div class="prog-wrap"><div class="prog-fill prog-{{ s.color }}" [style.width.%]="s.pct"></div></div></div>
          <span style="font-size:12px;font-weight:700;color:#1A2B3C;width:24px;text-align:right;">{{ s.count }}</span>
        </div>
      </div>
    </ng-container>

    <!-- Create Panel -->
    <ng-container *ngIf="panelType==='create'">
      <div class="rp-header">
        <span class="rp-title">{{ createTitle }}</span>
        <div class="rp-head-right">
          <button class="rp-close" (click)="closePanel()"><i class="bx bx-x"></i></button>
        </div>
      </div>
      <div class="rp-body" style="padding-bottom:0;">
        <ng-container *ngIf="activeModule==='workforce'">
          <div class="cp-field"><div class="cp-lbl">Department</div><select class="cp-select" [(ngModel)]="createForm.dept"><option value="">Select department</option><option *ngFor="let d of deptOptions">{{d}}</option></select></div>
          <div class="cp-row">
            <div class="cp-field"><div class="cp-lbl">Current HC</div><input class="cp-input" type="number" [(ngModel)]="createForm.current" placeholder="0"/></div>
            <div class="cp-field"><div class="cp-lbl">Planned HC</div><input class="cp-input" type="number" [(ngModel)]="createForm.planned" placeholder="0"/></div>
          </div>
          <div class="cp-row">
            <div class="cp-field"><div class="cp-lbl">Budget</div><input class="cp-input" [(ngModel)]="createForm.budget" placeholder="$0.00"/></div>
            <div class="cp-field"><div class="cp-lbl">Review Date</div><input class="cp-input" type="date" [(ngModel)]="createForm.reviewDate"/></div>
          </div>
          <div class="cp-field"><div class="cp-lbl">Scenario</div><select class="cp-select" [(ngModel)]="createForm.scenario"><option>Conservative</option><option>Moderate</option><option>Aggressive</option></select></div>
          <div class="cp-field"><div class="cp-lbl">Notes</div><textarea class="cp-textarea" [(ngModel)]="createForm.notes" placeholder="Additional notes..."></textarea></div>
        </ng-container>
        <ng-container *ngIf="activeModule==='training'">
          <div class="cp-field"><div class="cp-lbl">Employee</div><input class="cp-input" [(ngModel)]="createForm.employee" placeholder="Employee name"/></div>
          <div class="cp-field"><div class="cp-lbl">Skill Gap</div><input class="cp-input" [(ngModel)]="createForm.skill" placeholder="e.g. Python, Leadership"/></div>
          <div class="cp-row">
            <div class="cp-field"><div class="cp-lbl">Current Level (1-5)</div><input class="cp-input" type="number" min="1" max="5" [(ngModel)]="createForm.currentLevel"/></div>
            <div class="cp-field"><div class="cp-lbl">Target Level (1-5)</div><input class="cp-input" type="number" min="1" max="5" [(ngModel)]="createForm.targetLevel"/></div>
          </div>
          <div class="cp-row">
            <div class="cp-field"><div class="cp-lbl">Priority</div><select class="cp-select" [(ngModel)]="createForm.priority"><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></div>
            <div class="cp-field"><div class="cp-lbl">Deadline</div><input class="cp-input" type="date" [(ngModel)]="createForm.deadline"/></div>
          </div>
        </ng-container>
        <ng-container *ngIf="activeModule==='career'">
          <div class="cp-field"><div class="cp-lbl">Employee</div><input class="cp-input" [(ngModel)]="createForm.employee" placeholder="Employee name"/></div>
          <div class="cp-row">
            <div class="cp-field"><div class="cp-lbl">Current Role</div><input class="cp-input" [(ngModel)]="createForm.currentRole" placeholder="Current position"/></div>
            <div class="cp-field"><div class="cp-lbl">Target Role</div><input class="cp-input" [(ngModel)]="createForm.targetRole" placeholder="Goal position"/></div>
          </div>
          <div class="cp-field"><div class="cp-lbl">Timeline</div><input class="cp-input" [(ngModel)]="createForm.timeline" placeholder="e.g. 12–18 months"/></div>
          <div class="cp-field"><div class="cp-lbl">Assign Mentor</div><select class="cp-select" [(ngModel)]="createForm.mentor"><option value="">Select mentor</option><option *ngFor="let m of mentorOptions">{{m}}</option></select></div>
          <div class="cp-field"><div class="cp-lbl">Career Goal</div><textarea class="cp-textarea" [(ngModel)]="createForm.notes" placeholder="Describe the career objective..."></textarea></div>
        </ng-container>
        <ng-container *ngIf="activeModule==='recruitment'">
          <div class="cp-field"><div class="cp-lbl">Position Title</div><input class="cp-input" [(ngModel)]="createForm.position" placeholder="e.g. Senior Developer"/></div>
          <div class="cp-row">
            <div class="cp-field"><div class="cp-lbl">Department</div><select class="cp-select" [(ngModel)]="createForm.dept"><option value="">Select</option><option *ngFor="let d of deptOptions">{{d}}</option></select></div>
            <div class="cp-field"><div class="cp-lbl">Headcount</div><input class="cp-input" type="number" [(ngModel)]="createForm.hc" placeholder="1"/></div>
          </div>
          <div class="cp-row">
            <div class="cp-field"><div class="cp-lbl">Budget</div><input class="cp-input" [(ngModel)]="createForm.budget" placeholder="$0"/></div>
            <div class="cp-field"><div class="cp-lbl">Target Date</div><input class="cp-input" type="date" [(ngModel)]="createForm.targetDate"/></div>
          </div>
          <div class="cp-field"><div class="cp-lbl">Workforce Plan Reference</div><select class="cp-select" [(ngModel)]="createForm.planRef"><option value="">Link to headcount plan</option><option *ngFor="let p of headcountPlans">{{p.dept}} — {{p.planned}} HC</option></select></div>
        </ng-container>
      </div>
      <div class="cp-footer">
        <button class="cp-cancel" (click)="closePanel()">Cancel</button>
        <button class="cp-submit" (click)="submitCreate()">Create</button>
      </div>
    </ng-container>

  </div>

  <!-- ══════════════════════════════════════════
       PLANNING WRAPPER (sidebar + content)
       ══════════════════════════════════════════ -->
  <div class="planning-wrapper">

    <!-- ══ PLANNING SIDEBAR ══ -->
    <aside class="plan-sidebar">
      <!-- Logo / Title -->
      <div class="ps-header">
        <div class="ps-logo">
          <div class="ps-logo-icon"><i class="bx bxs-calendar-check"></i></div>
          <span class="ps-title">Planning</span>
        </div>
        <div class="ps-subtitle">HR Strategic Planning</div>
      </div>

      <!-- Search -->
      <div class="ps-search">
        <i class="bx bx-search"></i>
        <input type="text" placeholder="Search modules..." [(ngModel)]="sidebarSearch"/>
      </div>

      <!-- Nav -->
      <nav class="ps-nav">

        <!-- Workforce Planning -->
        <div class="ps-group">
          <button class="ps-module-btn" [class.active]="activeModule==='workforce'" (click)="setModule('workforce')">
            <span class="ps-module-icon icon-workforce"><i class="bx bx-building-house"></i></span>
            <span class="ps-module-label">Workforce</span>
            <i class="bx bx-chevron-right ps-chevron"></i>
          </button>
          <div class="ps-sub-list" [class.open]="activeModule==='workforce'">
            <button class="ps-sub-btn" [class.active]="activeSub==='headcount'"  (click)="activeSub='headcount'">Headcount Plan</button>
            <button class="ps-sub-btn" [class.active]="activeSub==='budget'"     (click)="activeSub='budget'">Department Budget</button>
            <button class="ps-sub-btn" [class.active]="activeSub==='scenarios'"  (click)="activeSub='scenarios'">Scenarios</button>
          </div>
        </div>

        <!-- Training Planning -->
        <div class="ps-group">
          <button class="ps-module-btn" [class.active]="activeModule==='training'" (click)="setModule('training')">
            <span class="ps-module-icon icon-training"><i class="bx bx-chalkboard"></i></span>
            <span class="ps-module-label">Training</span>
            <i class="bx bx-chevron-right ps-chevron"></i>
          </button>
          <div class="ps-sub-list" [class.open]="activeModule==='training'">
            <button class="ps-sub-btn" [class.active]="activeSub==='needs'"     (click)="activeSub='needs'">Training Needs</button>
            <button class="ps-sub-btn" [class.active]="activeSub==='tplans'"    (click)="activeSub='tplans'">Training Plans</button>
            <button class="ps-sub-btn" [class.active]="activeSub==='sessions'"  (click)="activeSub='sessions'">Sessions</button>
            <button class="ps-sub-btn" [class.active]="activeSub==='pdi'"       (click)="activeSub='pdi'">PDI</button>
          </div>
        </div>

        <!-- Career Planning -->
        <div class="ps-group">
          <button class="ps-module-btn" [class.active]="activeModule==='career'" (click)="setModule('career')">
            <span class="ps-module-icon icon-career"><i class="bx bx-trending-up"></i></span>
            <span class="ps-module-label">Career</span>
            <i class="bx bx-chevron-right ps-chevron"></i>
          </button>
          <div class="ps-sub-list" [class.open]="activeModule==='career'">
            <button class="ps-sub-btn" [class.active]="activeSub==='idp'"         (click)="activeSub='idp'">Goals & IDP</button>
            <button class="ps-sub-btn" [class.active]="activeSub==='succession'"  (click)="activeSub='succession'">Succession</button>
            <button class="ps-sub-btn" [class.active]="activeSub==='milestones'"  (click)="activeSub='milestones'">Milestones</button>
            <button class="ps-sub-btn" [class.active]="activeSub==='mentorship'"  (click)="activeSub='mentorship'">Mentorship</button>
          </div>
        </div>

        <!-- Recruitment Planning -->
        <div class="ps-group">
          <button class="ps-module-btn" [class.active]="activeModule==='recruitment'" (click)="setModule('recruitment')">
            <span class="ps-module-icon icon-recruitment"><i class="bx bx-user-plus"></i></span>
            <span class="ps-module-label">Recruitment</span>
            <i class="bx bx-chevron-right ps-chevron"></i>
          </button>
          <div class="ps-sub-list" [class.open]="activeModule==='recruitment'">
            <button class="ps-sub-btn" [class.active]="activeSub==='hiring'"       (click)="activeSub='hiring'">Hiring Requests</button>
            <button class="ps-sub-btn" [class.active]="activeSub==='requisitions'" (click)="activeSub='requisitions'">Job Requisitions</button>
            <button class="ps-sub-btn" [class.active]="activeSub==='pipeline'"     (click)="activeSub='pipeline'">Pipeline</button>
          </div>
        </div>

        <div class="ps-divider"></div>

        <!-- Quick actions -->
        <button class="ps-sub-btn" style="margin:0 0 2px;" (click)="openCreate()">
          <i class="bx bx-plus" style="font-size:14px;color:#1B7872;margin-right:2px;"></i>
          New Plan
        </button>

      </nav>

      <!-- Footer stats -->
      <div class="ps-footer">
        <div class="ps-stat-row">
          <div class="ps-stat">
            <div class="ps-stat-num" style="color:#1B7872;">14</div>
            <div class="ps-stat-lbl">Active Plans</div>
          </div>
          <div class="ps-stat">
            <div class="ps-stat-num" style="color:#3B82F6;">47</div>
            <div class="ps-stat-lbl">Needs</div>
          </div>
          <div class="ps-stat">
            <div class="ps-stat-num" style="color:#6D28D9;">63</div>
            <div class="ps-stat-lbl">IDPs</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- ══ MAIN CONTENT ══ -->
    <div class="plan-main">

      <!-- Header bar -->
      <div class="page-header">
        <div class="page-header-left">
          <div>
            <div class="page-breadcrumb">Planning / <span>{{ moduleLabel }}</span></div>
            <h4 class="page-title">{{ moduleLabel }}</h4>
          </div>
        </div>
        <div class="header-right">
          <span class="header-date"><i class="bx bx-calendar-alt"></i> May 1, 2025</span>
          <button class="btn-outline"><i class="bx bx-export"></i> Export</button>
          <button class="btn-solid" (click)="openCreate()"><i class="bx bx-plus"></i> New Plan</button>
        </div>
      </div>

      <!-- ══ WORKFORCE PLANNING ══ -->
      <ng-container *ngIf="activeModule==='workforce'">
        <div class="kpi-row">
          <div class="kpi-box">
            <div class="kpi-box-top"><div><div class="kpi-val">2,213</div><div class="kpi-lbl">Total Headcount</div></div><span class="kpi-icon kpi-icon--teal"><i class="bx bx-group"></i></span></div>
            <span class="kpi-trend trend-up"><i class="bx bx-up-arrow-alt"></i> +3.2% vs plan</span>
          </div>
          <div class="kpi-box">
            <div class="kpi-box-top"><div><div class="kpi-val">14</div><div class="kpi-lbl">Approved Plans</div></div><span class="kpi-icon kpi-icon--blue"><i class="bx bx-check-shield"></i></span></div>
            <span class="kpi-trend trend-up"><i class="bx bx-up-arrow-alt"></i> +2 this month</span>
          </div>
          <div class="kpi-box">
            <div class="kpi-box-top"><div><div class="kpi-val">78%</div><div class="kpi-lbl">Budget Utilized</div></div><span class="kpi-icon kpi-icon--amber"><i class="bx bx-dollar-circle"></i></span></div>
            <span class="kpi-trend trend-neutral"><i class="bx bx-minus"></i> On track</span>
          </div>
          <div class="kpi-box">
            <div class="kpi-box-top"><div><div class="kpi-val">38</div><div class="kpi-lbl">Open Positions</div></div><span class="kpi-icon kpi-icon--rose"><i class="bx bx-user-plus"></i></span></div>
            <span class="kpi-trend trend-dn"><i class="bx bx-down-arrow-alt"></i> -6 vs last Q</span>
          </div>
        </div>

        <div class="two-col">
          <div class="card">
            <div class="inner-tabs">
              <button class="inner-tab active">HeadcountPlan</button>
              <button class="inner-tab">DepartmentBudget</button>
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Department</th><th>Current HC</th><th>Planned HC</th><th>Gap</th><th>Budget</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  <tr *ngFor="let r of headcountPlans" (click)="openDetail(r,'workforce')">
                    <td class="td-bold">{{ r.dept }}</td>
                    <td>{{ r.current }}</td>
                    <td>{{ r.planned }}</td>
                    <td [style.color]="r.gap>0?'#15803D':'#BE123C'" style="font-weight:700;">{{ r.gap>0?'+':'' }}{{ r.gap }}</td>
                    <td>{{ r.budget }}</td>
                    <td><span class="chip chip--{{ r.statusClass }}">{{ r.status }}</span></td>
                    <td (click)="$event.stopPropagation()">
                      <button class="act-btn act-btn--green"><i class="bx bx-edit-alt"></i></button>
                      <button class="act-btn act-btn--del"><i class="bx bx-trash"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:16px;">
            <div class="card card-pad">
              <div class="card-head">
                <span class="card-title">Workforce Scenarios</span>
                <span class="card-badge">Q1 2025</span>
              </div>
              <div class="scenario-list">
                <div *ngFor="let s of workforceScenarios" class="scenario-item" [class.active]="s.active" (click)="s.active=!s.active">
                  <div class="scenario-head">
                    <span class="scenario-name">{{ s.name }}</span>
                    <span class="chip chip--{{ s.chipClass }}">{{ s.label }}</span>
                  </div>
                  <div class="scenario-desc">{{ s.desc }}</div>
                  <div class="scenario-meta">
                    <span class="scenario-meta-item"><i class="bx bx-group"></i> +{{ s.hc }} HC</span>
                    <span class="scenario-meta-item"><i class="bx bx-dollar"></i> {{ s.cost }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="card card-pad">
              <div class="card-head"><span class="card-title">Budget by Department</span></div>
              <div *ngFor="let b of departmentBudgets" class="budget-item">
                <div class="budget-dept">{{ b.dept }}</div>
                <div class="budget-bar-wrap">
                  <div class="prog-wrap"><div class="prog-fill prog-teal" [style.width.%]="b.pct"></div></div>
                </div>
                <span class="budget-pct">{{ b.pct }}%</span>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ══ TRAINING PLANNING ══ -->
      <ng-container *ngIf="activeModule==='training'">
        <div class="training-stats">
          <div class="t-stat-box">
            <div class="t-stat-num">47</div>
            <div class="t-stat-lbl">Training Needs Identified</div>
            <div class="t-stat-sub">↑ 8 new from GPEC</div>
          </div>
          <div class="t-stat-box">
            <div class="t-stat-num">12</div>
            <div class="t-stat-lbl">Training Plans Active</div>
            <div class="t-stat-sub">3 pending approval</div>
          </div>
          <div class="t-stat-box">
            <div class="t-stat-num">89</div>
            <div class="t-stat-lbl">PDIs in Progress</div>
            <div class="t-stat-sub">Avg. completion 64%</div>
          </div>
        </div>

        <div class="two-col">
          <div class="card full-card">
            <div class="inner-tabs">
              <button class="inner-tab active">Training Needs</button>
              <button class="inner-tab">Training Plans</button>
              <button class="inner-tab">PDI</button>
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Employee</th><th>Role</th><th>Skill Gap</th><th>Gap Level</th><th>Priority</th><th>Deadline</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  <tr *ngFor="let r of trainingNeeds" (click)="openDetail(r,'training')">
                    <td class="td-bold">{{ r.employee }}</td>
                    <td>{{ r.role }}</td>
                    <td>{{ r.skill }}</td>
                    <td>
                      <div style="display:flex;align-items:center;gap:6px;">
                        <span style="font-size:12px;font-weight:700;color:#1A2B3C;">{{ r.currentLevel }}/{{ r.targetLevel }}</span>
                        <div class="prog-wrap" style="width:56px;"><div class="prog-fill prog-rose" [style.width.%]="(r.currentLevel/r.targetLevel)*100"></div></div>
                      </div>
                    </td>
                    <td><span class="chip chip--{{ r.priorityClass }}">{{ r.priority }}</span></td>
                    <td style="font-size:12.5px;">{{ r.deadline }}</td>
                    <td><span class="chip chip--{{ r.statusClass }}">{{ r.status }}</span></td>
                    <td (click)="$event.stopPropagation()">
                      <button class="act-btn act-btn--green"><i class="bx bx-book-add"></i></button>
                      <button class="act-btn act-btn--del"><i class="bx bx-trash"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:16px;">
            <div class="card card-pad">
              <div class="card-head">
                <span class="card-title">Upcoming Sessions</span>
                <span class="card-badge">May 2025</span>
              </div>
              <div *ngFor="let s of trainingSessions" class="session-item">
                <div class="session-date-box">
                  <span class="session-day">{{ s.day }}</span>
                  <span class="session-month">{{ s.month }}</span>
                </div>
                <div class="session-info">
                  <div class="session-name">{{ s.name }}</div>
                  <div class="session-meta">{{ s.trainer }} · {{ s.duration }}</div>
                </div>
                <span class="session-spots">{{ s.enrolled }}/{{ s.capacity }}</span>
              </div>
            </div>
            <div class="card card-pad">
              <div class="card-head"><span class="card-title">PDI Progress</span></div>
              <div *ngFor="let p of pdiProgress" class="pdi-row">
                <div>
                  <div class="pdi-name">{{ p.name }}</div>
                  <div class="pdi-role">{{ p.role }}</div>
                  <div class="prog-wrap" style="margin-top:6px;width:150px;"><div class="prog-fill prog-teal" [style.width.%]="p.pct"></div></div>
                </div>
                <span class="pdi-pct">{{ p.pct }}%</span>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ══ CAREER PLANNING ══ -->
      <ng-container *ngIf="activeModule==='career'">
        <div class="career-stats">
          <div class="kpi-box">
            <div class="kpi-box-top"><div><div class="kpi-val">63</div><div class="kpi-lbl">Active IDPs</div></div><span class="kpi-icon kpi-icon--teal"><i class="bx bx-user-check"></i></span></div>
            <span class="kpi-trend trend-up"><i class="bx bx-up-arrow-alt"></i> +11 this year</span>
          </div>
          <div class="kpi-box">
            <div class="kpi-box-top"><div><div class="kpi-val">28</div><div class="kpi-lbl">Career Goals Set</div></div><span class="kpi-icon kpi-icon--blue"><i class="bx bx-target-lock"></i></span></div>
            <span class="kpi-trend trend-up"><i class="bx bx-up-arrow-alt"></i> 44% completion</span>
          </div>
          <div class="kpi-box">
            <div class="kpi-box-top"><div><div class="kpi-val">18</div><div class="kpi-lbl">Mentorships Active</div></div><span class="kpi-icon kpi-icon--purple"><i class="bx bxs-graduation"></i></span></div>
            <span class="kpi-trend trend-neutral"><i class="bx bx-minus"></i> Stable</span>
          </div>
          <div class="kpi-box">
            <div class="kpi-box-top"><div><div class="kpi-val">9</div><div class="kpi-lbl">Promotions Planned</div></div><span class="kpi-icon kpi-icon--amber"><i class="bx bx-trending-up"></i></span></div>
            <span class="kpi-trend trend-up"><i class="bx bx-up-arrow-alt"></i> Q2 2025</span>
          </div>
        </div>

        <div class="two-col">
          <div class="card">
            <div class="inner-tabs">
              <button class="inner-tab active">IDP / Career Goals</button>
              <button class="inner-tab">Succession</button>
              <button class="inner-tab">Mobility</button>
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Employee</th><th>Current Role</th><th>Target Role</th><th>Timeline</th><th>Mentor</th><th>Progress</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  <tr *ngFor="let r of idpPlans" (click)="openDetail(r,'career')">
                    <td class="td-bold">{{ r.employee }}</td>
                    <td style="font-size:12.5px;">{{ r.currentRole }}</td>
                    <td style="font-size:12.5px;font-weight:600;color:#1B7872;">{{ r.targetRole }}</td>
                    <td style="font-size:12.5px;">{{ r.timeline }}</td>
                    <td style="font-size:12.5px;">{{ r.mentor }}</td>
                    <td>
                      <div style="display:flex;align-items:center;gap:6px;">
                        <div class="prog-wrap" style="width:60px;"><div class="prog-fill prog-teal" [style.width.%]="r.progress"></div></div>
                        <span style="font-size:12px;font-weight:700;color:#1B7872;">{{ r.progress }}%</span>
                      </div>
                    </td>
                    <td><span class="chip chip--{{ r.statusClass }}">{{ r.status }}</span></td>
                    <td (click)="$event.stopPropagation()">
                      <button class="act-btn act-btn--green"><i class="bx bx-edit-alt"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="card card-pad">
            <div class="card-head">
              <span class="card-title">Mentorship Assignments</span>
              <span class="card-badge">Active</span>
            </div>
            <div *ngFor="let m of mentorships" class="mentor-item">
              <div class="mentor-avatar">{{ m.mentorInitials }}</div>
              <div style="flex:1;">
                <div class="mentor-name">{{ m.mentor }}</div>
                <div class="mentor-meta">{{ m.mentorRole }}</div>
              </div>
              <i class="bx bx-right-arrow-alt mentor-arrow"></i>
              <div style="text-align:right;">
                <div class="mentee-name">{{ m.mentee }}</div>
                <div class="mentor-meta">{{ m.menteeRole }}</div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ══ RECRUITMENT PLANNING ══ -->
      <ng-container *ngIf="activeModule==='recruitment'">
        <div class="pipeline-funnel">
          <div *ngFor="let s of pipelineStages" class="funnel-stage">
            <div class="funnel-count">{{ s.count }}</div>
            <div class="funnel-lbl">{{ s.label }}</div>
            <div class="funnel-bar" [style.background]="s.color"></div>
          </div>
        </div>

        <div class="two-col">
          <div class="card">
            <div class="inner-tabs">
              <button class="inner-tab active">Hiring Requests</button>
              <button class="inner-tab">Job Requisitions</button>
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Req ID</th><th>Position</th><th>Dept</th><th>HC</th><th>Budget</th><th>Target Date</th><th>Stage</th><th></th></tr></thead>
                <tbody>
                  <tr *ngFor="let r of hiringRequests" (click)="openDetail(r,'recruitment')">
                    <td class="td-id">{{ r.reqId }}</td>
                    <td class="td-bold">{{ r.position }}</td>
                    <td>{{ r.dept }}</td>
                    <td style="font-weight:700;text-align:center;">{{ r.hc }}</td>
                    <td style="font-size:12.5px;">{{ r.budget }}</td>
                    <td style="font-size:12.5px;">{{ r.targetDate }}</td>
                    <td><span class="chip chip--{{ r.stageClass }}">{{ r.stage }}</span></td>
                    <td (click)="$event.stopPropagation()">
                      <button class="act-btn act-btn--green"><i class="bx bx-send"></i></button>
                      <button class="act-btn act-btn--del"><i class="bx bx-trash"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:16px;">
            <div class="card card-pad">
              <div class="card-head">
                <span class="card-title">Event Stream</span>
                <span style="font-size:11px;background:#DCFCE7;color:#15803D;padding:3px 9px;border-radius:999px;font-weight:700;">Live</span>
              </div>
              <div *ngFor="let e of eventStream" style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #F5F7FA;">
                <div style="width:8px;height:8px;border-radius:50%;margin-top:5px;flex-shrink:0;" [style.background]="e.color"></div>
                <div style="flex:1;">
                  <div style="font-size:12px;font-weight:600;color:#1A2B3C;font-family:monospace;">{{ e.event }}</div>
                  <div style="font-size:11px;color:#8FA3B8;">{{ e.desc }}</div>
                </div>
                <div style="font-size:11px;color:#B0BEC5;white-space:nowrap;padding-top:2px;">{{ e.time }}</div>
              </div>
            </div>
            <div class="card card-pad">
              <div class="card-head"><span class="card-title">Recruitment Pipeline</span></div>
              <div *ngFor="let s of recruitPipeline" style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                <div style="width:80px;font-size:12px;color:#4A6080;flex-shrink:0;">{{ s.name }}</div>
                <div style="flex:1;"><div class="prog-wrap"><div class="prog-fill prog-{{ s.color }}" [style.width.%]="s.pct"></div></div></div>
                <div style="font-size:12px;font-weight:700;color:#1A2B3C;width:22px;text-align:right;">{{ s.count }}</div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

    </div><!-- /plan-main -->
  </div><!-- /planning-wrapper -->
  `
})
export class PlanningComponent implements OnInit {

  activeModule = 'workforce';
  activeSub    = 'headcount';
  sidebarSearch = '';
  loading  = false;
  error: string | null = null;
  saving   = false;
  saveError: string | null = null;

  get moduleLabel(): string {
    const map: Record<string,string> = {
      workforce: 'Workforce Planning', training: 'Training Planning',
      career: 'Career Planning', recruitment: 'Recruitment Planning',
    };
    return map[this.activeModule] ?? 'Planning';
  }

  setModule(key: string): void {
    this.activeModule = key;
    const defaults: Record<string,string> = {
      workforce: 'headcount', training: 'needs', career: 'idp', recruitment: 'hiring',
    };
    this.activeSub = defaults[key] ?? '';
  }

  // ── Panel state ──
  showPanel   = false;
  panelType   = '';
  selected: any = null;
  createTitle = 'New Plan';
  createForm: any = {};

  // ── Options (loaded from API) ──
  deptOptions:   string[] = [];
  mentorOptions: string[] = [];

  // ══════════ WORKFORCE ══════════
  headcountPlans: { dept:string; current:number; planned:number; gap:number; budget:string; reviewDate:string; status:string; statusClass:string }[] = [];
  workforceScenarios: { name:string; label:string; chipClass:string; desc:string; hc:number; cost:string; active:boolean }[] = [];
  departmentBudgets: { dept:string; pct:number }[] = [];

  // ══════════ TRAINING ══════════
  trainingNeeds: { employee:string; role:string; skill:string; currentLevel:number; targetLevel:number; priority:string; priorityClass:string; deadline:string; status:string; statusClass:string; assignedTraining:string|null }[] = [];
  trainingSessions: { day:string; month:string; name:string; trainer:string; duration:string; enrolled:number; capacity:number }[] = [];
  pdiProgress: { name:string; role:string; pct:number }[] = [];

  // ══════════ CAREER ══════════
  idpPlans: { employee:string; currentRole:string; targetRole:string; timeline:string; mentor:string; progress:number; status:string; statusClass:string }[] = [];
  careerMilestones: { title:string; date:string; dotClass:string; status:string }[] = [];
  mentorships: { mentorInitials:string; mentor:string; mentorRole:string; mentee:string; menteeRole:string }[] = [];

  // ══════════ RECRUITMENT ══════════
  pipelineStages: { label:string; count:number; color:string }[] = [];
  hiringRequests: { reqId:string; position:string; dept:string; hc:number; budget:string; targetDate:string; stage:string; stageClass:string; planRef:string }[] = [];
  recruitPipeline: { name:string; count:number; pct:number; color:string; cls:string }[] = [];

  // ══════════ EVENT STREAM ══════════
  eventStream: { event:string; desc:string; time:string; color:string }[] = [];

  private readonly EVENT_COLORS: Record<string,string> = {
    MEETING: '#2FA8A0', INTERVIEW: '#3B82F6', TRAINING: '#8B5CF6',
    HOLIDAY: '#22C55E', DEADLINE: '#F97316',  OTHER: '#8FA3B8',
  };

  constructor(
    private planningService: PlanningService,
    private collaborateurService: CollaborateurService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.error   = null;
    forkJoin({
      events:         this.planningService.getAllEvents(),
      collaborateurs: this.collaborateurService.getAll(),
    }).subscribe({
      next: ({ events, collaborateurs }) => {
        this.loading = false;
        this._buildFromCollaborateurs(collaborateurs as any[]);
        this._buildFromEvents(events as any[]);
      },
      error: err => {
        this.loading = false;
        this.error = err?.error?.message || 'Failed to load planning data.';
      },
    });
  }

  // ─── Derive data from real Collaborateur list ───────────────────────────────
  private _buildFromCollaborateurs(colls: any[]): void {
    // Group by department
    const deptMap = new Map<string, number>();
    colls.forEach(c => {
      const dept = (c.Département || c.département || '—').trim();
      deptMap.set(dept, (deptMap.get(dept) ?? 0) + 1);
    });

    const total = colls.length || 1;

    // headcountPlans — real current headcount per department
    this.headcountPlans = Array.from(deptMap.entries())
      .filter(([dept]) => dept !== '—')
      .map(([dept, count]) => ({
        dept, current: count, planned: count, gap: 0,
        budget: '—', reviewDate: '—', status: 'Active', statusClass: 'approved',
      }));

    // departmentBudgets — relative % of total workforce
    const sorted = Array.from(deptMap.entries())
      .filter(([dept]) => dept !== '—')
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    const maxCount = sorted[0]?.[1] ?? 1;
    this.departmentBudgets = sorted.map(([dept, count]) => ({
      dept: dept.length > 20 ? dept.slice(0, 20) + '…' : dept,
      pct: Math.round(count / maxCount * 100),
    }));

    // workforceScenarios — one real scenario based on current headcount
    this.workforceScenarios = [
      {
        name: 'Current Headcount',
        label: 'Live',
        chipClass: 'active',
        desc: `${total} employees across ${deptMap.size} department(s). Based on live HR data.`,
        hc: total,
        cost: '—',
        active: true,
      },
    ];

    // deptOptions for create form
    this.deptOptions = Array.from(deptMap.keys()).filter(d => d !== '—');

    // pdiProgress — seniority-based (Ancienneté / 5 years → 100%)
    this.pdiProgress = colls
      .filter(c => c.prenom || c.nom)
      .slice(0, 8)
      .map(c => ({
        name: `${c.prenom ?? ''} ${c.nom ?? ''}`.trim(),
        role: c.Fonction || c.Département || '—',
        pct:  Math.min(100, Math.round(((c.Ancienneté ?? 0) / 5) * 100)),
      }));

    // mentorOptions — collaborateur full names
    this.mentorOptions = colls
      .filter(c => c.nom && c.prenom)
      .map(c => `${c.prenom} ${c.nom}`.trim())
      .slice(0, 20);

    // mentorships — pair managers with their team
    const mgrs = colls.filter(c =>
      /(manager|responsable|directeur|chef|head)/i.test(c.Fonction ?? '')
    ).slice(0, 5);
    const others = colls.filter(c => !mgrs.includes(c)).slice(0, 5);
    this.mentorships = mgrs
      .slice(0, Math.min(mgrs.length, others.length))
      .map((m, i) => ({
        mentorInitials: `${(m.prenom || '?')[0]}${(m.nom || '?')[0]}`.toUpperCase(),
        mentor:         `${m.prenom ?? ''} ${m.nom ?? ''}`.trim(),
        mentorRole:     m.Fonction || '—',
        mentee:         `${others[i]?.prenom ?? ''} ${others[i]?.nom ?? ''}`.trim(),
        menteeRole:     others[i]?.Fonction || '—',
      }));

    // idpPlans — every employee as a development candidate
    this.idpPlans = colls.slice(0, 10).map(c => ({
      employee:    `${c.prenom ?? ''} ${c.nom ?? ''}`.trim(),
      currentRole: c.Fonction || '—',
      targetRole:  '—',
      timeline:    '—',
      mentor:      '—',
      progress:    Math.min(100, Math.round(((c.Ancienneté ?? 0) / 5) * 100)),
      status:      'Active',
      statusClass: 'active',
    }));
  }

  // ─── Derive data from real PlanningEvent list ────────────────────────────────
  private _buildFromEvents(events: any[]): void {
    const now = new Date();
    const sorted = [...events].sort(
      (a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime()
    );

    const byType = (t: string) => sorted.filter(e => e.type === t);

    // ── Training ──
    const trainingEvts = byType('TRAINING');
    this.trainingNeeds = trainingEvts.map(e => {
      const cb = e.createdBy;
      const emp = cb ? `${cb.firstname ?? ''} ${cb.lastname ?? ''}`.trim() : '—';
      const isPast = new Date(e.startDateTime) < now;
      return {
        employee: emp, role: e.location || '—', skill: e.title,
        currentLevel: 0, targetLevel: 0,
        priority: 'Medium', priorityClass: 'medium',
        deadline: e.endDateTime
          ? new Date(e.endDateTime).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
          : '—',
        status:      isPast ? 'Completed' : 'Assigned',
        statusClass: isPast ? 'completed'  : 'active',
        assignedTraining: e.description || null,
      };
    });

    this.trainingSessions = trainingEvts.map(e => {
      const d   = new Date(e.startDateTime);
      const cb  = e.createdBy;
      const dur = e.endDateTime
        ? `${Math.max(1, Math.ceil((new Date(e.endDateTime).getTime() - d.getTime()) / 86_400_000))} day(s)`
        : '—';
      return {
        day:     String(d.getDate()).padStart(2, '0'),
        month:   d.toLocaleString('en', { month: 'short' }),
        name:    e.title,
        trainer: cb ? `${cb.firstname ?? ''} ${cb.lastname ?? ''}`.trim() : (e.location || '—'),
        duration: dur,
        enrolled: 0, capacity: 0,
      };
    });

    // ── Career milestones (DEADLINE events) ──
    this.careerMilestones = byType('DEADLINE').map(e => {
      const d    = new Date(e.startDateTime);
      const past = d < now;
      return {
        title:    e.title,
        date:     d.toLocaleDateString('en', { month: 'short', year: 'numeric' }),
        dotClass: past ? 'done' : 'pending',
        status:   past ? 'Done' : 'Pending',
      };
    });

    // ── Recruitment — INTERVIEW events ──
    const interviewEvts = byType('INTERVIEW');
    this.hiringRequests = interviewEvts.map((e, idx) => {
      const d = new Date(e.startDateTime);
      return {
        reqId:      `HR-${String(e.id ?? idx + 1).padStart(4, '0')}`,
        position:   e.title,
        dept:       e.location || '—',
        hc:         1,
        budget:     '—',
        targetDate: d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }),
        stage:      d < now ? 'Completed' : 'Interviewing',
        stageClass: d < now ? 'completed' : 'active',
        planRef:    `EVT-${e.id ?? idx + 1}`,
      };
    });

    // pipelineStages — count by event type
    const typeCounts = new Map<string, number>();
    events.forEach(e => typeCounts.set(e.type, (typeCounts.get(e.type) ?? 0) + 1));

    this.pipelineStages = Array.from(typeCounts.entries()).map(([type, count]) => ({
      label: type.charAt(0) + type.slice(1).toLowerCase(),
      count,
      color: this.EVENT_COLORS[type] ?? '#8FA3B8',
    }));

    const maxCount = Math.max(1, ...Array.from(typeCounts.values()));
    this.recruitPipeline = Array.from(typeCounts.entries()).map(([type, count]) => ({
      name:  type.charAt(0) + type.slice(1).toLowerCase(),
      count,
      pct:   Math.round(count / maxCount * 100),
      color: 'teal',
      cls:   'active',
    }));

    // ── Event stream — 6 most recent events ──
    this.eventStream = sorted.slice(0, 6).map(e => {
      const diff = now.getTime() - new Date(e.startDateTime).getTime();
      const mins = Math.floor(diff / 60_000);
      const hrs  = Math.floor(diff / 3_600_000);
      const days = Math.floor(diff / 86_400_000);
      const time = days > 0 ? `${days}d ago` : hrs > 0 ? `${hrs}h ago` : `${Math.max(0,mins)}m ago`;
      return {
        event: `planning.${e.type.toLowerCase()}.event`,
        desc:  `${e.title}${e.location ? ' — ' + e.location : ''}`,
        time,
        color: this.EVENT_COLORS[e.type] ?? '#8FA3B8',
      };
    });
  }

  // ── Panel handlers ──
  openDetail(row: any, type: string): void {
    this.selected  = row;
    this.panelType = type;
    this.showPanel = true;
  }

  openCreate(): void {
    this.createForm = {};
    this.panelType  = 'create';
    this.showPanel  = true;
    this.selected   = null;
    this.saveError  = null;
    const labels: Record<string,string> = {
      workforce: 'New Headcount Plan', training: 'New Training Need',
      career: 'New Development Plan',  recruitment: 'New Hiring Request',
    };
    this.createTitle = labels[this.activeModule] ?? 'New Plan';
  }

  submitCreate(): void {
    if (!this.createForm.title) { this.saveError = 'Title is required.'; return; }
    this.saving    = true;
    this.saveError = null;
    const typeMap: Record<string,string> = {
      workforce: 'MEETING', training: 'TRAINING', career: 'OTHER', recruitment: 'INTERVIEW',
    };
    const payload: any = {
      title:         this.createForm.title,
      description:   this.createForm.description || '',
      startDateTime: this.createForm.startDate   || new Date().toISOString(),
      endDateTime:   this.createForm.endDate     || null,
      location:      this.createForm.location    || '',
      type:          typeMap[this.activeModule]  ?? 'OTHER',
    };
    this.planningService.createEvent(payload).subscribe({
      next: () => { this.saving = false; this.closePanel(); this.ngOnInit(); },
      error: err => { this.saving = false; this.saveError = err?.error?.message || 'Failed to save.'; },
    });
  }

  closePanel(): void { this.showPanel = false; this.selected = null; }
}
