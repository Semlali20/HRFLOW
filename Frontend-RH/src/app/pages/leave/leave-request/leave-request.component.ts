import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LeaveService, LeaveType } from '../leave.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-leave-request',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
    <div class="card">
      <div class="card-header"><h5>{{ 'LEAVE.PANEL_NEW_TITLE' | translate }}</h5></div>
      <div class="card-body">
        <form (ngSubmit)="submit()">
          <div class="mb-3">
            <label class="form-label">{{ 'LEAVE.FIELD_LEAVE_TYPE' | translate }}</label>
            <select class="form-select" [(ngModel)]="form.leaveTypeId" name="leaveTypeId" required>
              <option *ngFor="let t of leaveTypes" [value]="t.id">{{ t.name }}</option>
            </select>
          </div>
          <div class="row mb-3">
            <div class="col">
              <label class="form-label">{{ 'LEAVE.FIELD_START_DATE' | translate }}</label>
              <input type="date" class="form-control" [(ngModel)]="form.startDate" name="startDate" required>
            </div>
            <div class="col">
              <label class="form-label">{{ 'LEAVE.FIELD_END_DATE' | translate }}</label>
              <input type="date" class="form-control" [(ngModel)]="form.endDate" name="endDate" required>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">{{ 'LEAVE.REASON' | translate }}</label>
            <textarea class="form-control" [(ngModel)]="form.reason" name="reason" rows="3"></textarea>
          </div>
          <button type="submit" class="btn btn-primary">{{ 'LEAVE.SUBMIT' | translate }}</button>
        </form>
      </div>
    </div>
  `
})
export class LeaveRequestComponent implements OnInit {

    leaveTypes: LeaveType[] = [];
    form = { leaveTypeId: null as number | null, startDate: '', endDate: '', reason: '' };

    constructor(private leaveService: LeaveService, private router: Router) {}

    ngOnInit(): void {
        this.leaveService.getLeaveTypes().subscribe(types => this.leaveTypes = types);
    }

    submit(): void {
        if (!this.form.leaveTypeId || !this.form.startDate || !this.form.endDate) return;
        this.leaveService.submitRequest({
            leaveTypeId: this.form.leaveTypeId,
            startDate: this.form.startDate,
            endDate: this.form.endDate,
            reason: this.form.reason
        }).subscribe(() => this.router.navigate(['/leaves']));
    }
}
