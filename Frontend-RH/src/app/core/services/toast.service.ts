import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message: string;
  autoDismiss: boolean;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts$ = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this._toasts$.asObservable();
  private nextId = 1;

  private add(type: ToastType, title: string, message: string, duration = 4000, autoDismiss = true) {
    const toast: Toast = { id: this.nextId++, type, title, message, autoDismiss, duration };
    this._toasts$.next([...this._toasts$.value, toast]);
    if (autoDismiss) {
      setTimeout(() => this.dismiss(toast.id), duration);
    }
    return toast.id;
  }

  success(title: string, message = '') { return this.add('success', title, message); }
  error(title: string, message = '', persist = false) { return this.add('error', title, message, 6000, !persist); }
  warning(title: string, message = '') { return this.add('warning', title, message, 5000); }
  info(title: string, message = '') { return this.add('info', title, message); }

  dismiss(id: number) {
    this._toasts$.next(this._toasts$.value.filter(t => t.id !== id));
  }

  clear() { this._toasts$.next([]); }
}
