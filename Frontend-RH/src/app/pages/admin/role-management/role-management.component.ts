import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, Permission, Role } from '../admin.service';

@Component({
    selector: 'app-role-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Gestion des Rôles</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <ul class="list-group">
              <li class="list-group-item d-flex justify-content-between align-items-center"
                  *ngFor="let role of roles"
                  [class.active]="selectedRole?.id === role.id"
                  (click)="selectRole(role)" style="cursor:pointer">
                {{ role.name }}
                <span class="badge bg-secondary">{{ role.permissions.length }}</span>
              </li>
            </ul>
          </div>
          <div class="col-md-8" *ngIf="selectedRole">
            <h6>Permissions — {{ selectedRole.name }}</h6>
            <div class="row">
              <div class="col-md-6" *ngFor="let perm of allPermissions">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox"
                         [checked]="hasPermission(perm.name)"
                         (change)="togglePermission(perm.name, $event)">
                  <label class="form-check-label small">
                    <strong>{{ perm.name }}</strong>
                    <span class="text-muted ms-1">{{ perm.description }}</span>
                  </label>
                </div>
              </div>
            </div>
            <button class="btn btn-primary btn-sm mt-3" (click)="savePermissions()">
              Enregistrer
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
    selectedRole: Role | null = null;
    selectedPermissions: Set<string> = new Set();

    constructor(private adminService: AdminService) {}

    ngOnInit(): void {
        this.adminService.getAllRoles().subscribe(r => this.roles = r);
        this.adminService.getAllPermissions().subscribe(p => this.allPermissions = p);
    }

    selectRole(role: Role): void {
        this.selectedRole = role;
        this.selectedPermissions = new Set(role.permissions.map(p => p.name));
    }

    hasPermission(permName: string): boolean {
        return this.selectedPermissions.has(permName);
    }

    togglePermission(permName: string, event: Event): void {
        const checked = (event.target as HTMLInputElement).checked;
        if (checked) {
            this.selectedPermissions.add(permName);
        } else {
            this.selectedPermissions.delete(permName);
        }
    }

    savePermissions(): void {
        if (!this.selectedRole) return;
        this.adminService.updateRolePermissions(this.selectedRole.id, [...this.selectedPermissions])
            .subscribe(updated => {
                const idx = this.roles.findIndex(r => r.id === updated.id);
                if (idx > -1) this.roles[idx] = updated;
                this.selectedRole = updated;
            });
    }
}
