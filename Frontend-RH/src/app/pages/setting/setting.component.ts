import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ThemeService, AppTheme } from '../../core/services/theme.service';
import { AuthenticationService } from '../../core/services/auth.service';
import { AdminService } from '../admin/admin.service';
import { environment } from 'src/environments/environment';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WallClockComponent } from 'src/app/shared/wall-clock/wall-clock.component';

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, WallClockComponent],
  styles: [`
    :host { display:block; }
    .page { padding:0 24px 80px; animation:fadeIn .4s ease both; }
    @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

    /* Horizontal tabs */
    .tabs-bar { display:flex; gap:0; border-bottom:2px solid #F0F3F6; margin-bottom:0; background:#fff; padding:0 24px; }
    .tab-btn { background:none; border:none; padding:14px 20px; font-size:13.5px; font-weight:500; color:#8FA3B8; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; transition:all .15s; }
    .tab-btn.active { color:#1A2B3C; font-weight:700; border-bottom-color:#2FA8A0; }
    .tab-btn:hover:not(.active) { color:#4A6080; }

    /* Content card */
    .content-card { background:#fff; border-radius:0 0 12px 12px; padding:28px 32px 32px; box-shadow:0 4px 20px rgba(22,34,51,.06); }
    .section-head { font-size:15px; font-weight:700; color:#1A2B3C; margin:0 0 20px; }
    .divider { border:none; border-top:1px solid #F0F3F6; margin:28px 0; }

    /* Form rows: left=label+desc, right=input */
    .form-row { display:flex; align-items:flex-start; gap:40px; padding:14px 0; border-bottom:1px solid #F8FAFC; }
    .form-row:last-of-type { border-bottom:none; }
    .fr-left { flex:0 0 340px; }
    .fr-right { flex:1; }
    .fr-label { font-size:14px; font-weight:600; color:#1A2B3C; margin:0 0 4px; }
    .fr-desc { font-size:12.5px; color:#8FA3B8; margin:0; line-height:1.5; }

    /* Logo row */
    .logo-row { display:flex; align-items:center; gap:16px; }
    .logo-circle { width:64px; height:64px; border-radius:50%; background:#E8EDF2; display:flex; align-items:center; justify-content:center; position:relative; flex-shrink:0; overflow:visible; }
    .logo-circle-inner { width:64px; height:64px; border-radius:50%; background:repeating-conic-gradient(#D0D8E0 0% 25%, #E8EDF2 0% 50%) 0 0/8px 8px; }
    .logo-edit-btn { position:absolute; bottom:0; right:0; width:22px; height:22px; border-radius:50%; background:#1B7872; border:2px solid #fff; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .logo-edit-btn i { font-size:11px; color:#fff; }
    .logo-text { }
    .logo-name { font-size:14px; font-weight:600; color:#1A2B3C; margin:0 0 2px; }
    .logo-hint { font-size:12px; color:#8FA3B8; margin:0; }

    /* Avatar circle for profile */
    .avatar-circle { width:64px; height:64px; border-radius:50%; background:repeating-conic-gradient(#D0D8E0 0% 25%, #E8EDF2 0% 50%) 0 0/8px 8px; position:relative; }
    .avatar-edit-btn { position:absolute; bottom:0; right:0; width:22px; height:22px; border-radius:50%; background:#1B7872; border:2px solid #fff; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .avatar-edit-btn i { font-size:11px; color:#fff; }

    /* Inputs */
    .form-input { width:100%; border:1.5px solid #E8EDF2; border-radius:8px; padding:10px 14px; font-size:13.5px; color:#1A2B3C; font-family:'Archivo',sans-serif; outline:none; transition:border .15s; box-sizing:border-box; background:#fff; }
    .form-input:focus { border-color:#2FA8A0; }
    .form-input:disabled { background:#F5F7FA; color:#B0BFCF; cursor:not-allowed; }
    select.form-input { cursor:pointer; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238FA3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; padding-right:36px; }

    /* Save bar */
    .save-bar { position:fixed; bottom:0; right:0; left:260px; background:#fff; border-top:1px solid #F0F3F6; padding:14px 40px; display:flex; justify-content:flex-end; z-index:100; }
    .btn-save { background:#1B7872; color:#fff; border:none; border-radius:10px; padding:12px 28px; font-size:14px; font-weight:600; cursor:pointer; }

    /* Security / notifications / theme / integrations */
    .toggle-row { display:flex; align-items:center; justify-content:space-between; padding:14px 0; border-bottom:1px solid #F5F7FA; }
    .toggle-row:last-child { border-bottom:none; }
    .toggle-title { font-size:13.5px; font-weight:600; color:#1A2B3C; }
    .toggle-desc { font-size:12px; color:#8FA3B8; margin-top:2px; }
    .toggle { position:relative; width:44px; height:24px; flex-shrink:0; }
    .toggle input { opacity:0; width:0; height:0; }
    .toggle-slider { position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:#E8EDF2; border-radius:24px; transition:.3s; }
    .toggle-slider:before { position:absolute; content:""; height:18px; width:18px; left:3px; bottom:3px; background:#fff; border-radius:50%; transition:.3s; }
    .toggle input:checked + .toggle-slider { background:#1B7872; }
    .toggle input:checked + .toggle-slider:before { transform:translateX(20px); }

    /* ── Theme Picker ── */
    .theme-section-desc { font-size:13px; color:#8FA3B8; margin:-8px 0 28px; line-height:1.6; }
    .theme-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }

    .theme-card {
      border-radius:14px; border:2px solid #F0F3F6; cursor:pointer;
      background:#fff; transition:border-color .2s, box-shadow .2s;
      overflow:hidden; position:relative;
    }
    .theme-card:hover { border-color:#CBD5E0; box-shadow:0 4px 16px rgba(22,34,51,.08); }
    .theme-card.selected { border-color:#2FA8A0; box-shadow:0 0 0 4px rgba(47,168,160,.12); }

    /* checkmark badge */
    .theme-check {
      position:absolute; top:10px; right:10px; width:22px; height:22px;
      border-radius:50%; background:#2FA8A0; display:none;
      align-items:center; justify-content:center; z-index:2;
    }
    .theme-check i { font-size:13px; color:#fff; }
    .theme-card.selected .theme-check { display:flex; }

    /* mini UI mockup */
    .theme-mockup {
      height:130px; overflow:hidden; display:flex; border-bottom:1px solid #F0F3F6;
    }
    .tm-sidebar { width:36px; height:100%; display:flex; flex-direction:column; gap:6px; padding:10px 6px; flex-shrink:0; }
    .tm-sb-dot { width:20px; height:4px; border-radius:3px; opacity:.7; }
    .tm-sb-dot.active { opacity:1; }
    .tm-content { flex:1; padding:10px; display:flex; flex-direction:column; gap:7px; }
    .tm-topbar { height:18px; border-radius:5px; width:100%; }
    .tm-row { display:flex; gap:6px; }
    .tm-card { border-radius:6px; height:28px; flex:1; }
    .tm-card.wide { flex:2; }
    .tm-line { height:6px; border-radius:3px; width:70%; }
    .tm-line.short { width:40%; }

    /* Light theme colors */
    .tm-light .tm-sidebar { background:#F8FAFC; }
    .tm-light .tm-sb-dot { background:#CBD5E0; }
    .tm-light .tm-sb-dot.active { background:#2FA8A0; }
    .tm-light .tm-content { background:#F1F5F9; }
    .tm-light .tm-topbar { background:#fff; }
    .tm-light .tm-card { background:#fff; }
    .tm-light .tm-line { background:#E2E8F0; }

    /* Dark theme colors */
    .tm-dark .tm-sidebar { background:#0F172A; }
    .tm-dark .tm-sb-dot { background:#334155; }
    .tm-dark .tm-sb-dot.active { background:#2FA8A0; }
    .tm-dark .tm-content { background:#1E293B; }
    .tm-dark .tm-topbar { background:#0F172A; }
    .tm-dark .tm-card { background:#0F172A; }
    .tm-dark .tm-line { background:#334155; }

    /* Teal theme colors */
    .tm-teal .tm-sidebar { background:#1B7872; }
    .tm-teal .tm-sb-dot { background:rgba(255,255,255,.35); }
    .tm-teal .tm-sb-dot.active { background:#fff; }
    .tm-teal .tm-content { background:#F0FDF9; }
    .tm-teal .tm-topbar { background:#fff; }
    .tm-teal .tm-card { background:#fff; }
    .tm-teal .tm-line { background:#CCEDE9; }

    .theme-card-body { padding:14px 16px; }
    .theme-card-name { font-size:14px; font-weight:700; color:#1A2B3C; margin:0 0 3px; }
    .theme-card-desc { font-size:12px; color:#8FA3B8; margin:0; }

    .integration-item { display:flex; align-items:center; gap:14px; padding:14px 0; border-bottom:1px solid #F5F7FA; }
    .integration-item:last-child { border-bottom:none; }
    .integration-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
    .integration-info { flex:1; }
    .integration-name { font-size:13.5px; font-weight:600; color:#1A2B3C; }
    .integration-desc { font-size:12px; color:#8FA3B8; margin-top:2px; }
    .btn-connect { background:#1B7872; color:#fff; border:none; border-radius:7px; padding:7px 16px; font-size:12px; font-weight:600; cursor:pointer; }
    .btn-disconnect { background:#FFE4E6; color:#BE123C; border:none; border-radius:7px; padding:7px 16px; font-size:12px; font-weight:600; cursor:pointer; }

    .pw-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .form-group { display:flex; flex-direction:column; gap:6px; }
    .form-label { font-size:12.5px; font-weight:600; color:#4A6080; }

    .notif-section { display:flex; gap:40px; align-items:flex-start; }
    .notif-list { flex:1; display:flex; flex-direction:column; gap:0; }
    .notif-row { display:flex; align-items:flex-start; gap:14px; padding:12px 0; border-bottom:1px solid #F8FAFC; }
    .notif-row:last-child { border-bottom:none; }

    /* ── Dark Mode ── */
    :host-context([data-theme="dark"]) .tabs-bar{background:#111111 !important;border-bottom-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .tab-btn{color:#6B6B6B !important}
    :host-context([data-theme="dark"]) .tab-btn.active{color:#FFFFFF !important;border-bottom-color:#2FA8A0}
    :host-context([data-theme="dark"]) .tab-btn:hover:not(.active){color:#A0A0A0 !important}
    :host-context([data-theme="dark"]) .content-card{background:#111111 !important;box-shadow:none !important}
    :host-context([data-theme="dark"]) .section-head{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .divider{border-top-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .form-row{border-bottom-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .fr-label{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .fr-desc{color:#6B6B6B !important}
    :host-context([data-theme="dark"]) .form-input{background:#1A1A1A !important;border-color:#2A2A2A !important;color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .form-input:disabled{background:#1A1A1A !important;color:#4A6080}
    :host-context([data-theme="dark"]) .toggle-row{border-bottom-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .toggle-title{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .toggle-desc{color:#6B6B6B !important}
    :host-context([data-theme="dark"]) .toggle-slider{background:#243E58}
    :host-context([data-theme="dark"]) .save-bar{background:#111111 !important;border-top-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .theme-card{background:#1A1A1A !important;border-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .theme-card:hover{border-color:#2FA8A0}
    :host-context([data-theme="dark"]) .theme-card.selected{border-color:#2FA8A0;box-shadow:0 0 0 4px rgba(47,168,160,.15)}
    :host-context([data-theme="dark"]) .theme-mockup{border-bottom-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .theme-card-name{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .theme-card-desc{color:#6B6B6B !important}
    :host-context([data-theme="dark"]) .theme-section-desc{color:#6B6B6B !important}
    :host-context([data-theme="dark"]) .integration-item{border-bottom-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .integration-name{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .integration-desc{color:#6B6B6B !important}
    :host-context([data-theme="dark"]) .notif-row{border-bottom-color:#2A2A2A !important}
    :host-context([data-theme="dark"]) .form-label{color:#A0A0A0 !important}
    :host-context([data-theme="dark"]) .logo-name{color:#FFFFFF !important}
    :host-context([data-theme="dark"]) .logo-hint{color:#6B6B6B !important}
  `],
  template: `
  <div class="page">

    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
      <div class="page-header" style="flex:1;margin-bottom:0;">
        <h4 class="page-title">Settings</h4>
      </div>
      <app-wall-clock></app-wall-clock>
    </div>

    <!-- Tabs bar -->
    <div class="tabs-bar">
      <button *ngFor="let t of tabs" class="tab-btn" [class.active]="activeTab===t.key" (click)="activeTab=t.key">{{ t.label | translate }}</button>
    </div>

    <!-- Content -->
    <div class="content-card">

      <!-- General -->
      <ng-container *ngIf="activeTab==='general'">
        <p class="section-head">{{ 'SETTING.SECTION_ORG_PROFILE' | translate }}</p>

        <!-- Logo -->
        <div class="form-row">
          <div class="fr-left">
            <p class="fr-label">{{ 'SETTING.ORG_LOGO' | translate }}</p>
            <p class="fr-desc">{{ 'SETTING.ORG_LOGO_DESC' | translate }}</p>
          </div>
          <div class="fr-right">
            <div class="logo-row">
              <div class="logo-circle">
                <div class="logo-circle-inner"></div>
                <div class="logo-edit-btn"><i class="bx bx-pencil"></i></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Display Name -->
        <div class="form-row">
          <div class="fr-left">
            <p class="fr-label">{{ 'SETTING.FIELD_DISPLAY_NAME' | translate }}</p>
            <p class="fr-desc">{{ 'SETTING.DISPLAY_NAME_DESC' | translate }}</p>
          </div>
          <div class="fr-right">
            <input class="form-input" [(ngModel)]="org.name" [placeholder]="'SETTING.ORG_NAME_PH' | translate">
          </div>
        </div>

        <hr class="divider">
        <p class="section-head">{{ 'SETTING.SECTION_YOUR_PROFILE' | translate }}</p>

        <!-- Profile Picture -->
        <div class="form-row">
          <div class="fr-left">
            <p class="fr-label">{{ 'SETTING.PROFILE_PICTURE' | translate }}</p>
            <p class="fr-desc">{{ 'SETTING.PROFILE_PIC_DESC' | translate }}</p>
          </div>
          <div class="fr-right">
            <div class="avatar-circle">
              <div class="avatar-edit-btn"><i class="bx bx-pencil"></i></div>
            </div>
          </div>
        </div>

        <!-- Full Name -->
        <div class="form-row">
          <div class="fr-left">
            <p class="fr-label">{{ 'SETTING.FIELD_FULL_NAME' | translate }}</p>
            <p class="fr-desc">{{ 'SETTING.FULL_NAME_DESC' | translate }}</p>
          </div>
          <div class="fr-right">
            <input class="form-input" [(ngModel)]="user.fullName" [placeholder]="'SETTING.FIELD_FULL_NAME' | translate">
          </div>
        </div>

        <!-- Employee ID -->
        <div class="form-row">
          <div class="fr-left">
            <p class="fr-label">{{ 'SETTING.FIELD_EMP_ID' | translate }}</p>
            <p class="fr-desc">{{ 'SETTING.EMP_ID_DESC' | translate }}</p>
          </div>
          <div class="fr-right">
            <input class="form-input" [value]="user.empId" placeholder="123456789" disabled>
          </div>
        </div>

        <!-- Email -->
        <div class="form-row">
          <div class="fr-left">
            <p class="fr-label">{{ 'SETTING.FIELD_EMAIL' | translate }}</p>
            <p class="fr-desc">{{ 'SETTING.EMAIL_LOGIN_DESC' | translate }}</p>
          </div>
          <div class="fr-right">
            <input class="form-input" [value]="user.email" [placeholder]="'SETTING.EMAIL_LOGIN_PH' | translate" disabled>
          </div>
        </div>

        <!-- Role -->
        <div class="form-row">
          <div class="fr-left">
            <p class="fr-label">{{ 'SETTING.FIELD_ROLE' | translate }}</p>
            <p class="fr-desc">{{ 'SETTING.ROLE_DESC' | translate }}</p>
          </div>
          <div class="fr-right">
            <input class="form-input" [value]="user.role" disabled>
          </div>
        </div>

        <!-- Title -->
        <div class="form-row">
          <div class="fr-left">
            <p class="fr-label">{{ 'SETTING.FIELD_TITLE' | translate }}</p>
            <p class="fr-desc">{{ 'SETTING.TITLE_PH' | translate }}</p>
          </div>
          <div class="fr-right">
            <input class="form-input" [(ngModel)]="user.title" [placeholder]="'SETTING.TITLE_PH' | translate">
          </div>
        </div>
      </ng-container>

      <!-- Security -->
      <ng-container *ngIf="activeTab==='security'">
        <p class="section-head">{{ 'SETTING.SECTION_SECURITY' | translate }}</p>
        <div class="pw-grid" style="margin-bottom:24px;">
          <div class="form-group">
            <label class="form-label">{{ 'SETTING.FIELD_CURRENT_PASSWORD' | translate }}</label>
            <input class="form-input" type="password" [(ngModel)]="security.currentPassword" placeholder="••••••••">
          </div>
          <div></div>
          <div class="form-group">
            <label class="form-label">{{ 'SETTING.FIELD_NEW_PASSWORD' | translate }}</label>
            <input class="form-input" type="password" [(ngModel)]="security.newPassword" placeholder="••••••••">
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'SETTING.FIELD_CONFIRM_PASSWORD' | translate }}</label>
            <input class="form-input" type="password" [(ngModel)]="security.confirmPassword" placeholder="••••••••">
          </div>
        </div>
      </ng-container>

      <!-- Notifications -->
      <ng-container *ngIf="activeTab==='notifications'">
        <p class="section-head">{{ 'SETTING.SECTION_NOTIFICATIONS' | translate }}</p>
        <p class="fr-desc" style="margin:-12px 0 24px;">{{ 'SETTING.NOTIF_SECTION_DESC' | translate }}</p>

        <!-- Email Notification -->
        <div class="notif-section">
          <div class="fr-left">
            <p class="fr-label">{{ 'SETTING.EMAIL_NOTIF_LABEL' | translate }}</p>
            <p class="fr-desc">{{ 'SETTING.EMAIL_NOTIF_DESC' | translate }}</p>
          </div>
          <div class="notif-list">
            <div *ngFor="let n of emailNotifs" class="notif-row">
              <label class="toggle"><input type="checkbox" [(ngModel)]="n.on"><span class="toggle-slider"></span></label>
              <div>
                <div class="toggle-title">{{ n.title | translate }}</div>
                <div class="toggle-desc">{{ n.desc | translate }}</div>
              </div>
            </div>
          </div>
        </div>

        <hr class="divider">

        <!-- Push Notification -->
        <div class="notif-section">
          <div class="fr-left">
            <p class="fr-label">{{ 'SETTING.PUSH_NOTIF_LABEL' | translate }}</p>
            <p class="fr-desc">{{ 'SETTING.PUSH_NOTIF_DESC' | translate }}</p>
          </div>
          <div class="notif-list">
            <div *ngFor="let n of pushNotifs" class="notif-row">
              <label class="toggle"><input type="checkbox" [(ngModel)]="n.on"><span class="toggle-slider"></span></label>
              <div>
                <div class="toggle-title">{{ n.title | translate }}</div>
                <div class="toggle-desc">{{ n.desc | translate }}</div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Theme -->
      <ng-container *ngIf="activeTab==='theme'">
        <p class="section-head">{{ 'SETTING.SECTION_APPEARANCE' | translate }}</p>
        <p class="theme-section-desc">{{ 'SETTING.APPEARANCE_DESC' | translate }}</p>

        <div class="theme-grid">

          <!-- Light -->
          <div class="theme-card" [class.selected]="selectedTheme==='light'" (click)="applyTheme('light')">
            <div class="theme-check"><i class="bx bx-check"></i></div>
            <div class="theme-mockup tm-light">
              <div class="tm-sidebar">
                <div class="tm-sb-dot active"></div>
                <div class="tm-sb-dot"></div>
                <div class="tm-sb-dot"></div>
                <div class="tm-sb-dot"></div>
                <div class="tm-sb-dot"></div>
              </div>
              <div class="tm-content">
                <div class="tm-topbar"></div>
                <div class="tm-row">
                  <div class="tm-card wide"></div>
                  <div class="tm-card"></div>
                </div>
                <div class="tm-row">
                  <div class="tm-card"></div>
                  <div class="tm-card"></div>
                  <div class="tm-card"></div>
                </div>
                <div class="tm-line"></div>
                <div class="tm-line short"></div>
              </div>
            </div>
            <div class="theme-card-body">
              <p class="theme-card-name">☀️ {{ 'SETTING.THEME_LIGHT' | translate }}</p>
              <p class="theme-card-desc">{{ 'SETTING.THEME_LIGHT_DESC' | translate }}</p>
            </div>
          </div>

          <!-- Dark -->
          <div class="theme-card" [class.selected]="selectedTheme==='dark'" (click)="applyTheme('dark')">
            <div class="theme-check"><i class="bx bx-check"></i></div>
            <div class="theme-mockup tm-dark">
              <div class="tm-sidebar">
                <div class="tm-sb-dot active"></div>
                <div class="tm-sb-dot"></div>
                <div class="tm-sb-dot"></div>
                <div class="tm-sb-dot"></div>
                <div class="tm-sb-dot"></div>
              </div>
              <div class="tm-content">
                <div class="tm-topbar"></div>
                <div class="tm-row">
                  <div class="tm-card wide"></div>
                  <div class="tm-card"></div>
                </div>
                <div class="tm-row">
                  <div class="tm-card"></div>
                  <div class="tm-card"></div>
                  <div class="tm-card"></div>
                </div>
                <div class="tm-line"></div>
                <div class="tm-line short"></div>
              </div>
            </div>
            <div class="theme-card-body">
              <p class="theme-card-name">🌙 {{ 'SETTING.THEME_DARK' | translate }}</p>
              <p class="theme-card-desc">{{ 'SETTING.THEME_DARK_DESC' | translate }}</p>
            </div>
          </div>

          <!-- Teal -->
          <div class="theme-card" [class.selected]="selectedTheme==='teal'" (click)="applyTheme('teal')">
            <div class="theme-check"><i class="bx bx-check"></i></div>
            <div class="theme-mockup tm-teal">
              <div class="tm-sidebar">
                <div class="tm-sb-dot active"></div>
                <div class="tm-sb-dot"></div>
                <div class="tm-sb-dot"></div>
                <div class="tm-sb-dot"></div>
                <div class="tm-sb-dot"></div>
              </div>
              <div class="tm-content">
                <div class="tm-topbar"></div>
                <div class="tm-row">
                  <div class="tm-card wide"></div>
                  <div class="tm-card"></div>
                </div>
                <div class="tm-row">
                  <div class="tm-card"></div>
                  <div class="tm-card"></div>
                  <div class="tm-card"></div>
                </div>
                <div class="tm-line"></div>
                <div class="tm-line short"></div>
              </div>
            </div>
            <div class="theme-card-body">
              <p class="theme-card-name">🎨 {{ 'SETTING.THEME_TEAL' | translate }}</p>
              <p class="theme-card-desc">{{ 'SETTING.THEME_TEAL_DESC' | translate }}</p>
            </div>
          </div>

        </div>
      </ng-container>

      <!-- Integrations -->
      <ng-container *ngIf="activeTab==='integrations'">
        <p class="section-head">{{ 'SETTING.SECTION_INTEGRATIONS' | translate }}</p>
        <div *ngFor="let i of integrations" class="integration-item">
          <div class="integration-icon" [style.background]="i.bg"><i class="bx" [ngClass]="i.icon" [style.color]="i.color"></i></div>
          <div class="integration-info">
            <div class="integration-name">{{ i.name }}</div>
            <div class="integration-desc">{{ i.desc }}</div>
          </div>
          <button [class.btn-connect]="!i.connected" [class.btn-disconnect]="i.connected">{{ i.connected ? ('SETTING.BTN_DISCONNECT' | translate) : ('SETTING.BTN_CONNECT' | translate) }}</button>
        </div>
      </ng-container>

      <!-- Email -->
      <ng-container *ngIf="activeTab==='email'">
        <p class="section-head">{{ 'SETTING.SECTION_EMAIL' | translate }}</p>
        <p class="fr-desc" style="margin:-12px 0 24px;">{{ 'SETTING.EMAIL_DESC' | translate }}</p>
        <div class="form-row">
          <div class="fr-left"><p class="fr-label">{{ 'SETTING.FIELD_TO' | translate }}</p><p class="fr-desc">{{ 'SETTING.TO_DESC' | translate }}</p></div>
          <div class="fr-right"><input class="form-input" type="email" [(ngModel)]="emailForm.to" [placeholder]="'SETTING.TO_PH' | translate" /></div>
        </div>
        <div class="form-row">
          <div class="fr-left"><p class="fr-label">{{ 'SETTING.FIELD_SUBJECT' | translate }}</p><p class="fr-desc">{{ 'SETTING.SUBJECT_DESC' | translate }}</p></div>
          <div class="fr-right"><input class="form-input" [(ngModel)]="emailForm.subject" [placeholder]="'SETTING.SUBJECT_PH' | translate" /></div>
        </div>
        <div class="form-row">
          <div class="fr-left"><p class="fr-label">{{ 'SETTING.FIELD_MESSAGE' | translate }}</p><p class="fr-desc">{{ 'SETTING.MESSAGE_DESC' | translate }}</p></div>
          <div class="fr-right">
            <textarea class="form-input" [(ngModel)]="emailForm.message" rows="6" [placeholder]="'SETTING.MESSAGE_PH' | translate"
              style="resize:vertical;min-height:120px"></textarea>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:16px;gap:10px">
          <span *ngIf="emailSentMsg" style="font-size:13px;font-weight:600;align-self:center">{{ emailSentMsg }}</span>
          <button class="btn-save" [disabled]="sendingEmail || !emailForm.to || !emailForm.subject || !emailForm.message" (click)="sendEmail()">
            {{ sendingEmail ? ('SETTING.SENDING' | translate) : ('SETTING.BTN_SEND' | translate) }}
          </button>
        </div>
      </ng-container>

      <!-- Import Excel -->
      <ng-container *ngIf="activeTab==='import'">
        <p class="section-head">{{ 'SETTING.SECTION_IMPORT' | translate }}</p>
        <p class="fr-desc" style="margin:-12px 0 24px;">{{ 'SETTING.IMPORT_DESC' | translate }}</p>
        <div class="form-row">
          <div class="fr-left">
            <p class="fr-label">{{ 'SETTING.FIELD_EXCEL_FILE' | translate }}</p>
            <p class="fr-desc">{{ 'SETTING.EXCEL_FILE_DESC' | translate }}</p>
          </div>
          <div class="fr-right">
            <div style="border:2px dashed #E8EDF2;border-radius:10px;padding:32px;text-align:center;transition:border-color .2s"
              [style.border-color]="importFile ? '#2FA8A0' : '#E8EDF2'">
              <i class="bx bx-spreadsheet" style="font-size:2.5rem;color:#6B6B6B !important;display:block;margin-bottom:12px"></i>
              <p style="font-size:13px;color:#4A6080;margin:0 0 16px">
                {{ importFile ? importFile.name : ('SETTING.DRAG_FILE' | translate) }}
              </p>
              <input type="file" accept=".xlsx,.xls" (change)="onImportFileChange($event)"
                style="display:none" #importFileInput />
              <button type="button" class="btn-save" (click)="importFileInput.click()">
                <i class="bx bx-upload me-1"></i> {{ 'SETTING.BTN_CHOOSE_FILE' | translate }}
              </button>
            </div>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:16px;gap:12px;align-items:center">
          <span *ngIf="importMsg" style="font-size:13px;font-weight:600">{{ importMsg }}</span>
          <button class="btn-save" [disabled]="!importFile || importing" (click)="importExcel()">
            <span *ngIf="importing" class="spinner-border spinner-border-sm me-1" style="width:.9rem;height:.9rem"></span>
            {{ importing ? ('SETTING.IMPORTING' | translate) : ('SETTING.BTN_LAUNCH_IMPORT' | translate) }}
          </button>
        </div>
      </ng-container>

    </div>
  </div>

  <!-- Sticky Save -->
  <div class="save-bar">
    <span *ngIf="saveMsg" [style.color]="saveMsgError ? '#BE123C' : '#15803D'" style="font-size:13px;font-weight:600;margin-right:16px">{{ saveMsg }}</span>
    <button class="btn-save" [disabled]="saving" (click)="saveSettings()">
      {{ saving ? ('SETTING.BTN_SAVING' | translate) : ('SETTING.BTN_SAVE_CHANGES' | translate) }}
    </button>
  </div>
  `
})
export class SettingComponent implements OnInit {
  saving = false;
  saveMsg: string | null = null;
  saveMsgError = false;
  sendingEmail = false;
  emailSentMsg: string | null = null;
  emailForm = { to: '', subject: '', message: '' };

  importFile: File | null = null;
  importing = false;
  importMsg: string | null = null;

  constructor(
    private themeService: ThemeService,
    private authService: AuthenticationService,
    private adminService: AdminService,
    private http: HttpClient,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    // ── Theme ──────────────────────────────────────────────────────────────
    this.selectedTheme = this.themeService.current;

    // ── Org name (persisted in localStorage) ───────────────────────────────
    const savedOrgName = localStorage.getItem('hr_org_name');
    if (savedOrgName) this.org.name = savedOrgName;

    // ── Authenticated user ─────────────────────────────────────────────────
    const authUser = this.authService.getAuthenticatedUser();
    if (authUser) {
      this.user = {
        fullName: `${authUser.firstname ?? ''} ${authUser.lastname ?? ''}`.trim() || '—',
        empId:    String(authUser.id ?? '—'),
        email:    authUser.email ?? '—',
        role:     (authUser.userRole ?? '—').replace(/_/g, ' '),
        title:    authUser.title ?? '—',
      };
    }

    // ── Notification prefs (persisted in localStorage) ─────────────────────
    try {
      const saved = localStorage.getItem('hr_notif_prefs');
      if (saved) {
        const prefs = JSON.parse(saved);
        if (Array.isArray(prefs.email)) {
          prefs.email.forEach((p: any, i: number) => { if (this.emailNotifs[i]) this.emailNotifs[i].on = p.on; });
        }
        if (Array.isArray(prefs.push)) {
          prefs.push.forEach((p: any, i: number) => { if (this.pushNotifs[i])  this.pushNotifs[i].on  = p.on; });
        }
      }
    } catch {}
  }

  applyTheme(key: string): void {
    this.selectedTheme = key;
    this.themeService.apply(key as AppTheme);
  }

  saveSettings(): void {
    if (this.activeTab === 'security') {
      // ── Validate ──────────────────────────────────────────────────────────
      if (!this.security.currentPassword || !this.security.newPassword || !this.security.confirmPassword) {
        this.showSaveMsg(this.translate.instant('SETTING.TOAST_REQUIRED_FIELDS'), true); return;
      }
      if (this.security.newPassword !== this.security.confirmPassword) {
        this.showSaveMsg(this.translate.instant('SETTING.TOAST_PASSWORDS_NO_MATCH'), true); return;
      }
      if (this.security.newPassword.length < 8) {
        this.showSaveMsg(this.translate.instant('SETTING.TOAST_PASSWORD_TOO_SHORT'), true); return;
      }
      this.saving = true;
      this.authService.editPassword(this.security.currentPassword, this.security.newPassword).subscribe({
        next: () => {
          this.saving = false;
          this.security = { currentPassword: '', newPassword: '', confirmPassword: '' };
          this.showSaveMsg(this.translate.instant('SETTING.TOAST_PASSWORD_UPDATED'));
        },
        error: e => {
          this.saving = false;
          const code = e?.error?.code || '';
          const msg  = code === 'WRONG_PASSWORD'  ? this.translate.instant('SETTING.TOAST_WRONG_PASSWORD')
                     : code === 'SAME_PASSWORD'   ? this.translate.instant('SETTING.TOAST_SAME_PASSWORD')
                     : code === 'WEAK_PASSWORD'   ? this.translate.instant('SETTING.TOAST_PASSWORD_TOO_SHORT')
                     : (e?.error?.message || this.translate.instant('SETTING.TOAST_REQUIRED_FIELDS'));
          this.showSaveMsg(msg, true);
        }
      });
      return;
    }
    // General tab — persist org name locally + update user profile via backend
    if (this.activeTab === 'general') {
      // Always save org name to localStorage
      localStorage.setItem('hr_org_name', this.org.name);

      const authUser = this.authService.getAuthenticatedUser();
      if (authUser) {
        this.saving = true;
        const parts     = (this.user.fullName || '').trim().split(/\s+/);
        const firstName = parts[0] || '';
        const lastName  = parts.slice(1).join(' ') || '';
        this.adminService.updateUser(authUser.id, {
          firstName,
          lastName,
          email: authUser.email,
          title: this.user.title,
        }).subscribe({
          next: (updated) => {
            this.saving = false;
            // Persist updated name & title back into the stored auth user
            // so refresh shows the new values instead of the old ones
            const current = this.authService.getAuthenticatedUser();
            if (current) {
              this.authService.storeAuthData({
                ...current,
                firstname: updated.firstName ?? firstName,
                lastname:  updated.lastName  ?? lastName,
                title:     updated.title     ?? this.user.title,
              });
            }
            this.showSaveMsg(this.translate.instant('SETTING.TOAST_PROFILE_UPDATED'));
          },
          error: () => { this.saving = false; this.showSaveMsg(this.translate.instant('SETTING.TOAST_REQUIRED_FIELDS'), true); }
        });
        return;
      }
      this.showSaveMsg(this.translate.instant('SETTING.TOAST_SETTINGS_SAVED'));
      return;
    }
    // Preferences (notifications, theme) are UI-only — persist to localStorage
    localStorage.setItem('hr_notif_prefs', JSON.stringify({ email: this.emailNotifs, push: this.pushNotifs }));
    localStorage.setItem('hr_theme', this.selectedTheme);
    this.saving = false;
    this.showSaveMsg(this.translate.instant('SETTING.TOAST_SETTINGS_SAVED'));
  }

  sendEmail(): void {
    if (!this.emailForm.to || !this.emailForm.subject || !this.emailForm.message) return;
    this.sendingEmail = true;
    this.adminService.sendEmail(this.emailForm).subscribe({
      next: () => {
        this.sendingEmail = false;
        this.emailForm = { to: '', subject: '', message: '' };
        this.emailSentMsg = this.translate.instant('SETTING.TOAST_EMAIL_SENT');
        setTimeout(() => this.emailSentMsg = null, 3500);
      },
      error: e => {
        this.sendingEmail = false;
        this.emailSentMsg = this.translate.instant('SETTING.TOAST_EMAIL_ERROR') + ' ' + (e?.error?.message || '');
        setTimeout(() => this.emailSentMsg = null, 4000);
      }
    });
  }

  onImportFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.importFile = input.files?.[0] ?? null;
    this.importMsg = null;
  }

  importExcel(): void {
    if (!this.importFile) return;
    this.importing = true;
    this.importMsg = null;
    const fd = new FormData();
    fd.append('file', this.importFile);
    this.http.post(`${environment.apiUrl}/excel/import`, fd).subscribe({
      next: () => {
        this.importing = false;
        this.importFile = null;
        this.importMsg = this.translate.instant('SETTING.TOAST_IMPORT_SUCCESS');
        setTimeout(() => this.importMsg = null, 5000);
      },
      error: e => {
        this.importing = false;
        this.importMsg = this.translate.instant('SETTING.TOAST_EMAIL_ERROR') + ' ' + (e?.error?.message ?? '');
        setTimeout(() => this.importMsg = null, 5000);
      }
    });
  }

  private showSaveMsg(msg: string, isError = false): void {
    this.saveMsg = msg;
    this.saveMsgError = isError;
    setTimeout(() => { this.saveMsg = null; this.saveMsgError = false; }, 4000);
  }

  tabs = [
    { key: 'general',       label: 'SETTING.TAB_GENERAL'       },
    { key: 'security',      label: 'SETTING.TAB_SECURITY'      },
    { key: 'notifications', label: 'SETTING.TAB_NOTIFICATIONS' },
    { key: 'theme',         label: 'SETTING.TAB_THEME'         },
    { key: 'email',         label: 'SETTING.TAB_EMAIL'         },
    { key: 'import',        label: 'SETTING.TAB_IMPORT'        },
  ];
  activeTab = 'general';

  org = { name: 'INNOVX' };
  user = { fullName: '—', empId: '—', email: '—', role: '—', title: '—' };

  emailNotifs = [
    { title: 'SETTING.NOTIF_NEWS_TITLE',        desc: 'SETTING.NOTIF_NEWS_DESC',        on: false },
    { title: 'SETTING.NOTIF_DEADLINE_TITLE',    desc: 'SETTING.NOTIF_DEADLINE_DESC',    on: true  },
    { title: 'SETTING.NOTIF_REMINDER_TITLE',    desc: 'SETTING.NOTIF_REMINDER_DESC',    on: true  },
    { title: 'SETTING.NOTIF_ATTENDANCE_TITLE',  desc: 'SETTING.NOTIF_ATTENDANCE_DESC',  on: true  },
    { title: 'SETTING.NOTIF_RECRUITMENT_TITLE', desc: 'SETTING.NOTIF_RECRUITMENT_DESC', on: true  },
    { title: 'SETTING.NOTIF_DAYOFF_TITLE',      desc: 'SETTING.NOTIF_DAYOFF_DESC',      on: true  },
  ];
  pushNotifs = [
    { title: 'SETTING.NOTIF_DEADLINE_TITLE',    desc: 'SETTING.NOTIF_DEADLINE_DESC',    on: true  },
    { title: 'SETTING.NOTIF_REMINDER_TITLE',    desc: 'SETTING.NOTIF_REMINDER_DESC',    on: true  },
    { title: 'SETTING.NOTIF_DAYOFF_TITLE',      desc: 'SETTING.NOTIF_DAYOFF_DESC',      on: true  },
    { title: 'SETTING.NOTIF_ACTIVITY_TITLE',    desc: 'SETTING.NOTIF_ACTIVITY_DESC',    on: true  },
  ];

  themes = [
    { key: 'light', label: '☀️ Light', desc: 'Thème clair, idéal pour les environnements lumineux.' },
    { key: 'dark',  label: '🌙 Dark',  desc: 'Thème sombre, parfait pour travailler la nuit.'       },
    { key: 'teal',  label: '🎨 Teal',  desc: 'Thème turquoise, moderne et professionnel.'            },
  ];
  selectedTheme = 'light';

  security = { currentPassword: '', newPassword: '', confirmPassword: '' };

  integrations = [
    { name: 'Slack',      desc: 'Send HR notifications to Slack channels.',    icon: 'bxl-slack',    bg: '#4A154B22', color: '#4A154B', connected: true  },
    { name: 'Google Workspace', desc: 'Sync calendar events and employee directory.', icon: 'bxl-google', bg: '#4285F422', color: '#4285F4', connected: true  },
    { name: 'Zoom',       desc: 'Schedule and manage HR interview calls.',     icon: 'bx-video',     bg: '#2D8CFE22', color: '#2D8CFE', connected: false },
    { name: 'Jira',       desc: 'Link HR projects to engineering sprints.',    icon: 'bxl-jira',     bg: '#0052CC22', color: '#0052CC', connected: false },
    { name: 'Zapier',     desc: 'Automate HR workflows with 3000+ apps.',     icon: 'bxs-zap',      bg: '#FF4A0022', color: '#FF4A00', connected: false },
  ];
}
