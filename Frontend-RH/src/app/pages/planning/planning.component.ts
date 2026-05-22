import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { PlanningService } from './planning.service';
import { CollaborateurService } from 'src/app/core/services/collaborateur.service';
import { ConfirmService } from 'src/app/shared/confirm.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WallClockComponent } from 'src/app/shared/wall-clock/wall-clock.component';

interface CalDay { date: Date; cur: boolean; events: any[]; }

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, WallClockComponent],
  styles: [`
    :host { display:block; font-family:'Inter',sans-serif; background:#F4F7FB; min-height:100vh; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
    @keyframes spin    { to{transform:rotate(360deg)} }
    @keyframes rpIn    { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:none} }

    .page { padding:0 24px 32px; animation:fadeIn .35s ease both; }

    /* ── Header ── */
    .ph { display:flex; align-items:center; justify-content:space-between; background:#fff;
          border-radius:12px; box-shadow:0 4px 20px rgba(22,34,51,.08); padding:14px 20px;
          margin-bottom:20px; }
    .ph-left { display:flex; align-items:center; gap:14px; }
    .ph-icon  { width:40px; height:40px; border-radius:11px;
                background:linear-gradient(135deg,#1B7872,#2FA8A0);
                display:flex; align-items:center; justify-content:center; color:#fff; font-size:19px; }
    .ph-title { font-size:20px; font-weight:800; color:#1A2B3C; margin:0; }
    .ph-sub   { font-size:12px; color:#8FA3B8; margin-top:1px; }
    .ph-right { display:flex; align-items:center; gap:10px; }
    .ph-date  { font-size:12.5px; color:#8FA3B8; display:flex; align-items:center; gap:5px; }

    /* ── Buttons ── */
    .btn-prim { background:#1B7872; color:#fff; border:none; border-radius:9px;
                padding:9px 18px; font-size:13px; font-weight:600; cursor:pointer;
                display:inline-flex; align-items:center; gap:6px; transition:background .15s; }
    .btn-prim:hover  { background:#1A9690; }
    .btn-prim:disabled { opacity:.5; cursor:default; }
    .btn-ghost { background:#F1F5F9; color:#4A6080; border:none; border-radius:9px;
                 padding:9px 16px; font-size:13px; font-weight:600; cursor:pointer;
                 display:inline-flex; align-items:center; gap:6px; transition:all .15s; }
    .btn-ghost:hover { background:#E2E8F0; }

    /* ── View tabs ── */
    .view-tabs { display:flex; gap:4px; background:#fff; border-radius:12px;
                 box-shadow:0 4px 20px rgba(22,34,51,.08); padding:6px; margin-bottom:12px; }
    .vt { flex:1; padding:10px 14px; border:none; border-radius:9px; background:none;
          font-size:13px; font-weight:600; color:#8FA3B8; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:7px; transition:all .15s; }
    .vt:hover:not(.vt--active) { background:#F8FAFC; color:#4A6080; }
    .vt--active { background:#1B7872; color:#fff; }
    .vt-icon { width:24px; height:24px; border-radius:6px; display:flex; align-items:center;
               justify-content:center; font-size:13px; transition:all .15s; }
    .vt--active .vt-icon { background:rgba(255,255,255,.2); }

    /* ── KPI strip ── */
    .kpi-strip { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:12px; }
    .kpi  { background:#fff; border-radius:12px; padding:16px 18px;
            box-shadow:0 4px 20px rgba(22,34,51,.08);
            display:flex; align-items:center; gap:14px; }
    .kpi-ico { width:44px; height:44px; border-radius:12px; display:flex; align-items:center;
               justify-content:center; font-size:20px; flex-shrink:0; }
    .ico-teal   { background:#E8F7F6; color:#1B7872; }
    .ico-blue   { background:#DBEAFE; color:#1E40AF; }
    .ico-purple { background:#EDE9FE; color:#6D28D9; }
    .ico-amber  { background:#FEF3C7; color:#92400E; }
    .kpi-v  { font-size:26px; font-weight:800; color:#1A2B3C; line-height:1; }
    .kpi-l  { font-size:11.5px; color:#8FA3B8; margin-top:2px; }

    /* ══════════════════════════════════
       CALENDAR
       ══════════════════════════════════ */
    .cal-wrap { background:#fff; border-radius:14px; box-shadow:0 4px 20px rgba(22,34,51,.08); overflow:hidden; }

    /* Calendar toolbar */
    .cal-toolbar { display:flex; align-items:center; justify-content:space-between;
                   padding:12px 22px 12px; border-bottom:1px solid #F0F3F6; }
    .cal-nav     { display:flex; align-items:center; gap:10px; }
    .cal-nav-btn { width:34px; height:34px; border:1.5px solid #E2E8F0; background:#fff;
                   border-radius:9px; display:flex; align-items:center; justify-content:center;
                   cursor:pointer; font-size:16px; color:#4A6080; transition:all .15s; }
    .cal-nav-btn:hover { border-color:#2FA8A0; color:#1B7872; background:#F0FDF9; }
    .cal-month-label { font-size:17px; font-weight:800; color:#1A2B3C; min-width:160px; text-align:center; }
    .cal-today-btn   { padding:6px 16px; border:1.5px solid #E2E8F0; background:#fff;
                       border-radius:8px; font-size:12.5px; font-weight:600; color:#4A6080;
                       cursor:pointer; transition:all .15s; }
    .cal-today-btn:hover { border-color:#2FA8A0; color:#1B7872; }

    /* Legend */
    .cal-legend { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
    .leg-item   { display:flex; align-items:center; gap:5px; font-size:11.5px; color:#4A6080; font-weight:500; }
    .leg-dot    { width:9px; height:9px; border-radius:50%; flex-shrink:0; }

    /* Day-of-week header */
    .cal-dow { display:grid; grid-template-columns:repeat(7,1fr);
               background:#FAFBFC; border-bottom:1px solid #F0F3F6; }
    .cal-dow-cell { padding:10px 0; text-align:center; font-size:11px; font-weight:700;
                    letter-spacing:.06em; text-transform:uppercase; color:#8FA3B8; }

    /* Day grid */
    .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); }
    .cal-cell  { min-height:110px; padding:8px 8px 6px; border-right:1px solid #F5F7FA;
                 border-bottom:1px solid #F5F7FA; cursor:pointer; transition:background .12s;
                 position:relative; }
    .cal-cell:hover { background:#F8FFFE; }
    .cal-cell:nth-child(7n) { border-right:none; }
    .cal-cell--other { background:#FAFBFC; }
    .cal-cell--other .cal-day-num { color:#CBD5E0; }
    .cal-cell--today  { background:#F0FDF9; }
    .cal-cell--today .cal-day-num { background:#1B7872; color:#fff; }
    .cal-cell--selected { background:#E8F7F6; }

    .cal-day-num { display:inline-flex; align-items:center; justify-content:center;
                   width:26px; height:26px; border-radius:50%; font-size:13px; font-weight:700;
                   color:#1A2B3C; margin-bottom:4px; }

    /* Event pills inside day cells */
    .cal-events { display:flex; flex-direction:column; gap:2px; }
    .cal-pill   { display:flex; align-items:center; gap:4px; padding:2px 7px; border-radius:5px;
                  font-size:11px; font-weight:600; cursor:pointer; transition:opacity .1s;
                  overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
    .cal-pill:hover { opacity:.82; }
    .cal-pill-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
    .cal-more   { font-size:10.5px; color:#8FA3B8; font-weight:600; padding:1px 6px;
                  cursor:pointer; text-decoration:underline; }

    /* ── Selected day events list (below calendar) ── */
    .day-events-panel { padding:20px 22px; border-top:1px solid #F0F3F6; }
    .dep-title  { font-size:14px; font-weight:700; color:#1A2B3C; margin-bottom:14px;
                  display:flex; align-items:center; gap:8px; }
    .dep-date-chip { background:#E8F7F6; color:#1B7872; padding:3px 10px; border-radius:7px;
                     font-size:12px; font-weight:700; }
    .dep-empty  { color:#B0BEC5; font-size:13px; padding:12px 0; }
    .dep-event  { display:flex; align-items:center; gap:12px; padding:10px 0;
                  border-bottom:1px solid #F5F7FA; cursor:pointer; transition:background .1s; }
    .dep-event:last-child { border-bottom:none; }
    .dep-event:hover { background:#F8FFFE; margin:0 -4px; padding:10px 4px; border-radius:8px; }
    .dep-type-badge { width:34px; height:34px; border-radius:9px; display:flex; align-items:center;
                      justify-content:center; font-size:15px; flex-shrink:0; }
    .dep-ev-title { font-size:13px; font-weight:600; color:#1A2B3C; }
    .dep-ev-meta  { font-size:11.5px; color:#8FA3B8; margin-top:1px; }
    .dep-ev-chip  { margin-left:auto; padding:3px 10px; border-radius:999px;
                    font-size:11px; font-weight:700; flex-shrink:0; }

    /* ══════════════════════════════════
       MODULE VIEWS (Workforce / Training / Career / Recruitment)
       ══════════════════════════════════ */
    .pl-sec      { margin:0 0 12px 0 !important; padding:0 !important; }
    .pl-card     { background:#fff; border-radius:12px; box-shadow:0 4px 20px rgba(22,34,51,.08);
                   overflow:hidden; border:none !important; }
    .pl-card-pad { padding:14px 22px; }
    .pl-card-hd  { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
    .pl-card-ttl { font-size:14px; font-weight:700; color:#1A2B3C; }
    .pl-card-bdg { background:#E8F7F6; color:#1B7872; border-radius:999px; padding:3px 12px;
                   font-size:12px; font-weight:700; }

    .pl-two-col   { display:grid; grid-template-columns:1fr 320px; gap:18px; align-items:start; }
    .pl-three-col { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }

    /* Inner tabs */
    .itabs { display:flex; gap:2px; padding:12px 20px 0; border-bottom:1px solid #F0F3F6; }
    .itab  { padding:8px 16px; border:none; background:none; font-size:13px; font-weight:500;
             color:#8FA3B8; border-bottom:2px solid transparent; cursor:pointer;
             margin-bottom:-1px; transition:all .15s; }
    .itab.act { color:#2FA8A0; border-bottom-color:#2FA8A0; font-weight:700; }
    .itab:hover:not(.act) { color:#4A6080; }

    /* Tables */
    .tbl-wrap { overflow-x:auto; }
    table  { width:100%; border-collapse:collapse; }
    thead tr { background:#FAFBFC; }
    thead th { padding:10px 16px; font-size:11px; font-weight:700; letter-spacing:.06em;
               text-transform:uppercase; color:#8FA3B8; border-bottom:1px solid #F0F3F6; }
    tbody tr { cursor:pointer; transition:background .12s; }
    tbody tr:hover { background:#F8FFFE; }
    tbody td { padding:11px 16px; font-size:13px; color:#4A6080;
               border-bottom:1px solid #F5F7FA; vertical-align:middle; }
    tbody tr:last-child td { border-bottom:none; }
    .td-b { font-weight:600; color:#1A2B3C; }

    /* Chips */
    .chip { display:inline-flex; padding:3px 10px; border-radius:999px; font-size:11.5px; font-weight:700; }
    .ch-green  { background:#DCFCE7; color:#15803D; }
    .ch-blue   { background:#DBEAFE; color:#1E40AF; }
    .ch-amber  { background:#FEF3C7; color:#B45309; }
    .ch-red    { background:#FFE4E6; color:#BE123C; }
    .ch-purple { background:#EDE9FE; color:#6D28D9; }
    .ch-gray   { background:#F1F5F9; color:#8FA3B8; }
    .ch-teal   { background:#E8F7F6; color:#1B7872; }

    /* Progress */
    .prog-bg { background:#F1F5F9; border-radius:999px; height:6px; overflow:hidden; }
    .prog-fill { height:100%; border-radius:999px; background:#1B7872; }

    /* Action btns */
    .act-btn { background:none; border:none; font-size:15px; color:#B0BEC5; cursor:pointer;
               padding:3px 5px; border-radius:6px; }
    .act-btn:hover { background:#F1F5F9; color:#4A6080; }
    .act-btn.del:hover { background:#FEE2E2; color:#BE123C; }

    /* ── Small list items ── */
    .list-item  { display:flex; align-items:center; gap:12px; padding:10px 0;
                  border-bottom:1px solid #F5F7FA; }
    .list-item:last-child { border-bottom:none; }
    .li-avatar  { width:36px; height:36px; border-radius:10px; background:#E8F7F6; color:#1B7872;
                  font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .li-main    { flex:1; min-width:0; }
    .li-title   { font-size:13px; font-weight:600; color:#1A2B3C; margin-bottom:1px; }
    .li-sub     { font-size:11.5px; color:#8FA3B8; }

    /* ── Date box ── */
    .date-box   { width:40px; height:40px; border-radius:9px; background:#E8F7F6;
                  display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0; }
    .db-day     { font-size:15px; font-weight:800; color:#1B7872; line-height:1; }
    .db-mon     { font-size:9px; font-weight:700; color:#2FA8A0; text-transform:uppercase; }

    /* ── Budget bar ── */
    .bgt-row { display:flex; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid #F5F7FA; }
    .bgt-row:last-child { border-bottom:none; }
    .bgt-dept { font-size:13px; font-weight:600; color:#1A2B3C; width:130px; flex-shrink:0;
                overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .bgt-bar  { flex:1; }
    .bgt-pct  { font-size:12px; font-weight:700; color:#1B7872; width:34px; text-align:right; }

    /* ── Mentor pair ── */
    .mentor-row { display:flex; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid #F5F7FA; }
    .mentor-row:last-child { border-bottom:none; }

    /* ── State boxes ── */
    .state-box { padding:48px 0; text-align:center; color:#8FA3B8; font-size:14px; }
    .state-box i { font-size:36px; display:block; margin-bottom:10px; }
    .spinner { width:30px; height:30px; border:3px solid #E2E8F0; border-top-color:#2FA8A0;
               border-radius:50%; animation:spin .7s linear infinite; margin:0 auto 10px; }

    /* ── Right Panel ── */
    .backdrop { position:fixed; inset:0; background:rgba(10,20,35,.35); z-index:1800; backdrop-filter:blur(1px); }
    .rp { position:fixed; top:70px; right:0; bottom:0; width:500px; background:#fff;
          box-shadow:-8px 0 40px rgba(10,20,35,.14); border-radius:16px 0 0 0; z-index:1801;
          display:flex; flex-direction:column; animation:rpIn .22s ease both; overflow:hidden; }
    .rp-hd  { display:flex; align-items:center; justify-content:space-between;
              padding:18px 22px 16px; border-bottom:1px solid #F0F3F6; flex-shrink:0; }
    .rp-t   { font-size:15px; font-weight:700; color:#1A2B3C; }
    .rp-cls { width:30px; height:30px; border:none; background:#F1F5F9; border-radius:7px;
              display:flex; align-items:center; justify-content:center; cursor:pointer;
              font-size:18px; color:#4A6080; }
    .rp-cls:hover { background:#E2E8F0; }
    .rp-bd  { flex:1; overflow-y:auto; padding:22px; }
    .rp-sec { font-size:13px; font-weight:700; color:#1A2B3C; margin:16px 0 10px;
              padding-bottom:6px; border-bottom:1px solid #F0F3F6; }
    .rp-sec:first-child { margin-top:0; }
    .rp-row { display:flex; gap:10px; padding:8px 0; border-bottom:1px solid #F8FAFC; }
    .rp-row:last-of-type { border-bottom:none; }
    .rp-lbl { font-size:12px; color:#8FA3B8; min-width:130px; display:flex; align-items:center; gap:5px; }
    .rp-lbl i { font-size:14px; }
    .rp-val { font-size:13px; font-weight:600; color:#1A2B3C; }
    .rp-ft  { padding:14px 22px; border-top:1px solid #F0F3F6; flex-shrink:0; display:flex; justify-content:flex-end; gap:10px; }

    /* ── Create form ── */
    .cf-field { margin-bottom:14px; }
    .cf-lbl   { font-size:13px; font-weight:600; color:#1A2B3C; margin-bottom:5px; display:block; }
    .cf-in    { width:100%; padding:10px 14px; border:1.5px solid #E2E8F0; border-radius:9px;
                font-size:13px; color:#1A2B3C; font-family:'Inter',sans-serif;
                box-sizing:border-box; outline:none; transition:border .15s; }
    .cf-in:focus { border-color:#2FA8A0; box-shadow:0 0 0 3px rgba(47,168,160,.1); }
    .cf-in::placeholder { color:#C0CDD8; }
    .cf-sel   { width:100%; padding:10px 14px; border:1.5px solid #E2E8F0; border-radius:9px;
                font-size:13px; color:#4A6080; font-family:'Inter',sans-serif;
                appearance:none; background:#fff; box-sizing:border-box; outline:none; cursor:pointer; }
    .cf-sel:focus { border-color:#2FA8A0; }
    .cf-row   { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .cf-ta    { width:100%; padding:10px 14px; border:1.5px solid #E2E8F0; border-radius:9px;
                font-size:13px; color:#1A2B3C; font-family:'Inter',sans-serif;
                box-sizing:border-box; outline:none; resize:vertical; min-height:72px; transition:border .15s; }
    .cf-ta:focus { border-color:#2FA8A0; }
    .cf-err { color:#BE123C; font-size:12px; padding:8px 12px; background:#FFF5F5;
              border-radius:8px; border:1px solid #FFE4E6; margin-bottom:10px; }

    .btn-cancel { padding:10px 20px; background:#F1F5F9; color:#4A6080; border:none;
                  border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; }
    .btn-save   { padding:10px 24px; background:#1B7872; color:#fff; border:none;
                  border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; }
    .btn-save:hover { background:#1A9690; }
    .btn-save:disabled { opacity:.5; cursor:default; }

    /* ── Calendar view switcher ── */
    .cal-vsw       { display:flex; gap:2px; background:#F1F5F9; border-radius:9px; padding:3px; }
    .cal-vsw-btn   { padding:6px 16px; border:none; border-radius:7px; background:none;
                     font-size:12.5px; font-weight:600; color:#8FA3B8; cursor:pointer; transition:all .15s; }
    .cal-vsw-btn.act { background:#fff; color:#1B7872; box-shadow:0 1px 4px rgba(10,20,35,.12); }
    .cal-vsw-btn:hover:not(.act) { color:#4A6080; }

    /* ── Weekly view ── */
    .cal-week-wrap    { overflow:hidden; }
    .cal-week-header  { display:flex; border-bottom:2px solid #F0F3F6; }
    .cal-tg           { width:62px; flex-shrink:0; border-right:1px solid #F0F3F6; }
    .cal-week-day-hd  { flex:1; padding:10px 8px 10px; text-align:center;
                        border-right:1px solid #F0F3F6; transition:background .12s; }
    .cal-week-day-hd:last-child { border-right:none; }
    .cal-wdh-name     { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#8FA3B8; }
    .cal-wdh-num      { display:inline-flex; align-items:center; justify-content:center;
                        width:30px; height:30px; border-radius:50%;
                        font-size:15px; font-weight:800; color:#1A2B3C; margin-top:3px; }
    .cal-wdh-num.today { background:#1B7872; color:#fff; }
    .cal-allday-row   { display:flex; border-bottom:1px solid #F0F3F6; background:#FAFBFC; }
    .cal-allday-tg    { width:62px; flex-shrink:0; border-right:1px solid #F0F3F6;
                        padding:6px 6px 0; font-size:9.5px; font-weight:700; color:#C0CDD8;
                        text-align:right; text-transform:uppercase; letter-spacing:.04em; }
    .cal-allday-cell  { flex:1; border-right:1px solid #F5F7FA; padding:4px 3px; min-height:24px; }
    .cal-allday-cell:last-child { border-right:none; }
    .cal-week-body    { overflow-y:auto; max-height:500px; }
    .cal-time-row     { display:flex; border-bottom:1px solid #F5F7FA; min-height:54px; }
    .cal-tg-cell      { width:62px; flex-shrink:0; border-right:1px solid #F0F3F6;
                        padding:0 8px 0 0; font-size:10.5px; font-weight:600; color:#C0CDD8;
                        text-align:right; padding-top:6px; }
    .cal-day-col      { flex:1; border-right:1px solid #F5F7FA; padding:3px; cursor:pointer;
                        transition:background .1s; }
    .cal-day-col:last-child { border-right:none; }
    .cal-day-col:hover { background:#F0FDF9; }
    .cal-ev-block     { padding:3px 7px 3px 8px; border-radius:5px; font-size:11px; font-weight:600;
                        margin-bottom:2px; cursor:pointer; overflow:hidden; white-space:nowrap;
                        text-overflow:ellipsis; transition:opacity .12s; border-left-width:3px; border-left-style:solid; }
    .cal-ev-block:hover { opacity:.8; }

    /* ── Daily view ── */
    .cal-day-wrap     { overflow:hidden; }
    .cal-day-allday   { display:flex; align-items:center; gap:6px; flex-wrap:wrap;
                        padding:8px 16px 8px 78px; border-bottom:1px solid #F0F3F6; background:#FAFBFC; }
    .cal-day-allday-lbl { font-size:10px; font-weight:700; color:#C0CDD8; text-transform:uppercase;
                          letter-spacing:.04em; margin-right:4px; }
    .cal-day-body     { overflow-y:auto; max-height:580px; }
    .cal-day-row      { display:flex; border-bottom:1px solid #F5F7FA; min-height:64px; }
    .cal-day-row:hover { background:#FAFFFE; }
    .cal-day-row:last-child { border-bottom:none; }
    .cal-day-tg       { width:62px; flex-shrink:0; border-right:1px solid #F0F3F6;
                        padding:0 8px 0 0; font-size:10.5px; font-weight:600; color:#C0CDD8;
                        text-align:right; padding-top:6px; }
    .cal-day-slot     { flex:1; padding:4px 10px; }
    .cal-day-ev       { display:flex; align-items:center; gap:10px; padding:8px 12px;
                        border-radius:9px; margin-bottom:4px; cursor:pointer;
                        transition:opacity .12s; border-left-width:4px; border-left-style:solid; }
    .cal-day-ev:hover { opacity:.85; }
    .cal-day-ev-t     { font-size:13px; font-weight:600; flex:1; min-width:0;
                        overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
    .cal-day-ev-time  { font-size:11.5px; font-weight:700; opacity:.8; flex-shrink:0; }
    .cal-day-chip     { padding:2px 9px; border-radius:999px; font-size:10.5px; font-weight:700; flex-shrink:0; }
    .cal-day-empty    { text-align:center; color:#C0CDD8; padding:14px 0;
                        font-size:12px; font-style:italic; }

    .toast { position:fixed; bottom:24px; right:24px; z-index:9999; background:#111111 !important; color:#fff;
             padding:12px 20px; border-radius:10px; font-size:13px; font-weight:500;
             box-shadow:0 8px 24px rgba(0,0,0,.18); animation:rpIn .22s ease both; }

    /* ── Table utility classes (replaces inline styles) ── */
    .td-gap-pos  { color:#15803D; font-weight:700; }
    .td-gap-neg  { color:#BE123C; font-weight:700; }
    .td-reqid    { font-size:12px; font-weight:600; color:#4A6080; }
    .cal-today-hd  { background:#F0FDF9; }
    .cal-today-col { background:#FAFFFD; }
    .cal-day-title-bar {
      padding:12px 16px 12px 78px; border-bottom:1px solid #F0F3F6;
      display:flex; align-items:center; gap:10px; background:#FAFBFC;
    }
    .cal-day-title-text  { font-size:15px; font-weight:800; color:#1A2B3C; }
    .cal-day-title-count { margin-left:auto; font-size:12px; color:#8FA3B8; }

    /* ════════════════════════════════════════
       DARK MODE
       ════════════════════════════════════════ */
    :host-context([data-theme="dark"]) { background:#000000; }

    /* ── Header ── */
    :host-context([data-theme="dark"]) .ph { background:#111111 !important; box-shadow:0 4px 20px rgba(0,0,0,.3); }
    :host-context([data-theme="dark"]) .ph-title { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .ph-sub,
    :host-context([data-theme="dark"]) .ph-date { color:#6B6B6B !important; }

    /* ── Buttons ── */
    :host-context([data-theme="dark"]) .btn-ghost { background:#1A1A1A !important; color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .btn-ghost:hover { background:#2A2A2A; }
    :host-context([data-theme="dark"]) .btn-cancel { background:#1A1A1A !important; color:#A0A0A0 !important; }

    /* ── View tabs ── */
    :host-context([data-theme="dark"]) .view-tabs { background:#111111 !important; box-shadow:0 4px 20px rgba(0,0,0,.3); }
    :host-context([data-theme="dark"]) .vt { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .vt:hover:not(.vt--active) { background:#1A1A1A !important; color:#A0A0A0 !important; }

    /* ── KPI cards ── */
    :host-context([data-theme="dark"]) .kpi { background:#111111 !important; box-shadow:0 4px 20px rgba(0,0,0,.3); }
    :host-context([data-theme="dark"]) .kpi-v { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .kpi-l { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .ico-teal   { background:#0D3330; color:#2FA8A0; }
    :host-context([data-theme="dark"]) .ico-blue   { background:#172554; color:#60A5FA; }
    :host-context([data-theme="dark"]) .ico-purple { background:#2E1065; color:#A78BFA; }
    :host-context([data-theme="dark"]) .ico-amber  { background:#451A03; color:#FCD34D; }

    /* ── Calendar wrap & toolbar ── */
    :host-context([data-theme="dark"]) .cal-wrap { background:#111111 !important; box-shadow:0 4px 20px rgba(0,0,0,.3); }
    :host-context([data-theme="dark"]) .cal-toolbar { border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .cal-nav-btn { background:#1A1A1A !important; border-color:#2A2A2A !important; color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .cal-nav-btn:hover { border-color:#2FA8A0; color:#2FA8A0; background:#0D3330; }
    :host-context([data-theme="dark"]) .cal-month-label { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .cal-today-btn { background:#1A1A1A !important; border-color:#2A2A2A !important; color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .cal-today-btn:hover { border-color:#2FA8A0; color:#2FA8A0; }
    :host-context([data-theme="dark"]) .leg-item { color:#A0A0A0 !important; }

    /* ── Day-of-week header ── */
    :host-context([data-theme="dark"]) .cal-dow { background:#1A1A1A; border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .cal-dow-cell { color:#6B6B6B !important; }

    /* ── Calendar grid cells ── */
    :host-context([data-theme="dark"]) .cal-cell { border-right-color:#2A2A2A; border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .cal-cell:hover { background:#1A1A1A; }
    :host-context([data-theme="dark"]) .cal-cell--other { background:#0A0A0A; }
    :host-context([data-theme="dark"]) .cal-cell--other .cal-day-num { color:#444444; }
    :host-context([data-theme="dark"]) .cal-cell--today { background:#0D2E2C; }
    :host-context([data-theme="dark"]) .cal-cell--selected { background:#112A2A; }
    :host-context([data-theme="dark"]) .cal-day-num { color:#C8D6E5; }
    :host-context([data-theme="dark"]) .cal-more { color:#6B6B6B !important; }

    /* ── Day events panel (below calendar) ── */
    :host-context([data-theme="dark"]) .day-events-panel { border-top-color:#2A2A2A; }
    :host-context([data-theme="dark"]) .dep-title { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .dep-date-chip { background:#0D3330; color:#2FA8A0; }
    :host-context([data-theme="dark"]) .dep-empty { color:#4A6080; }
    :host-context([data-theme="dark"]) .dep-event { border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .dep-event:hover { background:#1A1A1A; }
    :host-context([data-theme="dark"]) .dep-ev-title { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .dep-ev-meta { color:#6B6B6B !important; }

    /* ── Module section cards ── */
    :host-context([data-theme="dark"]) .pl-card { background:#111111 !important; box-shadow:0 4px 20px rgba(0,0,0,.3); }
    :host-context([data-theme="dark"]) .pl-card-ttl { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .pl-card-bdg { background:#0D3330; color:#2FA8A0; }

    /* ── Inner tabs ── */
    :host-context([data-theme="dark"]) .itabs { border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .itab { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .itab.act { color:#2FA8A0; border-bottom-color:#2FA8A0; }
    :host-context([data-theme="dark"]) .itab:hover:not(.act) { color:#A0A0A0 !important; }

    /* ── Tables ── */
    :host-context([data-theme="dark"]) .tbl-wrap { background:#111111 !important; border-radius:0 0 12px 12px; overflow:hidden; }
    :host-context([data-theme="dark"]) table { background:#111111 !important; }
    :host-context([data-theme="dark"]) thead tr { background:#1A1A1A !important; }
    :host-context([data-theme="dark"]) thead th {
      color:#6B6B6B !important;
      border-bottom:1px solid #2A2A2A !important;
      border-top:none;
    }
    :host-context([data-theme="dark"]) tbody tr { background:#111111 !important; }
    :host-context([data-theme="dark"]) tbody tr:hover { background:rgba(47,168,160,.06) !important; }
    :host-context([data-theme="dark"]) tbody td { color:#A0A0A0 !important; border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) tbody tr:last-child td { border-bottom:none; }
    :host-context([data-theme="dark"]) .td-b { color:#FFFFFF !important; }

    /* ── Progress bars ── */
    :host-context([data-theme="dark"]) .prog-bg { background:#1A1A1A !important; }

    /* ── Action buttons ── */
    :host-context([data-theme="dark"]) .act-btn { color:#4A6080; }
    :host-context([data-theme="dark"]) .act-btn:hover { background:#1A1A1A !important; color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .act-btn.del:hover { background:#3B0A0A; color:#F87171; }

    /* ── List items ── */
    :host-context([data-theme="dark"]) .list-item { border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .li-title { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .li-sub { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .li-avatar { background:#0D3330; color:#2FA8A0; }

    /* ── Date box ── */
    :host-context([data-theme="dark"]) .date-box { background:#0D3330; }

    /* ── Budget rows ── */
    :host-context([data-theme="dark"]) .bgt-row { border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .bgt-dept { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .bgt-pct { color:#2FA8A0; }

    /* ── Mentor rows ── */
    :host-context([data-theme="dark"]) .mentor-row { border-bottom-color:#2A2A2A !important; }

    /* ── State / empty boxes ── */
    :host-context([data-theme="dark"]) .state-box { color:#4A6080; }
    :host-context([data-theme="dark"]) .spinner { border-color:#2A2A2A !important; border-top-color:#2FA8A0; }

    /* ── Right panel ── */
    :host-context([data-theme="dark"]) .rp { background:#111111 !important; box-shadow:-8px 0 40px rgba(0,0,0,.6) !important; }
    :host-context([data-theme="dark"]) .rp-hd { border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .rp-t { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .rp-cls { background:#1A1A1A !important; color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .rp-cls:hover { background:#243E58; }
    :host-context([data-theme="dark"]) .rp-sec { color:#FFFFFF !important; border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .rp-row { border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .rp-lbl { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .rp-val { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .rp-ft { border-top-color:#243E58; }

    /* ── Create form ── */
    :host-context([data-theme="dark"]) .cf-lbl { color:#C8D6E5; }
    :host-context([data-theme="dark"]) .cf-in { background:#1A1A1A !important; border-color:#2A2A2A !important; color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .cf-in:focus { border-color:#2FA8A0; box-shadow:0 0 0 3px rgba(47,168,160,.15); }
    :host-context([data-theme="dark"]) .cf-in::placeholder { color:#3A5170; }
    :host-context([data-theme="dark"]) .cf-sel { background:#1A1A1A !important; border-color:#2A2A2A !important; color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .cf-sel:focus { border-color:#2FA8A0; }
    :host-context([data-theme="dark"]) .cf-sel option { background:#111111 !important; color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .cf-ta { background:#1A1A1A !important; border-color:#2A2A2A !important; color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .cf-ta:focus { border-color:#2FA8A0; }
    :host-context([data-theme="dark"]) .cf-err { background:#2D0F0F; border-color:#5B1818; color:#F87171; }

    /* ── Calendar view switcher ── */
    :host-context([data-theme="dark"]) .cal-vsw { background:#1A1A1A !important; }
    :host-context([data-theme="dark"]) .cal-vsw-btn { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .cal-vsw-btn.act { background:#243E58; color:#2FA8A0; box-shadow:0 1px 4px rgba(0,0,0,.4); }
    :host-context([data-theme="dark"]) .cal-vsw-btn:hover:not(.act) { color:#A0A0A0 !important; }

    /* ── Weekly view ── */
    :host-context([data-theme="dark"]) .cal-week-header { border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .cal-tg { border-right-color:#243E58; }
    :host-context([data-theme="dark"]) .cal-week-day-hd { border-right-color:#243E58; }
    :host-context([data-theme="dark"]) .cal-wdh-name { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .cal-wdh-num { color:#C8D6E5; }
    :host-context([data-theme="dark"]) .cal-allday-row { background:#172030; border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .cal-allday-tg { border-right-color:#243E58; color:#3A5170; }
    :host-context([data-theme="dark"]) .cal-allday-cell { border-right-color:#1E3448; }
    :host-context([data-theme="dark"]) .cal-time-row { border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .cal-tg-cell { border-right-color:#243E58; color:#3A5170; }
    :host-context([data-theme="dark"]) .cal-day-col { border-right-color:#1E3448; }
    :host-context([data-theme="dark"]) .cal-day-col:hover { background:#172030; }

    /* ── Daily view ── */
    :host-context([data-theme="dark"]) .cal-day-allday { background:#172030; border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .cal-day-allday-lbl { color:#3A5170; }
    :host-context([data-theme="dark"]) .cal-day-row { border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .cal-day-row:hover { background:#172030; }
    :host-context([data-theme="dark"]) .cal-day-tg { border-right-color:#243E58; color:#3A5170; }
    :host-context([data-theme="dark"]) .cal-day-empty { color:#3A5170; }

    /* ── Table utility dark overrides ── */
    :host-context([data-theme="dark"]) .td-gap-pos  { color:#4ADE80; }
    :host-context([data-theme="dark"]) .td-gap-neg  { color:#F87171; }
    :host-context([data-theme="dark"]) .td-reqid    { color:#6B6B6B !important; }
    :host-context([data-theme="dark"]) .cal-today-hd  { background:#0D2E2C; }
    :host-context([data-theme="dark"]) .cal-today-col { background:#0A2422; }
    :host-context([data-theme="dark"]) .cal-day-title-bar { background:#172030; border-bottom-color:#2A2A2A !important; }
    :host-context([data-theme="dark"]) .cal-day-title-text  { color:#FFFFFF !important; }
    :host-context([data-theme="dark"]) .cal-day-title-count { color:#6B6B6B !important; }

    /* ── Chip colours in dark mode ── */
    :host-context([data-theme="dark"]) .ch-green  { background:#052E16; color:#4ADE80; }
    :host-context([data-theme="dark"]) .ch-blue   { background:#172554; color:#93C5FD; }
    :host-context([data-theme="dark"]) .ch-amber  { background:#451A03; color:#FCD34D; }
    :host-context([data-theme="dark"]) .ch-red    { background:#3B0A0A; color:#FCA5A5; }
    :host-context([data-theme="dark"]) .ch-purple { background:#2E1065; color:#C4B5FD; }
    :host-context([data-theme="dark"]) .ch-gray   { background:#1E2D3D; color:#A0A0A0 !important; }
    :host-context([data-theme="dark"]) .ch-teal   { background:#0D3330; color:#2FA8A0; }
  `],
  template: `
  <div class="backdrop" *ngIf="showPanel" (click)="closePanel()"></div>
  <div class="toast" *ngIf="toast">{{ toast }}</div>

  <!-- ══ Right Panel ══ -->
  <div class="rp" *ngIf="showPanel">
    <div class="rp-hd">
      <span class="rp-t">{{ panelType === 'create' ? createTitle : ('PLANNING.PANEL_EVENT_DETAIL' | translate) }}</span>
      <button class="rp-cls" (click)="closePanel()"><i class="bx bx-x"></i></button>
    </div>

    <!-- Event detail -->
    <div class="rp-bd" *ngIf="panelType === 'event' && selected">
      <div class="rp-sec">{{ 'PLANNING.SECTION_EVENT_INFO' | translate }}</div>
      <div class="rp-row"><span class="rp-lbl"><i class="bx bx-font"></i> {{ 'PLANNING.FIELD_TITLE' | translate }}</span><span class="rp-val">{{ selected.title }}</span></div>
      <div class="rp-row"><span class="rp-lbl"><i class="bx bx-category"></i> {{ 'PLANNING.FIELD_TYPE' | translate }}</span>
        <span class="chip" [ngClass]="typeChipClass(selected.type)">{{ selected.type }}</span>
      </div>
      <div class="rp-row"><span class="rp-lbl"><i class="bx bx-calendar"></i> {{ 'PLANNING.FIELD_START' | translate }}</span>
        <span class="rp-val">{{ formatDateDisplay(selected.startDateTime) }}</span>
      </div>
      <div class="rp-row" *ngIf="selected.endDateTime">
        <span class="rp-lbl"><i class="bx bx-calendar-check"></i> {{ 'PLANNING.FIELD_END' | translate }}</span>
        <span class="rp-val">{{ formatDateDisplay(selected.endDateTime) }}</span>
      </div>
      <div class="rp-row" *ngIf="selected.location">
        <span class="rp-lbl"><i class="bx bx-map-pin"></i> {{ 'PLANNING.FIELD_LOCATION' | translate }}</span>
        <span class="rp-val">{{ selected.location }}</span>
      </div>
      <div class="rp-row" *ngIf="selected.description">
        <span class="rp-lbl"><i class="bx bx-note"></i> {{ 'PLANNING.FIELD_DESCRIPTION' | translate }}</span>
        <span class="rp-val" style="white-space:pre-wrap">{{ selected.description }}</span>
      </div>
      <div class="rp-row" *ngIf="selected.createdBy">
        <span class="rp-lbl"><i class="bx bx-user"></i> {{ 'PLANNING.FIELD_CREATED_BY' | translate }}</span>
        <span class="rp-val">{{ selected.createdBy.firstname }} {{ selected.createdBy.lastname }}</span>
      </div>
    </div>

    <!-- Generic row detail panels -->
    <div class="rp-bd" *ngIf="panelType !== 'event' && panelType !== 'create' && selected">
      <div class="rp-sec">{{ 'PLANNING.SECTION_DETAILS' | translate }}</div>
      <div class="rp-row" *ngIf="selected.dept"><span class="rp-lbl"><i class="bx bx-buildings"></i> {{ 'PLANNING.FIELD_DEPARTMENT' | translate }}</span><span class="rp-val">{{ selected.dept }}</span></div>
      <div class="rp-row" *ngIf="selected.employee"><span class="rp-lbl"><i class="bx bx-user"></i> {{ 'PLANNING.FIELD_EMPLOYEE' | translate }}</span><span class="rp-val">{{ selected.employee }}</span></div>
      <div class="rp-row" *ngIf="selected.position"><span class="rp-lbl"><i class="bx bx-briefcase"></i> {{ 'PLANNING.FIELD_POSITION' | translate }}</span><span class="rp-val">{{ selected.position }}</span></div>
      <div class="rp-row" *ngIf="selected.skill"><span class="rp-lbl"><i class="bx bx-book"></i> {{ 'PLANNING.FIELD_SKILL' | translate }}</span><span class="rp-val">{{ selected.skill }}</span></div>
      <div class="rp-row" *ngIf="selected.currentRole"><span class="rp-lbl"><i class="bx bx-briefcase"></i> {{ 'PLANNING.FIELD_CURRENT_ROLE' | translate }}</span><span class="rp-val">{{ selected.currentRole }}</span></div>
      <div class="rp-row" *ngIf="selected.targetRole"><span class="rp-lbl"><i class="bx bx-trending-up"></i> {{ 'PLANNING.FIELD_TARGET_ROLE' | translate }}</span><span class="rp-val">{{ selected.targetRole }}</span></div>
      <div class="rp-row" *ngIf="selected.status"><span class="rp-lbl"><i class="bx bx-check-circle"></i> {{ 'PLANNING.FIELD_STATUS' | translate }}</span><span class="rp-val">{{ selected.status }}</span></div>
    </div>

    <!-- Create form -->
    <ng-container *ngIf="panelType === 'create'">
      <div class="rp-bd" style="padding-bottom:0">
        <div class="cf-err" *ngIf="saveError"><i class="bx bx-error-circle"></i> {{ saveError }}</div>

        <!-- Calendar event create -->
        <ng-container *ngIf="activeView === 'calendar'">
          <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.CAL_FORM_TITLE' | translate }}</label>
            <input class="cf-in" [(ngModel)]="createForm.title" [placeholder]="'PLANNING.CAL_FORM_EVENT_TITLE_PH' | translate"/></div>
          <div class="cf-row">
            <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.CAL_FORM_TYPE' | translate }}</label>
              <select class="cf-sel" [(ngModel)]="createForm.type">
                <option value="MEETING">{{ 'PLANNING.CAL_TYPE_MEETING' | translate }}</option><option value="TRAINING">{{ 'PLANNING.CAL_TYPE_TRAINING' | translate }}</option>
                <option value="INTERVIEW">{{ 'PLANNING.CAL_TYPE_INTERVIEW' | translate }}</option><option value="HOLIDAY">{{ 'PLANNING.CAL_TYPE_HOLIDAY' | translate }}</option>
                <option value="DEADLINE">{{ 'PLANNING.CAL_TYPE_DEADLINE' | translate }}</option><option value="OTHER">{{ 'PLANNING.CAL_TYPE_OTHER' | translate }}</option>
              </select></div>
            <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.CAL_FORM_START_DATE' | translate }}</label>
              <input class="cf-in" type="datetime-local" [(ngModel)]="createForm.startDateTime"/></div>
          </div>
          <div class="cf-row">
            <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.CAL_FORM_END_DATE' | translate }}</label>
              <input class="cf-in" type="datetime-local" [(ngModel)]="createForm.endDateTime"/></div>
            <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.CAL_FORM_LOCATION' | translate }}</label>
              <input class="cf-in" [(ngModel)]="createForm.location" [placeholder]="'PLANNING.CAL_FORM_LOCATION_PH' | translate"/></div>
          </div>
          <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.CAL_FORM_DESCRIPTION' | translate }}</label>
            <textarea class="cf-ta" [(ngModel)]="createForm.description" [placeholder]="'PLANNING.CAL_FORM_DESCRIPTION_PH' | translate"></textarea></div>
        </ng-container>

        <!-- Workforce create -->
        <ng-container *ngIf="activeView === 'workforce'">
          <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.WF_FORM_DEPT' | translate }}</label>
            <select class="cf-sel" [(ngModel)]="createForm.dept">
              <option value="">{{ 'PLANNING.WF_SELECT_DEPT' | translate }}</option>
              <option *ngFor="let d of deptOptions">{{d}}</option>
            </select></div>
          <div class="cf-row">
            <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.WF_FORM_CURRENT_HC' | translate }}</label>
              <input class="cf-in" type="number" [(ngModel)]="createForm.current" placeholder="0"/></div>
            <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.WF_FORM_PLANNED_HC' | translate }}</label>
              <input class="cf-in" type="number" [(ngModel)]="createForm.planned" placeholder="0"/></div>
          </div>
          <div class="cf-row">
            <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.WF_FORM_BUDGET' | translate }}</label>
              <input class="cf-in" [(ngModel)]="createForm.budget" placeholder="$0.00"/></div>
            <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.WF_FORM_REVIEW_DATE' | translate }}</label>
              <input class="cf-in" type="date" [(ngModel)]="createForm.reviewDate"/></div>
          </div>
          <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.WF_FORM_NOTES' | translate }}</label>
            <textarea class="cf-ta" [(ngModel)]="createForm.notes"></textarea></div>
        </ng-container>

        <!-- Training create -->
        <ng-container *ngIf="activeView === 'training'">
          <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.TR_FORM_EMPLOYEE' | translate }}</label>
            <input class="cf-in" [(ngModel)]="createForm.employee" [placeholder]="'PLANNING.TR_FORM_EMPLOYEE_PH' | translate"/></div>
          <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.TR_FORM_SKILL_GAP' | translate }}</label>
            <input class="cf-in" [(ngModel)]="createForm.skill" [placeholder]="'PLANNING.TR_FORM_SKILL_PH' | translate"/></div>
          <div class="cf-row">
            <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.TR_FORM_PRIORITY' | translate }}</label>
              <select class="cf-sel" [(ngModel)]="createForm.priority">
                <option>{{ 'PLANNING.TR_PRIORITY_CRITICAL' | translate }}</option><option>{{ 'PLANNING.TR_PRIORITY_HIGH' | translate }}</option><option>{{ 'PLANNING.TR_PRIORITY_MEDIUM' | translate }}</option><option>{{ 'PLANNING.TR_PRIORITY_LOW' | translate }}</option>
              </select></div>
            <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.TR_FORM_DEADLINE' | translate }}</label>
              <input class="cf-in" type="date" [(ngModel)]="createForm.deadline"/></div>
          </div>
        </ng-container>

        <!-- Career create -->
        <ng-container *ngIf="activeView === 'career'">
          <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.CAR_FORM_EMPLOYEE' | translate }}</label>
            <input class="cf-in" [(ngModel)]="createForm.employee" [placeholder]="'PLANNING.CAR_FORM_EMPLOYEE_PH' | translate"/></div>
          <div class="cf-row">
            <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.CAR_FORM_CURRENT_ROLE' | translate }}</label>
              <input class="cf-in" [(ngModel)]="createForm.currentRole" [placeholder]="'PLANNING.CAR_FORM_CURRENT_ROLE_PH' | translate"/></div>
            <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.CAR_FORM_TARGET_ROLE' | translate }}</label>
              <input class="cf-in" [(ngModel)]="createForm.targetRole" [placeholder]="'PLANNING.CAR_FORM_TARGET_ROLE_PH' | translate"/></div>
          </div>
          <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.CAR_FORM_TIMELINE' | translate }}</label>
            <input class="cf-in" [(ngModel)]="createForm.timeline" [placeholder]="'PLANNING.CAR_FORM_TIMELINE_PH' | translate"/></div>
        </ng-container>

        <!-- Recruitment create -->
        <ng-container *ngIf="activeView === 'recruitment'">
          <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.REC_FORM_POSITION' | translate }}</label>
            <input class="cf-in" [(ngModel)]="createForm.position" [placeholder]="'PLANNING.REC_FORM_POSITION_PH' | translate"/></div>
          <div class="cf-row">
            <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.REC_FORM_DEPT' | translate }}</label>
              <select class="cf-sel" [(ngModel)]="createForm.dept">
                <option value="">{{ 'PLANNING.REC_SELECT_DEPT' | translate }}</option>
                <option *ngFor="let d of deptOptions">{{d}}</option>
              </select></div>
            <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.REC_FORM_TARGET_DATE' | translate }}</label>
              <input class="cf-in" type="date" [(ngModel)]="createForm.targetDate"/></div>
          </div>
          <div class="cf-row">
            <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.REC_FORM_HC' | translate }}</label>
              <input class="cf-in" type="number" [(ngModel)]="createForm.hc" placeholder="1"/></div>
            <div class="cf-field"><label class="cf-lbl">{{ 'PLANNING.REC_FORM_BUDGET' | translate }}</label>
              <input class="cf-in" [(ngModel)]="createForm.budget" placeholder="$0"/></div>
          </div>
        </ng-container>
      </div>
      <div class="rp-ft">
        <button class="btn-cancel" (click)="closePanel()">{{ 'PLANNING.BTN_CANCEL' | translate }}</button>
        <button class="btn-save" [disabled]="saving" (click)="submitCreate()">
          {{ saving ? ('PLANNING.BTN_SAVING' | translate) : ('PLANNING.BTN_CREATE' | translate) }}
        </button>
      </div>
    </ng-container>
    <div class="rp-ft" *ngIf="panelType !== 'create'">
      <button class="btn-cancel" (click)="closePanel()">{{ 'PLANNING.BTN_CLOSE' | translate }}</button>
    </div>
  </div>

  <!-- ══════════ PAGE ══════════ -->
  <div class="page">

    <!-- Header -->
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
      <div class="page-header" style="flex:1;margin-bottom:0;">
        <h4 class="page-title">{{ 'PLANNING.PLANNING_HEADER' | translate }}</h4>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;padding-top:10px;">
        <app-wall-clock></app-wall-clock>
        <div class="ph-right">
          <button class="btn-ghost" style="border:1.5px solid #E2E8F0" (click)="exportData()"><i class="bx bx-export"></i> Export</button>
          <button class="btn-prim" (click)="openCreate()"><i class="bx bx-plus"></i> New Event</button>
        </div>
      </div>
    </div>

    <!-- KPI strip -->
    <div class="kpi-strip" *ngIf="!loading">
      <div class="kpi">
        <div class="kpi-ico ico-teal"><i class="bx bx-calendar-event"></i></div>
        <div><div class="kpi-v">{{ allEvents.length }}</div><div class="kpi-l">Total Events</div></div>
      </div>
      <div class="kpi">
        <div class="kpi-ico ico-blue"><i class="bx bx-group"></i></div>
        <div><div class="kpi-v">{{ totalHC }}</div><div class="kpi-l">Total Headcount</div></div>
      </div>
      <div class="kpi">
        <div class="kpi-ico ico-purple"><i class="bx bx-chalkboard"></i></div>
        <div><div class="kpi-v">{{ trainingNeeds.length }}</div><div class="kpi-l">Training Needs</div></div>
      </div>
      <div class="kpi">
        <div class="kpi-ico ico-amber"><i class="bx bx-user-plus"></i></div>
        <div><div class="kpi-v">{{ hiringRequests.length }}</div><div class="kpi-l">Open Positions</div></div>
      </div>
    </div>

    <!-- View tabs -->
    <div class="view-tabs">
      <button class="vt" [class.vt--active]="activeView==='calendar'" (click)="activeView='calendar'">
        <span class="vt-icon"><i class="bx bx-calendar"></i></span> Calendar
      </button>
      <button class="vt" [class.vt--active]="activeView==='workforce'" (click)="activeView='workforce'">
        <span class="vt-icon"><i class="bx bx-building-house"></i></span> Workforce
      </button>
      <button class="vt" [class.vt--active]="activeView==='training'" (click)="activeView='training'">
        <span class="vt-icon"><i class="bx bx-chalkboard"></i></span> Training
      </button>
      <button class="vt" [class.vt--active]="activeView==='career'" (click)="activeView='career'">
        <span class="vt-icon"><i class="bx bx-trending-up"></i></span> Career
      </button>
      <button class="vt" [class.vt--active]="activeView==='recruitment'" (click)="activeView='recruitment'">
        <span class="vt-icon"><i class="bx bx-user-plus"></i></span> Recruitment
      </button>
    </div>

    <!-- Loading / Error -->
    <div class="state-box" *ngIf="loading">
      <div class="spinner"></div>Loading planning data…
    </div>
    <div class="state-box" style="color:#EF4444" *ngIf="!loading && error">
      <i class="bx bx-error-circle"></i> {{ error }}
    </div>

    <!-- ═══════════ CALENDAR VIEW ═══════════ -->
    <ng-container *ngIf="!loading && activeView==='calendar'">
      <div class="cal-wrap">

        <!-- Toolbar -->
        <div class="cal-toolbar">
          <div class="cal-nav">
            <button class="cal-nav-btn" (click)="prevPeriod()"><i class="bx bx-chevron-left"></i></button>
            <span class="cal-month-label">{{ calLabel }}</span>
            <button class="cal-nav-btn" (click)="nextPeriod()"><i class="bx bx-chevron-right"></i></button>
            <button class="cal-today-btn" (click)="goToday()">{{ 'PLANNING.CAL_TODAY_BTN' | translate }}</button>
          </div>
          <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
            <!-- View switcher -->
            <div class="cal-vsw">
              <button class="cal-vsw-btn" [class.act]="calView==='daily'"   (click)="setCalView('daily')">
                <i class="bx bx-calendar-day" style="vertical-align:middle;margin-right:3px"></i>Daily
              </button>
              <button class="cal-vsw-btn" [class.act]="calView==='weekly'"  (click)="setCalView('weekly')">
                <i class="bx bx-calendar-week" style="vertical-align:middle;margin-right:3px"></i>Weekly
              </button>
              <button class="cal-vsw-btn" [class.act]="calView==='monthly'" (click)="setCalView('monthly')">
                <i class="bx bx-calendar" style="vertical-align:middle;margin-right:3px"></i>Monthly
              </button>
            </div>
            <!-- Legend -->
            <div class="cal-legend">
              <div class="leg-item" *ngFor="let l of typeLegend">
                <span class="leg-dot" [style.background]="l.color"></span> {{ l.label }}
              </div>
            </div>
          </div>
        </div>

        <!-- ══ MONTHLY VIEW ══ -->
        <ng-container *ngIf="calView==='monthly'">
          <!-- Day of week header -->
          <div class="cal-dow">
            <div class="cal-dow-cell" *ngFor="let d of ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']">{{ d }}</div>
          </div>

          <!-- Day grid -->
          <div class="cal-grid">
            <div class="cal-cell"
                 *ngFor="let day of calendarDays"
                 [class.cal-cell--other]="!day.cur"
                 [class.cal-cell--today]="isToday(day.date)"
                 [class.cal-cell--selected]="isSameDay(day.date, selectedDay)"
                 (click)="selectDay(day)">
              <span class="cal-day-num">{{ day.date.getDate() }}</span>
              <div class="cal-events">
                <div class="cal-pill"
                     *ngFor="let ev of day.events.slice(0,3)"
                     [style.background]="typeColor(ev.type) + '20'"
                     [style.color]="typeColorDark(ev.type)"
                     (click)="openEventDetail(ev); $event.stopPropagation()">
                  <span class="cal-pill-dot" [style.background]="typeColor(ev.type)"></span>
                  {{ ev.title | slice:0:22 }}{{ ev.title.length > 22 ? '…' : '' }}
                </div>
                <span class="cal-more" *ngIf="day.events.length > 3"
                      (click)="selectDay(day); $event.stopPropagation()">
                  +{{ day.events.length - 3 }} more
                </span>
              </div>
            </div>
          </div>

          <!-- Selected day event list -->
          <div class="day-events-panel" *ngIf="selectedDay">
            <div class="dep-title">
              <i class="bx bx-calendar-event" style="color:#1B7872;"></i>
              Events for
              <span class="dep-date-chip">{{ selectedDay | date:'EEEE, MMMM d, y' }}</span>
              <span style="color:#6B6B6B !important;font-weight:400;font-size:13px;margin-left:4px;">
                ({{ selectedDayEvents.length }} event{{ selectedDayEvents.length !== 1 ? 's' : '' }})
              </span>
            </div>
            <div class="dep-empty" *ngIf="selectedDayEvents.length === 0">
              <i class="bx bx-calendar-x" style="font-size:22px;vertical-align:middle;margin-right:8px;"></i>
              No events on this day. Click "New Event" to add one.
            </div>
            <div class="dep-event" *ngFor="let ev of selectedDayEvents" (click)="openEventDetail(ev)">
              <div class="dep-type-badge" [style.background]="typeColor(ev.type)+'20'"
                   [style.color]="typeColorDark(ev.type)">
                <i class="bx" [ngClass]="typeIcon(ev.type)"></i>
              </div>
              <div style="flex:1;min-width:0;">
                <div class="dep-ev-title">{{ ev.title }}</div>
                <div class="dep-ev-meta">
                  {{ formatDateDisplay(ev.startDateTime) }}
                  <span *ngIf="ev.location"> · {{ ev.location }}</span>
                </div>
              </div>
              <span class="dep-ev-chip" [style.background]="typeColor(ev.type)+'20'"
                    [style.color]="typeColorDark(ev.type)">{{ ev.type }}</span>
            </div>
          </div>
        </ng-container>

        <!-- ══ WEEKLY VIEW ══ -->
        <ng-container *ngIf="calView==='weekly'">
          <div class="cal-week-wrap">
            <!-- Day headers -->
            <div class="cal-week-header">
              <div class="cal-tg"></div>
              <div class="cal-week-day-hd" *ngFor="let wd of weekDays"
                   [class.cal-today-hd]="isToday(wd.date)">
                <div class="cal-wdh-name">{{ wd.date | date:'EEE' }}</div>
                <div class="cal-wdh-num" [class.today]="isToday(wd.date)">{{ wd.date.getDate() }}</div>
              </div>
            </div>
            <!-- All-day row (shown only when there are all-day events) -->
            <div class="cal-allday-row" *ngIf="weekHasAllDay">
              <div class="cal-allday-tg">all-day</div>
              <div class="cal-allday-cell" *ngFor="let wd of weekDays">
                <div class="cal-pill" *ngFor="let ev of wd.allDayEvents"
                     [style.background]="typeColor(ev.type)+'20'"
                     [style.color]="typeColorDark(ev.type)"
                     (click)="openEventDetail(ev)">
                  <span class="cal-pill-dot" [style.background]="typeColor(ev.type)"></span>
                  {{ ev.title | slice:0:16 }}{{ ev.title.length > 16 ? '…' : '' }}
                </div>
              </div>
            </div>
            <!-- Time grid -->
            <div class="cal-week-body">
              <div class="cal-time-row" *ngFor="let h of calHours">
                <div class="cal-tg-cell">{{ fmtHour(h) }}:00</div>
                <div class="cal-day-col" *ngFor="let wd of weekDays"
                     [class.cal-today-col]="isToday(wd.date)"
                     (click)="drillDay(wd.date, h)">
                  <div class="cal-ev-block" *ngFor="let ev of wd.eventsByHour[h]"
                       [style.background]="typeColor(ev.type)+'22'"
                       [style.color]="typeColorDark(ev.type)"
                       [style.border-left-color]="typeColor(ev.type)"
                       (click)="openEventDetail(ev); $event.stopPropagation()">
                    {{ ev.title | slice:0:22 }}{{ ev.title.length > 22 ? '…' : '' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- ══ DAILY VIEW ══ -->
        <ng-container *ngIf="calView==='daily'">
          <div class="cal-day-wrap">
            <!-- Day title bar -->
            <div class="cal-day-title-bar">
              <span class="cal-day-title-text">{{ calDayDate | date:'EEEE' }}</span>
              <span class="dep-date-chip">{{ calDayDate | date:'MMMM d, y' }}</span>
              <span class="cal-day-title-count">{{ dayTotalEvents }} event{{ dayTotalEvents !== 1 ? 's' : '' }}</span>
            </div>
            <!-- All-day events -->
            <div class="cal-day-allday" *ngIf="dayAllDayEvents.length > 0">
              <span class="cal-day-allday-lbl">{{ 'PLANNING.CAL_ALL_DAY' | translate }}</span>
              <div class="cal-pill" *ngFor="let ev of dayAllDayEvents"
                   [style.background]="typeColor(ev.type)+'20'"
                   [style.color]="typeColorDark(ev.type)"
                   (click)="openEventDetail(ev)">
                <span class="cal-pill-dot" [style.background]="typeColor(ev.type)"></span>
                {{ ev.title }}
              </div>
            </div>
            <!-- Time slots -->
            <div class="cal-day-body">
              <div class="cal-day-row" *ngFor="let slot of dayHours">
                <div class="cal-day-tg">{{ fmtHour(slot.hour) }}:00</div>
                <div class="cal-day-slot">
                  <div class="cal-day-ev" *ngFor="let ev of slot.events"
                       [style.background]="typeColor(ev.type)+'18'"
                       [style.border-left-color]="typeColor(ev.type)"
                       (click)="openEventDetail(ev)">
                    <span style="width:8px;height:8px;border-radius:50%;flex-shrink:0"
                          [style.background]="typeColor(ev.type)"></span>
                    <span class="cal-day-ev-t" [style.color]="typeColorDark(ev.type)">{{ ev.title }}</span>
                    <span class="cal-day-ev-time" [style.color]="typeColorDark(ev.type)">
                      {{ ev.startDateTime | date:'HH:mm' }}
                      <span *ngIf="ev.endDateTime"> – {{ ev.endDateTime | date:'HH:mm' }}</span>
                    </span>
                    <span class="cal-day-chip"
                          [style.background]="typeColor(ev.type)+'22'"
                          [style.color]="typeColorDark(ev.type)">{{ ev.type }}</span>
                  </div>
                  <div class="cal-day-empty" *ngIf="slot.events.length === 0"></div>
                </div>
              </div>
            </div>
          </div>
        </ng-container>

      </div>
    </ng-container>

    <!-- ═══════════ WORKFORCE ═══════════ -->
    <ng-container *ngIf="!loading && activeView==='workforce'">
      <div class="pl-sec pl-two-col">
        <div class="pl-card">
          <div class="itabs">
            <button class="itab" [class.act]="wfTab==='hc'" (click)="wfTab='hc'">{{ 'PLANNING.ITAB_HC_PLAN' | translate }}</button>
            <button class="itab" [class.act]="wfTab==='budget'" (click)="wfTab='budget'">{{ 'PLANNING.ITAB_DEPT_BUDGET' | translate }}</button>
          </div>
          <div class="tbl-wrap" *ngIf="wfTab==='hc'">
            <table>
              <thead><tr><th>{{ 'PLANNING.TH_DEPARTMENT' | translate }}</th><th>{{ 'PLANNING.TH_CURRENT_HC' | translate }}</th><th>{{ 'PLANNING.TH_PLANNED_HC' | translate }}</th><th>{{ 'PLANNING.TH_GAP' | translate }}</th><th>{{ 'PLANNING.TH_STATUS' | translate }}</th></tr></thead>
              <tbody>
                <tr *ngIf="headcountPlans.length===0"><td colspan="5" style="text-align:center;padding:28px;color:#6B6B6B !important;">{{ 'PLANNING.EMPTY_HC_PLANS' | translate }}</td></tr>
                <tr *ngFor="let r of headcountPlans" (click)="openDetail(r,'workforce')">
                  <td class="td-b">{{ r.dept }}</td>
                  <td>{{ r.current }}</td>
                  <td>{{ r.planned }}</td>
                  <td [class.td-gap-pos]="r.gap >= 0" [class.td-gap-neg]="r.gap < 0">{{ r.gap > 0 ? '+' : '' }}{{ r.gap }}</td>
                  <td><span class="chip ch-green">{{ 'PLANNING.STATUS_ACTIVE' | translate }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pl-card-pad" *ngIf="wfTab==='budget'">
            <div class="bgt-row" *ngFor="let b of departmentBudgets">
              <span class="bgt-dept">{{ b.dept }}</span>
              <div class="bgt-bar"><div class="prog-bg"><div class="prog-fill" [style.width.%]="b.pct"></div></div></div>
              <span class="bgt-pct">{{ b.pct }}%</span>
            </div>
            <div *ngIf="departmentBudgets.length===0" style="color:#6B6B6B !important;text-align:center;padding:20px;">{{ 'PLANNING.EMPTY_DEPT_BUDGET' | translate }}</div>
          </div>
        </div>
        <div class="pl-card pl-card-pad">
          <div class="pl-card-hd"><span class="pl-card-ttl">{{ 'PLANNING.CARD_DEPT_DISTRIBUTION' | translate }}</span></div>
          <div class="bgt-row" *ngFor="let b of departmentBudgets">
            <span class="bgt-dept" style="width:110px">{{ b.dept }}</span>
            <div class="bgt-bar"><div class="prog-bg"><div class="prog-fill" [style.width.%]="b.pct"></div></div></div>
            <span class="bgt-pct">{{ b.pct }}%</span>
          </div>
        </div>
      </div>
    </ng-container>

    <!-- ═══════════ TRAINING ═══════════ -->
    <ng-container *ngIf="!loading && activeView==='training'">
      <div class="pl-sec pl-two-col">
        <div class="pl-card">
          <div class="itabs">
            <button class="itab" [class.act]="trTab==='needs'" (click)="trTab='needs'">{{ 'PLANNING.ITAB_TRAINING_NEEDS' | translate }}</button>
            <button class="itab" [class.act]="trTab==='sessions'" (click)="trTab='sessions'">{{ 'PLANNING.ITAB_SESSIONS' | translate }}</button>
            <button class="itab" [class.act]="trTab==='pdi'" (click)="trTab='pdi'">{{ 'PLANNING.ITAB_PDI_PROGRESS' | translate }}</button>
          </div>
          <div class="tbl-wrap" *ngIf="trTab==='needs'">
            <table>
              <thead><tr><th>{{ 'PLANNING.TH_EMPLOYEE' | translate }}</th><th>{{ 'PLANNING.TH_SKILL_GAP' | translate }}</th><th>{{ 'PLANNING.TH_PRIORITY' | translate }}</th><th>{{ 'PLANNING.TH_DEADLINE' | translate }}</th><th>{{ 'PLANNING.TH_STATUS' | translate }}</th><th></th></tr></thead>
              <tbody>
                <tr *ngIf="trainingNeeds.length===0"><td colspan="6" style="text-align:center;padding:28px;color:#6B6B6B !important;">{{ 'PLANNING.EMPTY_TRAINING_NEEDS' | translate }}</td></tr>
                <tr *ngFor="let r of trainingNeeds" (click)="openDetail(r,'training')">
                  <td class="td-b">{{ r.employee }}</td>
                  <td>{{ r.skill }}</td>
                  <td><span class="chip" [ngClass]="prioClass(r.priority)">{{ r.priority }}</span></td>
                  <td style="font-size:12.5px;">{{ r.deadline }}</td>
                  <td><span class="chip" [ngClass]="r.statusClass==='completed'?'ch-green':'ch-blue'">{{ r.status }}</span></td>
                  <td (click)="$event.stopPropagation()">
                    <button class="act-btn del" *ngIf="r._eventId" (click)="deletePlanRow(r)"><i class="bx bx-trash"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="tbl-wrap" *ngIf="trTab==='sessions'">
            <table>
              <thead><tr><th>{{ 'PLANNING.TH_DATE' | translate }}</th><th>{{ 'PLANNING.TH_SESSION' | translate }}</th><th>{{ 'PLANNING.TH_TRAINER' | translate }}</th><th>{{ 'PLANNING.TH_DURATION' | translate }}</th></tr></thead>
              <tbody>
                <tr *ngIf="trainingSessions.length===0"><td colspan="4" style="text-align:center;padding:28px;color:#6B6B6B !important;">{{ 'PLANNING.EMPTY_SESSIONS' | translate }}</td></tr>
                <tr *ngFor="let s of trainingSessions">
                  <td><div class="date-box"><span class="db-day">{{ s.day }}</span><span class="db-mon">{{ s.month }}</span></div></td>
                  <td class="td-b">{{ s.name }}</td>
                  <td>{{ s.trainer }}</td>
                  <td>{{ s.duration }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pl-card-pad" *ngIf="trTab==='pdi'">
            <div class="list-item" *ngFor="let p of pdiProgress">
              <div class="li-avatar">{{ p.name[0] }}</div>
              <div class="li-main">
                <div class="li-title">{{ p.name }}</div>
                <div class="li-sub">{{ p.role }}</div>
                <div class="prog-bg" style="margin-top:6px;"><div class="prog-fill" [style.width.%]="p.pct"></div></div>
              </div>
              <span style="font-size:13px;font-weight:700;color:#1B7872;">{{ p.pct }}%</span>
            </div>
            <div *ngIf="pdiProgress.length===0" style="color:#6B6B6B !important;text-align:center;padding:20px;">{{ 'PLANNING.EMPTY_PDI' | translate }}</div>
          </div>
        </div>
        <div class="pl-card pl-card-pad">
          <div class="pl-card-hd"><span class="pl-card-ttl">{{ 'PLANNING.CARD_UPCOMING_SESSIONS' | translate }}</span></div>
          <div class="list-item" *ngFor="let s of trainingSessions.slice(0,6)">
            <div class="date-box"><span class="db-day">{{ s.day }}</span><span class="db-mon">{{ s.month }}</span></div>
            <div class="li-main">
              <div class="li-title">{{ s.name }}</div>
              <div class="li-sub">{{ s.trainer }} · {{ s.duration }}</div>
            </div>
          </div>
          <div *ngIf="trainingSessions.length===0" class="dep-empty" style="padding:12px 0;">{{ 'PLANNING.EMPTY_SESSIONS_SCHEDULED' | translate }}</div>
        </div>
      </div>
    </ng-container>

    <!-- ═══════════ CAREER ═══════════ -->
    <ng-container *ngIf="!loading && activeView==='career'">
      <div class="pl-sec pl-two-col">
        <div class="pl-card">
          <div class="itabs">
            <button class="itab" [class.act]="carTab==='idp'" (click)="carTab='idp'">{{ 'PLANNING.ITAB_IDP' | translate }}</button>
            <button class="itab" [class.act]="carTab==='milestones'" (click)="carTab='milestones'">{{ 'PLANNING.ITAB_MILESTONES' | translate }}</button>
            <button class="itab" [class.act]="carTab==='mentorship'" (click)="carTab='mentorship'">{{ 'PLANNING.ITAB_MENTORSHIP' | translate }}</button>
          </div>
          <div class="tbl-wrap" *ngIf="carTab==='idp'">
            <table>
              <thead><tr><th>{{ 'PLANNING.TH_EMPLOYEE' | translate }}</th><th>{{ 'PLANNING.TH_CURRENT_ROLE' | translate }}</th><th>{{ 'PLANNING.TH_TARGET_ROLE' | translate }}</th><th>{{ 'PLANNING.TH_PROGRESS' | translate }}</th><th>{{ 'PLANNING.TH_STATUS' | translate }}</th></tr></thead>
              <tbody>
                <tr *ngIf="idpPlans.length===0"><td colspan="5" style="text-align:center;padding:28px;color:#6B6B6B !important;">{{ 'PLANNING.EMPTY_IDP' | translate }}</td></tr>
                <tr *ngFor="let r of idpPlans" (click)="openDetail(r,'career')">
                  <td class="td-b">{{ r.employee }}</td>
                  <td style="font-size:12.5px;">{{ r.currentRole }}</td>
                  <td style="font-size:12.5px;font-weight:600;color:#1B7872;">{{ r.targetRole }}</td>
                  <td>
                    <div style="display:flex;align-items:center;gap:6px;">
                      <div class="prog-bg" style="width:60px;"><div class="prog-fill" [style.width.%]="r.progress"></div></div>
                      <span style="font-size:12px;font-weight:700;color:#1B7872;">{{ r.progress }}%</span>
                    </div>
                  </td>
                  <td><span class="chip ch-blue">{{ r.status }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="tbl-wrap" *ngIf="carTab==='milestones'">
            <table>
              <thead><tr><th>{{ 'PLANNING.TH_MILESTONE' | translate }}</th><th>{{ 'PLANNING.TH_DATE' | translate }}</th><th>{{ 'PLANNING.TH_STATUS' | translate }}</th></tr></thead>
              <tbody>
                <tr *ngIf="careerMilestones.length===0"><td colspan="3" style="text-align:center;padding:28px;color:#6B6B6B !important;">{{ 'PLANNING.EMPTY_MILESTONES' | translate }}</td></tr>
                <tr *ngFor="let m of careerMilestones">
                  <td class="td-b">{{ m.title }}</td>
                  <td>{{ m.date }}</td>
                  <td><span class="chip" [ngClass]="m.dotClass==='done'?'ch-green':'ch-gray'">{{ m.status }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pl-card-pad" *ngIf="carTab==='mentorship'">
            <div class="mentor-row" *ngFor="let m of mentorships">
              <div class="li-avatar">{{ m.mentorInitials }}</div>
              <div class="li-main"><div class="li-title">{{ m.mentor }}</div><div class="li-sub">{{ m.mentorRole }}</div></div>
              <i class="bx bx-right-arrow-alt" style="font-size:18px;color:#CBD5E0;"></i>
              <div style="text-align:right;">
                <div class="li-title">{{ m.mentee }}</div>
                <div class="li-sub">{{ m.menteeRole }}</div>
              </div>
            </div>
            <div *ngIf="mentorships.length===0" style="color:#6B6B6B !important;text-align:center;padding:20px;">{{ 'PLANNING.EMPTY_MENTORSHIP' | translate }}</div>
          </div>
        </div>
        <div class="pl-card pl-card-pad">
          <div class="pl-card-hd"><span class="pl-card-ttl">{{ 'PLANNING.CARD_MENTORSHIP_PAIRS' | translate }}</span><span class="pl-card-bdg">{{ mentorships.length }} {{ 'PLANNING.ACTIVE_COUNT' | translate }}</span></div>
          <div class="mentor-row" *ngFor="let m of mentorships">
            <div class="li-avatar">{{ m.mentorInitials }}</div>
            <div class="li-main"><div class="li-title">{{ m.mentor }}</div><div class="li-sub">→ {{ m.mentee }}</div></div>
          </div>
          <div *ngIf="mentorships.length===0" style="color:#6B6B6B !important;text-align:center;padding:20px;">{{ 'PLANNING.EMPTY_PAIRS' | translate }}</div>
        </div>
      </div>
    </ng-container>

    <!-- ═══════════ RECRUITMENT ═══════════ -->
    <ng-container *ngIf="!loading && activeView==='recruitment'">
      <div class="pl-sec pl-two-col">
        <div class="pl-card">
          <div class="itabs">
            <button class="itab" [class.act]="recTab==='hiring'" (click)="recTab='hiring'">{{ 'PLANNING.ITAB_HIRING' | translate }}</button>
            <button class="itab" [class.act]="recTab==='pipeline'" (click)="recTab='pipeline'">{{ 'PLANNING.ITAB_PIPELINE' | translate }}</button>
          </div>
          <div class="tbl-wrap" *ngIf="recTab==='hiring'">
            <table>
              <thead><tr><th>{{ 'PLANNING.TH_REQ_ID' | translate }}</th><th>{{ 'PLANNING.TH_POSITION' | translate }}</th><th>{{ 'PLANNING.TH_DEPARTMENT' | translate }}</th><th>{{ 'PLANNING.TH_TARGET_DATE' | translate }}</th><th>{{ 'PLANNING.TH_STAGE' | translate }}</th><th></th></tr></thead>
              <tbody>
                <tr *ngIf="hiringRequests.length===0"><td colspan="6" style="text-align:center;padding:28px;color:#6B6B6B !important;">{{ 'PLANNING.EMPTY_HIRING' | translate }}</td></tr>
                <tr *ngFor="let r of hiringRequests" (click)="openDetail(r,'recruitment')">
                  <td class="td-reqid">{{ r.reqId }}</td>
                  <td class="td-b">{{ r.position }}</td>
                  <td>{{ r.dept }}</td>
                  <td style="font-size:12.5px;">{{ r.targetDate }}</td>
                  <td><span class="chip" [ngClass]="r.stageClass==='completed'?'ch-green':'ch-blue'">{{ r.stage }}</span></td>
                  <td (click)="$event.stopPropagation()">
                    <button class="act-btn del" *ngIf="r._eventId" (click)="deletePlanRow(r)"><i class="bx bx-trash"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pl-card-pad" *ngIf="recTab==='pipeline'">
            <div class="bgt-row" *ngFor="let s of pipelineStages">
              <span class="bgt-dept">{{ s.label }}</span>
              <div class="bgt-bar"><div class="prog-bg"><div class="prog-fill" [style.width.%]="(s.count / (pipelineStages[0]?.count || 1)) * 100" [style.background]="s.color"></div></div></div>
              <span class="bgt-pct">{{ s.count }}</span>
            </div>
          </div>
        </div>
        <div class="pl-card pl-card-pad">
          <div class="pl-card-hd"><span class="pl-card-ttl">{{ 'PLANNING.CARD_RECENT_EVENTS' | translate }}</span></div>
          <div class="list-item" *ngFor="let e of allEvents.slice(0,8)">
            <div class="dep-type-badge" [style.background]="typeColor(e.type)+'20'" [style.color]="typeColorDark(e.type)">
              <i class="bx" [ngClass]="typeIcon(e.type)"></i>
            </div>
            <div class="li-main">
              <div class="li-title">{{ e.title }}</div>
              <div class="li-sub">{{ formatDateDisplay(e.startDateTime) }}</div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>

  </div>
  `
})
export class PlanningComponent implements OnInit {

  today      = new Date();
  activeView = 'calendar';
  loading    = false;
  error: string | null = null;
  saving     = false;
  saveError: string | null = null;
  toast: string | null = null;

  // Inner tab state
  wfTab  = 'hc';
  trTab  = 'needs';
  carTab = 'idp';
  recTab = 'hiring';

  // Panel
  showPanel  = false;
  panelType  = '';
  selected: any = null;
  createTitle  = 'New Event';
  createForm: any = {};

  // Calendar state
  calYear  = new Date().getFullYear();
  calMonth = new Date().getMonth();
  selectedDay: Date | null = null;

  // Calendar view mode
  calView: 'monthly' | 'weekly' | 'daily' = 'monthly';
  calWeekStart: Date = this._getWeekStart(new Date());
  calDayDate: Date  = new Date();

  /** Hours displayed in weekly / daily time grid (07:00 → 21:00) */
  readonly calHours = Array.from({ length: 15 }, (_, i) => i + 7);

  // Data
  allEvents: any[] = [];
  deptOptions: string[] = [];

  headcountPlans:   any[] = [];
  departmentBudgets:any[] = [];
  workforceScenarios: any[] = [];

  trainingNeeds:    any[] = [];
  trainingSessions: any[] = [];
  pdiProgress:      any[] = [];

  idpPlans:         any[] = [];
  careerMilestones: any[] = [];
  mentorships:      any[] = [];

  pipelineStages:   any[] = [];
  hiringRequests:   any[] = [];

  // Computed KPIs
  get totalHC(): number { return this.headcountPlans.reduce((s, r) => s + r.current, 0); }

  private readonly TYPE_COLORS: Record<string,string> = {
    MEETING:   '#2FA8A0', INTERVIEW: '#3B82F6', TRAINING: '#8B5CF6',
    HOLIDAY:   '#22C55E', DEADLINE:  '#F97316', OTHER:    '#94A3B8',
  };
  private readonly TYPE_COLORS_DARK: Record<string,string> = {
    MEETING:   '#1B7872', INTERVIEW: '#1E40AF', TRAINING: '#6D28D9',
    HOLIDAY:   '#15803D', DEADLINE:  '#C2410C', OTHER:    '#64748B',
  };
  private readonly TYPE_ICONS: Record<string,string> = {
    MEETING:   'bx-group',       INTERVIEW:  'bx-user-voice',
    TRAINING:  'bx-chalkboard',  HOLIDAY:    'bx-sun',
    DEADLINE:  'bx-flag',        OTHER:      'bx-calendar',
  };

  readonly typeLegend = Object.entries(this.TYPE_COLORS).map(([t, c]) => ({
    label: t.charAt(0) + t.slice(1).toLowerCase(), color: c,
  }));

  constructor(
    private planningService: PlanningService,
    private collaborateurService: CollaborateurService,
    private confirmSvc: ConfirmService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    forkJoin({
      events:         this.planningService.getAllEvents(),
      collaborateurs: this.collaborateurService.getAll(),
    }).subscribe({
      next: ({ events, collaborateurs }) => {
        this.loading   = false;
        this.allEvents = events as any[];
        this._buildFromCollaborateurs(collaborateurs as any[]);
        this._buildFromEvents(events as any[]);
      },
      error: err => {
        this.loading = false;
        this.error   = err?.error?.message || 'Failed to load planning data.';
      },
    });
  }

  // ── Calendar helpers ──────────────────────────────────────────────────────

  get calMonthLabel(): string {
    return new Date(this.calYear, this.calMonth, 1)
      .toLocaleString('en', { month: 'long', year: 'numeric' });
  }

  get calendarDays(): CalDay[] {
    const days: CalDay[] = [];
    const first    = new Date(this.calYear, this.calMonth, 1);
    const lastDate = new Date(this.calYear, this.calMonth + 1, 0).getDate();
    // Monday-based: 0=Mon … 6=Sun
    let dow = first.getDay(); // 0=Sun
    dow = dow === 0 ? 6 : dow - 1;

    for (let i = dow - 1; i >= 0; i--) {
      const d = new Date(this.calYear, this.calMonth, -i);
      days.push({ date: d, cur: false, events: [] });
    }
    for (let d = 1; d <= lastDate; d++) {
      const date = new Date(this.calYear, this.calMonth, d);
      days.push({ date, cur: true, events: this._eventsForDay(date) });
    }
    const fill = 42 - days.length;
    for (let d = 1; d <= fill; d++) {
      const date = new Date(this.calYear, this.calMonth + 1, d);
      days.push({ date, cur: false, events: this._eventsForDay(date) });
    }
    return days;
  }

  get selectedDayEvents(): any[] {
    if (!this.selectedDay) return [];
    return this._eventsForDay(this.selectedDay);
  }

  private _eventsForDay(date: Date): any[] {
    return this.allEvents.filter(ev => {
      if (!ev.startDateTime) return false;
      const d = new Date(ev.startDateTime);
      return d.getFullYear() === date.getFullYear()
          && d.getMonth()    === date.getMonth()
          && d.getDate()     === date.getDate();
    });
  }

  // ── Calendar view switching ───────────────────────────────────────────────

  setCalView(v: 'monthly' | 'weekly' | 'daily'): void {
    this.calView = v;
    if (v === 'weekly') {
      // Sync week start to the currently selected/viewed day
      const ref = this.selectedDay ?? new Date(this.calYear, this.calMonth, 1);
      this.calWeekStart = this._getWeekStart(ref);
    }
    if (v === 'daily') {
      this.calDayDate = this.selectedDay ?? new Date();
    }
  }

  /** Navigate back by month / week / day depending on active view. */
  prevPeriod(): void {
    if (this.calView === 'monthly') {
      if (this.calMonth === 0) { this.calMonth = 11; this.calYear--; }
      else this.calMonth--;
    } else if (this.calView === 'weekly') {
      const d = new Date(this.calWeekStart);
      d.setDate(d.getDate() - 7);
      this.calWeekStart = d;
    } else {
      const d = new Date(this.calDayDate);
      d.setDate(d.getDate() - 1);
      this.calDayDate = d;
    }
  }

  /** Navigate forward by month / week / day depending on active view. */
  nextPeriod(): void {
    if (this.calView === 'monthly') {
      if (this.calMonth === 11) { this.calMonth = 0; this.calYear++; }
      else this.calMonth++;
    } else if (this.calView === 'weekly') {
      const d = new Date(this.calWeekStart);
      d.setDate(d.getDate() + 7);
      this.calWeekStart = d;
    } else {
      const d = new Date(this.calDayDate);
      d.setDate(d.getDate() + 1);
      this.calDayDate = d;
    }
  }

  goToday(): void {
    const n = new Date();
    this.calYear      = n.getFullYear();
    this.calMonth     = n.getMonth();
    this.calWeekStart = this._getWeekStart(n);
    this.calDayDate   = new Date(n.getFullYear(), n.getMonth(), n.getDate());
    this.selectedDay  = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }

  // ── Calendar label ────────────────────────────────────────────────────────

  get calLabel(): string {
    if (this.calView === 'monthly') {
      return new Date(this.calYear, this.calMonth, 1)
        .toLocaleString('en', { month: 'long', year: 'numeric' });
    }
    if (this.calView === 'weekly') {
      const end = new Date(this.calWeekStart);
      end.setDate(end.getDate() + 6);
      const s = this.calWeekStart.toLocaleString('en', { month: 'short', day: 'numeric' });
      const e = end.toLocaleString('en', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${s} – ${e}`;
    }
    return this.calDayDate.toLocaleString('en', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  }

  // ── Weekly getters ────────────────────────────────────────────────────────

  get weekDays(): { date: Date; events: any[]; allDayEvents: any[]; eventsByHour: Record<number, any[]> }[] {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(this.calWeekStart);
      date.setDate(date.getDate() + i);
      const all  = this._eventsForDay(date);
      const allDayEvents = all.filter(ev => !this._hasTime(ev));
      const eventsByHour: Record<number, any[]> = {};
      for (const h of this.calHours) eventsByHour[h] = [];
      all.filter(ev => this._hasTime(ev)).forEach(ev => {
        const h = new Date(ev.startDateTime).getHours();
        if (eventsByHour[h] !== undefined) eventsByHour[h].push(ev);
      });
      return { date, events: all, allDayEvents, eventsByHour };
    });
  }

  get weekHasAllDay(): boolean {
    return this.weekDays.some(wd => wd.allDayEvents.length > 0);
  }

  /** Click on a week cell → drill into daily view at that day/hour. */
  drillDay(date: Date, _hour: number): void {
    this.calDayDate = new Date(date);
    this.setCalView('daily');
  }

  // ── Daily getters ─────────────────────────────────────────────────────────

  get dayHours(): { hour: number; events: any[] }[] {
    const all = this._eventsForDay(this.calDayDate);
    return this.calHours.map(h => ({
      hour:   h,
      events: all.filter(ev => this._hasTime(ev) && new Date(ev.startDateTime).getHours() === h),
    }));
  }

  get dayAllDayEvents(): any[] {
    return this._eventsForDay(this.calDayDate).filter(ev => !this._hasTime(ev));
  }

  get dayTotalEvents(): number {
    return this._eventsForDay(this.calDayDate).length;
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /** Returns the Monday of the week containing `d`. */
  private _getWeekStart(d: Date): Date {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    const dow = date.getDay(); // 0 = Sun
    const diff = dow === 0 ? -6 : 1 - dow;
    date.setDate(date.getDate() + diff);
    return date;
  }

  /** Returns true if the event has a specific time (not midnight = all-day). */
  private _hasTime(ev: any): boolean {
    if (!ev.startDateTime) return false;
    const str = String(ev.startDateTime);
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return false; // date-only string
    const d = new Date(ev.startDateTime);
    return !isNaN(d.getTime()) && (d.getHours() !== 0 || d.getMinutes() !== 0);
  }
  selectDay(day: CalDay): void {
    this.selectedDay = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
  }
  isToday(d: Date):               boolean { const n = new Date(); return this.isSameDay(d, n); }
  isSameDay(a: Date, b: Date | null): boolean {
    if (!b) return false;
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  // ── Type helpers ──────────────────────────────────────────────────────────
  typeColor(t: string):     string { return this.TYPE_COLORS[t]      ?? '#94A3B8'; }
  typeColorDark(t: string): string { return this.TYPE_COLORS_DARK[t] ?? '#64748B'; }
  typeIcon(t: string):      string { return this.TYPE_ICONS[t]       ?? 'bx-calendar'; }
  typeChipClass(t: string): string {
    const m: Record<string,string> = {
      MEETING:'ch-teal', INTERVIEW:'ch-blue', TRAINING:'ch-purple',
      HOLIDAY:'ch-green', DEADLINE:'ch-amber', OTHER:'ch-gray',
    };
    return m[t] ?? 'ch-gray';
  }
  prioClass(p: string): string {
    const m: Record<string,string> = { Critical:'ch-red', High:'ch-amber', Medium:'ch-blue', Low:'ch-gray' };
    return m[p] ?? 'ch-gray';
  }

  /** Zero-pads an hour number: 7 → "07", 14 → "14" */
  fmtHour(h: number): string { return String(h).padStart(2, '0'); }

  formatDateDisplay(val: any): string {
    if (!val) return '—';
    const d = new Date(val);
    return isNaN(d.getTime()) ? String(val) : d.toLocaleString('en-GB', {
      day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit',
    });
  }

  // ── Panel ─────────────────────────────────────────────────────────────────
  openEventDetail(ev: any): void {
    this.selected  = ev;
    this.panelType = 'event';
    this.showPanel = true;
  }
  openDetail(row: any, type: string): void {
    this.selected  = row;
    this.panelType = type;
    this.showPanel = true;
  }
  openCreate(): void {
    this.createForm = { type: 'MEETING', status: 'SCHEDULED' };
    this.saveError  = null;
    this.panelType  = 'create';
    this.showPanel  = true;
    this.selected   = null;
    const labelKeys: Record<string,string> = {
      calendar: 'PLANNING.CREATE_TITLE_CALENDAR', workforce: 'PLANNING.CREATE_TITLE_WORKFORCE',
      training: 'PLANNING.CREATE_TITLE_TRAINING',  career: 'PLANNING.CREATE_TITLE_CAREER',
      recruitment: 'PLANNING.CREATE_TITLE_RECRUITMENT',
    };
    this.createTitle = this.translate.instant(labelKeys[this.activeView] ?? 'PLANNING.CREATE_TITLE_DEFAULT');
  }
  closePanel(): void { this.showPanel = false; this.selected = null; }

  // ── Submit ────────────────────────────────────────────────────────────────
  submitCreate(): void {
    this.saving    = true;
    this.saveError = null;

    const typeMap: Record<string,string> = {
      workforce: 'MEETING', training: 'TRAINING', career: 'OTHER',
      recruitment: 'INTERVIEW', calendar: this.createForm.type || 'OTHER',
    };

    let title = '', startDateTime = new Date().toISOString(),
        endDateTime: string | undefined, location = '', description = '';

    if (this.activeView === 'calendar') {
      if (!this.createForm.title) { this.saving = false; this.saveError = 'Title is required.'; return; }
      title         = this.createForm.title;
      startDateTime = this.createForm.startDateTime
        ? new Date(this.createForm.startDateTime).toISOString() : startDateTime;
      endDateTime   = this.createForm.endDateTime
        ? new Date(this.createForm.endDateTime).toISOString() : undefined;
      location      = this.createForm.location || '';
      description   = this.createForm.description || '';
    } else if (this.activeView === 'workforce') {
      if (!this.createForm.dept) { this.saving = false; this.saveError = 'Department is required.'; return; }
      title       = `HC Plan — ${this.createForm.dept}`;
      endDateTime = this.createForm.reviewDate ? new Date(this.createForm.reviewDate).toISOString() : undefined;
      location    = this.createForm.dept;
      description = `Budget: ${this.createForm.budget||'—'} | ${this.createForm.notes||''}`.trim();
    } else if (this.activeView === 'training') {
      if (!this.createForm.skill) { this.saving = false; this.saveError = 'Skill gap is required.'; return; }
      title       = `Training — ${this.createForm.skill} (${this.createForm.employee||'?'})`;
      endDateTime = this.createForm.deadline ? new Date(this.createForm.deadline).toISOString() : undefined;
      location    = this.createForm.employee || '';
      description = `Priority: ${this.createForm.priority||'Medium'}`;
    } else if (this.activeView === 'career') {
      if (!this.createForm.employee) { this.saving = false; this.saveError = 'Employee is required.'; return; }
      title       = `IDP — ${this.createForm.employee}${this.createForm.targetRole ? ' → ' + this.createForm.targetRole : ''}`;
      location    = this.createForm.employee;
      description = `Timeline: ${this.createForm.timeline||'—'}`;
    } else if (this.activeView === 'recruitment') {
      if (!this.createForm.position) { this.saving = false; this.saveError = 'Position is required.'; return; }
      title       = this.createForm.position;
      endDateTime = this.createForm.targetDate ? new Date(this.createForm.targetDate).toISOString() : undefined;
      location    = this.createForm.dept || '';
      description = `HC: ${this.createForm.hc||1} | Budget: ${this.createForm.budget||'—'}`;
    }

    this.planningService.createEvent({
      title, description, startDateTime, endDateTime: endDateTime ?? null,
      location, type: typeMap[this.activeView] ?? 'OTHER',
    } as any).subscribe({
      next: (created: any) => {
        this.saving    = false;
        this.allEvents = [created, ...this.allEvents];
        this._buildFromEvents(this.allEvents);
        this.closePanel();
        this._toast(this.translate.instant('PLANNING.TOAST_EVENT_CREATED'));
      },
      error: err => { this.saving = false; this.saveError = err?.error?.message || this.translate.instant('PLANNING.SAVE_ERROR_DEFAULT'); },
    });
  }

  async deletePlanRow(row: any): Promise<void> {
    if (!row._eventId) return;
    if (!(await this.confirmSvc.confirm(this.translate.instant('PLANNING.CONFIRM_DELETE_EVENT_MSG'), this.translate.instant('PLANNING.CONFIRM_DELETE_EVENT_BTN')))) return;
    this.planningService.deleteEvent(row._eventId).subscribe({
      next: () => {
        this.allEvents     = this.allEvents.filter(e => e.id !== row._eventId);
        this.trainingNeeds = this.trainingNeeds.filter(r => r._eventId !== row._eventId);
        this.hiringRequests= this.hiringRequests.filter(r => r._eventId !== row._eventId);
        this._toast(this.translate.instant('PLANNING.TOAST_EVENT_DELETED'));
      },
      error: () => {}
    });
  }

  private _toast(msg: string): void {
    this.toast = msg;
    setTimeout(() => this.toast = null, 3000);
  }

  // ── Build data from Collaborateurs ────────────────────────────────────────
  private _buildFromCollaborateurs(colls: any[]): void {
    const deptMap = new Map<string, number>();
    colls.forEach(c => {
      const dept = (c.Département || c.département || '—').trim();
      deptMap.set(dept, (deptMap.get(dept) ?? 0) + 1);
    });
    const total = colls.length || 1;

    this.headcountPlans = Array.from(deptMap.entries())
      .filter(([dept]) => dept !== '—')
      .map(([dept, count]) => ({ dept, current: count, planned: count, gap: 0 }));

    const sorted  = Array.from(deptMap.entries()).filter(([d]) => d !== '—').sort((a,b) => b[1]-a[1]).slice(0,8);
    const maxCount = sorted[0]?.[1] ?? 1;
    this.departmentBudgets = sorted.map(([dept, count]) => ({
      dept: dept.length > 22 ? dept.slice(0,22)+'…' : dept,
      pct:  Math.round(count / maxCount * 100),
    }));

    this.deptOptions = Array.from(deptMap.keys()).filter(d => d !== '—');

    this.pdiProgress = colls.filter(c => c.prenom || c.nom).slice(0,8).map(c => ({
      name: `${c.prenom??''} ${c.nom??''}`.trim(),
      role: c.Fonction || c.Département || '—',
      pct:  Math.min(100, Math.round(((c.Ancienneté ?? 0) / 5) * 100)),
    }));

    const mgrs   = colls.filter(c => /(manager|responsable|directeur|chef|head)/i.test(c.Fonction??'')).slice(0,5);
    const others = colls.filter(c => !mgrs.includes(c)).slice(0,5);
    this.mentorships = mgrs.slice(0, Math.min(mgrs.length, others.length)).map((m, i) => ({
      mentorInitials: `${(m.prenom||'?')[0]}${(m.nom||'?')[0]}`.toUpperCase(),
      mentor:         `${m.prenom??''} ${m.nom??''}`.trim(),
      mentorRole:     m.Fonction || '—',
      mentee:         `${others[i]?.prenom??''} ${others[i]?.nom??''}`.trim(),
      menteeRole:     others[i]?.Fonction || '—',
    }));

    this.idpPlans = colls.slice(0,10).map(c => ({
      employee:    `${c.prenom??''} ${c.nom??''}`.trim(),
      currentRole: c.Fonction || '—',
      targetRole:  '—',
      timeline:    '—',
      mentor:      '—',
      progress:    Math.min(100, Math.round(((c.Ancienneté ?? 0) / 5) * 100)),
      status:      'Active',
      statusClass: 'active',
    }));
  }

  // ── Build data from Events ─────────────────────────────────────────────────
  private _buildFromEvents(events: any[]): void {
    const now    = new Date();
    const sorted = [...events].sort((a,b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime());
    const byType = (t: string) => sorted.filter(e => e.type === t);

    this.trainingNeeds = byType('TRAINING').map(e => {
      const cb = e.createdBy;
      const emp = cb ? `${cb.firstname??''} ${cb.lastname??''}`.trim() : '—';
      const isPast = new Date(e.startDateTime) < now;
      return {
        _eventId: e.id, employee: emp, role: e.location || '—', skill: e.title,
        currentLevel: 0, targetLevel: 5,
        priority: 'Medium', priorityClass: 'medium',
        deadline: e.endDateTime ? new Date(e.endDateTime).toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'}) : '—',
        status:      isPast ? 'Completed' : 'Assigned',
        statusClass: isPast ? 'completed'  : 'active',
        assignedTraining: e.description || null,
      };
    });

    this.trainingSessions = byType('TRAINING').map(e => {
      const d = new Date(e.startDateTime);
      const cb = e.createdBy;
      return {
        day:     String(d.getDate()).padStart(2,'0'),
        month:   d.toLocaleString('en',{month:'short'}),
        name:    e.title,
        trainer: cb ? `${cb.firstname??''} ${cb.lastname??''}`.trim() : (e.location||'—'),
        duration: e.endDateTime
          ? `${Math.max(1, Math.ceil((new Date(e.endDateTime).getTime()-d.getTime())/86400000))} day(s)`
          : '—',
        enrolled: 0, capacity: 0,
      };
    });

    this.careerMilestones = byType('DEADLINE').map(e => {
      const d = new Date(e.startDateTime);
      const past = d < now;
      return { title: e.title, date: d.toLocaleDateString('en',{month:'short',year:'numeric'}),
               dotClass: past ? 'done' : 'pending', status: past ? 'Done' : 'Pending' };
    });

    this.hiringRequests = byType('INTERVIEW').map((e, idx) => {
      const d = new Date(e.startDateTime);
      return {
        _eventId:   e.id,
        reqId:      `HR-${String(e.id??idx+1).padStart(4,'0')}`,
        position:   e.title, dept: e.location||'—', hc: 1, budget: '—',
        targetDate: d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),
        stage:      d < now ? 'Completed' : 'Interviewing',
        stageClass: d < now ? 'completed' : 'active', planRef: `EVT-${e.id??idx+1}`,
      };
    });

    const typeCounts = new Map<string,number>();
    events.forEach(e => typeCounts.set(e.type, (typeCounts.get(e.type)??0)+1));
    this.pipelineStages = Array.from(typeCounts.entries()).map(([type, count]) => ({
      label: type.charAt(0)+type.slice(1).toLowerCase(), count, color: this.typeColor(type),
    }));
  }

  // ── Export ────────────────────────────────────────────────────────────────

  exportData(): void {
    switch (this.activeView) {
      case 'calendar':    return this._exportCalendar();
      case 'workforce':   return this._exportWorkforce();
      case 'training':    return this._exportTraining();
      case 'career':      return this._exportCareer();
      case 'recruitment': return this._exportRecruitment();
    }
  }

  /** Calendar → .ics  (works with Google Calendar, Outlook, Apple Calendar) */
  private _exportCalendar(): void {
    const esc  = (s: string) => (s ?? '').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    const fmt  = (d: Date)   => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//InnovX GestionRH//Planning//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    for (const ev of this.allEvents) {
      if (!ev.startDateTime) continue;
      const start = new Date(ev.startDateTime);
      const end   = ev.endDateTime ? new Date(ev.endDateTime) : new Date(start.getTime() + 3600000);
      lines.push(
        'BEGIN:VEVENT',
        `UID:planning-event-${ev.id ?? Math.random().toString(36).slice(2)}@innovx`,
        `DTSTAMP:${fmt(new Date())}`,
        `DTSTART:${fmt(start)}`,
        `DTEND:${fmt(end)}`,
        `SUMMARY:${esc(ev.title)}`,
        ...(ev.description ? [`DESCRIPTION:${esc(ev.description)}`] : []),
        ...(ev.location    ? [`LOCATION:${esc(ev.location)}`]       : []),
        `CATEGORIES:${esc(ev.type ?? 'OTHER')}`,
        'END:VEVENT',
      );
    }

    lines.push('END:VCALENDAR');
    this._download(lines.join('\r\n'), 'planning-events.ics', 'text/calendar;charset=utf-8');
    this._toast(`Exported ${this.allEvents.length} event(s) to ICS`);
  }

  /** Workforce → headcount-plan.csv */
  private _exportWorkforce(): void {
    const headers = ['Department', 'Current HC', 'Planned HC', 'Gap', 'Status'];
    const rows    = this.headcountPlans.map(r => [
      r.dept, r.current, r.planned,
      r.gap >= 0 ? `+${r.gap}` : String(r.gap),
      'Active',
    ]);
    this._download(this._buildCsv(headers, rows), 'workforce-headcount.csv', 'text/csv;charset=utf-8');
    this._toast(`Exported ${rows.length} headcount plan(s) to CSV`);
  }

  /** Training → training-needs.csv or training-sessions.csv depending on active tab */
  private _exportTraining(): void {
    if (this.trTab === 'sessions') {
      const headers = ['Date', 'Session', 'Trainer', 'Duration'];
      const rows    = this.trainingSessions.map(s => [
        `${s.day} ${s.month}`, s.name, s.trainer, s.duration,
      ]);
      this._download(this._buildCsv(headers, rows), 'training-sessions.csv', 'text/csv;charset=utf-8');
      this._toast(`Exported ${rows.length} training session(s) to CSV`);
    } else {
      const headers = ['Employee', 'Skill Gap', 'Priority', 'Deadline', 'Status'];
      const rows    = this.trainingNeeds.map(r => [
        r.employee, r.skill, r.priority, r.deadline, r.status,
      ]);
      this._download(this._buildCsv(headers, rows), 'training-needs.csv', 'text/csv;charset=utf-8');
      this._toast(`Exported ${rows.length} training need(s) to CSV`);
    }
  }

  /** Career → career-idp.csv */
  private _exportCareer(): void {
    const headers = ['Employee', 'Current Role', 'Target Role', 'Progress (%)', 'Status'];
    const rows    = this.idpPlans.map(r => [
      r.employee, r.currentRole, r.targetRole, r.progress, r.status,
    ]);
    this._download(this._buildCsv(headers, rows), 'career-idp.csv', 'text/csv;charset=utf-8');
    this._toast(`Exported ${rows.length} IDP plan(s) to CSV`);
  }

  /** Recruitment → hiring-requests.csv */
  private _exportRecruitment(): void {
    const headers = ['Req ID', 'Position', 'Department', 'Target Date', 'Stage'];
    const rows    = this.hiringRequests.map(r => [
      r.reqId, r.position, r.dept, r.targetDate, r.stage,
    ]);
    this._download(this._buildCsv(headers, rows), 'hiring-requests.csv', 'text/csv;charset=utf-8');
    this._toast(`Exported ${rows.length} hiring request(s) to CSV`);
  }

  /** Build a properly-escaped CSV string from headers + rows */
  private _buildCsv(headers: string[], rows: (string | number)[][]): string {
    const esc = (v: string | number) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [headers, ...rows].map(row => row.map(esc).join(',')).join('\r\n');
  }

  /** Trigger a browser file download */
  private _download(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
