import { Component, OnInit, OnDestroy, Output, EventEmitter, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';
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
    username: any;
    openMobileMenu = false;
    userRole: string;

    private notifSub: Subscription;
    private countSub: Subscription;

    listLang = [
        { text: 'English',  flag: 'assets/images/flags/us.jpg',      lang: 'en' },
        { text: 'Spanish',  flag: 'assets/images/flags/spain.jpg',    lang: 'es' },
        { text: 'German',   flag: 'assets/images/flags/germany.jpg',  lang: 'de' },
        { text: 'Italian',  flag: 'assets/images/flags/italy.jpg',    lang: 'it' },
        { text: 'Russian',  flag: 'assets/images/flags/russia.jpg',   lang: 'ru' },
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

    ngOnInit(): void {
        this.openMobileMenu = false;
        this.element = document.documentElement;

        this.cookieValue = this._cookiesService.get('lang');
        const val = this.listLang.filter(x => x.lang === this.cookieValue);
        this.countryName = val.map(el => el.text);
        if (val.length === 0) {
            if (this.flagvalue === undefined) { this.valueset = 'assets/images/flags/us.jpg'; }
        } else {
            this.flagvalue = val.map(el => el.flag);
        }

        this.currentUser = this.authService.getAuthenticatedUser();
        if (this.currentUser) {
            this.username = `${this.currentUser.lastname} ${this.currentUser.firstname}`;
        }
        this.userRole = this.authService.getUserRole() ?? '';

        // Subscribe to SSE-based notifications
        this.notifSub = this.notificationService.notifications$.subscribe(n => {
            this.notifications = n;
        });
        this.countSub = this.notificationService.unreadCount$.subscribe(c => {
            this.unreadCount = c;
        });
        this.notificationService.connect();
    }

    ngOnDestroy(): void {
        this.notifSub?.unsubscribe();
        this.countSub?.unsubscribe();
    }

    setLanguage(text: string, lang: string, flag: string): void {
        this.countryName = text;
        this.flagvalue = flag;
        this.cookieValue = lang;
        this.languageService.setLanguage(lang);
    }

    markAllRead(): void {
        this.notificationService.markAllRead().subscribe();
    }

    toggleRightSidebar(): void {
        this.settingsButtonClicked.emit();
    }

    toggleMobileMenu(event: any): void {
        event.preventDefault();
        this.mobileMenuButtonClicked.emit();
    }

    logout(): void {
        this.notificationService.disconnect();
        this.authService.logout();
    }

    fullscreen(): void {
        document.body.classList.toggle('fullscreen-enable');
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}
