import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, ElementRef, ViewChild, Input, OnChanges, HostListener } from '@angular/core';
import MetisMenu from 'metismenujs';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { MENU } from './menu';
import { MenuItem } from './menu.model';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { PermissionService } from 'src/app/core/services/permission.service';

interface SbSearchItem {
  label: string;
  icon: string;
  route: string;
  permission?: string;
  queryParams?: { [key: string]: string };
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @ViewChild('componentRef') scrollRef;
  @Input() isCondensed = false;
  @Input() userRole: string;
  menu: any;
  menuItems: MenuItem[] = [];
  employeeManagerOpen = true;
  orgOpen = true;
  analyticsOpen = true;
  adminOpen = true;
  showProfileMenu  = false;
  showSearchModal  = false;
  searchQuery      = '';
  activeChip: string | null    = null;
  recentSearches: SbSearchItem[] = [];
  highlightedIndex               = -1;

  private readonly RECENT_KEY  = 'wiko_recent_searches';
  private readonly MAX_RECENT  = 5;

  /** All navigable pages — filtered at runtime by permission + query. */
  private readonly SB_ALL_ITEMS: SbSearchItem[] = [
    { label: 'Dashboard',            icon: 'bxs-dashboard',      route: '/dashboard' },
    { label: 'Notifications',        icon: 'bxs-bell',           route: '/chat' },
    { label: 'Day-Off Request',      icon: 'bxs-calendar-check', route: '/dayoff' },
    { label: 'Planning',             icon: 'bxs-calendar-alt',   route: '/planning',        permission: 'PLANNING_READ' },
    { label: 'Employees',            icon: 'bxs-group',          route: '/collaborateur',   permission: 'EMPLOYEE_READ' },
    { label: 'Interns',              icon: 'bxs-graduation',     route: '/stagiaires',      permission: 'INTERN_READ' },
    { label: 'Projects',             icon: 'bxs-briefcase',      route: '/projects-hr',     permission: 'PLANNING_READ' },
    { label: 'Attendance',           icon: 'bxs-time',           route: '/attendance',      permission: 'EMPLOYEE_READ' },
    { label: 'Leave Requests',       icon: 'bxs-door-open',      route: '/leave',           permission: 'LEAVE_READ_ALL' },
    { label: 'Leave Balances',       icon: 'bxs-calendar-heart', route: '/leave/balance',   permission: 'LEAVE_READ_ALL' },
    { label: 'Recruitment',          icon: 'bxs-user-plus',      route: '/recruitment',     permission: 'CV_READ' },
    { label: 'Salary',               icon: 'bxs-wallet',         route: '/salary',          permission: 'SALARY_READ' },
    { label: 'Documents',            icon: 'bxs-folder-open',    route: '/documents',       permission: 'DOCUMENT_READ' },
    { label: 'Meetings',             icon: 'bxs-conversation',   route: '/meetings',        permission: 'MEETING_READ' },
    { label: 'Performance Reviews',  icon: 'bxs-star-half',      route: '/performance',     permission: 'PERFORMANCE_READ' },
    { label: 'Departments',          icon: 'bxs-building-house', route: '/org',             permission: 'DEPARTMENT_READ' },
    { label: 'Public Holidays',      icon: 'bxs-party',          route: '/public-holidays', permission: 'LEAVE_MANAGE_TYPES' },
    { label: 'Statistics',           icon: 'bxs-chart',          route: '/statistics',      permission: 'REPORT_READ' },
    { label: 'Audit Log',            icon: 'bx-history',         route: '/audit',           permission: 'AUDIT_READ' },
    { label: 'User Management',      icon: 'bxs-user-badge',     route: '/admin/users',     permission: 'USER_MANAGE' },
    { label: 'Roles & Permissions',  icon: 'bxs-shield',         route: '/admin/roles',     permission: 'ROLE_MANAGE' },
    { label: 'Settings',             icon: 'bxs-cog',            route: '/settings' },
    { label: 'File Manager',         icon: 'bxs-folder',         route: '/filemanager',     permission: 'DOCUMENT_READ' },
  ];

  /** Default quick-action shortcuts shown when the search box is empty. */
  private readonly SB_DEFAULT_ACTIONS: SbSearchItem[] = [
    { label: 'Open Settings',        icon: 'bxs-cog',            route: '/settings' },
    { label: 'Create New Employee',  icon: 'bx-plus-circle',     route: '/collaborateur',  permission: 'EMPLOYEE_READ',  queryParams: { action: 'create' } },
    { label: 'Create Project',       icon: 'bx-plus-circle',     route: '/projects-hr',    permission: 'PLANNING_READ',  queryParams: { action: 'create' } },
    { label: 'Create Hiring',        icon: 'bx-plus-circle',     route: '/recruitment',    permission: 'CV_READ',        queryParams: { action: 'create' } },
  ];

  /** Items shown in the results list — live-filtered as the user types. */
  get visibleSearchItems(): SbSearchItem[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      return this.SB_DEFAULT_ACTIONS.filter(i => !i.permission || this.canSee(i.permission));
    }
    return this.SB_ALL_ITEMS
      .filter(i => (!i.permission || this.canSee(i.permission)) && i.label.toLowerCase().includes(q))
      .slice(0, 8);
  }
  currentUser: { name: string; email: string; role: string; initials: string } = { name: '—', email: '—', role: '—', initials: '?' };
  @ViewChild('sideMenu') sideMenu: ElementRef;

  private permSub: Subscription;

  constructor(
    private router: Router,
    public translate: TranslateService,
    private http: HttpClient,
    private authService: AuthenticationService,
    private permissionService: PermissionService,
    private cdr: ChangeDetectorRef,
  ) {
    this.router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this._activateMenuDropdown();
        this._scrollElement();
      }
    });
  }

  ngOnInit() {
    this.userRole = this.authService.getUserRole();
    if (Array.isArray(this.userRole)) {
      this.userRole = this.userRole[0];
    }
    this.menuItems = this.filterMenuByPermissions(MENU);
    this._scrollElement();

    // When admin updates this user's role permissions, re-evaluate the sidebar immediately.
    this.permSub = this.authService.permissionsRefreshed$.subscribe(() => {
      this.cdr.detectChanges();
    });

    const u = this.authService.getAuthenticatedUser();
    if (u) {
      const first = u.firstname ?? '';
      const last  = u.lastname  ?? '';
      const name  = `${first} ${last}`.trim() || u.email || '—';
      this.currentUser = {
        name,
        email:    u.email ?? '—',
        role:     u.userRole ?? u.title ?? '—',
        initials: ((first[0] ?? '') + (last[0] ?? '')).toUpperCase() || '?'
      };
    }
  }

  ngOnDestroy(): void {
    this.permSub?.unsubscribe();
  }

  ngAfterViewInit() {
    if (this.sideMenu && this.sideMenu.nativeElement) {
      this.menu = new MetisMenu(this.sideMenu.nativeElement);
      this._activateMenuDropdown();
    }
  }

  ngOnChanges() {
    if (this.sideMenu && this.sideMenu.nativeElement) {
      if (!this.isCondensed) {
        setTimeout(() => {
          this.menu = new MetisMenu(this.sideMenu.nativeElement);
        });
      } else if (this.menu) {
        this.menu.dispose();
      }
    }
  }

  _scrollElement() {
    setTimeout(() => {
      const activeElements = document.getElementsByClassName("mm-active");
      if (activeElements.length > 0) {
        const currentPosition = activeElements[0]['offsetTop'];
        if (currentPosition > 500 && this.scrollRef && this.scrollRef.SimpleBar !== null) {
          this.scrollRef.SimpleBar.getScrollElement().scrollTop = currentPosition + 300;
        }
      }
    }, 300);
  }

  _removeAllClass(className) {
    const elements = document.getElementsByClassName(className);
    while (elements[0]) {
      elements[0].classList.remove(className);
    }
  }

  _activateMenuDropdown() {
    this._removeAllClass('mm-active');
    this._removeAllClass('mm-show');
    const links = document.getElementsByClassName('side-nav-link-ref');
    const paths = Array.from(links).map(link => link['pathname']);
    let menuItemEl = null;
    const itemIndex = paths.indexOf(window.location.pathname);
    if (itemIndex === -1) {
      const strIndex = window.location.pathname.lastIndexOf('/');
      const item = window.location.pathname.substr(0, strIndex).toString();
      menuItemEl = links[paths.indexOf(item)];
    } else {
      menuItemEl = links[itemIndex];
    }
    if (menuItemEl) {
      menuItemEl.classList.add('active');
      let parentEl = menuItemEl.parentElement;
      while (parentEl && parentEl.id !== 'side-menu') {
        parentEl.classList.add('mm-active');
        parentEl = parentEl.parentElement.closest('ul');
        if (parentEl) parentEl.classList.add('mm-show');
      }
    }
  }

  /** Returns only the menu items the current user is allowed to see,
   *  based on their assigned permissions. Section titles are included
   *  only when at least one item below them is visible. */
  filterMenuByPermissions(items: MenuItem[]): MenuItem[] {
    const isAdmin = this.authService.getUserRole() === 'ADMIN';
    const result: MenuItem[] = [];
    let pendingTitle: MenuItem | null = null;

    for (const item of items) {
      if (item.isTitle) {
        pendingTitle = item;
        continue;
      }

      if (this.isItemVisible(item, isAdmin)) {
        if (pendingTitle) { result.push(pendingTitle); pendingTitle = null; }

        // For items with sub-menus, filter sub-items too
        if (item.subItems?.length) {
          const visibleSubs = item.subItems.filter(s => this.isItemVisible(s, isAdmin));
          if (visibleSubs.length > 0) {
            result.push({ ...item, subItems: visibleSubs });
          }
        } else {
          result.push(item);
        }
      }
    }
    return result;
  }

  private isItemVisible(item: MenuItem, isAdmin: boolean): boolean {
    if (isAdmin) return true;                          // ADMIN sees everything
    if (!item.permission) return true;                 // no permission required → always show
    return this.permissionService.has(item.permission); // check user's permissions array
  }

  /** @deprecated use filterMenuByPermissions */
  filterMenuItemsByRole(menuItems: MenuItem[], role: string): MenuItem[] {
    return this.filterMenuByPermissions(menuItems);
  }

  /** Returns true if the current user can see an item with the given permission.
   *  Passing null/undefined means the item is always visible. */
  canSee(permission: string | null | undefined): boolean {
    if (!permission) return true;
    if (this.authService.getUserRole() === 'ADMIN') return true;
    return this.permissionService.has(permission);
  }

  get showEmployeeSection(): boolean {
    return this.canSee('EMPLOYEE_READ')    || this.canSee('INTERN_READ')       ||
           this.canSee('PLANNING_READ')    || this.canSee('LEAVE_READ_ALL')    ||
           this.canSee('CV_READ')          || this.canSee('SALARY_READ')       ||
           this.canSee('DOCUMENT_READ')    || this.canSee('MEETING_READ')      ||
           this.canSee('PERFORMANCE_READ') || this.canSee('DEPARTMENT_READ');
  }

  get showOrgSection(): boolean {
    return this.canSee('DEPARTMENT_READ') || this.canSee('LEAVE_MANAGE_TYPES');
  }

  get showAnalyticsSection(): boolean {
    return this.canSee('REPORT_READ') || this.canSee('AUDIT_READ');
  }

  get showAdminSection(): boolean {
    return this.canSee('USER_MANAGE') || this.canSee('ROLE_MANAGE');
  }

  isCollapsed = false;

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    document.body.classList.toggle('vertical-collpsed', this.isCollapsed);
    if (this.isCollapsed) this.showProfileMenu = false;
  }

  toggleEmployeeManager() {
    this.employeeManagerOpen = !this.employeeManagerOpen;
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  openSearch(): void {
    this.showSearchModal  = true;
    this.showProfileMenu  = false;
    this.searchQuery      = '';
    this.activeChip       = null;
    this.highlightedIndex = -1;
    this.loadRecentSearches();
    setTimeout(() => {
      const el = document.querySelector('.wsm-input') as HTMLInputElement;
      if (el) el.focus();
    }, 40);
  }

  closeSearch(): void {
    this.showSearchModal = false;
    this.searchQuery     = '';
    this.activeChip      = null;
    this.highlightedIndex = -1;
  }

  // ── Recent searches ────────────────────────────────────────────────────────

  loadRecentSearches(): void {
    try { this.recentSearches = JSON.parse(localStorage.getItem(this.RECENT_KEY) || '[]'); }
    catch { this.recentSearches = []; }
  }

  private saveRecentSearch(item: SbSearchItem): void {
    this.recentSearches = [item, ...this.recentSearches.filter(s => s.route !== item.route)].slice(0, this.MAX_RECENT);
    localStorage.setItem(this.RECENT_KEY, JSON.stringify(this.recentSearches));
  }

  removeRecentSearch(item: SbSearchItem, e: Event): void {
    e.stopPropagation();
    this.recentSearches = this.recentSearches.filter(s => s.route !== item.route);
    localStorage.setItem(this.RECENT_KEY, JSON.stringify(this.recentSearches));
  }

  clearRecentSearches(): void {
    this.recentSearches = [];
    localStorage.removeItem(this.RECENT_KEY);
  }

  // ── Chip + navigation ──────────────────────────────────────────────────────

  selectChip(chipId: string, route: string): void {
    this.closeSearch();
    this.router.navigate([route]);
  }

  navigateToItem(item: SbSearchItem): void {
    this.saveRecentSearch(item);
    this.closeSearch();
    this.router.navigate([item.route], item.queryParams ? { queryParams: item.queryParams } : {});
  }

  navigateFromRecent(item: SbSearchItem): void {
    this.closeSearch();
    this.router.navigate([item.route]);
  }

  // ── Keyboard handling ──────────────────────────────────────────────────────

  onSearchKeydown(e: KeyboardEvent): void {
    const items = this.visibleSearchItems;
    switch (e.key) {
      case 'Escape':
        this.closeSearch(); break;
      case 'ArrowDown':
        e.preventDefault();
        this.highlightedIndex = Math.min(this.highlightedIndex + 1, items.length - 1); break;
      case 'ArrowUp':
        e.preventDefault();
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, 0); break;
      case 'Enter':
        const target = items[this.highlightedIndex] ?? items[0];
        if (target) this.navigateToItem(target); break;
      default:
        this.highlightedIndex = -1;
    }
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKey(e: KeyboardEvent): void {
    // ⌘1 or Ctrl+K opens search
    if ((e.metaKey || e.ctrlKey) && (e.key === '1' || e.key === 'k')) {
      e.preventDefault();
      if (this.showSearchModal) this.closeSearch();
      else this.openSearch();
    }
  }

  doLogout() {
    this.showProfileMenu = false;
    this.authService.logout();
  }

  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }
}
