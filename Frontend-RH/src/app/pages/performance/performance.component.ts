import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PerformanceService, PerformanceReview } from './performance.service';
import { SharedCacheService } from '../../core/services/shared-cache.service';
import { WallClockComponent } from 'src/app/shared/wall-clock/wall-clock.component';
import { ConfirmService } from 'src/app/shared/confirm.service';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, WallClockComponent],
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.scss'],
})
export class PerformanceComponent implements OnInit, OnDestroy {
  reviews: PerformanceReview[] = [];
  employees: any[] = [];
  loading = false;
  error: string | null = null;
  showForm = false;
  editingId: number | null = null;

  form: PerformanceReview = this.emptyForm();
  scoreLabels = [1, 2, 3, 4, 5];
  scoreFields: (keyof PerformanceReview)[] = [
    'technicalScore',
    'communicationScore',
    'teamworkScore',
    'initiativeScore',
    'attendanceScore',
  ];

  // Pagination
  currentPage   = 0;
  totalPages    = 0;
  totalElements = 0;
  pageSize      = 20;

  private destroy$ = new Subject<void>();

  constructor(
    private performanceService: PerformanceService,
    private sharedCache: SharedCacheService,
    private confirmSvc: ConfirmService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.loadReviews();
    this.sharedCache.getEmployees()
      .pipe(takeUntil(this.destroy$))
      .subscribe(e => this.employees = e);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReviews(): void {
    this.loading = true;
    this.error   = null;
    this.performanceService.getAll(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page: any) => {
          this.reviews       = Array.isArray(page) ? page : (page.content ?? page.data ?? []);
          this.totalPages    = page.totalPages    ?? 1;
          this.totalElements = page.totalElements ?? this.reviews.length;
          this.loading       = false;
        },
        error: () => {
          this.error   = 'PERFORMANCE.LOAD_ERROR';
          this.loading = false;
        }
      });
  }

  openForm(review?: PerformanceReview): void {
    this.form      = review ? { ...review } : this.emptyForm();
    this.editingId = review?.id ?? null;
    this.showForm  = true;
  }

  closeForm(): void {
    this.showForm  = false;
    this.editingId = null;
    this.form      = this.emptyForm();
  }

  save(): void {
    const call = this.editingId
      ? this.performanceService.update(this.editingId, this.form)
      : this.performanceService.create(this.form);
    call.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.closeForm(); this.loadReviews(); },
      error: () => {}
    });
  }

  submit(id: number): void {
    this.performanceService.submit(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadReviews());
  }

  async delete(id: number): Promise<void> {
    const lang = this.translate.currentLang ?? 'fr';
    const title   = lang === 'fr' ? 'Supprimer l\'évaluation' : 'Delete Review';
    const message = lang === 'fr'
      ? 'Êtes-vous sûr de vouloir supprimer cette évaluation ? Cette action est irréversible.'
      : 'Are you sure you want to delete this review? This action cannot be undone.';
    const confirmed = await this.confirmSvc.confirm(message, title);
    if (!confirmed) return;
    this.performanceService.delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadReviews());
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadReviews();
  }

  get pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  // ── Computed KPI counts (from current page data) ──────────────────────
  get draftCount():        number { return this.reviews.filter(r => r.status === 'DRAFT').length; }
  get submittedCount():    number { return this.reviews.filter(r => r.status === 'SUBMITTED').length; }
  get acknowledgedCount(): number { return this.reviews.filter(r => r.status === 'ACKNOWLEDGED').length; }

  // ── Badge helpers ─────────────────────────────────────────────────────
  statusBadgeClass(s?: string): string {
    const map: Record<string, string> = {
      DRAFT:        'badge-draft',
      SUBMITTED:    'badge-submitted',
      ACKNOWLEDGED: 'badge-acknowledged',
    };
    return map[s ?? ''] ?? 'badge-period';
  }

  scoreLabel(field: string): string {
    const labels: Record<string, string> = {
      technicalScore:     'Technical',
      communicationScore: 'Communication',
      teamworkScore:      'Teamwork',
      initiativeScore:    'Initiative',
      attendanceScore:    'Attendance',
    };
    return labels[field] ?? field.replace('Score', '');
  }

  trackById(_: number, r: any): number { return r.id; }

  private emptyForm(): PerformanceReview {
    return {
      collaborateurId: 0,
      reviewPeriod:    '',
      reviewDate:      new Date().toISOString().substring(0, 10),
    };
  }
}
