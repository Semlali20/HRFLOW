import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { EventService } from '../core/services/event.service';
import { AuthenticationService } from '../core/services/auth.service';

import {
  LAYOUT_VERTICAL, LAYOUT_HORIZONTAL, LAYOUT_WIDTH, TOPBAR, LAYOUT_MODE, SIDEBAR_TYPE
} from './layouts.model';

/** How often to silently refresh the user's permissions from the backend (ms). */
const PERMISSION_REFRESH_INTERVAL_MS = 60_000;

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy, AfterViewInit {

  // layout related config
  layoutType: string;
  layoutwidth: string;
  topbar: string;
  mode: string;
  sidebartype: string;

  private permRefreshTimer: any;

  constructor(private eventService: EventService, private authService: AuthenticationService) { }

  ngOnInit() {
    // default settings
    this.layoutType = LAYOUT_VERTICAL;
    this.layoutwidth = LAYOUT_WIDTH;
    this.topbar = TOPBAR;
    this.mode = LAYOUT_MODE;
    this.sidebartype = SIDEBAR_TYPE;

    // document.body.setAttribute('data-bs-theme', this.mode);

    // listen to event and change the layout, theme, etc
    this.eventService.subscribe('changeLayout', (layout) => {
      this.layoutType = layout;
    });

    this.LayoutWidth(this.layoutwidth);

    this.eventService.subscribe('changeWidth', (width) => {
      this.layoutwidth = width;
      this.LayoutWidth(this.layoutwidth);
    });

    // listen to event and change the layout, theme, etc
    this.eventService.subscribe('changeSidebartype', (layout) => {
      this.sidebartype = layout;
      this.changeSidebar(this.sidebartype);
    });

    // Change Mode
    this.eventService.subscribe('changeMode', (mode) => {
      this.mode = mode;
      this.changeMode(this.mode);
    });

    this.changeSidebar(this.sidebartype);
    this.changeMode(this.mode);

    // Silently refresh permissions every minute so admin-side changes
    // are reflected without forcing a re-login.
    this.permRefreshTimer = setInterval(() => {
      if (this.authService.isLoggedIn()) {
        this.authService.refreshCurrentUser().subscribe({ error: () => {} });
      }
    }, PERMISSION_REFRESH_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.permRefreshTimer);
  }

  // Theme Dark Light Mode
  changeMode(value) {
    switch (value) {
      case "light":
        document.body.setAttribute('data-bs-theme', 'light');
        break;
      case "dark":
        document.body.setAttribute('data-bs-theme', 'dark');
        break;
      default:
        document.body.setAttribute('data-bs-theme', 'light');
        break;
    }
  }

  changeSidebar(value) {
    switch (value) {
      case "light":
        document.body.setAttribute('data-sidebar', 'light');
        document.body.setAttribute('data-topbar', 'dark');
        document.body.removeAttribute('data-sidebar-size');
        document.body.removeAttribute('data-layout-size');
        document.body.removeAttribute('data-keep-enlarged');
        document.body.classList.remove('vertical-collpsed');
        document.body.removeAttribute('data-layout-scrollable');
        break;
      case "compact":
        document.body.setAttribute('data-sidebar-size', 'small');
        document.body.setAttribute('data-sidebar', 'dark');
        document.body.removeAttribute('data-topbar');
        document.body.removeAttribute('data-layout-size');
        document.body.removeAttribute('data-keep-enlarged');
        document.body.classList.remove('sidebar-enable');
        document.body.classList.remove('vertical-collpsed');
        document.body.removeAttribute('data-layout-scrollable');
        break;
      case "dark":
        document.body.setAttribute('data-sidebar', 'dark');
        document.body.removeAttribute('data-topbar');
        document.body.removeAttribute('data-layout-size');
        document.body.removeAttribute('data-keep-enlarged');
        document.body.removeAttribute('data-sidebar-size');
        document.body.classList.remove('sidebar-enable');
        document.body.classList.remove('vertical-collpsed');
        document.body.removeAttribute('data-layout-scrollable');
        break;
      case "icon":
        document.body.classList.add('vertical-collpsed');
        document.body.setAttribute('data-sidebar', 'dark');
        document.body.removeAttribute('data-layout-size');
        document.body.setAttribute('data-keep-enlarged',"true");
        document.body.removeAttribute('data-topbar');
        document.body.removeAttribute('data-layout-scrollable');
        break;
      case "colored":
        document.body.classList.remove('sidebar-enable');
        document.body.classList.remove('vertical-collpsed');
        document.body.setAttribute('data-sidebar', 'colored');
        document.body.removeAttribute('data-layout-size');
        document.body.removeAttribute('data-keep-enlarged');
        document.body.removeAttribute('data-topbar');
        document.body.removeAttribute('data-layout-scrollable');
        document.body.removeAttribute('data-sidebar-size');
        break;
      default:
        document.body.setAttribute('data-sidebar', 'dark');
        break;
    }
  }

  ngAfterViewInit() {
  }

  LayoutWidth(width: string) {
    switch (width) {
      case "fluid":
        document.body.setAttribute("data-layout-size", "fluid");
        document.body.classList.remove("vertical-collpsed");
        document.body.removeAttribute("data-layout-scrollable");
        break;
      case "boxed":
        document.body.setAttribute("data-layout-size", "boxed");
        document.body.classList.add("vertical-collpsed");
        document.body.removeAttribute("data-layout-scrollable");
        break;
      case "scrollable":
        document.body.removeAttribute("data-layout-size");
        document.body.setAttribute("data-layout-scrollable", "true");
        document.body.setAttribute("data-layout-size", "fluid");
        document.body.classList.remove("right-bar-enabled", "vertical-collpsed");
      default:
        document.body.setAttribute("data-layout-size", "fluid");
        break;
    }
  }

  /**
   * Check if the vertical layout is requested
   */
  isVerticalLayoutRequested() {
    return this.layoutType === LAYOUT_VERTICAL;
  }

  /**
   * Check if the horizontal layout is requested
   */
  isHorizontalLayoutRequested() {
    return this.layoutType === LAYOUT_HORIZONTAL;
  }
}
