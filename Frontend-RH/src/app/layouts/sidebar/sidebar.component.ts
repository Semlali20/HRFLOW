import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input, OnChanges } from '@angular/core';
import MetisMenu from 'metismenujs';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MENU } from './menu';
import { MenuItem } from './menu.model';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('componentRef') scrollRef;
  @Input() isCondensed = false;
  @Input() userRole: string;
  menu: any;
  menuItems: MenuItem[] = [];
  employeeManagerOpen = true;
  showProfileMenu = false;
  showSearchModal = false;
  searchQuery = '';
  @ViewChild('sideMenu') sideMenu: ElementRef;

  constructor(private router: Router, public translate: TranslateService, private http: HttpClient, private authService: AuthenticationService) {
    this.router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this._activateMenuDropdown();
        this._scrollElement();
      }
    });
  }

  ngOnInit() {
    console.log('Initialisation du composant Sidebar');
    this.userRole = this.authService.getUserRole(); // Récupérez le rôle de l'utilisateur directement ici
    if (Array.isArray(this.userRole)) {
      this.userRole = this.userRole[0]; // Assurez-vous que c'est une chaîne
    }
    console.log('Rôle utilisateur récupéré dans la barre latérale:', this.userRole); // Vérifiez le rôle
    this.menuItems = this.filterMenuItemsByRole(MENU, this.userRole); // Initialisez les éléments du menu après avoir récupéré le rôle
    console.log('Éléments du menu pour ce rôle:', this.menuItems);
    this._scrollElement();
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

  filterMenuItemsByRole(menuItems: MenuItem[], role: string): MenuItem[] {
    switch (role) {
      case 'STAGIAIRE_RH':
        return menuItems.filter(item => ['MAIN', 'Dashboard', 'Notifications', 'GENERAL', 'File Manager'].includes(item.label));
      case 'COLLABORATEUR_RH':
        return menuItems.filter(item => ['MAIN', 'Dashboard', 'Notifications', 'Day-off Request', 'Planning', 'EMPLOYEE MANAGER', 'Employees', 'Attendances'].includes(item.label));
      case 'ADMIN':
      default:
        return menuItems;
    }
  }

  toggleEmployeeManager() {
    this.employeeManagerOpen = !this.employeeManagerOpen;
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  openSearch() {
    this.showSearchModal = true;
    this.showProfileMenu = false;
  }

  doLogout() {
    this.showProfileMenu = false;
    this.authService.logout();
  }

  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }
}
