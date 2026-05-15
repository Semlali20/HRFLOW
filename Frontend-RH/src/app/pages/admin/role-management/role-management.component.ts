import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, Permission, Role } from '../admin.service';
import { ConfirmService } from 'src/app/shared/confirm.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WallClockComponent } from 'src/app/shared/wall-clock/wall-clock.component';

@Component({
    selector: 'app-role-management',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, WallClockComponent],
    styles: [`
      :host { display:block }
      .page { padding:0 24px 60px; font-family:'Inter',sans-serif; animation:fadeIn .35s ease both }
      @keyframes fadeIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }

      /* ── Page header ── */
      .page-header { display:flex; align-items:center; justify-content:space-between; padding:14px 20px; background:#fff; border-radius:12px; box-shadow:0 4px 20px rgba(22,34,51,.08); margin-bottom:18px }
      .page-title  { font-size:22px; font-weight:700; color:#1A2B3C; margin:0 }
      .action-row  { display:flex; justify-content:flex-end; margin-bottom:18px }
      .big-action-btn { display:flex; align-items:center; justify-content:center; gap:8px; padding:12px 24px; background:#1B7872; color:#fff; border:none; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; transition:background .15s }
      .big-action-btn:hover { background:#1A9690 }
      .big-action-btn i { font-size:18px }

      /* ── Layout ── */
      .layout { display:grid; grid-template-columns:380px 1fr; gap:18px; align-items:start }

      /* ── Cards ── */
      .card { background:#fff; border-radius:14px; box-shadow:0 2px 16px rgba(22,34,51,.07); }
      .card-head { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid #F0F3F6; border-radius:14px 14px 0 0; }
      .card-title { font-size:14px; font-weight:700; color:#1A2B3C; display:flex; align-items:center; gap:8px }

      /* ── Role list ── */
      .role-list { display:flex; flex-direction:column; gap:8px; padding:12px; height:calc(100vh - 230px); overflow-y:auto; scrollbar-width:thin; scrollbar-color:#CBD5E0 transparent }
      .role-list::-webkit-scrollbar { width:5px }
      .role-list::-webkit-scrollbar-thumb { background:#CBD5E0; border-radius:6px }
      .role-list::-webkit-scrollbar-track { background:#F1F5F9; border-radius:6px }

      .role-card { position:relative; border-radius:12px; border:1.5px solid #EDF0F5; background:#fff; cursor:pointer; overflow:hidden; transition:all .18s; flex-shrink:0; }
      .role-card:hover { border-color:#9BD4CF; box-shadow:0 4px 14px rgba(27,120,114,.1); transform:translateY(-1px) }
      .role-card.active { border-color:#1B7872; box-shadow:0 4px 18px rgba(27,120,114,.15); background:#FAFFFE }
      .role-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:4px; background:transparent; transition:background .18s }
      .role-card.active::before { background:#1B7872 }

      .rc-body { display:flex; align-items:center; gap:12px; padding:13px 14px 13px 18px }
      .rc-avatar { width:40px; height:40px; border-radius:10px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:#fff; letter-spacing:.5px; background:linear-gradient(135deg,#2FA8A0,#1B7872) }
      .role-card.active .rc-avatar { background:linear-gradient(135deg,#1B7872,#0E5C58) }
      .rc-info { flex:1; min-width:0 }
      .rc-name { font-size:13px; font-weight:700; color:#1A2B3C; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
      .role-card.active .rc-name { color:#1B7872 }
      .rc-desc { font-size:11.5px; color:#94A3B8; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }

      .rc-foot { display:flex; align-items:center; justify-content:space-between; padding:7px 14px 9px 18px; border-top:1px solid #F5F7FA }
      .role-card.active .rc-foot { border-top-color:#D1FAF4 }
      .rc-badge { display:inline-flex; align-items:center; gap:5px; background:#F1F5F9; color:#64748B; border-radius:20px; padding:3px 10px; font-size:11px; font-weight:700 }
      .rc-badge i { font-size:12px }
      .role-card.active .rc-badge { background:#D1FAF4; color:#1B7872 }
      .btn-del { display:inline-flex; align-items:center; gap:4px; padding:4px 9px; border:1px solid #FEE2E2; background:#FFF5F5; color:#BE123C; border-radius:7px; cursor:pointer; font-size:11px; font-weight:600; font-family:'Inter',sans-serif; transition:all .12s }
      .btn-del:hover { background:#FEE2E2 }
      .btn-del i { font-size:13px }

      /* ── Permission panel ── */
      .perms-empty { padding:60px 24px; text-align:center; color:#8FA3B8; font-size:13px; display:flex; flex-direction:column; align-items:center; gap:12px }
      .perms-empty i { font-size:44px; color:#E2E8F0 }
      .perms-empty p { margin:0; line-height:1.6 }

      .perms-body { padding:12px 14px; display:flex; flex-direction:column; gap:10px; height:calc(100vh - 290px); overflow-y:auto; overflow-x:hidden; }
      .perms-body::-webkit-scrollbar { width:6px }
      .perms-body::-webkit-scrollbar-thumb { background:#C8D6E5; border-radius:6px }
      .perms-body::-webkit-scrollbar-track { background:#F1F5F9; border-radius:6px }

      /* ── Module header row ── */
      .mod-header { display:flex; align-items:center; gap:10px; padding:10px 16px; background:#F8FAFC; border-radius:10px; margin-top:6px; }
      .mod-header--sel { background:#F0FDF9; }
      .mod-header:first-child { margin-top:0; }

      .mod-icon { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0 }
      .mod-label { flex:1; font-size:13px; font-weight:700; color:#1A2B3C }

      .mod-badge { font-size:11px; font-weight:700; padding:2px 9px; border-radius:20px; flex-shrink:0 }
      .mod-badge-all     { background:#E8F7F6; color:#1B7872 }
      .mod-badge-partial { background:#FEF3C7; color:#92400E }
      .mod-badge-none    { background:#F1F5F9; color:#94A3B8 }

      .mod-toggle-btn { display:flex; align-items:center; gap:5px; font-size:11.5px; font-weight:600; color:#2FA8A0; background:none; border:1px solid #C8EDE9; border-radius:6px; padding:4px 10px; cursor:pointer; transition:background .12s; flex-shrink:0; white-space:nowrap }
      .mod-toggle-btn:hover { background:#E8F7F6 }

      /* ── Permission pair (2-col grid) ── */
      .perm-pair { display:grid; grid-template-columns:1fr 1fr; gap:6px; padding:4px 8px; }

      /* ── Permission button ── */
      .perm-row {
        display:flex; align-items:center; gap:10px;
        padding:10px 12px;
        border:1.5px solid #EDF0F5; border-radius:9px;
        background:#fff; cursor:pointer; text-align:left;
        font-family:'Inter',sans-serif; transition:all .15s;
        width:100%;
      }
      .perm-row:hover { border-color:#9BD4CF; background:#F8FFFE; }
      .perm-row.perm-on { background:#E8F7F6; border-color:#1B7872; }
      .perm-row--empty { border-color:transparent; background:transparent; cursor:default; }

      /* Custom checkbox */
      .perm-check { width:18px; height:18px; border-radius:5px; border:2px solid #CBD5E0; background:#fff; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .15s; }
      .perm-row:hover .perm-check { border-color:#2FA8A0; }
      .perm-row.perm-on .perm-check { border-color:#1B7872; background:#1B7872; }
      .perm-check i { font-size:11px; color:#fff; opacity:0; transition:opacity .12s; }
      .perm-row.perm-on .perm-check i { opacity:1; }

      .perm-text { flex:1; min-width:0; overflow:hidden; }
      .perm-name { font-size:12px; font-weight:600; color:#1A2B3C; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .perm-row.perm-on .perm-name { color:#1B7872; }
      .perm-desc { font-size:11px; color:#94A3B8; margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

      /* ── Footer ── */
      .perms-footer { display:flex; align-items:center; justify-content:space-between; padding:14px 20px; border-top:1px solid #F0F3F6; background:#FAFBFC; border-radius:0 0 14px 14px; }
      .footer-stat { font-size:12.5px; color:#8FA3B8 }
      .footer-stat strong { color:#1B7872; font-size:13px }

      /* ── Buttons ── */
      .btn { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; border:none; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; transition:background .15s; font-family:'Inter',sans-serif }
      .btn:disabled { opacity:.5; cursor:default }
      .btn-primary   { background:#1B7872; color:#fff } .btn-primary:hover:not(:disabled)   { background:#1A9690 }
      .btn-secondary { background:#F1F5F9; color:#4A6080 } .btn-secondary:hover:not(:disabled) { background:#E2E8F0 }

      /* ── Drawer (right-side panel) ── */
      .rm-backdrop { position:fixed; inset:0; background:rgba(10,20,35,.4); z-index:1800; backdrop-filter:blur(2px) }
      @keyframes drawerIn { from { opacity:0; transform:translateX(40px) } to { opacity:1; transform:translateX(0) } }
      .rm-drawer { position:fixed; top:70px; right:0; bottom:0; width:540px; background:#fff; box-shadow:-8px 0 40px rgba(10,20,35,.14); border-radius:16px 0 0 0; z-index:1801; display:flex; flex-direction:column; overflow:hidden; animation:drawerIn .22s ease both }
      .rm-drawer-head { display:flex; align-items:center; gap:12px; padding:18px 24px 16px; border-bottom:1px solid #F0F3F6; flex-shrink:0 }
      .rm-drawer-icon { width:36px; height:36px; border-radius:10px; background:#E8F7F6; color:#1B7872; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0 }
      .rm-drawer-title { font-size:16px; font-weight:700; color:#1A2B3C; flex:1 }
      .rm-drawer-close { width:30px; height:30px; border:none; background:#F1F5F9; border-radius:7px; cursor:pointer; font-size:17px; color:#64748B; display:flex; align-items:center; justify-content:center }
      .rm-drawer-close:hover { background:#E2E8F0 }
      .rm-drawer-body { flex:1; overflow-y:auto; padding:24px; scrollbar-width:thin; scrollbar-color:#E2E8F0 transparent }
      .rm-drawer-foot { padding:14px 24px 20px; border-top:1px solid #F0F3F6; display:flex; justify-content:flex-end; gap:10px; flex-shrink:0 }
      .f-field { margin-bottom:18px }
      .f-lbl { display:block; font-size:12.5px; font-weight:600; color:#1A2B3C; margin-bottom:6px }
      .f-input { width:100%; padding:10px 14px; border:1.5px solid #E2E8F0; border-radius:9px; font-size:13px; color:#1A2B3C; outline:none; box-sizing:border-box; font-family:'Inter',sans-serif; transition:border .15s }
      .f-input:focus { border-color:#2FA8A0; box-shadow:0 0 0 3px rgba(47,168,160,.1) }
      .f-hint { font-size:12px; color:#94A3B8; margin-top:5px }

      /* ── States ── */
      .state-box { padding:48px 0; text-align:center; color:#8FA3B8; font-size:14px }
      .spinner { width:32px; height:32px; border:3px solid #E2E8F0; border-top-color:#2FA8A0; border-radius:50%; animation:spin .7s linear infinite; margin:0 auto 12px }
      @keyframes spin { to { transform:rotate(360deg) } }
      .toast { position:fixed; bottom:24px; right:24px; z-index:9999; background:#1A2B3C; color:#fff; padding:12px 20px; border-radius:10px; font-size:13px; font-weight:500; box-shadow:0 8px 24px rgba(0,0,0,.2) }
    `],
    template: `
    <div class="toast" *ngIf="toast">{{ toast }}</div>

    <!-- ── Create Role Drawer ── -->
    <div class="rm-backdrop" *ngIf="showCreateModal" (click)="showCreateModal=false"></div>
    <div class="rm-drawer" *ngIf="showCreateModal" (click)="$event.stopPropagation()">
      <div class="rm-drawer-head">
        <div class="rm-drawer-icon"><i class="bx bx-shield-plus"></i></div>
        <span class="rm-drawer-title">{{ 'ROLE_MANAGEMENT.MODAL_TITLE' | translate }}</span>
        <button class="rm-drawer-close" (click)="showCreateModal=false"><i class="bx bx-x"></i></button>
      </div>
      <div class="rm-drawer-body">
        <div class="f-field">
          <label class="f-lbl">{{ 'ROLE_MANAGEMENT.FIELD_ROLE_NAME' | translate }}</label>
          <input class="f-input" [(ngModel)]="createForm.name"
                 [placeholder]="'ROLE_MANAGEMENT.ROLE_NAME_PLACEHOLDER' | translate"
                 (input)="createForm.name = createForm.name.toUpperCase().replace(' ', '_')" />
          <p class="f-hint">Use uppercase letters and underscores, e.g. HR_MANAGER</p>
        </div>
        <div class="f-field">
          <label class="f-lbl">{{ 'ROLE_MANAGEMENT.FIELD_DESCRIPTION' | translate }}</label>
          <input class="f-input" [(ngModel)]="createForm.description" [placeholder]="'ROLE_MANAGEMENT.DESC_PLACEHOLDER' | translate" />
        </div>
      </div>
      <div class="rm-drawer-foot">
        <button class="btn btn-secondary" (click)="showCreateModal=false">{{ 'ROLE_MANAGEMENT.CANCEL' | translate }}</button>
        <button class="btn btn-primary" [disabled]="saving || !createForm.name" (click)="createRole()">
          <i class="bx" [class.bx-check]="!saving" [class.bx-loader-alt]="saving" [style.animation]="saving ? 'spin .7s linear infinite' : 'none'"></i>
          {{ saving ? ('ROLE_MANAGEMENT.CREATING' | translate) : ('ROLE_MANAGEMENT.BTN_CREATE' | translate) }}
        </button>
      </div>
    </div>

    <div class="page">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
        <div class="page-header" style="flex:1;margin-bottom:0;">
          <h4 class="page-title">
            <i class="bx bx-shield-alt-2" style="color:#2FA8A0;font-size:20px"></i>
            {{ 'ROLE_MANAGEMENT.TITLE' | translate }}
          </h4>
        </div>
        <app-wall-clock></app-wall-clock>
      </div>

      <div class="action-row">
        <button class="big-action-btn" (click)="openCreate()">
          <i class="bx bx-plus"></i> {{ 'ROLE_MANAGEMENT.BTN_NEW_ROLE' | translate }}
        </button>
      </div>

      <div class="state-box" *ngIf="loading">
        <div class="spinner"></div>{{ 'ROLE_MANAGEMENT.LOADING' | translate }}
      </div>

      <div class="layout" *ngIf="!loading">

        <!-- ── Role list ── -->
        <div class="card">
          <div class="card-head">
            <span class="card-title">
              <i class="bx bx-shield-alt-2" style="color:#2FA8A0"></i>
              {{ 'ROLE_MANAGEMENT.ROLE_LIST_TITLE' | translate:{count: roles.length} }}
            </span>
          </div>
          <div class="role-list">
            <div class="role-card" *ngFor="let role of roles"
                 [class.active]="selectedRole?.id === role.id"
                 (click)="selectRole(role)">

              <div class="rc-body">
                <div class="rc-avatar">{{ roleInitials(role.name) }}</div>
                <div class="rc-info">
                  <div class="rc-name">{{ role.name }}</div>
                  <div class="rc-desc">{{ role.description || ('ROLE_MANAGEMENT.NO_DESCRIPTION' | translate) }}</div>
                </div>
              </div>

              <div class="rc-foot">
                <span class="rc-badge">
                  <i class="bx bx-key"></i>
                  {{ role.permissions.length }} {{ 'ROLE_MANAGEMENT.PERMISSIONS_COUNT' | translate }}
                </span>
                <button class="btn-del" (click)="$event.stopPropagation(); deleteRole(role)">
                  <i class="bx bx-trash"></i> {{ 'ROLE_MANAGEMENT.BTN_DELETE' | translate }}
                </button>
              </div>

            </div>

            <div *ngIf="roles.length === 0"
                 style="padding:40px 20px;text-align:center;color:#94A3B8;font-size:13px">
              <i class="bx bx-shield-quarter"
                 style="font-size:36px;color:#E2E8F0;display:block;margin-bottom:8px"></i>
              {{ 'ROLE_MANAGEMENT.NO_ROLES' | translate }}
            </div>
          </div>
        </div>

        <!-- ── Permission editor ── -->
        <div class="card">

          <!-- Card header -->
          <div class="card-head">
            <span class="card-title" *ngIf="!selectedRole">
              <i class="bx bx-shield-quarter" style="color:#CBD5E0"></i>
              {{ 'ROLE_MANAGEMENT.SELECT_ROLE_HINT' | translate }}
            </span>
            <span class="card-title" *ngIf="selectedRole">
              <i class="bx bx-key" style="color:#2FA8A0"></i>
              {{ selectedRole.name }}
            </span>
            <span *ngIf="selectedRole" style="font-size:12.5px;color:#8FA3B8">
              <strong style="color:#1B7872;font-size:14px">{{ selectedPermissions.size }}</strong>
              {{ 'ROLE_MANAGEMENT.SELECTED_COUNT' | translate:{total: allPermissions.length} }}
            </span>
          </div>

          <!-- Empty state -->
          <div class="perms-empty" *ngIf="!selectedRole">
            <i class="bx bx-shield-quarter"></i>
            <p>{{ 'ROLE_MANAGEMENT.SELECT_ROLE_DESC' | translate }}</p>
          </div>

          <!-- Permissions body with scroll -->
          <div class="perms-body" *ngIf="selectedRole">
            <ng-container *ngFor="let item of flatList">

              <!-- Module header -->
              <div *ngIf="item.kind==='header'" class="mod-header"
                   [class.mod-header--sel]="item.hasAny">
                <div class="mod-icon"
                     [style.background]="moduleColor(item.module).bg"
                     [style.color]="moduleColor(item.module).fg">
                  <i class="bx" [ngClass]="moduleIcon(item.module)"></i>
                </div>
                <span class="mod-label">{{ moduleLabel(item.module) }}</span>
                <span class="mod-badge"
                      [class.mod-badge-all]="item.allSel"
                      [class.mod-badge-partial]="item.partial"
                      [class.mod-badge-none]="!item.hasAny">
                  {{ item.selected }} / {{ item.total }}
                </span>
                <button class="mod-toggle-btn" (click)="toggleGroupAll(item.group)">
                  <i class="bx" [class.bx-check-double]="!item.allSel" [class.bx-minus]="item.allSel"></i>
                  {{ item.allSel ? ('ROLE_MANAGEMENT.BTN_REMOVE_ALL' | translate) : ('ROLE_MANAGEMENT.BTN_SELECT_ALL' | translate) }}
                </button>
              </div>

              <!-- Permission pair (2 per row) -->
              <div *ngIf="item.kind==='pair'" class="perm-pair">

                <button class="perm-row" [class.perm-on]="selectedPermissions.has(item.a.name)"
                        (click)="togglePermissionDirect(item.a.name)">
                  <div class="perm-check"><i class="bx bx-check"></i></div>
                  <div class="perm-text">
                    <div class="perm-name">{{ item.a.name }}</div>
                    <div class="perm-desc" *ngIf="item.a.description">{{ item.a.description }}</div>
                  </div>
                </button>

                <button *ngIf="item.b" class="perm-row" [class.perm-on]="selectedPermissions.has(item.b.name)"
                        (click)="togglePermissionDirect(item.b.name)">
                  <div class="perm-check"><i class="bx bx-check"></i></div>
                  <div class="perm-text">
                    <div class="perm-name">{{ item.b.name }}</div>
                    <div class="perm-desc" *ngIf="item.b.description">{{ item.b.description }}</div>
                  </div>
                </button>

                <!-- empty slot when odd number of permissions -->
                <div *ngIf="!item.b" class="perm-row perm-row--empty"></div>

              </div>

            </ng-container>
          </div>

          <!-- Footer -->
          <div class="perms-footer" *ngIf="selectedRole">
            <span class="footer-stat">
              <strong>{{ selectedPermissions.size }}</strong>
              {{ 'ROLE_MANAGEMENT.PERMISSIONS_GRANTED' | translate }}
            </span>
            <button class="btn btn-primary" [disabled]="saving" (click)="savePermissions()">
              <i class="bx bx-save"></i>
              {{ saving ? ('ROLE_MANAGEMENT.SAVING' | translate) : ('ROLE_MANAGEMENT.SAVE' | translate) }}
            </button>
          </div>

        </div>
      </div>
    </div>
    `
})
export class RoleManagementComponent implements OnInit {

    roles: Role[] = [];
    allPermissions: Permission[] = [];
    permGroups: { module: string; perms: Permission[] }[] = [];
    selectedRole: Role | null = null;
    selectedPermissions = new Set<string>();
    loading = false;
    saving  = false;
    toast: string | null = null;
    showCreateModal = false;
    createForm = { name: '', description: '' };

    constructor(private adminService: AdminService, private confirmSvc: ConfirmService, private translate: TranslateService) {}

    ngOnInit(): void {
        this.loading = true;
        this.adminService.getAllRoles().subscribe({
            next: r  => { this.roles = r; this.loading = false; },
            error: () => { this.loading = false; }
        });
        this.adminService.getAllPermissions().subscribe({
            next: p => {
                this.allPermissions = p;
                this.buildPermGroups();
            },
            error: () => {}
        });
    }

    private buildPermGroups(): void {
        const map = new Map<string, Permission[]>();
        for (const p of this.allPermissions) {
            const mod = p.module ?? 'OTHER';
            if (!map.has(mod)) map.set(mod, []);
            map.get(mod)!.push(p);
        }
        this.permGroups = [...map.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([module, perms]) => ({ module, perms }));
    }

    roleInitials(name: string): string {
        if (!name) return '?';
        const parts = name.replace(/_/g, ' ').split(' ').filter(Boolean);
        return parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : name.substring(0, 2).toUpperCase();
    }

    selectRole(role: Role): void {
        this.selectedRole = role;
        this.selectedPermissions = new Set(role.permissions.map(p => p.name));
    }

    // ── Flat list for template (avoids nested *ngFor) ───────────────────────────
    get flatList(): any[] {
        const items: any[] = [];
        for (const group of this.permGroups) {
            const selected = group.perms.filter(p => this.selectedPermissions.has(p.name)).length;
            const allSel   = group.perms.length > 0 && selected === group.perms.length;
            const hasAny   = selected > 0;
            items.push({
                kind: 'header', module: group.module, group,
                total: group.perms.length, selected, allSel, hasAny,
                partial: hasAny && !allSel,
            });
            // Emit pairs of 2 permissions per row
            for (let i = 0; i < group.perms.length; i += 2) {
                items.push({
                    kind: 'pair',
                    a: group.perms[i],
                    b: group.perms[i + 1] ?? null,
                });
            }
        }
        return items;
    }

    // ── Group helpers ───────────────────────────────────────────────────────────
    groupSelected(group: { module: string; perms: Permission[] }): number {
        return group.perms.filter(p => this.selectedPermissions.has(p.name)).length;
    }
    groupAllSelected(group: { module: string; perms: Permission[] }): boolean {
        return group.perms.length > 0 && group.perms.every(p => this.selectedPermissions.has(p.name));
    }
    groupHasAny(group: { module: string; perms: Permission[] }): boolean {
        return group.perms.some(p => this.selectedPermissions.has(p.name));
    }
    groupPartial(group: { module: string; perms: Permission[] }): boolean {
        return this.groupHasAny(group) && !this.groupAllSelected(group);
    }
    toggleGroupAll(group: { module: string; perms: Permission[] }): void {
        if (this.groupAllSelected(group)) {
            group.perms.forEach(p => this.selectedPermissions.delete(p.name));
        } else {
            group.perms.forEach(p => this.selectedPermissions.add(p.name));
        }
        this.selectedPermissions = new Set(this.selectedPermissions);
    }

    togglePermissionDirect(permName: string): void {
        this.selectedPermissions.has(permName)
            ? this.selectedPermissions.delete(permName)
            : this.selectedPermissions.add(permName);
        this.selectedPermissions = new Set(this.selectedPermissions);
    }

    moduleIcon(module: string): string {
        const map: Record<string, string> = {
            USER: 'bx-user', ROLE: 'bx-shield-alt-2', LEAVE: 'bx-calendar-check',
            ATTENDANCE: 'bx-time-five', SALARY: 'bx-money', DOCUMENT: 'bx-file',
            RECRUITMENT: 'bx-briefcase', SYSTEM: 'bx-cog', REPORT: 'bx-bar-chart-alt-2',
            NOTIFICATION: 'bx-bell', PLANNING: 'bx-calendar', MEETING: 'bx-video',
            CV: 'bx-id-card', EMPLOYEE: 'bx-group', INTERN: 'bx-graduation',
            ORG: 'bx-buildings', ADMIN: 'bx-crown', OTHER: 'bx-layer',
        };
        return map[module?.toUpperCase()] ?? 'bx-layer';
    }

    moduleColor(module: string): { bg: string; fg: string } {
        const map: Record<string, { bg: string; fg: string }> = {
            USER:         { bg: '#EFF6FF', fg: '#2563EB' },
            ROLE:         { bg: '#F5F3FF', fg: '#7C3AED' },
            LEAVE:        { bg: '#ECFDF5', fg: '#059669' },
            ATTENDANCE:   { bg: '#FFF7ED', fg: '#EA580C' },
            SALARY:       { bg: '#FEFCE8', fg: '#CA8A04' },
            DOCUMENT:     { bg: '#F0F9FF', fg: '#0284C7' },
            RECRUITMENT:  { bg: '#FDF2F8', fg: '#9D174D' },
            SYSTEM:       { bg: '#F8FAFC', fg: '#475569' },
            REPORT:       { bg: '#ECFDF5', fg: '#1B7872' },
            NOTIFICATION: { bg: '#FEF3C7', fg: '#92400E' },
            PLANNING:     { bg: '#F0FDF4', fg: '#16A34A' },
            MEETING:      { bg: '#EFF6FF', fg: '#3B82F6' },
            CV:           { bg: '#FDF2F8', fg: '#BE185D' },
            EMPLOYEE:     { bg: '#EFF6FF', fg: '#1D4ED8' },
            INTERN:       { bg: '#F0FDF9', fg: '#0F766E' },
            ORG:          { bg: '#FFF7ED', fg: '#C2410C' },
            ADMIN:        { bg: '#FEF9C3', fg: '#854D0E' },
            OTHER:        { bg: '#F1F5F9', fg: '#64748B' },
        };
        return map[module?.toUpperCase()] ?? { bg: '#F1F5F9', fg: '#64748B' };
    }

    moduleLabel(module: string): string {
        const keyMap: Record<string, string> = {
            USER: 'SIDEBAR.USER_MANAGEMENT', ROLE: 'SIDEBAR.ROLES_PERMISSIONS', LEAVE: 'SIDEBAR.LEAVE_REQUESTS',
            ATTENDANCE: 'SIDEBAR.ATTENDANCES', SALARY: 'SIDEBAR.SALARY', DOCUMENT: 'SIDEBAR.DOCUMENTS',
            RECRUITMENT: 'SIDEBAR.RECRUITMENT', SYSTEM: 'SIDEBAR.ADMINISTRATION', REPORT: 'SIDEBAR.REPORTS',
            NOTIFICATION: 'SIDEBAR.NOTIFICATIONS', PLANNING: 'SIDEBAR.PLANNING', MEETING: 'SIDEBAR.MEETINGS',
            CV: 'SIDEBAR.EMPLOYEES', EMPLOYEE: 'SIDEBAR.EMPLOYEES', INTERN: 'SIDEBAR.INTERNS',
            ORG: 'SIDEBAR.ORGANISATION', ADMIN: 'SIDEBAR.ADMINISTRATION',
        };
        const key = keyMap[module?.toUpperCase()];
        return key ? this.translate.instant(key) : module;
    }

    savePermissions(): void {
        if (!this.selectedRole) return;
        this.saving = true;
        this.adminService.updateRolePermissions(this.selectedRole.id, [...this.selectedPermissions]).subscribe({
            next: updated => {
                const idx = this.roles.findIndex(r => r.id === updated.id);
                if (idx > -1) this.roles[idx] = updated;
                this.selectedRole = updated;
                this.saving = false;
                this.showToast(this.translate.instant('ROLE_MANAGEMENT.TOAST_PERMISSIONS_UPDATED'));
            },
            error: e => { this.saving = false; this.showToast(e?.error?.message || this.translate.instant('ROLE_MANAGEMENT.TOAST_ERROR')); }
        });
    }

    openCreate(): void { this.createForm = { name: '', description: '' }; this.showCreateModal = true; }

    createRole(): void {
        if (!this.createForm.name) return;
        this.saving = true;
        this.adminService.createRole(this.createForm).subscribe({
            next: role => {
                this.roles = [...this.roles, { ...role, permissions: [] }];
                this.showCreateModal = false;
                this.saving = false;
                this.showToast(this.translate.instant('ROLE_MANAGEMENT.TOAST_ROLE_CREATED').replace('{name}', role.name));
            },
            error: e => { this.saving = false; this.showToast(e?.error?.message || this.translate.instant('ROLE_MANAGEMENT.TOAST_ERROR')); }
        });
    }

    async deleteRole(role: Role): Promise<void> {
        if (!(await this.confirmSvc.confirm(
            this.translate.instant('ROLE_MANAGEMENT.TOAST_ROLE_DELETED').replace('{name}', role.name),
            this.translate.instant('ROLE_MANAGEMENT.BTN_DELETE')))) return;
        this.adminService.deleteRole(role.id).subscribe({
            next: () => {
                this.roles = this.roles.filter(r => r.id !== role.id);
                if (this.selectedRole?.id === role.id) {
                    this.selectedRole = null;
                    this.selectedPermissions = new Set();
                }
                this.showToast(this.translate.instant('ROLE_MANAGEMENT.TOAST_ROLE_DELETED').replace('{name}', role.name));
            },
            error: e => this.showToast(e?.error?.message || this.translate.instant('ROLE_MANAGEMENT.TOAST_ERROR'))
        });
    }

    private showToast(msg: string): void {
        this.toast = msg;
        setTimeout(() => this.toast = null, 3000);
    }
}
