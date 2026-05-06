import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService, AppTheme } from '../../core/services/theme.service';
import { AuthenticationService } from '../../core/services/auth.service';

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

    .theme-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:8px; }
    .theme-box { border-radius:10px; overflow:hidden; cursor:pointer; border:2px solid transparent; transition:all .2s; }
    .theme-box.selected { border-color:#2FA8A0; }
    .theme-preview { height:72px; }
    .theme-label { font-size:12px; font-weight:600; color:#4A6080; margin-top:8px; text-align:center; }

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
  `],
  template: `
  <div class="page">

    <!-- Tabs bar -->
    <div class="tabs-bar">
      <button *ngFor="let t of tabs" class="tab-btn" [class.active]="activeTab===t.key" (click)="activeTab=t.key">{{ t.label }}</button>
    </div>

    <!-- Content -->
    <div class="content-card">

      <!-- General -->
      <ng-container *ngIf="activeTab==='general'">
        <p class="section-head">Organizational Profile</p>

        <!-- Logo -->
        <div class="form-row">
          <div class="fr-left">
            <p class="fr-label">Organizational Logo</p>
            <p class="fr-desc">Utilize a visual element such as a photo or image instead of text, and upload an image that is 132 pixels square or round.</p>
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
            <p class="fr-label">Display Name</p>
            <p class="fr-desc">How your organization name will be appear to employees.</p>
          </div>
          <div class="fr-right">
            <input class="form-input" [(ngModel)]="org.name" placeholder="Cadavor Ltd.">
          </div>
        </div>

        <hr class="divider">
        <p class="section-head">Your Profile</p>

        <!-- Profile Picture -->
        <div class="form-row">
          <div class="fr-left">
            <p class="fr-label">Profile Picture</p>
            <p class="fr-desc">Your profile will be visible to all employees, so please ensure it reflects a professional and polished image.</p>
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
            <p class="fr-label">Full Name</p>
            <p class="fr-desc">Kindly input the complete and formal version as it will be displayed across all employee records.</p>
          </div>
          <div class="fr-right">
            <input class="form-input" [(ngModel)]="user.fullName" placeholder="Maria Karl">
          </div>
        </div>

        <!-- Employee ID -->
        <div class="form-row">
          <div class="fr-left">
            <p class="fr-label">Employee ID</p>
            <p class="fr-desc">This information can not be changed anytime.</p>
          </div>
          <div class="fr-right">
            <input class="form-input" [value]="user.empId" placeholder="123456789" disabled>
          </div>
        </div>

        <!-- Email -->
        <div class="form-row">
          <div class="fr-left">
            <p class="fr-label">Email Address</p>
            <p class="fr-desc">This will be used to log in to your account and can't be change.</p>
          </div>
          <div class="fr-right">
            <input class="form-input" [value]="user.email" placeholder="mariakarl@example.com" disabled>
          </div>
        </div>

        <!-- Role -->
        <div class="form-row">
          <div class="fr-left">
            <p class="fr-label">Role</p>
            <p class="fr-desc">Ensure your role is accurately defined, as it determines your access permissions within this account.</p>
          </div>
          <div class="fr-right">
            <select class="form-input" [(ngModel)]="user.role">
              <option>Human Resource</option><option>Manager</option><option>Developer</option><option>Finance</option>
            </select>
          </div>
        </div>

        <!-- Start Date -->
        <div class="form-row">
          <div class="fr-left">
            <p class="fr-label">Start Date</p>
            <p class="fr-desc">This information is for your reference only and cannot be altered.</p>
          </div>
          <div class="fr-right">
            <select class="form-input" [(ngModel)]="user.startDate">
              <option>January 23, 2024</option>
            </select>
          </div>
        </div>
      </ng-container>

      <!-- Security -->
      <ng-container *ngIf="activeTab==='security'">
        <p class="section-head">Security Settings</p>
        <div class="pw-grid" style="margin-bottom:24px;">
          <div class="form-group">
            <label class="form-label">Current Password</label>
            <input class="form-input" type="password" placeholder="••••••••">
          </div>
          <div></div>
          <div class="form-group">
            <label class="form-label">New Password</label>
            <input class="form-input" type="password" placeholder="••••••••">
          </div>
          <div class="form-group">
            <label class="form-label">Confirm New Password</label>
            <input class="form-input" type="password" placeholder="••••••••">
          </div>
        </div>
        <hr class="divider">
        <p class="section-head">Two-Factor Authentication</p>
        <div class="toggle-row">
          <div><div class="toggle-title">Authenticator App</div><div class="toggle-desc">Use an authenticator app to generate one-time codes.</div></div>
          <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
        </div>
        <div class="toggle-row">
          <div><div class="toggle-title">SMS Authentication</div><div class="toggle-desc">Receive a code via SMS to your registered phone number.</div></div>
          <label class="toggle"><input type="checkbox"><span class="toggle-slider"></span></label>
        </div>
      </ng-container>

      <!-- Notifications -->
      <ng-container *ngIf="activeTab==='notifications'">
        <p class="section-head">Notification Setting</p>
        <p class="fr-desc" style="margin:-12px 0 24px;">Select the kinds of notifications you get about your activities and recommendations</p>

        <!-- Email Notification -->
        <div class="notif-section">
          <div class="fr-left">
            <p class="fr-label">Email Notification</p>
            <p class="fr-desc">Get email to finds out what's going on when you're not online. You can turn this off.</p>
          </div>
          <div class="notif-list">
            <div *ngFor="let n of emailNotifs" class="notif-row">
              <label class="toggle"><input type="checkbox" [(ngModel)]="n.on"><span class="toggle-slider"></span></label>
              <div>
                <div class="toggle-title">{{ n.title }}</div>
                <div class="toggle-desc">{{ n.desc }}</div>
              </div>
            </div>
          </div>
        </div>

        <hr class="divider">

        <!-- Push Notification -->
        <div class="notif-section">
          <div class="fr-left">
            <p class="fr-label">Push Notification</p>
            <p class="fr-desc">Get push notification to find out what's going on when you're online.</p>
          </div>
          <div class="notif-list">
            <div *ngFor="let n of pushNotifs" class="notif-row">
              <label class="toggle"><input type="checkbox" [(ngModel)]="n.on"><span class="toggle-slider"></span></label>
              <div>
                <div class="toggle-title">{{ n.title }}</div>
                <div class="toggle-desc">{{ n.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Theme -->
      <ng-container *ngIf="activeTab==='theme'">
        <p class="section-head">Theme</p>
        <div class="theme-grid">
          <div *ngFor="let t of themes" class="theme-box" [class.selected]="selectedTheme===t.key" (click)="applyTheme(t.key)">
            <div class="theme-preview" [style.background]="t.preview"></div>
            <div class="theme-label">{{ t.label }}</div>
          </div>
        </div>
      </ng-container>

      <!-- Integrations -->
      <ng-container *ngIf="activeTab==='integrations'">
        <p class="section-head">Apps &amp; Integrations</p>
        <div *ngFor="let i of integrations" class="integration-item">
          <div class="integration-icon" [style.background]="i.bg"><i class="bx" [ngClass]="i.icon" [style.color]="i.color"></i></div>
          <div class="integration-info">
            <div class="integration-name">{{ i.name }}</div>
            <div class="integration-desc">{{ i.desc }}</div>
          </div>
          <button [class.btn-connect]="!i.connected" [class.btn-disconnect]="i.connected">{{ i.connected ? 'Disconnect' : 'Connect' }}</button>
        </div>
      </ng-container>

    </div>
  </div>

  <!-- Sticky Save -->
  <div class="save-bar">
    <button class="btn-save">Save Change</button>
  </div>
  `
})
export class SettingComponent {
  constructor(private themeService: ThemeService, private authService: AuthenticationService) {
    this.selectedTheme = this.themeService.current;

    // Load real authenticated user data
    const authUser = this.authService.getAuthenticatedUser();
    if (authUser) {
      this.user = {
        fullName:  `${authUser.firstname ?? ''} ${authUser.lastname ?? ''}`.trim() || '—',
        empId:     String(authUser.id ?? '—'),
        email:     authUser.email ?? '—',
        role:      authUser.title ?? authUser.userRole ?? '—',
        startDate: '—',
      };
    }
  }

  applyTheme(key: string): void {
    this.selectedTheme = key;
    this.themeService.apply(key as AppTheme);
  }

  tabs = [
    { key: 'general',       label: 'General'                 },
    { key: 'security',      label: 'Security'                },
    { key: 'notifications', label: 'Notification Preference' },
    { key: 'theme',         label: 'Theme'                   },
  ];
  activeTab = 'general';

  org = { name: 'INNOVX' };
  user = { fullName: '—', empId: '—', email: '—', role: '—', startDate: '—' };

  emailNotifs = [
    { title: 'News and Updates',       desc: 'News about platform and updates.',                                                                on: false },
    { title: 'Deadline',               desc: 'Important deadlines for projects, tasks, and submissions.',                                       on: true  },
    { title: 'Reminders',              desc: 'Timely reminders for upcoming events, meetings, and deadlines.',                                  on: true  },
    { title: 'Employee Attendances',   desc: 'Notifications regarding employee check-ins, check-outs, and attendance records.',                 on: true  },
    { title: 'Recruitment Process',    desc: 'Updates on job vacancies, applications, interviews, and hiring progress.',                        on: true  },
    { title: 'Day Off Request',        desc: 'Notifications for new day-off requests, approvals, and schedule adjustments.',                    on: true  },
  ];
  pushNotifs = [
    { title: 'Deadline',               desc: 'Important deadlines for projects, tasks, and submissions.',                                       on: true  },
    { title: 'Reminders',              desc: 'Timely reminders for upcoming events, meetings, and deadlines.',                                  on: true  },
    { title: 'Day-Off Request',        desc: 'Notifications for new day-off requests, approvals, and schedule adjustments.',                    on: true  },
    { title: 'More Activity About You',desc: 'Additional notifications related to your activities, tasks, and interactions within the platform.',on: true  },
  ];

  themes = [
    { key: 'light',    label: 'Light',     preview: 'linear-gradient(135deg,#F5F6FA 50%,#E8F7F6 100%)' },
    { key: 'dark',     label: 'Dark',      preview: 'linear-gradient(135deg,#162233 50%,#1E3249 100%)' },
    { key: 'teal',     label: 'Teal',      preview: 'linear-gradient(135deg,#2FA8A0 50%,#C8F0ED 100%)' },
  ];
  selectedTheme = 'light';

  integrations = [
    { name: 'Slack',      desc: 'Send HR notifications to Slack channels.',    icon: 'bxl-slack',    bg: '#4A154B22', color: '#4A154B', connected: true  },
    { name: 'Google Workspace', desc: 'Sync calendar events and employee directory.', icon: 'bxl-google', bg: '#4285F422', color: '#4285F4', connected: true  },
    { name: 'Zoom',       desc: 'Schedule and manage HR interview calls.',     icon: 'bx-video',     bg: '#2D8CFE22', color: '#2D8CFE', connected: false },
    { name: 'Jira',       desc: 'Link HR projects to engineering sprints.',    icon: 'bxl-jira',     bg: '#0052CC22', color: '#0052CC', connected: false },
    { name: 'Zapier',     desc: 'Automate HR workflows with 3000+ apps.',     icon: 'bxs-zap',      bg: '#FF4A0022', color: '#FF4A00', connected: false },
  ];
}
