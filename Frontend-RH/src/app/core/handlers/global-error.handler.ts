import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private zone: NgZone, private toastService: ToastService) {}

  handleError(error: any): void {
    const message = error?.message || 'An unexpected error occurred';
    // Don't flood the user with chunk-load errors on navigation
    if (message.includes('ChunkLoadError') || message.includes('Loading chunk')) {
      window.location.reload();
      return;
    }
    this.zone.run(() => {
      this.toastService.error('Application Error', message);
    });
    console.error('[GlobalErrorHandler]', error);
  }
}
