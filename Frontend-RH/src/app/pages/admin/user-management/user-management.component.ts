import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUser, Role } from '../admin.service';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="card">
      <div class="card-header"><h5>Gestion des Utilisateurs</h5></div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Titre</th>
                <th>Rôles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td>{{ user.firstName }} {{ user.lastName }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.title }}</td>
                <td>
                  <span class="badge bg-primary me-1" *ngFor="let r of user.roles">{{ r.name }}</span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1" (click)="editRoles(user)">
                    Rôles
                  </button>
                  <button class="btn btn-sm btn-outline-danger" (click)="deleteUser(user)">
                    Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Role editor -->
        <div *ngIf="editingUser" class="mt-4 p-3 border rounded bg-light">
          <h6>Modifier les rôles de {{ editingUser.firstName }} {{ editingUser.lastName }}</h6>
          <div class="form-check" *ngFor="let role of allRoles">
            <input class="form-check-input" type="checkbox"
                   [checked]="hasRole(editingUser, role.name)"
                   (change)="toggleRole(role.name, $event)">
            <label class="form-check-label">{{ role.name }} — {{ role.description }}</label>
          </div>
          <div class="mt-2">
            <button class="btn btn-success btn-sm me-2" (click)="saveRoles()">Enregistrer</button>
            <button class="btn btn-secondary btn-sm" (click)="editingUser = null">Annuler</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserManagementComponent implements OnInit {

    users: AdminUser[] = [];
    allRoles: Role[] = [];
    editingUser: AdminUser | null = null;
    selectedRoles: Set<string> = new Set();

    constructor(private adminService: AdminService) {}

    ngOnInit(): void {
        this.adminService.getAllUsers().subscribe(u => this.users = u);
        this.adminService.getAllRoles().subscribe(r => this.allRoles = r);
    }

    hasRole(user: AdminUser, roleName: string): boolean {
        return user.roles.some(r => r.name === roleName);
    }

    editRoles(user: AdminUser): void {
        this.editingUser = user;
        this.selectedRoles = new Set(user.roles.map(r => r.name));
    }

    toggleRole(roleName: string, event: Event): void {
        const checked = (event.target as HTMLInputElement).checked;
        if (checked) {
            this.selectedRoles.add(roleName);
        } else {
            this.selectedRoles.delete(roleName);
        }
    }

    saveRoles(): void {
        if (!this.editingUser) return;
        this.adminService.updateUserRoles(this.editingUser.id, [...this.selectedRoles])
            .subscribe(updated => {
                const idx = this.users.findIndex(u => u.id === updated.id);
                if (idx > -1) this.users[idx] = updated;
                this.editingUser = null;
            });
    }

    deleteUser(user: AdminUser): void {
        if (!confirm(`Supprimer ${user.firstName} ${user.lastName} ?`)) return;
        this.adminService.deleteUser(user.id).subscribe(() => {
            this.users = this.users.filter(u => u.id !== user.id);
        });
    }
}
