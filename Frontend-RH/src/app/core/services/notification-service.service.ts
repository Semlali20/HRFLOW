import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthenticationService } from './auth.service';

export interface HrNotification {
    id: number;
    recipientEmail: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {

    private readonly BASE_URL = 'http://localhost:8090/api/v1/notifications';
    private eventSource: EventSource | null = null;

    private _notifications = new BehaviorSubject<HrNotification[]>([]);
    readonly notifications$ = this._notifications.asObservable();

    private _unreadCount = new BehaviorSubject<number>(0);
    readonly unreadCount$ = this._unreadCount.asObservable();

    constructor(private http: HttpClient, private authService: AuthenticationService) {}

    connect(): void {
        if (this.eventSource) return;

        const token = this.authService.getToken();
        if (!token) return;

        this.loadUnread();

        this.eventSource = new EventSource(
            `${this.BASE_URL}/stream?access_token=${token}`
        );

        this.eventSource.addEventListener('notification', (event: MessageEvent) => {
            const notification: HrNotification = JSON.parse(event.data);
            const current = this._notifications.getValue();
            this._notifications.next([notification, ...current]);
            this._unreadCount.next(this._unreadCount.getValue() + 1);
        });

        this.eventSource.onerror = () => {
            this.disconnect();
        };
    }

    disconnect(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }

    loadUnread(): void {
        this.http.get<HrNotification[]>(`${this.BASE_URL}/unread`).subscribe({
            next: notifications => {
                this._notifications.next(notifications);
                this._unreadCount.next(notifications.length);
            },
            error: () => {}
        });
    }

    markAllRead(): Observable<void> {
        return new Observable(observer => {
            this.http.put<void>(`${this.BASE_URL}/read-all`, {}).subscribe({
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

    ngOnDestroy(): void {
        this.disconnect();
    }
}
