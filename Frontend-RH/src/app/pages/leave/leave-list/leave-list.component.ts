import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveRequest, LeaveService } from '../leave.service';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
    selector: 'app-leave-list',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">{{ canViewAll ? 'Toutes les demandes de congé' : 'Mes demandes de congé' }}</h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Type</th>
                <th>Du</th>
                <th>Au</th>
                <th>Jours</th>
                <th>Statut</th>
                <th *ngIf="canApprove">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let req of requests">
                <td>{{ req.requester.firstname }} {{ req.requester.lastname }}</td>
                <td>{{ req.leaveType.name }}</td>
                <td>{{ req.startDate | date:'dd/MM/yyyy' }}</td>
                <td>{{ req.endDate | date:'dd/MM/yyyy' }}</td>
                <td>{{ req.durationDays }}</td>
                <td>
                  <span [class]="'badge bg-' + statusColor(req.status)">{{ req.status }}</span>
                </td>
                <td *ngIf="canApprove">
                  <ng-container *ngIf="req.status === 'PENDING'">
                    <button class="btn btn-sm btn-success me-1" (click)="approve(req)">Approuver</button>
                    <button class="btn btn-sm btn-danger" (click)="reject(req)">Refuser</button>
                  </ng-container>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class LeaveListComponent implements OnInit {

    requests: LeaveRequest[] = [];
    canViewAll = false;
    canApprove = false;

    constructor(
        private leaveService: LeaveService,
        public permService: PermissionService
    ) {}

    ngOnInit(): void {
        this.canViewAll = this.permService.has('LEAVE_READ_ALL');
        this.canApprove = this.permService.hasAny('LEAVE_APPROVE', 'LEAVE_REJECT');
        const obs = this.canViewAll
            ? this.leaveService.getAllRequests()
            : this.leaveService.getMyRequests();
        obs.subscribe(data => this.requests = data);
    }

    approve(req: LeaveRequest): void {
        this.leaveService.approve(req.id, '').subscribe(updated => {
            const idx = this.requests.findIndex(r => r.id === req.id);
            if (idx > -1) this.requests[idx] = updated;
        });
    }

    reject(req: LeaveRequest): void {
        const comment = prompt('Raison du refus:') ?? '';
        this.leaveService.reject(req.id, comment).subscribe(updated => {
            const idx = this.requests.findIndex(r => r.id === req.id);
            if (idx > -1) this.requests[idx] = updated;
        });
    }

    statusColor(status: string): string {
        const map: Record<string, string> = {
            PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger', CANCELLED: 'secondary'
        };
        return map[status] ?? 'secondary';
    }
}
