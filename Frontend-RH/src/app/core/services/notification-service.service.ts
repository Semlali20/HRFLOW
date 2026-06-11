import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthenticationService } from './auth.service';
import { environment } from 'src/environments/environment';

export interface HrNotification {
    id: number;
    title: string;
    message: string;
    type: string;
    read: boolean;
    actionUrl?: string;
    createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {

    private readonly BASE_URL = `${environment.apiUrl}/notifications`;
    private eventSource: EventSource | null = null;

    private _notifications = new BehaviorSubject<HrNotification[]>([]);
    readonly notifications$ = this._notifications.asObservable();

    private _unreadCount = new BehaviorSubject<number>(0);
    readonly unreadCount$ = this._unreadCount.asObservable();

    constructor(private http: HttpClient, private authService: AuthenticationService) {}

    connect(): void {
        if (this.eventSource) return;
        if (!this.authService.isLoggedIn()) return;

        this.loadUnread();

        // S-006: Use a short-lived one-time ticket instead of passing the JWT
        // as a URL query parameter (which gets recorded in server access logs).
        this.http.post<{ ticket: string }>(
            `${environment.apiUrl}/auth/sse-ticket`, {}
        ).subscribe({
            next: ({ ticket }) => {
                const sseUrl = `${this.BASE_URL}/stream?ticket=${encodeURIComponent(ticket)}`;
                this.eventSource = new EventSource(sseUrl);

                this.eventSource.addEventListener('notification', (event: MessageEvent) => {
                    try {
                        const notification: HrNotification = JSON.parse(event.data);
                        const current = this._notifications.getValue();
                        this._notifications.next([notification, ...current]);
                        this._unreadCount.next(this._unreadCount.getValue() + 1);
                    } catch (e) {
                        console.warn('[NotificationService] Failed to parse SSE event:', e);
                    }
                });

                this.eventSource.onerror = () => {
                    console.warn('[NotificationService] SSE connection error, closing.');
                    this.disconnect();
                };
            },
            error: (err) => {
                console.warn('[NotificationService] Failed to obtain SSE ticket:', err);
            }
        });
    }

    disconnect(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }

    /** GET /notifications — load all then filter unread into the BehaviorSubject */
    loadUnread(): void {
        const params = new HttpParams().set('size', '50');
        this.http.get<any>(this.BASE_URL, { params }).subscribe({
            next: res => {
                const items: HrNotification[] = Array.isArray(res) ? res : (res?.content ?? []);
                const unread = items.filter(n => !n.read);
                this._notifications.next(unread);
                this._unreadCount.next(unread.length);
            },
            error: () => {}
        });
    }

    /** GET /notifications */
    getAll(): Observable<HrNotification[]> {
        return this.http.get<any>(this.BASE_URL, { params: new HttpParams().set('size', '100') }).pipe(
            map(res => Array.isArray(res) ? res : (res?.content ?? []))
        );
    }

    /** GET /notifications/unread-count */
    getUnreadCount(): Observable<number> {
        return this.http.get<any>(`${this.BASE_URL}/unread-count`).pipe(
            map(res => res?.data ?? res ?? 0)
        );
    }

    /** PATCH /notifications/{id}/read */
    markAsRead(id: number): Observable<void> {
        return this.http.patch<void>(`${this.BASE_URL}/${id}/read`, {});
    }

    /** PATCH /notifications/read-all */
    markAllRead(): Observable<void> {
        return new Observable(observer => {
            this.http.patch<void>(`${this.BASE_URL}/read-all`, {}).subscribe({
                next: () => {
                    const marked = this._notifications.getValue().map(n => ({ ...n, read: true }));
                    this._notifications.next(marked);
                    this._unreadCount.next(0);
                    observer.next();
                    observer.complete();
                },
                error: err => observer.error(err)
            });
        });
    }

    /** DELETE /notifications/clear-read */
    clearRead(): Observable<void> {
        return new Observable(observer => {
            this.http.delete<void>(`${this.BASE_URL}/clear-read`).subscribe({
                next: () => {
                    const remaining = this._notifications.getValue().filter(n => !n.read);
                    this._notifications.next(remaining);
                    observer.next();
                    observer.complete();
                },
                error: err => observer.error(err)
            });
        });
    }

    /** DELETE /notifications/{id} */
    deleteNotification(id: number): Observable<void> {
        return new Observable(observer => {
            this.http.delete<void>(`${this.BASE_URL}/${id}`).subscribe({
                next: () => {
                    const remaining = this._notifications.getValue().filter(n => n.id !== id);
                    this._notifications.next(remaining);
                    const unread = remaining.filter(n => !n.read).length;
                    this._unreadCount.next(unread);
                    observer.next();
                    observer.complete();
                },
                error: err => observer.error(err)
            });
        });
    }

    ngOnDestroy(): void {
        this.disconnect();
    }
}
