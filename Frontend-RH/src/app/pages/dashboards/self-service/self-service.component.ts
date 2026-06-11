import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, map } from 'rxjs/operators';

import { AuthenticationService } from 'src/app/core/services/auth.service';
import { AuthUser } from 'src/app/core/models/auth.models';
import { LeaveService } from 'src/app/pages/leave/leave.service';
import { TrainingService, TrainingSession } from 'src/app/pages/training/training.service';
import { PerformanceService, PerformanceReview } from 'src/app/pages/performance/performance.service';
import { ReportService } from 'src/app/core/services/report.service';

@Component({
  selector: 'app-self-service',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './self-service.component.html',
})
export class SelfServiceComponent implements OnInit, OnDestroy {

  currentUser: AuthUser | null = null;
  leaveBalance: any[] = [];
  myLeaveRequests: any[] = [];
  myTrainings: TrainingSession[] = [];
  myReviews: PerformanceReview[] = [];

  // Manager / HR counters
  pendingLeaveCount = 0;
  totalEmployees = 0;
  pendingReviewCount = 0;

  loading = true;
  todayDate = new Date();

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthenticationService,
    private leaveService: LeaveService,
    private trainingService: TrainingService,
    private performanceService: PerformanceService,
    private reportService: ReportService,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getAuthenticatedUser();
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Role helpers ──────────────────────────────────────────────────────────

  get isHR(): boolean {
    return this.authService.hasPermission('EMPLOYEE_CREATE');
  }

  get isManager(): boolean {
    return this.authService.hasPermission('LEAVE_APPROVE');
  }

  get isEmployee(): boolean {
    return !this.isManager && !this.isHR;
  }

  // ── Time greeting ─────────────────────────────────────────────────────────

  get timeOfDay(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 18) return 'afternoon';
    return 'evening';
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  loadDashboard(): void {
    this.loading = true;

    // All users: my leave requests + my balance
    const myRequests$ = this.leaveService.getMyRequests().pipe(catchError(() => of([])));
    const myBalance$  = this.leaveService.getMyBalances().pipe(catchError(() => of([])));

    // All users: trainings (filter by participation client-side)
    const trainings$ = this.trainingService.getAll(0, 50).pipe(
      map((res: any) => {
        const items: TrainingSession[] = Array.isArray(res) ? res : (res?.content ?? res?.data ?? []);
        // Keep only sessions where current user's id appears in participantIds
        const uid = this.currentUser?.id;
        if (!uid) return items.slice(0, 5);
        const enrolled = items.filter(t => t.participantIds?.includes(uid));
        return enrolled.length > 0 ? enrolled : items.slice(0, 5);
      }),
      catchError(() => of([] as TrainingSession[]))
    );

    // All users: performance reviews
    const reviews$ = this.performanceService.getAll(0, 10).pipe(
      map(res => res?.content ?? []),
      catchError(() => of([] as PerformanceReview[]))
    );

    // Manager / HR: pending leave count and KPIs
    const allLeaves$ = (this.isManager || this.isHR)
      ? this.leaveService.getAllRequests().pipe(catchError(() => of([])))
      : of([]);

    const kpi$ = this.isHR
      ? this.reportService.getKpis().pipe(catchError(() => of(null)))
      : of(null);

    forkJoin({
      myRequests: myRequests$,
      myBalance:  myBalance$,
      trainings:  trainings$,
      reviews:    reviews$,
      allLeaves:  allLeaves$,
      kpi:        kpi$,
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ({ myRequests, myBalance, trainings, reviews, allLeaves, kpi }) => {
        this.myLeaveRequests = myRequests as any[];
        this.leaveBalance    = (myBalance as any[]).slice(0, 8);
        this.myTrainings     = trainings as TrainingSession[];
        this.myReviews       = reviews as PerformanceReview[];

        // Manager/HR: count pending leaves
        const all = allLeaves as any[];
        this.pendingLeaveCount = all.filter((l: any) => l.status === 'PENDING').length;

        // HR: totals from KPI
        if (kpi) {
          this.totalEmployees    = (kpi as any).totalEmployees ?? 0;
          this.pendingReviewCount = reviews.filter((r: any) => r.status === 'DRAFT').length;
        }

        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  statusClass(status: string): string {
    switch ((status ?? '').toUpperCase()) {
      case 'APPROVED':    return 'badge bg-success';
      case 'PENDING':     return 'badge bg-warning text-dark';
      case 'REJECTED':    return 'badge bg-danger';
      case 'CANCELLED':   return 'badge bg-secondary';
      default:            return 'badge bg-light text-dark border';
    }
  }

  trainingStatusClass(status: string): string {
    switch ((status ?? '').toUpperCase()) {
      case 'ONGOING':   return 'badge bg-primary';
      case 'PLANNED':   return 'badge bg-info text-dark';
      case 'COMPLETED': return 'badge bg-success';
      case 'CANCELLED': return 'badge bg-danger';
      default:          return 'badge bg-light text-dark border';
    }
  }

  trackById(_: number, item: any): any {
    return item?.id ?? _;
  }
}
