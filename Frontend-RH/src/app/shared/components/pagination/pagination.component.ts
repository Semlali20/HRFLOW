import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav *ngIf="totalPages > 1" class="d-flex justify-content-between align-items-center mt-3">
      <small class="text-muted">
        Showing {{ (currentPage * pageSize) + 1 }} – {{ min((currentPage + 1) * pageSize, totalElements) }} of {{ totalElements }}
      </small>
      <ul class="pagination pagination-sm mb-0">
        <li class="page-item" [class.disabled]="currentPage === 0">
          <button class="page-link" (click)="changePage(0)" [disabled]="currentPage === 0">«</button>
        </li>
        <li class="page-item" [class.disabled]="currentPage === 0">
          <button class="page-link" (click)="changePage(currentPage - 1)" [disabled]="currentPage === 0">‹</button>
        </li>
        <li *ngFor="let p of pages" class="page-item" [class.active]="p === currentPage">
          <button class="page-link" (click)="changePage(p)">{{ p + 1 }}</button>
        </li>
        <li class="page-item" [class.disabled]="currentPage === totalPages - 1">
          <button class="page-link" (click)="changePage(currentPage + 1)" [disabled]="currentPage === totalPages - 1">›</button>
        </li>
        <li class="page-item" [class.disabled]="currentPage === totalPages - 1">
          <button class="page-link" (click)="changePage(totalPages - 1)" [disabled]="currentPage === totalPages - 1">»</button>
        </li>
      </ul>
    </nav>
  `
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage = 0;
  @Input() totalPages = 0;
  @Input() totalElements = 0;
  @Input() pageSize = 10;
  @Output() pageChange = new EventEmitter<number>();

  pages: number[] = [];

  ngOnChanges() {
    this.buildPages();
  }

  buildPages() {
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);
    if (end - start < maxVisible) start = Math.max(0, end - maxVisible);
    this.pages = Array.from({ length: end - start }, (_, i) => start + i);
  }

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  min(a: number, b: number) { return Math.min(a, b); }
}
