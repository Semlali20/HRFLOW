import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wall-clock',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host { display: block; }
    .wc-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 7px;
    }
    .wc-svg {
      width: 100px;
      height: 100px;
      overflow: visible;
    }
    .wc-time {
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      font-weight: 800;
      color: #1A2B3C;
      letter-spacing: 1.5px;
      line-height: 1;
    }
    .wc-date {
      font-size: 11.5px;
      color: #8FA3B8;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
    }
  `],
  template: `
    <div class="wc-wrap">
      <svg class="wc-svg" viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="wc-drop-shadow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="rgba(22,34,51,0.13)"/>
          </filter>
        </defs>

        <!-- Clock face -->
        <circle cx="55" cy="55" r="52" fill="white" stroke="#2FA8A0" stroke-width="2.5"
                filter="url(#wc-drop-shadow)"/>
        <!-- Subtle inner ring -->
        <circle cx="55" cy="55" r="46" fill="none" stroke="#E8F7F6" stroke-width="1"/>

        <!-- Minute ticks (60) -->
        <ng-container *ngFor="let t of minuteTicks; let i = index">
          <line x1="55" y1="6" x2="55" y2="11"
                [attr.transform]="'rotate(' + (i * 6) + ', 55, 55)'"
                stroke="#CBD5E1" stroke-width="1" stroke-linecap="round"/>
        </ng-container>

        <!-- Hour ticks (12) — drawn on top of minute ticks -->
        <ng-container *ngFor="let t of hourTicks; let i = index">
          <line x1="55" y1="6" x2="55" y2="16"
                [attr.transform]="'rotate(' + (i * 30) + ', 55, 55)'"
                stroke="#1A2B3C" stroke-width="2.5" stroke-linecap="round"/>
        </ng-container>

        <!-- Hour hand -->
        <line x1="55" y1="30" x2="55" y2="58"
              [attr.transform]="'rotate(' + hourDeg + ', 55, 55)'"
              stroke="#1A2B3C" stroke-width="5.5" stroke-linecap="round"/>

        <!-- Minute hand -->
        <line x1="55" y1="16" x2="55" y2="58"
              [attr.transform]="'rotate(' + minuteDeg + ', 55, 55)'"
              stroke="#1A2B3C" stroke-width="3" stroke-linecap="round"/>

        <!-- Second hand (with counterweight) -->
        <line x1="55" y1="11" x2="55" y2="66"
              [attr.transform]="'rotate(' + secondDeg + ', 55, 55)'"
              stroke="#2FA8A0" stroke-width="1.5" stroke-linecap="round"/>

        <!-- Center cap -->
        <circle cx="55" cy="55" r="5.5" fill="white" stroke="#2FA8A0" stroke-width="2"/>
        <circle cx="55" cy="55" r="2.5" fill="#2FA8A0"/>
      </svg>

      <div class="wc-time">{{ timeStr }}</div>
      <div class="wc-date">{{ dateStr }}</div>
    </div>
  `
})
export class WallClockComponent implements OnInit, OnDestroy {

  hourTicks   = Array(12).fill(0);
  minuteTicks = Array(60).fill(0);

  hourDeg   = 0;
  minuteDeg = 0;
  secondDeg = 0;
  timeStr = '';
  dateStr = '';

  private timer: any;
  private langSub: Subscription;

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
    this.langSub = this.translate.onLangChange.subscribe(() => this.tick());
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
    this.langSub?.unsubscribe();
  }

  private tick(): void {
    const now    = new Date();
    const locale = this.translate.currentLang || this.translate.defaultLang || 'en';
    const h = now.getHours() % 12;
    const m = now.getMinutes();
    const s = now.getSeconds();
    this.hourDeg   = h * 30 + m * 0.5;
    this.minuteDeg = m * 6  + s * 0.1;
    this.secondDeg = s * 6;
    this.timeStr = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    this.dateStr = now.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
  }
}
