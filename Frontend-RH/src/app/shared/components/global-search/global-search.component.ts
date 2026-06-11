import { Component, OnInit, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { GlobalSearchService, SearchResult } from '../../../core/services/global-search.service';

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="global-search position-relative" style="min-width:260px">
      <div class="gs-input-group">
        <span class="gs-input-icon">
          <i class="bx bx-search" *ngIf="!searching"></i>
          <span class="gs-spinner" *ngIf="searching"></span>
        </span>
        <input
          type="text"
          class="gs-input"
          placeholder="Search employees, leaves, candidates…"
          [(ngModel)]="query"
          (ngModelChange)="onInput($event)"
          (focus)="onFocus()"
          autocomplete="off"
        />
        <button *ngIf="query" class="gs-clear-btn" type="button" (click)="clear()">
          <i class="bx bx-x"></i>
        </button>
      </div>

      <!-- Results dropdown -->
      <div *ngIf="showResults && results.length > 0"
           class="gs-dropdown">
        <div *ngFor="let r of results; trackBy: trackById"
             class="gs-result-item"
             (click)="navigate(r)"
             (mouseenter)="hoveredId = r.id + r.type"
             (mouseleave)="hoveredId = null"
             [class.gs-result-item--hover]="hoveredId === r.id + r.type">
          <div class="gs-result-icon">
            <i [class]="'bx ' + mapIcon(r.icon)"></i>
          </div>
          <div class="gs-result-body">
            <div class="gs-result-title">{{ r.title }}</div>
            <div class="gs-result-sub">{{ r.subtitle }}</div>
          </div>
          <span *ngIf="r.badge" class="gs-badge" [ngClass]="r.badgeClass">{{ r.badge }}</span>
        </div>

        <div class="gs-footer">
          <span>{{ results.length }} result{{ results.length !== 1 ? 's' : '' }} found</span>
        </div>
      </div>

      <!-- No results -->
      <div *ngIf="showResults && results.length === 0 && query.length >= 2 && !searching"
           class="gs-dropdown gs-dropdown--empty">
        <i class="bx bx-search-alt"></i>
        <span>No results for "{{ query }}"</span>
      </div>
    </div>
  `,
  styles: [`
    .global-search { position: relative; }

    .gs-input-group {
      display: flex;
      align-items: center;
      background: var(--gs-bg, #f4f6f9);
      border: 1.5px solid transparent;
      border-radius: 10px;
      padding: 0 10px;
      transition: border-color .15s, background .15s;
      height: 38px;
      min-width: 260px;
    }
    .gs-input-group:focus-within {
      background: #fff;
      border-color: #1B7872;
      box-shadow: 0 0 0 3px rgba(27,120,114,.08);
    }

    .gs-input-icon {
      display: flex;
      align-items: center;
      color: #8FA3B8;
      font-size: 16px;
      flex-shrink: 0;
      margin-right: 6px;
    }
    .gs-spinner {
      display: inline-block;
      width: 14px; height: 14px;
      border: 2px solid #E2E8F0;
      border-top-color: #1B7872;
      border-radius: 50%;
      animation: gs-spin .7s linear infinite;
    }
    @keyframes gs-spin { to { transform: rotate(360deg); } }

    .gs-input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      font-size: 13px;
      color: #1A2B3C;
      font-family: 'Inter', sans-serif;
    }
    .gs-input::placeholder { color: #B0BEC5; }

    .gs-clear-btn {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      color: #8FA3B8;
      font-size: 16px;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      transition: color .13s;
    }
    .gs-clear-btn:hover { color: #4A6080; }

    .gs-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      min-width: 320px;
      width: 100%;
      background: #fff;
      border: 1px solid #E8EDF2;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(22,34,51,.12);
      z-index: 1050;
      overflow: hidden;
    }

    .gs-result-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      cursor: pointer;
      transition: background .12s;
    }
    .gs-result-item--hover { background: #F4FBF9; }

    .gs-result-icon {
      width: 34px; height: 34px;
      border-radius: 50%;
      background: #E8F4F3;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      font-size: 15px;
      color: #1B7872;
    }

    .gs-result-body { flex: 1; min-width: 0; }
    .gs-result-title {
      font-size: 13px;
      font-weight: 600;
      color: #1A2B3C;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .gs-result-sub {
      font-size: 11.5px;
      color: #8FA3B8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .gs-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 8px;
      color: #fff;
      flex-shrink: 0;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    .bg-success  { background: #22C55E !important; }
    .bg-secondary { background: #94A3B8 !important; }
    .bg-warning  { background: #F59E0B !important; color: #1A2B3C !important; }
    .bg-danger   { background: #EF4444 !important; }
    .bg-info     { background: #3B82F6 !important; }

    .gs-footer {
      padding: 8px 14px;
      border-top: 1px solid #F0F3F6;
      font-size: 11.5px;
      color: #8FA3B8;
      text-align: center;
    }

    .gs-dropdown--empty {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      font-size: 13px;
      color: #8FA3B8;
    }
  `]
})
export class GlobalSearchComponent implements OnInit, OnDestroy {
  query = '';
  results: SearchResult[] = [];
  showResults = false;
  searching = false;
  hoveredId: string | null = null;

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private searchService: GlobalSearchService,
    private router: Router,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length < 2) {
          this.results = [];
          this.searching = false;
          this.showResults = false;
          return [];
        }
        this.searching = true;
        return this.searchService.search(term);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (results: SearchResult[]) => {
        this.results = results;
        this.searching = false;
        this.showResults = true;
      },
      error: () => { this.searching = false; }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInput(val: string): void {
    this.search$.next(val);
  }

  onFocus(): void {
    if (this.results.length > 0) {
      this.showResults = true;
    }
  }

  navigate(r: SearchResult): void {
    this.clear();
    this.router.navigate([r.route]);
  }

  clear(): void {
    this.query = '';
    this.results = [];
    this.showResults = false;
  }

  trackById(_: number, r: SearchResult): string {
    return r.id + r.type;
  }

  /** Map bootstrap-icons class names to boxicons equivalents used in this project */
  mapIcon(icon: string): string {
    const map: Record<string, string> = {
      'bi-person-fill': 'bx-user',
      'bi-calendar-x': 'bx-calendar-x',
      'bi-person-lines-fill': 'bx-user-check',
    };
    // If it's already a bx icon (legacy calls), strip bi- prefix fallback
    return map[icon] ?? icon.replace('bi-', 'bx-');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.showResults = false;
    }
  }
}
