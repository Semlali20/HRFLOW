import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="empty-state text-center py-5">
      <div class="empty-state-icon mb-3">
        <i class="bi {{ icon }} fs-1 text-muted opacity-50"></i>
      </div>
      <h5 class="text-muted">{{ title | translate }}</h5>
      <p class="text-muted small mb-0">{{ subtitle | translate }}</p>
    </div>
  `,
  styles: [`
    .empty-state { min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .empty-state-icon { opacity: 0.4; }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'bi-inbox';
  @Input() title = 'COMMON.NO_DATA';
  @Input() subtitle = 'COMMON.NO_DATA_SUBTITLE';
}
