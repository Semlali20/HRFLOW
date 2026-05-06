import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppTheme = 'light' | 'dark' | 'teal';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'hr-theme';
  private _theme = new BehaviorSubject<AppTheme>('light');
  readonly theme$ = this._theme.asObservable();

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY) as AppTheme;
    this.apply(saved || 'light');
  }

  get current(): AppTheme {
    return this._theme.value;
  }

  apply(theme: AppTheme): void {
    this._theme.next(theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
  }

  toggle(): void {
    const next: Record<AppTheme, AppTheme> = { light: 'dark', dark: 'teal', teal: 'light' };
    this.apply(next[this.current]);
  }

  isDark():  boolean { return this.current === 'dark'; }
  isTeal():  boolean { return this.current === 'teal'; }
  isLight(): boolean { return this.current === 'light'; }
}
