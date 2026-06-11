import { Component, OnInit, OnDestroy, Output, EventEmitter, Inject, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { interval, Subject, Subscription } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { AuthenticationService } from '../../core/services/auth.service';
import { NotificationService, HrNotification } from '../../core/services/notification-service.service';
import { CookieService } from 'ngx-cookie-service';
import { LanguageService } from '../../core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService, AppTheme } from '../../core/services/theme.service';

@Component({
    selector: 'app-topbar',
    templateUrl: './topbar.component.html',
    styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit, OnDestroy {

    element: any;
    cookieValue: any;
    flagvalue: any;
    countryName: any;
    valueset: any;
    notifications: HrNotification[] = [];
    unreadCount = 0;
    currentUser: any;
    username = '';
    userInitials = '';
    openMobileMenu = false;
    userRole = '';

    // Panel open states
    langOpen    = false;
    themeOpen   = false;
    notifOpen   = false;
    profileOpen = false;
    searchOpen  = false;
    searchQuery = '';

    private notifSub: Subscription;
    private countSub: Subscription;
    private destroy$ = new Subject<void>();

    listLang = [
        { text: 'English', flag: 'assets/images/flags/us.jpg', lang: 'en' },
        { text: 'Français', flag: 'assets/images/flags/french.jpg', lang: 'fr' },
    ];

    @Output() settingsButtonClicked = new EventEmitter();
    @Output() mobileMenuButtonClicked = new EventEmitter();

    constructor(
        @Inject(DOCUMENT) private document: any,
        private router: Router,
        private authService: AuthenticationService,
        private notificationService: NotificationService,
        public languageService: LanguageService,
        public translate: TranslateService,
        public _cookiesService: CookieService,
        public themeService: ThemeService
    ) {}

    get currentTheme(): AppTheme { return this.themeService.current; }
    setTheme(t: AppTheme): void  { this.themeService.apply(t); }

    get themeLabel(): string {
        const m: Record<AppTheme, string> = {
            light: this.translate.instant('TOPBAR.THEME_LIGHT'),
            dark:  this.translate.instant('TOPBAR.THEME_DARK'),
            teal:  this.translate.instant('TOPBAR.THEME_TEAL'),
        };
        return m[this.currentTheme] || this.currentTheme;
    }

    ngOnInit(): void {
        this.element = document.documentElement;

        this.cookieValue = this._cookiesService.get('lang') || 'en';
        const val = this.listLang.find(x => x.lang === this.cookieValue);
        if (val) {
            this.flagvalue  = val.flag;
            this.countryName = val.text;
        } else {
            this.flagvalue = 'assets/images/flags/us.jpg';
        }

        this.currentUser = this.authService.getAuthenticatedUser();
        if (this.currentUser) {
            const last  = this.currentUser.lastname  || '';
            const first = this.currentUser.firstname || '';
            this.username     = `${last} ${first}`.trim();
            this.userInitials = ((last[0] || '') + (first[0] || '')).toUpperCase() || '?';
        }
        this.userRole = this.authService.getUserRole() ?? '';

        this.notifSub = this.notificationService.notifications$.subscribe(n => { this.notifications = n; });
        this.countSub = this.notificationService.unreadCount$.subscribe(c => { this.unreadCount = c; });
        this.notificationService.connect();

        // Poll unread count every 60 seconds as a fallback
        interval(60000).pipe(
            takeUntil(this.destroy$),
            switchMap(() => this.notificationService.getUnreadCount())
        ).subscribe(count => { this.unreadCount = count; });
    }

    ngOnDestroy(): void {
        this.notifSub?.unsubscribe();
        this.countSub?.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }

    // Close all panels when clicking outside the bar
    @HostListener('document:click')
    closeAll(): void {
        this.langOpen = this.themeOpen = this.notifOpen = this.profileOpen = false;
    }

    onBarClick(e: MouseEvent): void {
        e.stopPropagation();
    }

    togglePanel(panel: 'lang' | 'theme' | 'notif' | 'profile', e: MouseEvent): void {
        e.stopPropagation();
        const wasOpen = this[`${panel}Open`];
        this.langOpen = this.themeOpen = this.notifOpen = this.profileOpen = false;
        if (!wasOpen) this[`${panel}Open`] = true;
    }

    onSearchBlur(): void {
        setTimeout(() => { if (!this.searchQuery) this.searchOpen = false; }, 150);
    }

    setLanguage(text: string, lang: string, flag: string): void {
        this.countryName = text;
        this.flagvalue   = flag;
        this.cookieValue = lang;
        this.languageService.setLanguage(lang);
    }

    refreshing = false;

    markAllRead(): void {
        this.notificationService.markAllRead().subscribe();
    }

    clearRead(): void {
        this.notificationService.clearRead().subscribe();
    }

    deleteNotification(id: number): void {
        this.notificationService.deleteNotification(id).subscribe();
    }

    refreshNotifications(): void {
        if (this.refreshing) return;
        this.refreshing = true;
        this.notificationService.loadUnread();
        setTimeout(() => { this.refreshing = false; }, 800);
    }

    notifTypeClass(type: string): string {
        const m: Record<string, string> = {
            LEAVE: 'dot-amber', DOCUMENT: 'dot-teal', ATTENDANCE: 'dot-blue',
            RECRUITMENT: 'dot-purple', SALARY: 'dot-green', ALERT: 'dot-red',
        };
        return m[type] ?? 'dot-gray';
    }

    focusSearch(): void { /* triggers sidebar quick search */ }

    toggleRightSidebar(): void { this.settingsButtonClicked.emit(); }
    toggleMobileMenu(event: any): void { event.preventDefault(); this.mobileMenuButtonClicked.emit(); }

    logout(): void {
        this.notificationService.disconnect();
        this.authService.logout();
    }
}
