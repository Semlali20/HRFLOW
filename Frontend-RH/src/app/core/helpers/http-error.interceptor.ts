import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';
import { LoadingService } from '../services/loading.service';
import { Router } from '@angular/router';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private toastService: ToastService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip loading indicator for SSE/EventSource requests
    const isSSE = req.headers.get('Accept') === 'text/event-stream';
    if (!isSSE) this.loadingService.show();

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        const message = err.error?.message || err.message || 'Request failed';
        switch (err.status) {
          case 0:
            this.toastService.error('Network Error', 'Unable to connect to server. Check your connection.');
            break;
          case 400:
            // Validation errors — show field-level detail if available
            if (err.error?.fieldErrors) {
              const fields = Object.entries(err.error.fieldErrors)
                .map(([k, v]) => `${k}: ${v}`).join(', ');
              this.toastService.warning('Validation Error', fields);
            } else {
              this.toastService.warning('Bad Request', message);
            }
            break;
          case 401:
            this.toastService.error('Session Expired', 'Please log in again.');
            this.router.navigate(['/account/login']);
            break;
          case 403:
            this.toastService.error('Access Denied', 'You do not have permission for this action.');
            break;
          case 404:
            this.toastService.warning('Not Found', message);
            break;
          case 409:
            this.toastService.warning('Conflict', message);
            break;
          case 429:
            this.toastService.warning('Too Many Requests', 'Please wait before trying again.');
            break;
          case 500:
          case 502:
          case 503:
            this.toastService.error('Server Error', 'Something went wrong on our end. Please try again later.');
            break;
          default:
            if (err.status >= 400) this.toastService.error(`Error ${err.status}`, message);
        }
        return throwError(() => err);
      }),
      finalize(() => { if (!isSSE) this.loadingService.hide(); })
    );
  }
}
