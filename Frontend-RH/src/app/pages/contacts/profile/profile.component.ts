import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { CollaborateurService } from 'src/app/core/services/collaborateur.service';
import { StagiaireService } from 'src/app/core/services/stagiaire.service';
import { ConfirmService } from 'src/app/shared/confirm.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { AdminService, Role } from 'src/app/pages/admin/admin.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  // ── User data ──────────────────────────────────────────────────────────────
  userId: number | null = null;
  firstName  = '';
  lastName   = '';
  email      = '';
  title      = '';
  userRole   = '';
  permissions: string[] = [];
  createdAt: string | null = null;
  updatedAt: string | null = null;
  lastPasswordChange: string | null = null;
  mustChangePassword = false;
  isLoading = false;

  // ── Roles (from API) ───────────────────────────────────────────────────────
  roles: Role[] = [];

  // ── Create User modal ──────────────────────────────────────────────────────
  showCreateUserModal = false;
  createUserError: string | null = null;
  showRoleDropdown = false;
  newUser = { firstName: '', lastName: '', email: '', title: '', userRole: '' };

  @HostListener('document:click')
  onDocumentClick(): void { this.showRoleDropdown = false; }

  get selectedRoleLabel(): string {
    const r = this.roles.find(r => r.name === this.newUser.userRole);
    return r ? r.name.replace(/_/g, ' ') : '';
  }

  selectRole(name: string): void {
    this.newUser.userRole = name;
    this.showRoleDropdown = false;
  }

  // ── Edit Password modal ────────────────────────────────────────────────────
  showEditPasswordModal = false;
  editPwdError: string | null = null;
  pwdForm = { oldPassword: '', newPassword: '', confirmPassword: '' };
  showPwd = { old: false, new: false, confirm: false };

  constructor(
    private authService: AuthenticationService,
    private collaborateurService: CollaborateurService,
    private stagiaireService: StagiaireService,
    private confirmSvc: ConfirmService,
    private http: HttpClient,
    private translate: TranslateService,
    private adminService: AdminService,
  ) {}

  // ── Computed ───────────────────────────────────────────────────────────────
  get initials(): string {
    return ((this.lastName[0] || '') + (this.firstName[0] || '')).toUpperCase() || '?';
  }

  get displayRole(): string {
    return this.userRole ? this.userRole.replace(/_/g, ' ') : '';
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const user = this.authService.getAuthenticatedUser();
    if (user) {
      this.userId    = user.id;
      this.firstName = user.firstname || '';
      this.lastName  = user.lastname  || '';
      this.email     = user.email     || '';
      this.title     = user.title     || '';
      this.userRole  = user.userRole  || '';
      this.permissions = user.permissions || [];
    }

    if (this.authService.hasPermission('USER_MANAGE') && this.userId) {
      this.isLoading = true;
      this.http.get<any>(`${environment.apiUrl}/admin/users/${this.userId}`).subscribe({
        next: res => {
          const data = res.data ?? res;
          this.firstName          = data.firstName          || this.firstName;
          this.lastName           = data.lastName           || this.lastName;
          this.email              = data.email              || this.email;
          this.title              = data.title              || this.title;
          this.permissions        = data.permissions        || this.permissions;
          this.createdAt          = data.createdAt          ?? null;
          this.updatedAt          = data.updatedAt          ?? null;
          this.lastPasswordChange = data.lastPasswordChange ?? null;
          this.mustChangePassword = data.mustChangePassword ?? false;
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
    }

    if (this.isAdmin()) {
      this.adminService.getAllRoles().subscribe({
        next: roles => {
          this.roles = roles;
          if (this.roles.length > 0) {
            this.newUser.userRole = this.roles[0].name;
          }
        },
        error: () => {}
      });
    }
  }

  // ── Role helpers ───────────────────────────────────────────────────────────
  isAdmin(): boolean {
    return String(this.authService.getUserRole()).toUpperCase() === 'ADMIN';
  }

  // ── Create User ────────────────────────────────────────────────────────────
  openCreateUser(): void {
    this.newUser = { firstName: '', lastName: '', email: '', title: '', userRole: this.roles[0]?.name || '' };
    this.createUserError = null;
    this.showCreateUserModal = true;
  }

  submitCreateUser(): void {
    const { firstName, lastName, email, title, userRole } = this.newUser;
    if (!firstName || !lastName || !email || !title || !userRole) {
      this.createUserError = this.translate.instant('PROFILE.FILL_FIELDS');
      return;
    }
    this.createUserError = null;
    this.authService.registerUser(firstName, lastName, email, title, userRole).subscribe({
      next: async () => {
        this.showCreateUserModal = false;
        await this.confirmSvc.alert(this.translate.instant('PROFILE.USER_CREATED'), this.translate.instant('PROFILE.SUCCESS_TITLE'), 'success');
      },
      error: (err) => {
        const serverMsg: string = err?.error?.message || err?.error?.error || err?.message || '';
        const isEmailConflict = err?.status === 409 || serverMsg.toLowerCase().includes('email');
        this.createUserError = isEmailConflict
          ? this.translate.instant('PROFILE.EMAIL_EXISTS')
          : serverMsg || this.translate.instant('PROFILE.CREATE_USER_ERROR');
      },
    });
  }

  // ── Edit Password ──────────────────────────────────────────────────────────
  openEditPassword(): void {
    this.pwdForm  = { oldPassword: '', newPassword: '', confirmPassword: '' };
    this.showPwd  = { old: false, new: false, confirm: false };
    this.editPwdError = null;
    this.showEditPasswordModal = true;
  }

  submitEditPassword(): void {
    const { oldPassword, newPassword, confirmPassword } = this.pwdForm;
    if (!oldPassword || !newPassword || !confirmPassword) {
      this.editPwdError = this.translate.instant('PROFILE.PWD_FILL_FIELDS');
      return;
    }
    if (newPassword !== confirmPassword) {
      this.editPwdError = this.translate.instant('PROFILE.PWD_NO_MATCH');
      return;
    }
    if (newPassword.length < 8) {
      this.editPwdError = this.translate.instant('PROFILE.PWD_TOO_SHORT');
      return;
    }
    this.authService.editPassword(oldPassword, newPassword).subscribe({
      next: async () => {
        this.showEditPasswordModal = false;
        await this.confirmSvc.alert(this.translate.instant('PROFILE.PWD_CHANGED'), this.translate.instant('PROFILE.SUCCESS_TITLE'), 'success');
      },
      error: async err => {
        this.showEditPasswordModal = false;
        const msg = err?.error?.message?.includes('Old password')
          ? this.translate.instant('PROFILE.PWD_WRONG_OLD')
          : this.translate.instant('PROFILE.PWD_ERROR');
        await this.confirmSvc.alert(msg, this.translate.instant('PROFILE.ERROR_TITLE'), 'error');
      },
    });
  }
}
