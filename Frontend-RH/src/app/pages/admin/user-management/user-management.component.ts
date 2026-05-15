import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUser, Role } from '../admin.service';
import { ConfirmService } from 'src/app/shared/confirm.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WallClockComponent } from 'src/app/shared/wall-clock/wall-clock.component';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, WallClockComponent],
    styles: [`
      :host { display:block }
      .page { padding:0 24px 60px; font-family:'Inter',sans-serif; animation:fadeIn .35s ease both }
      @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

      .page-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);margin-bottom:18px}
      .page-title{font-size:22px;font-weight:700;color:#1A2B3C;margin:0}

      .card{background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);overflow:hidden}
      .card-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #F0F3F6}
      .card-title{font-size:14px;font-weight:700;color:#1A2B3C}

      table{width:100%;border-collapse:collapse}
      thead tr{background:#FAFBFC}
      thead th{padding:10px 16px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8FA3B8;border-bottom:1px solid #F0F3F6;text-align:left}
      tbody tr{cursor:pointer;transition:background .15s}
      tbody tr:hover{background:#F8FAFC}
      tbody td{padding:12px 16px;font-size:13px;color:#4A6080;border-bottom:1px solid #F5F7FA;vertical-align:middle}
      tbody tr:last-child td{border-bottom:none}
      .td-name{font-weight:600;color:#1A2B3C}

      .role-chip{display:inline-flex;align-items:center;padding:3px 9px;border-radius:6px;font-size:11px;font-weight:700;background:#E8F7F6;color:#1B7872;margin-right:4px;margin-bottom:2px}

      .btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border:none;border-radius:8px;font-size:12.5px;font-weight:600;cursor:pointer;transition:background .15s}
      .btn:disabled{opacity:.5;cursor:default}
      .btn-primary{background:#1B7872 !important;color:#fff !important;border-color:#1B7872 !important}.btn-primary:hover:not(:disabled){background:#1A9690 !important;border-color:#1A9690 !important}
      .btn-secondary{background:#F1F5F9;color:#4A6080}.btn-secondary:hover:not(:disabled){background:#E2E8F0}
      .btn-danger{background:#FEE2E2;color:#BE123C}.btn-danger:hover:not(:disabled){background:#FECACA}

      .state-box{padding:48px 0;text-align:center;color:#8FA3B8;font-size:14px}
      .state-box i{font-size:36px;display:block;margin-bottom:10px}
      .spinner{width:30px;height:30px;border:3px solid #E2E8F0;border-top-color:#2FA8A0;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 10px}
      @keyframes spin{to{transform:rotate(360deg)}}

      .backdrop{position:fixed;inset:0;background:rgba(10,20,35,.35);z-index:1800;backdrop-filter:blur(1px)}
      .rp{position:fixed;top:70px;right:0;bottom:0;width:480px;background:#fff;box-shadow:-8px 0 40px rgba(10,20,35,.14);border-radius:16px 0 0 0;z-index:1801;display:flex;flex-direction:column;animation:rpIn .22s ease both;overflow:hidden}
      @keyframes rpIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
      .rp-header{display:flex;align-items:center;justify-content:space-between;padding:18px 22px 16px;border-bottom:1px solid #F0F3F6;flex-shrink:0}
      .rp-title{font-size:15px;font-weight:700;color:#1A2B3C}
      .rp-close{width:30px;height:30px;border:none;background:#F1F5F9;border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:17px;color:#4A6080}
      .rp-close:hover{background:#E2E8F0}
      .rp-body{flex:1;overflow-y:auto;padding:20px 22px}
      .rp-footer{padding:14px 22px;border-top:1px solid #F0F3F6;flex-shrink:0;display:flex;justify-content:flex-end;gap:10px}

      .f-field{margin-bottom:16px}
      .f-lbl{display:block;font-size:13px;font-weight:600;color:#1A2B3C;margin-bottom:6px}
      .f-input{width:100%;padding:10px 14px;border:1.5px solid #E2E8F0;border-radius:9px;font-size:13px;color:#1A2B3C;outline:none;box-sizing:border-box;transition:border .15s;font-family:'Inter',sans-serif}
      .f-input:focus{border-color:#2FA8A0;box-shadow:0 0 0 3px rgba(47,168,160,.1)}

      .perm-section{font-size:12px;font-weight:700;color:#8FA3B8;text-transform:uppercase;letter-spacing:.06em;margin:14px 0 8px;padding-bottom:6px;border-bottom:1px solid #F0F3F6}
      .role-check-row{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid #F5F7FA}
      .role-check-row:last-child{border-bottom:none}
      .role-check-row input[type=checkbox]{width:16px;height:16px;accent-color:#1B7872;margin-top:2px;flex-shrink:0;cursor:pointer}
      .role-name{font-size:13px;font-weight:600;color:#1A2B3C}
      .role-desc{font-size:11.5px;color:#8FA3B8;margin-top:1px}

      .toast{position:fixed;bottom:24px;right:24px;z-index:9999;background:#1A2B3C;color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.18);animation:rpIn .22s ease both}
    `],
    template: `
    <div class="backdrop" *ngIf="editingUser || editingProfile" (click)="cancelEdit()"></div>

    <!-- Edit Profile Panel -->
    <div class="rp" *ngIf="editingProfile">
      <div class="rp-header">
        <span class="rp-title">{{ 'USER_MANAGEMENT.PANEL_EDIT_TITLE' | translate:{name: editingProfile.firstName + ' ' + editingProfile.lastName} }}</span>
        <button class="rp-close" (click)="cancelEdit()"><i class="bx bx-x"></i></button>
      </div>
      <div class="rp-body">
        <div class="f-field">
          <label class="f-lbl">{{ 'USER_MANAGEMENT.FIELD_FIRSTNAME' | translate }}</label>
          <input class="f-input" [(ngModel)]="profileForm.firstName" />
        </div>
        <div class="f-field">
          <label class="f-lbl">{{ 'USER_MANAGEMENT.FIELD_LASTNAME' | translate }}</label>
          <input class="f-input" [(ngModel)]="profileForm.lastName" />
        </div>
        <div class="f-field">
          <label class="f-lbl">{{ 'USER_MANAGEMENT.FIELD_EMAIL' | translate }}</label>
          <input class="f-input" type="email" [(ngModel)]="profileForm.email" />
        </div>
        <div class="f-field">
          <label class="f-lbl">{{ 'USER_MANAGEMENT.FIELD_TITLE' | translate }}</label>
          <input class="f-input" [(ngModel)]="profileForm.title" placeholder="ex: HR Manager" />
        </div>
      </div>
      <div class="rp-footer">
        <button class="btn btn-secondary" (click)="cancelEdit()">{{ 'USER_MANAGEMENT.CANCEL' | translate }}</button>
        <button class="btn btn-primary" [disabled]="saving" (click)="saveProfile()">
          <i class="bx bx-save"></i>{{ saving ? ('USER_MANAGEMENT.SAVING' | translate) : ('USER_MANAGEMENT.SAVE' | translate) }}
        </button>
      </div>
    </div>

    <!-- Edit Roles Panel -->
    <div class="rp" *ngIf="editingUser">
      <div class="rp-header">
        <span class="rp-title">{{ 'USER_MANAGEMENT.ROLES_PANEL_TITLE' | translate:{name: editingUser.firstName + ' ' + editingUser.lastName} }}</span>
        <button class="rp-close" (click)="cancelEdit()"><i class="bx bx-x"></i></button>
      </div>
      <div class="rp-body">
        <div class="f-field">
          <span class="perm-section">{{ 'USER_MANAGEMENT.AVAILABLE_ROLES' | translate }}</span>
          <div class="role-check-row" *ngFor="let role of allRoles">
            <input type="checkbox" [checked]="selectedRoles.has(role.name)" (change)="toggleRole(role.name, $event)" />
            <div>
              <div class="role-name">{{ role.name }}</div>
              <div class="role-desc">{{ role.description }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="rp-footer">
        <button class="btn btn-secondary" (click)="cancelEdit()">{{ 'USER_MANAGEMENT.CANCEL' | translate }}</button>
        <button class="btn btn-primary" [disabled]="saving" (click)="saveRoles()">
          <i class="bx bx-save"></i>{{ saving ? ('USER_MANAGEMENT.SAVING' | translate) : ('USER_MANAGEMENT.SAVE' | translate) }}
        </button>
      </div>
    </div>

    <div class="toast" *ngIf="toast">{{ toast }}</div>

    <div class="page">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
        <div class="page-header" style="flex:1;margin-bottom:0;">
          <h4 class="page-title">{{ 'USER_MANAGEMENT.TITLE' | translate }}</h4>
        </div>
        <app-wall-clock></app-wall-clock>
      </div>

      <div class="card">
        <div class="card-head">
          <span class="card-title">{{ 'USER_MANAGEMENT.CARD_TITLE' | translate:{count: users.length} }}</span>
        </div>

        <div class="state-box" *ngIf="loading"><div class="spinner"></div>{{ 'USER_MANAGEMENT.LOADING' | translate }}</div>
        <div class="state-box" style="color:#EF4444" *ngIf="!loading && error">
          <i class="bx bx-error-circle"></i>{{ error }}
        </div>

        <div style="overflow-x:auto" *ngIf="!loading && !error">
          <table>
            <thead><tr>
              <th>{{ 'USER_MANAGEMENT.TABLE_NAME' | translate }}</th><th>{{ 'USER_MANAGEMENT.TABLE_EMAIL' | translate }}</th><th>{{ 'USER_MANAGEMENT.TABLE_TITLE' | translate }}</th><th>{{ 'USER_MANAGEMENT.TABLE_ROLES' | translate }}</th><th>{{ 'USER_MANAGEMENT.TABLE_ACTIONS' | translate }}</th>
            </tr></thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td class="td-name">{{ user.firstName }} {{ user.lastName }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.title || '—' }}</td>
                <td>
                  <span class="role-chip" *ngFor="let r of user.roles">{{ r }}</span>
                  <span style="color:#8FA3B8;font-size:12px" *ngIf="!user.roles?.length">{{ 'USER_MANAGEMENT.NO_ROLE' | translate }}</span>
                </td>
                <td>
                  <button class="btn btn-secondary" style="margin-right:6px" (click)="editProfile(user)">
                    <i class="bx bx-edit-alt"></i>
                  </button>
                  <button class="btn btn-secondary" style="margin-right:6px" (click)="editRoles(user)">
                    <i class="bx bx-shield"></i> {{ 'USER_MANAGEMENT.BTN_ROLES' | translate }}
                  </button>
                  <button class="btn btn-danger" (click)="deleteUser(user)">
                    <i class="bx bx-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    `
})
export class UserManagementComponent implements OnInit {

    users: AdminUser[] = [];
    allRoles: Role[] = [];
    editingUser: AdminUser | null = null;
    editingProfile: AdminUser | null = null;
    profileForm: { firstName: string; lastName: string; email: string; title: string } = { firstName: '', lastName: '', email: '', title: '' };
    selectedRoles = new Set<string>();
    loading = false;
    error: string | null = null;
    saving = false;
    toast: string | null = null;

    constructor(private adminService: AdminService, private confirmSvc: ConfirmService, private translate: TranslateService) {}

    ngOnInit(): void {
        this.loading = true;
        this.adminService.getAllUsers().subscribe({
            next: u => { this.users = u; this.loading = false; },
            error: e => { this.error = e?.error?.message || 'Erreur de chargement'; this.loading = false; }
        });
        this.adminService.getAllRoles().subscribe({
            next: r => this.allRoles = r,
            error: () => {}
        });
    }

    editRoles(user: AdminUser): void {
        this.editingUser = user;
        this.selectedRoles = new Set(user.roles as string[]);
    }

    toggleRole(roleName: string, event: Event): void {
        (event.target as HTMLInputElement).checked
            ? this.selectedRoles.add(roleName)
            : this.selectedRoles.delete(roleName);
    }

    saveRoles(): void {
        if (!this.editingUser) return;
        this.saving = true;
        this.adminService.updateUserRoles(this.editingUser.id, [...this.selectedRoles]).subscribe({
            next: updated => {
                const idx = this.users.findIndex(u => u.id === updated.id);
                if (idx > -1) this.users[idx] = updated;
                this.editingUser = null;
                this.saving = false;
                this.showToast(this.translate.instant('USER_MANAGEMENT.TOAST_ROLES_UPDATED'));
            },
            error: e => { this.saving = false; this.showToast(e?.error?.message || this.translate.instant('USER_MANAGEMENT.TOAST_ERROR')); }
        });
    }

    editProfile(user: AdminUser): void {
        this.editingProfile = user;
        this.profileForm = { firstName: user.firstName, lastName: user.lastName, email: user.email, title: (user as any).title ?? '' };
    }

    saveProfile(): void {
        if (!this.editingProfile) return;
        this.saving = true;
        this.adminService.updateUser(this.editingProfile.id, {
            ...this.profileForm,
            roles: this.editingProfile.roles as string[],
        }).subscribe({
            next: updated => {
                const idx = this.users.findIndex(u => u.id === updated.id);
                if (idx > -1) this.users[idx] = updated;
                this.editingProfile = null;
                this.saving = false;
                this.showToast(this.translate.instant('USER_MANAGEMENT.TOAST_PROFILE_UPDATED'));
            },
            error: e => { this.saving = false; this.showToast(e?.error?.message || this.translate.instant('USER_MANAGEMENT.TOAST_ERROR')); }
        });
    }

    cancelEdit(): void { this.editingUser = null; this.editingProfile = null; this.saving = false; }

    async deleteUser(user: AdminUser): Promise<void> {
        if (!(await this.confirmSvc.confirm(`${this.translate.instant('USER_MANAGEMENT.CONFIRM_DELETE_MSG').replace('{name}', `${user.firstName} ${user.lastName}`)}`, this.translate.instant('USER_MANAGEMENT.CONFIRM_DELETE_BTN')))) return;
        this.adminService.deleteUser(user.id).subscribe({
            next: () => { this.users = this.users.filter(u => u.id !== user.id); this.showToast(this.translate.instant('USER_MANAGEMENT.TOAST_USER_DELETED')); },
            error: e => this.showToast(e?.error?.message || this.translate.instant('USER_MANAGEMENT.TOAST_ERROR'))
        });
    }

    private showToast(msg: string): void { this.toast = msg; setTimeout(() => this.toast = null, 3000); }
}
