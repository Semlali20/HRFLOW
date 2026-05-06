import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CollaborateurService } from 'src/app/core/services/collaborateur.service';
import { Collaborateur, CollaborateurCreateDto } from 'src/app/core/models/hr.models';

interface EmpRow {
  matricule: number;
  name: string;
  startDate: string;
  empType: string;
  empTypeClass: string;
  role: string;
  gender: string;
  genderClass: string;
  dob: string;
  email: string;
  department: string;
  cin: string;
  anciennete: number;
  filiale: string;
}

@Component({
  selector: 'app-collaborateur',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  styles: [`
    /* ================================================================
       WIKO HR — Employee Page
       ================================================================ */

    .emp-container { padding: 0 24px 40px; animation: fadeIn .4s ease both; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }

    /* ── Header ── */
    .emp-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 20px; background: #fff; border-radius: 12px;
      box-shadow: 0 4px 20px rgba(22,34,51,.08); margin-bottom: 18px;
    }
    .emp-header__title { font-family:'Inter',sans-serif; font-size:22px; font-weight:700; color:#1A2B3C; margin:0; }
    .emp-header__right { display:flex; align-items:center; gap:16px; }
    .emp-header__date  { font-size:13px; color:#8FA3B8; display:flex; align-items:center; gap:6px; }
    .emp-lang-badge    { display:flex; align-items:center; gap:6px; font-size:13px; color:#4A6080; cursor:pointer; }

    /* ── Layout ── */
    .emp-top-row {
      display: grid; grid-template-columns: 1fr 420px;
      gap: 20px; align-items: start; margin-bottom: 18px;
    }

    /* ── Stats Card ── */
    .emp-stats-card {
      background:#fff; border-radius:12px; padding:18px 20px;
      box-shadow: 0 4px 20px rgba(22,34,51,.08); box-sizing:border-box;
    }
    .emp-stats-header-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; }
    .emp-stats-label { font-family:'Inter',sans-serif; font-size:14px; font-weight:700; color:#1A2B3C; }
    .emp-emptype-filter {
      display:flex; align-items:center; gap:5px; font-size:12px; color:#4A6080;
      border:1px solid #E2E8F0; border-radius:8px; padding:4px 10px; cursor:pointer;
    }
    .emp-emptype-filter:hover { background:#F8FAFC; }
    .emp-stats-num-row { display:flex; align-items:baseline; gap:8px; margin-bottom:10px; }
    .emp-stats-total { font-family:'Inter',sans-serif; font-size:34px; font-weight:800; color:#1A2B3C; line-height:1; }
    .emp-stats-unit  { font-size:12px; color:#8FA3B8; }

    .emp-stats-bar { display:flex; height:5px; border-radius:4px; overflow:hidden; gap:3px; margin-bottom:14px; }
    .emp-stats-bar-seg { height:100%; border-radius:4px; }
    .emp-stats-bar-seg--ft  { background:#3B82F6; }
    .emp-stats-bar-seg--pt  { background:#22C55E; }
    .emp-stats-bar-seg--ct  { background:#EF4444; }
    .emp-stats-bar-seg--int { background:#F59E0B; }

    .emp-stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px 16px; }
    .emp-stats-item { display:flex; flex-direction:column; gap:2px; }
    .emp-stats-item-row { display:flex; align-items:center; gap:6px; margin-bottom:1px; }
    .emp-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .emp-dot--ft  { background:#3B82F6; }
    .emp-dot--pt  { background:#22C55E; }
    .emp-dot--ct  { background:#EF4444; }
    .emp-dot--int { background:#F59E0B; }
    .emp-stats-item-lbl { font-size:11.5px; color:#8FA3B8; }
    .emp-stats-item-num { font-family:'Inter',sans-serif; font-size:18px; font-weight:700; color:#1A2B3C; }
    .emp-stats-item-sub { font-size:11px; color:#8FA3B8; }

    /* ── Chart Card ── */
    .emp-chart-card {
      background:#fff; border-radius:12px; padding:20px;
      box-shadow:0 4px 20px rgba(22,34,51,.08); box-sizing:border-box; overflow:hidden;
    }
    .emp-chart-title { font-family:'Inter',sans-serif; font-size:14px; font-weight:700; color:#1A2B3C; margin-bottom:4px; }
    .emp-chart-wrap  { margin:0 -8px -100px; }
    .emp-chart-legend { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px 4px; padding:6px 4px 0; }
    .emp-legend-item { display:flex; align-items:center; gap:5px; font-size:11px; color:#4A6080; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .emp-legend-dot  { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

    /* ── Table Card ── */
    .emp-table-card { background:#fff; border-radius:12px; box-shadow:0 4px 20px rgba(22,34,51,.08); overflow:hidden; }
    .emp-tabs-bar { display:flex; align-items:center; gap:2px; padding:14px 20px 0; border-bottom:1px solid #F0F3F6; flex-wrap:wrap; }
    .emp-tab {
      padding:9px 16px; font-size:13px; font-weight:500; color:#8FA3B8;
      background:none; border:none; border-bottom:2px solid transparent;
      cursor:pointer; transition:all .15s; margin-bottom:-1px; white-space:nowrap;
    }
    .emp-tab--active { color:#2FA8A0; border-bottom-color:#2FA8A0; font-weight:600; }
    .emp-tab:hover:not(.emp-tab--active) { color:#4A6080; }
    .emp-tabs-updated { margin-left:auto; font-size:12px; color:#8FA3B8; display:flex; align-items:center; gap:4px; }

    table { width:100%; border-collapse:collapse; table-layout:fixed; }
    thead tr { background:#FAFBFC; }
    thead th {
      padding:11px 16px; font-size:11px; font-weight:700; letter-spacing:.06em;
      text-transform:uppercase; color:#8FA3B8; border-bottom:1px solid #F0F3F6;
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    }
    thead th:nth-child(1) { width:100px; }
    thead th:nth-child(3) { width:135px; }
    thead th:nth-child(4) { width:145px; }
    thead th:nth-child(5) { width:140px; }
    thead th:nth-child(6) { width:90px; }
    thead th:nth-child(7) { width:80px; }
    tbody tr { cursor:pointer; transition:background .15s; }
    tbody tr:hover { background:#F8FFFE; }
    tbody td {
      padding:12px 16px; font-size:13px; color:#4A6080;
      border-bottom:1px solid #F5F7FA; vertical-align:middle;
      overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
    }
    tbody tr:last-child td { border-bottom:none; }
    .emp-td-id   { font-family:'Inter',sans-serif; font-weight:600; color:#1A2B3C; font-size:12.5px; }
    .emp-td-name { font-weight:500; color:#1A2B3C; }
    .emp-td-date { font-size:12.5px; }

    .emp-type-chip { display:inline-block; padding:3px 10px; border-radius:6px; font-size:11.5px; font-weight:600; }
    .emp-type-chip--fulltime { background:#DBEAFE; color:#1E40AF; }
    .emp-type-chip--parttime { background:#DCFCE7; color:#15803D; }
    .emp-type-chip--contract { background:#FFE4E6; color:#BE123C; }
    .emp-type-chip--intern   { background:#FEF3C7; color:#92400E; }

    .emp-gender-chip { display:inline-block; padding:3px 10px; border-radius:6px; font-size:11.5px; font-weight:600; }
    .emp-gender-chip--man   { background:#E8F7F6; color:#2FA8A0; }
    .emp-gender-chip--women { background:#FCE7F3; color:#9D174D; }

    .emp-role-chip { display:inline-block; padding:3px 9px; border-radius:6px; font-size:11.5px; font-weight:500; background:#F1F5F9; color:#4A6080; }

    .emp-row-actions { display:flex; align-items:center; gap:10px; }
    .emp-act-icon { font-size:15px; color:#B0BEC5; cursor:pointer; transition:color .15s; }
    .emp-act-icon:hover { color:#4A6080; }
    .emp-act-icon--del:hover { color:#EF4444; }

    /* ── Add Button ── */
    .emp-add-btn {
      padding:9px 18px; border:none; border-radius:10px;
      background:#2FA8A0; color:#fff; font-size:13.5px; font-weight:600;
      display:flex; align-items:center; gap:7px; white-space:nowrap;
      cursor:pointer; transition:background .15s; flex-shrink:0;
    }
    .emp-add-btn:hover { background:#1A9690; }

    /* ── Search bar ── */
    .search-row { display:flex; align-items:center; gap:12px; padding:14px 20px; border-bottom:1px solid #F0F3F6; }
    .search-input-wrap { position:relative; flex:1; max-width:320px; }
    .search-input { width:100%; padding:8px 12px 8px 34px; border:1.5px solid #E2E8F0; border-radius:8px; font-size:13px; color:#1A2B3C; font-family:'Inter',sans-serif; }
    .search-input:focus { outline:none; border-color:#2FA8A0; }
    .search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#8FA3B8; font-size:15px; }
    .import-btn { display:flex; align-items:center; gap:6px; font-size:12.5px; color:#4A6080; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:7px 14px; cursor:pointer; }
    .import-btn:hover { background:#E2E8F0; }

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
    .page-btn { width:32px; height:32px; border-radius:6px; border:1px solid #E2E8F0; background:#fff; font-size:13px; color:#4A6080; cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .page-btn.active { background:#2FA8A0; color:#fff; border-color:#2FA8A0; }
    .page-btn:hover:not(.active) { background:#F8FAFC; }
    .page-btn:disabled { opacity:.4; cursor:default; }

    /* ══ BACKDROP ══ */
    .emp-backdrop {
      position:fixed; inset:0; background:rgba(10,20,35,.35);
      backdrop-filter:blur(2px); z-index:1800;
    }

    /* ══ EMPLOYEE DETAIL PANEL ══ */
    .emp-detail-panel {
      position:fixed; top:70px; right:0; bottom:0; width:580px;
      background:#fff; box-shadow:-8px 0 40px rgba(10,20,35,.14);
      z-index:1801; display:flex; flex-direction:column;
      overflow:hidden; animation:slideIn .22s ease both;
    }
    @keyframes slideIn { from{transform:translateX(40px);opacity:0} to{transform:translateX(0);opacity:1} }

    .edp-header { display:flex; align-items:center; justify-content:space-between; padding:18px 24px 16px; border-bottom:1px solid #F0F3F6; flex-shrink:0; }
    .edp-title  { font-family:'Inter',sans-serif; font-size:16px; font-weight:700; color:#1A2B3C; }
    .edp-header-right { display:flex; align-items:center; gap:10px; }
    .edp-edit-btn {
      display:flex; align-items:center; gap:7px; padding:8px 16px;
      border:none; border-radius:8px; background:#162233; color:#fff;
      font-size:13px; font-weight:600; cursor:pointer; transition:background .15s;
    }
    .edp-edit-btn:hover { background:#2FA8A0; }
    .edp-close-btn {
      background:#F0F3F6; border:none; border-radius:8px; width:32px; height:32px;
      display:flex; align-items:center; justify-content:center; cursor:pointer; color:#4A6080;
    }
    .edp-close-btn:hover { background:#E2E8F0; }

    .edp-body { flex:1; overflow-y:auto; padding:20px 24px 24px; scrollbar-width:thin; scrollbar-color:#E2E8F0 transparent; }
    .edp-avatar {
      width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg,#1B7872,#2FA8A0);
      display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:700;
      color:#fff; margin-bottom:16px; flex-shrink:0;
    }
    .edp-section-title { font-family:'Inter',sans-serif; font-size:14px; font-weight:700; color:#1A2B3C; margin-bottom:14px; padding-bottom:8px; border-bottom:1px solid #F0F3F6; }
    .edp-info-grid { display:flex; flex-direction:column; gap:12px; }
    .edp-field { display:flex; align-items:center; gap:10px; }
    .edp-field i { font-size:16px; color:#8FA3B8; width:20px; text-align:center; flex-shrink:0; }
    .edp-lbl  { font-size:12.5px; color:#8FA3B8; width:150px; flex-shrink:0; }
    .edp-val  { font-size:13.5px; color:#1A2B3C; font-weight:500; }

    /* ══ CREATE / EDIT PANEL ══ */
    .emp-create-modal {
      position:fixed; top:70px; right:0; bottom:0; width:540px;
      background:#fff; box-shadow:-8px 0 40px rgba(10,20,35,.14);
      border-radius:16px 0 0 0; z-index:1802;
      display:flex; flex-direction:column; overflow:hidden;
      animation:modalIn .22s ease both;
    }
    @keyframes modalIn { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:none} }

    .ecm-header { display:flex; align-items:center; justify-content:space-between; padding:18px 24px 16px; border-bottom:1px solid #F0F3F6; flex-shrink:0; }
    .ecm-title  { font-family:'Inter',sans-serif; font-size:16px; font-weight:700; color:#1A2B3C; }
    .ecm-close-btn {
      background:#F0F3F6; border:none; border-radius:8px; width:32px; height:32px;
      display:flex; align-items:center; justify-content:center; cursor:pointer; color:#4A6080;
    }
    .ecm-close-btn:hover { background:#E2E8F0; }
    .ecm-body { flex:1; overflow-y:auto; padding:20px 24px; scrollbar-width:thin; scrollbar-color:#E2E8F0 transparent; }
    .ecm-section-title { font-family:'Inter',sans-serif; font-size:14px; font-weight:700; color:#1A2B3C; margin:20px 0 14px; padding-bottom:8px; border-bottom:1px solid #F0F3F6; }
    .ecm-fields-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .ecm-field-group { display:flex; flex-direction:column; gap:5px; }
    .ecm-label { font-size:12.5px; font-weight:600; color:#1A2B3C; }
    .ecm-input {
      width:100%; padding:9px 12px; border:1.5px solid #E2E8F0; border-radius:8px;
      font-size:13px; color:#1A2B3C; outline:none; transition:border .15s; box-sizing:border-box;
      font-family:'Inter',sans-serif;
    }
    .ecm-input::placeholder { color:#8FA3B8; }
    .ecm-input:focus { border-color:#2FA8A0; box-shadow:0 0 0 3px rgba(47,168,160,.1); }
    .ecm-select-wrap { position:relative; }
    .ecm-select {
      width:100%; padding:9px 32px 9px 12px; border:1.5px solid #E2E8F0; border-radius:8px;
      font-size:13px; color:#1A2B3C; background:#fff; appearance:none; outline:none;
      cursor:pointer; transition:border .15s; box-sizing:border-box; font-family:'Inter',sans-serif;
    }
    .ecm-select:focus { border-color:#2FA8A0; box-shadow:0 0 0 3px rgba(47,168,160,.1); }
    .ecm-select-icon { position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:15px; color:#8FA3B8; pointer-events:none; }
    .ecm-footer { display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid #F0F3F6; flex-shrink:0; }
    .ecm-cancel-btn { padding:10px 20px; border:1.5px solid #E2E8F0; border-radius:10px; background:#fff; color:#4A6080; font-size:13.5px; font-weight:600; cursor:pointer; }
    .ecm-create-btn {
      padding:10px 32px; border:none; border-radius:10px;
      background:#162233; color:#fff; font-size:13.5px; font-weight:600; cursor:pointer; transition:background .15s;
    }
    .ecm-create-btn:hover { background:#2FA8A0; }
    .ecm-create-btn:disabled { opacity:.5; cursor:default; }

    /* ── Toast ── */
    .toast-msg { position:fixed; bottom:24px; right:24px; z-index:2000; padding:12px 20px; border-radius:10px; font-size:13.5px; font-weight:600; color:#fff; animation:fadeIn .3s; }
    .toast-msg--success { background:#22C55E; }
    .toast-msg--error   { background:#EF4444; }
  `],
  template: `
  <!-- ── Backdrop ── -->
  <div class="emp-backdrop" *ngIf="detailEmployee || showCreateModal" (click)="closeAll()"></div>

  <!-- ── Toast ── -->
  <div *ngIf="toast" class="toast-msg" [class.toast-msg--success]="toast.type==='success'" [class.toast-msg--error]="toast.type==='error'">
    {{ toast.message }}
  </div>

  <!-- ══ EMPLOYEE DETAIL PANEL ══ -->
  <div class="emp-detail-panel" *ngIf="detailEmployee" (click)="$event.stopPropagation()">
    <div class="edp-header">
      <span class="edp-title">Employee Detail</span>
      <div class="edp-header-right">
        <button class="edp-edit-btn" (click)="openEdit(detailEmployee)">
          <i class="bx bx-edit-alt"></i> Edit Employee
        </button>
        <button class="edp-close-btn" (click)="detailEmployee=null"><i class="bx bx-x"></i></button>
      </div>
    </div>
    <div class="edp-body">
      <div class="edp-avatar">{{ initials(detailEmployee) }}</div>

      <div class="edp-section-title">Employee Information</div>
      <div class="edp-info-grid">
        <div class="edp-field"><i class="bx bx-id-card"></i><span class="edp-lbl">Matricule</span><span class="edp-val">{{ detailEmployee.matricule }}</span></div>
        <div class="edp-field"><i class="bx bx-user"></i><span class="edp-lbl">Full Name</span><span class="edp-val">{{ detailEmployee.prenom }} {{ detailEmployee.nom }}</span></div>
        <div class="edp-field"><i class="bx bx-calendar"></i><span class="edp-lbl">Date of Birth</span><span class="edp-val">{{ detailEmployee.date_naissance || '—' }}</span></div>
        <div class="edp-field"><i class="bx bx-envelope"></i><span class="edp-lbl">Email</span><span class="edp-val">{{ detailEmployee.email || '—' }}</span></div>
        <div class="edp-field"><i class="bx bx-credit-card"></i><span class="edp-lbl">CIN</span><span class="edp-val">{{ detailEmployee.CIN || '—' }}</span></div>
        <div class="edp-field"><i class="bx bx-flag"></i><span class="edp-lbl">Nationality</span><span class="edp-val">{{ detailNationalite || '—' }}</span></div>
        <div class="edp-field"><i class="bx bx-male-female"></i><span class="edp-lbl">Gender</span><span class="edp-val">{{ detailEmployee.sexe || '—' }}</span></div>
        <div class="edp-field"><i class="bx bx-time"></i><span class="edp-lbl">Age</span><span class="edp-val">{{ detailEmployee.age || '—' }}</span></div>
      </div>

      <div class="edp-section-title" style="margin-top:20px">Work Information</div>
      <div class="edp-info-grid">
        <div class="edp-field"><i class="bx bx-briefcase"></i><span class="edp-lbl">Fonction</span><span class="edp-val">{{ detailEmployee.Fonction || '—' }}</span></div>
        <div class="edp-field"><i class="bx bx-building"></i><span class="edp-lbl">Department</span><span class="edp-val">{{ detailDepartement || '—' }}</span></div>
        <div class="edp-field"><i class="bx bx-file-blank"></i><span class="edp-lbl">Contract Type</span><span class="edp-val">{{ detailEmployee.Type || '—' }}</span></div>
        <div class="edp-field"><i class="bx bx-category"></i><span class="edp-lbl">Category</span><span class="edp-val">{{ detailEmployee.CATEGORIE || '—' }}</span></div>
        <div class="edp-field"><i class="bx bx-calendar-alt"></i><span class="edp-lbl">Start Date</span><span class="edp-val">{{ detailEmployee.date_entree || '—' }}</span></div>
        <div class="edp-field"><i class="bx bx-globe"></i><span class="edp-lbl">Filiale</span><span class="edp-val">{{ detailEmployee.FILIALE || '—' }}</span></div>
        <div class="edp-field"><i class="bx bx-award"></i><span class="edp-lbl">Anciennete (years)</span><span class="edp-val">{{ detailAnciennete ?? '—' }}</span></div>
      </div>
    </div>
  </div>

  <!-- ══ CREATE / EDIT PANEL ══ -->
  <div class="emp-create-modal" *ngIf="showCreateModal" (click)="$event.stopPropagation()">
    <div class="ecm-header">
      <span class="ecm-title">{{ editingEmployee ? 'Edit Employee' : 'Create New Employee' }}</span>
      <button class="ecm-close-btn" (click)="showCreateModal=false"><i class="bx bx-x"></i></button>
    </div>
    <div class="ecm-body">
      <div class="ecm-section-title">Employee Information</div>
      <div class="ecm-fields-grid">
        <div class="ecm-field-group">
          <label class="ecm-label">First Name (Prénom) *</label>
          <input class="ecm-input" [(ngModel)]="form.prenom" placeholder="Enter first name" />
        </div>
        <div class="ecm-field-group">
          <label class="ecm-label">Last Name (Nom) *</label>
          <input class="ecm-input" [(ngModel)]="form.nom" placeholder="Enter last name" />
        </div>
        <div class="ecm-field-group">
          <label class="ecm-label">Email *</label>
          <input class="ecm-input" [(ngModel)]="form.email" placeholder="employee@example.com" type="email" />
        </div>
        <div class="ecm-field-group">
          <label class="ecm-label">Date of Birth</label>
          <input class="ecm-input" [(ngModel)]="form.date_naissance" placeholder="YYYY-MM-DD" />
        </div>
        <div class="ecm-field-group">
          <label class="ecm-label">CIN</label>
          <input class="ecm-input" [(ngModel)]="form.CIN" placeholder="National ID" />
        </div>
        <div class="ecm-field-group">
          <label class="ecm-label">Gender</label>
          <div class="ecm-select-wrap">
            <select class="ecm-select" [(ngModel)]="form.sexe">
              <option value="">Select gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
            <i class="bx bx-chevron-down ecm-select-icon"></i>
          </div>
        </div>
        <div class="ecm-field-group">
          <label class="ecm-label">Nationality</label>
          <input class="ecm-input" [(ngModel)]="form.nationalite" placeholder="Nationality" />
        </div>
        <div class="ecm-field-group">
          <label class="ecm-label">Age</label>
          <input class="ecm-input" [(ngModel)]="form.age" placeholder="Age" type="number" min="18" max="70" />
        </div>
      </div>

      <div class="ecm-section-title">Work Information</div>
      <div class="ecm-fields-grid">
        <div class="ecm-field-group">
          <label class="ecm-label">Fonction</label>
          <input class="ecm-input" [(ngModel)]="form.Fonction" placeholder="Job title" />
        </div>
        <div class="ecm-field-group">
          <label class="ecm-label">Department</label>
          <input class="ecm-input" [(ngModel)]="form.departement" placeholder="Department" />
        </div>
        <div class="ecm-field-group">
          <label class="ecm-label">Contract Type</label>
          <div class="ecm-select-wrap">
            <select class="ecm-select" [(ngModel)]="form.Type">
              <option value="">Select type</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Intérim">Intérim</option>
              <option value="Stage">Stage</option>
            </select>
            <i class="bx bx-chevron-down ecm-select-icon"></i>
          </div>
        </div>
        <div class="ecm-field-group">
          <label class="ecm-label">Category</label>
          <input class="ecm-input" [(ngModel)]="form.CATEGORIE" placeholder="Category" />
        </div>
        <div class="ecm-field-group">
          <label class="ecm-label">Start Date</label>
          <input class="ecm-input" [(ngModel)]="form.date_entree" placeholder="YYYY-MM-DD" />
        </div>
        <div class="ecm-field-group">
          <label class="ecm-label">Filiale</label>
          <input class="ecm-input" [(ngModel)]="form.FILIALE" placeholder="Branch" />
        </div>
      </div>
    </div>
    <div class="ecm-footer">
      <button class="ecm-cancel-btn" (click)="showCreateModal=false">Cancel</button>
      <button class="ecm-create-btn" (click)="submitForm()" [disabled]="saving">
        <span *ngIf="saving"><i class="bx bx-loader-alt bx-spin"></i> Saving...</span>
        <span *ngIf="!saving">{{ editingEmployee ? 'Save Changes' : 'Create' }}</span>
      </button>
    </div>
  </div>

  <!-- ══ MAIN PAGE ══ -->
  <div class="emp-container">

    <!-- Header -->
    <div class="emp-header">
      <h4 class="emp-header__title">Employee</h4>
      <div class="emp-header__right">
        <span class="emp-header__date"><i class="bx bx-calendar-alt"></i> {{ today | date:'EEEE, MMMM d, y' }}</span>
        <button class="emp-add-btn" (click)="openCreate()">
          <i class="bx bx-plus"></i> Add New Employee
        </button>
      </div>
    </div>

    <!-- Top row: Stats + Chart -->
    <div class="emp-top-row">

      <!-- Stats Card -->
      <div class="emp-stats-card">
        <div class="emp-stats-header-row">
          <span class="emp-stats-label">Total Employee</span>
          <div class="emp-emptype-filter">
            <span>Contract Type</span>
            <i class="bx bx-chevron-down"></i>
          </div>
        </div>
        <div class="emp-stats-num-row">
          <span class="emp-stats-total">{{ total | number }}</span>
          <span class="emp-stats-unit">Employees</span>
        </div>

        <div class="emp-stats-bar">
          <div class="emp-stats-bar-seg emp-stats-bar-seg--ft"  [style.flex]="cdiCount || 1"></div>
          <div class="emp-stats-bar-seg emp-stats-bar-seg--pt"  [style.flex]="cddCount || 0"></div>
          <div class="emp-stats-bar-seg emp-stats-bar-seg--ct"  [style.flex]="interimCount || 0"></div>
          <div class="emp-stats-bar-seg emp-stats-bar-seg--int" [style.flex]="stageCount || 0"></div>
        </div>

        <div class="emp-stats-grid">
          <div class="emp-stats-item">
            <div class="emp-stats-item-row"><span class="emp-dot emp-dot--ft"></span><span class="emp-stats-item-lbl">CDI</span></div>
            <div class="emp-stats-item-num">{{ cdiCount | number }}</div>
            <div class="emp-stats-item-sub">Employees</div>
          </div>
          <div class="emp-stats-item">
            <div class="emp-stats-item-row"><span class="emp-dot emp-dot--pt"></span><span class="emp-stats-item-lbl">CDD</span></div>
            <div class="emp-stats-item-num">{{ cddCount | number }}</div>
            <div class="emp-stats-item-sub">Employees</div>
          </div>
          <div class="emp-stats-item">
            <div class="emp-stats-item-row"><span class="emp-dot emp-dot--ct"></span><span class="emp-stats-item-lbl">Intérim</span></div>
            <div class="emp-stats-item-num">{{ interimCount | number }}</div>
            <div class="emp-stats-item-sub">Employees</div>
          </div>
          <div class="emp-stats-item">
            <div class="emp-stats-item-row"><span class="emp-dot emp-dot--int"></span><span class="emp-stats-item-lbl">Stage</span></div>
            <div class="emp-stats-item-num">{{ stageCount | number }}</div>
            <div class="emp-stats-item-sub">Employees</div>
          </div>
        </div>
      </div>

      <!-- Chart Card -->
      <div class="emp-chart-card">
        <div class="emp-chart-title">Department Distribution</div>
        <div class="emp-chart-wrap">
          <apx-chart
            [series]="donutChart.series"
            [chart]="donutChart.chart"
            [labels]="donutChart.labels"
            [colors]="donutChart.colors"
            [plotOptions]="donutChart.plotOptions"
            [legend]="donutChart.legend"
            [dataLabels]="donutChart.dataLabels"
            [stroke]="donutChart.stroke">
          </apx-chart>
        </div>
        <div class="emp-chart-legend">
          <span *ngFor="let l of donutLegend" class="emp-legend-item">
            <span class="emp-legend-dot" [style.background]="l.color"></span>{{ l.label }}
          </span>
        </div>
      </div>

    </div>

    <!-- Table Card -->
    <div class="emp-table-card">
      <div class="emp-tabs-bar">
        <button *ngFor="let t of tableTabs" class="emp-tab" [class.emp-tab--active]="activeTableTab===t" (click)="activeTableTab=t">{{ t }}</button>
        <span class="emp-tabs-updated"><i class="bx bx-refresh" style="cursor:pointer" (click)="loadData()"></i>&nbsp; Updated just now</span>
      </div>

      <!-- Search + Import -->
      <div class="search-row">
        <div class="search-input-wrap">
          <i class="bx bx-search search-icon"></i>
          <input class="search-input" [(ngModel)]="searchQuery" (ngModelChange)="applySearch()" placeholder="Search by name, function, department…" />
        </div>
        <label class="import-btn" title="Import from Excel">
          <i class="bx bx-upload"></i> Import Excel
          <input type="file" accept=".xlsx,.xls" style="display:none" (change)="onFileImport($event)" />
        </label>
      </div>

      <div style="overflow-x:auto;">
        <!-- Loading state -->
        <div class="state-box" *ngIf="loading">
          <div class="spinner"></div>
          Loading employees…
        </div>

        <!-- Error state -->
        <div class="state-box state-box--error" *ngIf="!loading && error">
          <i class="bx bx-error-circle"></i>
          {{ error }}
          <br><button style="margin-top:12px;padding:7px 18px;border:none;border-radius:8px;background:#2FA8A0;color:#fff;cursor:pointer;font-size:13px" (click)="loadData()">Retry</button>
        </div>

        <!-- Empty state -->
        <div class="state-box" *ngIf="!loading && !error && filteredRows.length === 0">
          <i class="bx bx-user-x"></i>
          {{ searchQuery ? 'No employees match your search.' : 'No employees found.' }}
        </div>

        <!-- Data table -->
        <table *ngIf="!loading && !error && filteredRows.length > 0">
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Name</th>
              <th>Start Date</th>
              <th>Contract Type</th>
              <th>Function</th>
              <th>Gender</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of pagedRows" (click)="openDetail(getRaw(e.matricule))">
              <td class="emp-td-id">{{ e.matricule }}</td>
              <td class="emp-td-name">{{ e.name }}</td>
              <td class="emp-td-date">{{ e.startDate || '—' }}</td>
              <td><span class="emp-type-chip emp-type-chip--{{ e.empTypeClass }}">{{ e.empType || '—' }}</span></td>
              <td><span class="emp-role-chip">{{ e.role || '—' }}</span></td>
              <td><span class="emp-gender-chip emp-gender-chip--{{ e.genderClass }}">{{ e.gender || '—' }}</span></td>
              <td>
                <div class="emp-row-actions" (click)="$event.stopPropagation()">
                  <i class="bx bx-pencil emp-act-icon" (click)="openEditByRow(e)"></i>
                  <i class="bx bx-trash emp-act-icon emp-act-icon--del" (click)="deleteEmployee(e.matricule)"></i>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-row" *ngIf="!loading && !error && filteredRows.length > 0">
        <span class="pagination-info">
          Showing {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, filteredRows.length) }} of {{ filteredRows.length }} employees
        </span>
        <div class="pagination-btns">
          <button class="page-btn" (click)="currentPage=currentPage-1" [disabled]="currentPage===1"><i class="bx bx-chevron-left"></i></button>
          <button class="page-btn" *ngFor="let p of pageNumbers" [class.active]="p===currentPage" (click)="currentPage=p">{{ p }}</button>
          <button class="page-btn" (click)="currentPage=currentPage+1" [disabled]="currentPage===totalPages"><i class="bx bx-chevron-right"></i></button>
        </div>
      </div>
    </div>

  </div>
  `
})
export class CollaborateurComponent implements OnInit {

  today = new Date();
  Math = Math;

  // ── Data ──
  allEmployees: Collaborateur[] = [];
  rows: EmpRow[] = [];
  filteredRows: EmpRow[] = [];
  searchQuery = '';

  // ── State ──
  loading = false;
  error: string | null = null;
  saving = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  // ── Stats (computed from real data) ──
  get total()       { return this.allEmployees.length; }
  get cdiCount()    { return this.allEmployees.filter(e => e.Type === 'CDI').length; }
  get cddCount()    { return this.allEmployees.filter(e => e.Type === 'CDD').length; }
  get interimCount(){ return this.allEmployees.filter(e => e.Type === 'Intérim').length; }
  get stageCount()  { return this.allEmployees.filter(e => e.Type === 'Stage').length; }

  get detailNationalite(): string { return this.detailEmployee?.['Nationalité'] ?? ''; }
  get detailDepartement(): string { return this.detailEmployee?.['Département'] ?? ''; }
  get detailAnciennete(): number | null { return this.detailEmployee?.['Ancienneté'] ?? null; }

  // ── Table ──
  tableTabs = ['All', 'Contract Type', 'Gender', 'Department'];
  activeTableTab = 'All';

  // ── Panels ──
  detailEmployee: Collaborateur | null = null;
  showCreateModal = false;
  editingEmployee: Collaborateur | null = null;

  // ── Form ──
  form = this.emptyForm();

  // ── Pagination ──
  currentPage = 1;
  pageSize = 10;
  get totalPages() { return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize)); }
  get pageNumbers() {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end   = Math.min(this.totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
  get pagedRows() {
    const s = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows.slice(s, s + this.pageSize);
  }

  // ── Chart ──
  donutChart: any = {};
  donutLegend: { label: string; color: string }[] = [];
  private readonly COLORS = ['#3B82F6','#EF4444','#9CA3AF','#F59E0B','#22C55E','#F97316','#8B5CF6','#EC4899'];

  constructor(private collaborateurService: CollaborateurService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    this.collaborateurService.getAll().subscribe({
      next: data => {
        this.allEmployees = data;
        this.rows = data.map(e => this.toRow(e));
        this.applySearch();
        this.buildChart(data);
        this.loading = false;
      },
      error: err => {
        this.error = err?.error?.message || 'Failed to load employees. Please check your connection.';
        this.loading = false;
      }
    });
  }

  applySearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredRows = q
      ? this.rows.filter(r =>
          r.name.toLowerCase().includes(q) ||
          (r.role?.toLowerCase() ?? '').includes(q) ||
          (r.department?.toLowerCase() ?? '').includes(q) ||
          String(r.matricule).includes(q)
        )
      : [...this.rows];
    this.currentPage = 1;
  }

  getRaw(matricule: number): Collaborateur {
    return this.allEmployees.find(e => e.matricule === matricule) as Collaborateur;
  }

  openDetail(emp: Collaborateur): void {
    this.detailEmployee = emp;
    this.showCreateModal = false;
    this.editingEmployee = null;
  }

  openCreate(): void {
    this.editingEmployee = null;
    this.form = this.emptyForm();
    this.showCreateModal = true;
    this.detailEmployee = null;
  }

  openEdit(emp: Collaborateur): void {
    this.editingEmployee = emp;
    this.form = {
      nom: emp.nom,
      prenom: emp.prenom,
      email: emp.email,
      sexe: emp.sexe ?? '',
      CIN: emp.CIN ?? '',
      nationalite: emp.Nationalité ?? '',
      CATEGORIE: emp.CATEGORIE ?? '',
      age: emp.age ?? null,
      date_naissance: emp.date_naissance ?? '',
      FILIALE: emp.FILIALE ?? '',
      Type: emp.Type ?? '',
      departement: emp.Département ?? '',
      Fonction: emp.Fonction ?? '',
      date_entree: emp.date_entree ?? '',
      anciennete: emp.Ancienneté ?? null,
    };
    this.showCreateModal = true;
    this.detailEmployee = null;
  }

  openEditByRow(row: EmpRow): void {
    const emp = this.getRaw(row.matricule);
    if (emp) this.openEdit(emp);
  }

  submitForm(): void {
    if (!this.form.nom || !this.form.prenom || !this.form.email) {
      this.showToast('Nom, Prénom and Email are required.', 'error');
      return;
    }
    this.saving = true;
    const dto: any = {
      ...this.form,
      Nationalité: this.form.nationalite,
      Département: this.form.departement,
      Ancienneté: this.form.anciennete,
    };

    if (this.editingEmployee) {
      this.collaborateurService.update(this.editingEmployee.matricule, dto).subscribe({
        next: updated => {
          const idx = this.allEmployees.findIndex(e => e.matricule === this.editingEmployee!.matricule);
          if (idx !== -1) this.allEmployees[idx] = updated;
          this.rows = this.allEmployees.map(e => this.toRow(e));
          this.applySearch();
          this.showCreateModal = false;
          this.editingEmployee = null;
          this.saving = false;
          this.showToast('Employee updated successfully.', 'success');
        },
        error: err => {
          this.saving = false;
          this.showToast(err?.error?.message || 'Failed to update employee.', 'error');
        }
      });
    } else {
      this.collaborateurService.create(dto).subscribe({
        next: created => {
          this.allEmployees = [created, ...this.allEmployees];
          this.rows = this.allEmployees.map(e => this.toRow(e));
          this.applySearch();
          this.buildChart(this.allEmployees);
          this.showCreateModal = false;
          this.saving = false;
          this.showToast('Employee created successfully.', 'success');
        },
        error: err => {
          this.saving = false;
          this.showToast(err?.error?.message || 'Failed to create employee.', 'error');
        }
      });
    }
  }

  deleteEmployee(matricule: number): void {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    this.collaborateurService.delete(matricule).subscribe({
      next: () => {
        this.allEmployees = this.allEmployees.filter(e => e.matricule !== matricule);
        this.rows = this.allEmployees.map(e => this.toRow(e));
        this.applySearch();
        this.buildChart(this.allEmployees);
        this.showToast('Employee deleted.', 'success');
      },
      error: err => this.showToast(err?.error?.message || 'Failed to delete employee.', 'error')
    });
  }

  onFileImport(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.collaborateurService.importFromExcel(file).subscribe({
      next: () => {
        this.showToast('Import successful. Reloading data…', 'success');
        this.loadData();
      },
      error: err => this.showToast(err?.error || 'Import failed.', 'error')
    });
  }

  closeAll(): void {
    this.detailEmployee = null;
    this.showCreateModal = false;
  }

  initials(emp: Collaborateur): string {
    return `${(emp.prenom?.[0] ?? '').toUpperCase()}${(emp.nom?.[0] ?? '').toUpperCase()}`;
  }

  private toRow(e: Collaborateur): EmpRow {
    return {
      matricule: e.matricule,
      name: `${e.prenom ?? ''} ${e.nom ?? ''}`.trim(),
      startDate: e.date_entree ?? '',
      empType: e.Type ?? '',
      empTypeClass: this.contractClass(e.Type),
      role: e.Fonction ?? '',
      gender: e.sexe ?? '',
      genderClass: this.genderClass(e.sexe),
      dob: e.date_naissance ?? '',
      email: e.email ?? '',
      department: e.Département ?? '',
      cin: e.CIN ?? '',
      anciennete: e.Ancienneté ?? 0,
      filiale: e.FILIALE ?? '',
    };
  }

  private contractClass(type?: string): string {
    if (!type) return 'fulltime';
    const t = type.toUpperCase();
    if (t === 'CDI') return 'fulltime';
    if (t === 'CDD') return 'parttime';
    if (t.includes('INTÉRIM') || t.includes('INTERIM')) return 'contract';
    if (t === 'STAGE') return 'intern';
    return 'fulltime';
  }

  private genderClass(sexe?: string): string {
    if (!sexe) return 'man';
    const s = sexe.toUpperCase();
    if (s === 'F' || s.startsWith('F') || s === 'FEMME' || s === 'FEMALE') return 'women';
    return 'man';
  }

  private buildChart(data: Collaborateur[]): void {
    const deptCounts: Record<string, number> = {};
    data.forEach(e => {
      const dept = e.Département || 'Other';
      deptCounts[dept] = (deptCounts[dept] ?? 0) + 1;
    });
    const sorted = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 7);
    const otherCount = sorted.slice(7).reduce((s, [, c]) => s + c, 0);
    if (otherCount > 0) top.push(['Other', otherCount]);

    const labels  = top.map(([d]) => d);
    const series  = top.map(([, c]) => c);
    const colors  = top.map((_, i) => this.COLORS[i % this.COLORS.length]);

    this.donutLegend = top.map(([d], i) => ({ label: d, color: this.COLORS[i % this.COLORS.length] }));

    this.donutChart = {
      series,
      chart: { type:'donut', height:280, toolbar:{show:false}, fontFamily:'Inter,sans-serif' },
      labels,
      colors,
      plotOptions: {
        pie: {
          startAngle: -90, endAngle: 90, offsetY: 20,
          donut: {
            size: '60%',
            labels: {
              show: true,
              name:  { show:true, fontSize:'13px', fontWeight:400, color:'#8FA3B8', offsetY:20 },
              value: { show:true, fontSize:'36px', fontWeight:700, color:'#1A2B3C', offsetY:-16 },
              total: { show:true, showAlways:true, label:'Departments', fontSize:'13px', fontWeight:400, color:'#8FA3B8', formatter: () => String(labels.length) },
            }
          }
        }
      },
      legend: { show:false },
      dataLabels: { enabled:false },
      stroke: { width:3, colors:['#fff'] },
    };
  }

  private emptyForm(): any {
    return { nom:'', prenom:'', email:'', sexe:'', CIN:'', nationalite:'', CATEGORIE:'', age: null, date_naissance:'', FILIALE:'', Type:'', departement:'', Fonction:'', date_entree:'', anciennete: null };
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 3500);
  }
}
