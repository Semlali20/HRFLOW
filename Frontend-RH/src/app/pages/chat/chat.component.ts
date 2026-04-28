import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../../core/services/auth.service';
import { NotificationService, HrNotification } from '../../core/services/notification-service.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {

    notifications: HrNotification[] = [];
    userRole = '';
    showAllNotifications = false;

    private sub: Subscription;

    constructor(
        private authService: AuthenticationService,
        private notificationService: NotificationService
    ) {}

    ngOnInit(): void {
        this.userRole = this.authService.getUserRole() ?? '';
        this.sub = this.notificationService.notifications$.subscribe(n => {
            this.notifications = n;
        });
        this.notificationService.loadUnread();
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }

    toggleNotifications(): void {
        this.showAllNotifications = !this.showAllNotifications;
    }
}
