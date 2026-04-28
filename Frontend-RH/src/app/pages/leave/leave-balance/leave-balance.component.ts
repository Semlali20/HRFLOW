import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveBalance, LeaveService } from '../leave.service';

@Component({
    selector: 'app-leave-balance',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="card">
      <div class="card-header"><h5>Solde des congés</h5></div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-4" *ngFor="let b of balances">
            <div class="card border-primary mb-3">
              <div class="card-body text-center">
                <h6 class="card-title">{{ b.leaveType.name }}</h6>
                <div class="display-4 text-primary">{{ b.remainingDays }}</div>
                <small class="text-muted">jours restants sur {{ b.totalDays }}</small>
                <div class="progress mt-2" style="height: 6px">
                  <div class="progress-bar" [style.width.%]="(b.usedDays / b.totalDays) * 100"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p *ngIf="balances.length === 0" class="text-muted text-center">Aucun solde disponible</p>
      </div>
    </div>
  `
})
export class LeaveBalanceComponent implements OnInit {

    balances: LeaveBalance[] = [];

    constructor(private leaveService: LeaveService) {}

    ngOnInit(): void {
        this.leaveService.getMyBalances().subscribe(b => this.balances = b);
    }
}
