import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index:1080">
      <div *ngFor="let toast of toasts; trackBy: trackById"
           class="toast show align-items-center border-0"
           [class]="'text-bg-' + toastClass(toast.type)"
           role="alert" aria-live="assertive">
        <div class="d-flex">
          <div class="toast-body">
            <strong *ngIf="toast.title">{{ toast.title }}</strong>
            <div *ngIf="toast.message" class="small mt-1">{{ toast.message }}</div>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto"
                  (click)="toastService.dismiss(toast.id)" aria-label="Close"></button>
        </div>
      </div>
    </div>
  `
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private destroy$ = new Subject<void>();

  constructor(public toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toasts$.pipe(takeUntil(this.destroy$)).subscribe(t => this.toasts = t);
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  trackById(_: number, t: Toast) { return t.id; }

  toastClass(type: string): string {
    const map: Record<string, string> = { success: 'success', error: 'danger', warning: 'warning', info: 'info' };
    return map[type] || 'secondary';
  }
}
