import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, HrNotification } from '../../core/services/notification-service.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WallClockComponent } from 'src/app/shared/wall-clock/wall-clock.component';

const TYPE_ICON: Record<string, { icon: string; bg: string; color: string }> = {
  LEAVE_REQUEST:    { icon: 'bxs-calendar-check', bg: '#DCFCE7',  color: '#15803D'  },
  LEAVE_APPROVED:   { icon: 'bxs-check-circle',   bg: '#DCFCE7',  color: '#15803D'  },
  LEAVE_REJECTED:   { icon: 'bxs-x-circle',       bg: '#FFE4E6',  color: '#BE123C'  },
  MEETING:          { icon: 'bxs-conversation',   bg: '#DBEAFE',  color: '#2563EB'  },
  DOCUMENT:         { icon: 'bxs-file-doc',        bg: '#EDE9FE',  color: '#7C3AED'  },
  INTERN:           { icon: 'bxs-graduation',      bg: '#FEF3C7',  color: '#D97706'  },
  SYSTEM:           { icon: 'bxs-cog',             bg: '#F1F5F9',  color: '#64748B'  },
  DEFAULT:          { icon: 'bxs-bell',            bg: '#E8F7F6',  color: '#2FA8A0'  },
};

function iconFor(type: string) {
  return TYPE_ICON[type] ?? TYPE_ICON['DEFAULT'];
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, TranslateModule, WallClockComponent],
  styles: [`
    :host{display:block}
    .page{padding:0 24px 60px;font-family:'Inter',sans-serif;animation:fadeIn .35s ease both}
    @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

    .page-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);margin-bottom:18px}
    .page-title{font-size:22px;font-weight:700;color:#1A2B3C;margin:0}
    .header-right{display:flex;align-items:center;gap:10px}
    .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border:none;border-radius:9px;font-size:12.5px;font-weight:600;cursor:pointer;transition:background .15s}
    .btn-secondary{background:#F1F5F9;color:#4A6080}.btn-secondary:hover{background:#E2E8F0}
    .unread-badge{background:#EF4444;color:#fff;border-radius:999px;padding:2px 8px;font-size:11px;font-weight:700}

    .card{background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(22,34,51,.08);overflow:hidden}

    .notif-item{display:flex;align-items:flex-start;gap:14px;padding:14px 18px;border-bottom:1px solid #F5F7FA;transition:background .15s;position:relative;cursor:pointer}
    .notif-item:last-child{border-bottom:none}
    .notif-item:hover{background:#F8FAFC}
    .notif-item.unread{background:#FAFFFE}
    .unread-dot{position:absolute;left:7px;top:50%;transform:translateY(-50%);width:6px;height:6px;border-radius:50%;background:#2FA8A0}
    .notif-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
    .notif-body{flex:1;min-width:0}
    .notif-title-txt{font-size:13px;font-weight:700;color:#1A2B3C;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .notif-msg{font-size:12px;color:#4A6080;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .notif-time{font-size:11px;color:#8FA3B8;white-space:nowrap;flex-shrink:0}
    .notif-del{width:28px;height:28px;border:none;background:transparent;border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;color:#CBD5E1;flex-shrink:0;opacity:0;transition:all .15s}
    .notif-item:hover .notif-del{opacity:1}
    .notif-del:hover{background:#FEE2E2;color:#BE123C}

    .state-box{padding:48px 0;text-align:center;color:#8FA3B8;font-size:14px}
    .state-box i{font-size:36px;display:block;margin-bottom:10px}
    .spinner{width:30px;height:30px;border:3px solid #E2E8F0;border-top-color:#2FA8A0;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 10px}
    @keyframes spin{to{transform:rotate(360deg)}}
  `],
  template: `
  <div class="page">
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
      <div class="page-header" style="flex:1;margin-bottom:0;">
        <h4 class="page-title">
          {{ 'CHAT.TITLE' | translate }}
          <span class="unread-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
        </h4>
        <div class="header-right">
          <button class="btn btn-secondary" (click)="markAllRead()" [disabled]="unreadCount === 0">
            <i class="bx bx-check-double"></i> {{ 'CHAT.MARK_ALL_READ' | translate }}
          </button>
          <button class="btn btn-secondary" (click)="load()">
            <i class="bx bx-refresh"></i> {{ 'CHAT.REFRESH' | translate }}
          </button>
        </div>
      </div>
      <app-wall-clock></app-wall-clock>
    </div>

    <div class="card">
      <div class="state-box" *ngIf="loading"><div class="spinner"></div>{{ 'CHAT.LOADING' | translate }}</div>
      <div class="state-box" style="color:#EF4444" *ngIf="!loading && error">
        <i class="bx bx-error-circle"></i>{{ error }}
      </div>
      <div class="state-box" *ngIf="!loading && !error && notifications.length === 0">
        <i class="bx bx-bell-off"></i>{{ 'CHAT.NO_NOTIFICATIONS' | translate }}
      </div>

      <div *ngIf="!loading && !error && notifications.length > 0">
        <div class="notif-item" *ngFor="let n of notifications" [class.unread]="!n.read"
             (click)="markRead(n)">
          <div class="unread-dot" *ngIf="!n.read"></div>
          <div class="notif-icon" [style.background]="iconFor(n.type).bg">
            <i class="bx" [ngClass]="iconFor(n.type).icon" [style.color]="iconFor(n.type).color"></i>
          </div>
          <div class="notif-body">
            <div class="notif-title-txt">{{ n.title }}</div>
            <div class="notif-msg">{{ n.message }}</div>
          </div>
          <div class="notif-time">{{ n.createdAt | date:'dd/MM HH:mm' }}</div>
          <button class="notif-del" (click)="$event.stopPropagation(); deleteNotif(n)" [title]="'CHAT.DELETE' | translate">
            <i class="bx bx-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
  `
})
export class ChatComponent implements OnInit, OnDestroy {

  notifications: HrNotification[] = [];
  loading = false;
  error: string | null = null;
  private sub: Subscription;

  get unreadCount(): number { return this.notifications.filter(n => !n.read).length; }

  constructor(private notificationService: NotificationService, private translate: TranslateService) {}

  ngOnInit(): void {
    this.sub = this.notificationService.notifications$.subscribe(notifs => {
      if (notifs.length > 0 && !this.loading) this.notifications = notifs;
    });
    this.load();
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  load(): void {
    this.loading = true;
    this.error = null;
    this.notificationService.getAll().subscribe({
      next: data => { this.notifications = data; this.loading = false; },
      error: e => { this.error = e?.error?.message || this.translate.instant('CHAT.ERROR_LOADING'); this.loading = false; }
    });
  }

  markRead(n: HrNotification): void {
    if (n.read) return;
    this.notificationService.markAsRead(n.id).subscribe({
      next: () => { this.notifications = this.notifications.map(x => x.id === n.id ? { ...x, read: true } : x); },
      error: () => {}
    });
  }

  markAllRead(): void {
    this.notificationService.markAllRead().subscribe({
      next: () => { this.notifications = this.notifications.map(n => ({ ...n, read: true })); },
      error: () => {}
    });
  }

  deleteNotif(n: HrNotification): void {
    this.notificationService.deleteNotification(n.id).subscribe({
      next: () => { this.notifications = this.notifications.filter(x => x.id !== n.id); },
      error: () => {}
    });
  }

  iconFor(type: string) { return iconFor(type); }
}
