import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthenticationService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  styles: [`
    .wiko-auth { display:grid; grid-template-columns:1fr 1fr; min-height:100vh; font-family:'Archivo',sans-serif; }

    .auth-form-panel { display:flex; align-items:center; justify-content:center; background:#fff; padding:48px 40px; }
    .auth-form-inner { width:100%; max-width:400px; }
    .auth-logo { display:flex; align-items:center; gap:10px; margin-bottom:40px; }
    .logo-icon { width:38px; height:38px; background:#162233; border-radius:9px; display:flex; align-items:center; justify-content:center; color:#2FA8A0; font-size:20px; }
    .logo-text { font-family:'Inter',sans-serif; font-size:20px; font-weight:800; color:#1A2B3C; letter-spacing:-.5px; }
    .logo-text span { color:#2FA8A0; }

    .step-icon { width:64px; height:64px; background:#E8F7F6; border-radius:16px; display:flex; align-items:center; justify-content:center; margin-bottom:24px; }
    .step-icon i { font-size:30px; color:#2FA8A0; }
    .auth-title { font-family:'Inter',sans-serif; font-size:24px; font-weight:800; color:#1A2B3C; margin:0 0 8px; }
    .auth-sub { font-size:13.5px; color:#8FA3B8; margin:0 0 32px; line-height:1.6; }
    .auth-sub strong { color:#4A6080; }

    .form-group { display:flex; flex-direction:column; gap:7px; margin-bottom:16px; }
    .form-label { font-size:12.5px; font-weight:600; color:#4A6080; }
    .input-wrap { position:relative; display:flex; align-items:center; }
    .input-icon { position:absolute; left:14px; color:#8FA3B8; font-size:15px; pointer-events:none; }
    .eye-btn { position:absolute; right:12px; background:none; border:none; color:#8FA3B8; cursor:pointer; font-size:15px; display:flex; align-items:center; padding:0; }
    .form-input { width:100%; border:1.5px solid #E8EDF2; border-radius:9px; padding:12px 14px 12px 42px; font-size:13.5px; color:#1A2B3C; font-family:'Archivo',sans-serif; outline:none; transition:border .15s; }
    .form-input:focus { border-color:#2FA8A0; }
    .form-input::placeholder { color:#C4D0DC; }
    .form-input:disabled { background:#f5f7fa; cursor:not-allowed; }

    /* OTP inputs */
    .otp-row { display:flex; gap:10px; margin-bottom:16px; }
    .otp-input { width:52px; height:60px; border:1.5px solid #E8EDF2; border-radius:10px; text-align:center; font-family:'Inter',sans-serif; font-size:22px; font-weight:700; color:#1A2B3C; outline:none; transition:border .15s; background:#fff; }
    .otp-input:focus { border-color:#2FA8A0; box-shadow:0 0 0 3px rgba(47,168,160,.1); }
    .otp-input.filled { border-color:#2FA8A0; background:#E8F7F6; }
    .otp-input:disabled { background:#f5f7fa; border-color:#E8EDF2; color:#aaa; }

    /* Timer / resend */
    .resend-row { font-size:13px; color:#8FA3B8; margin-bottom:20px; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
    .resend-link { color:#2FA8A0; font-weight:600; cursor:pointer; }
    .resend-link:hover { text-decoration:underline; }
    .resend-timer { color:#F87171; font-weight:700; }

    /* Expired warning */
    .expired-banner { background:#FEF2F2; border:1px solid #FECACA; border-radius:8px; padding:10px 14px; font-size:13px; color:#B91C1C; margin-bottom:16px; display:flex; align-items:center; gap:8px; }

    /* Error */
    .error-msg { background:#FEF2F2; border:1px solid #FECACA; border-radius:8px; padding:10px 14px; font-size:13px; color:#B91C1C; margin-bottom:14px; display:flex; align-items:center; gap:8px; }

    .btn-main { width:100%; background:#2FA8A0; color:#fff; border:none; border-radius:9px; padding:13px; font-size:14px; font-weight:700; font-family:'Inter',sans-serif; cursor:pointer; transition:background .15s; margin-bottom:12px; display:flex; align-items:center; justify-content:center; gap:8px; }
    .btn-main:hover:not(:disabled) { background:#228880; }
    .btn-main:disabled { background:#A0CFCC; cursor:not-allowed; }
    .btn-back { width:100%; background:#fff; color:#4A6080; border:1.5px solid #E8EDF2; border-radius:9px; padding:11px; font-size:14px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; transition:all .15s; }
    .btn-back:hover { border-color:#2FA8A0; color:#2FA8A0; }

    .spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; border-radius:50%; animation:spin .6s linear infinite; display:inline-block; }
    @keyframes spin { to { transform:rotate(360deg); } }

    /* Hero */
    .auth-hero-panel { background-image:url('/assets/images/login-bg.jpg'); background-size:cover; background-position:center; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; }
    .auth-hero-panel::before { content:''; position:absolute; inset:0; background:linear-gradient(145deg,rgba(22,34,51,.75) 0%,rgba(15,28,42,.65) 100%); z-index:1; }
    .deco { position:absolute; border-radius:50%; opacity:.07; background:#2FA8A0; pointer-events:none; }
    .deco-1 { width:320px; height:320px; top:-80px; right:-80px; }
    .deco-2 { width:200px; height:200px; bottom:-50px; left:-50px; }
    @media(max-width:768px){ .wiko-auth{grid-template-columns:1fr;} .auth-hero-panel{display:none;} }
  `],
  template: `
  <div class="wiko-auth">
    <div class="auth-form-panel">
      <div class="auth-form-inner">
        <div class="auth-logo">
          <span class="logo-icon"><i class="bx bxs-cube-alt"></i></span>
          <span class="logo-text">WIKO<span>HR</span></span>
        </div>

        <!-- Step 1: Email -->
        <ng-container *ngIf="step===1">
          <div class="step-icon"><i class="bx bx-lock-open-alt"></i></div>
          <h2 class="auth-title">Forgot your password?</h2>
          <p class="auth-sub">Enter your email address and we'll send you a 6-digit verification code.</p>
          <div *ngIf="errorMsg" class="error-msg"><i class="bx bx-error-circle"></i> {{ errorMsg }}</div>
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <div class="input-wrap">
              <i class="bx bx-envelope input-icon"></i>
              <input class="form-input" type="email" [(ngModel)]="email" placeholder="you@company.com" [disabled]="loading">
            </div>
          </div>
          <button class="btn-main" (click)="sendCode()" [disabled]="loading || !email.trim()">
            <span class="spinner" *ngIf="loading"></span>
            <span>{{ loading ? 'Sending…' : 'Send Code' }}</span>
          </button>
          <button class="btn-back" (click)="goLogin()"><i class="bx bx-arrow-back"></i> Back to Login</button>
        </ng-container>

        <!-- Step 2: OTP -->
        <ng-container *ngIf="step===2">
          <div class="step-icon"><i class="bx bx-message-dots"></i></div>
          <h2 class="auth-title">Enter the Code</h2>
          <p class="auth-sub">We sent a 6-digit code to <strong>{{ maskedEmail }}</strong>. Enter it below.</p>

          <div *ngIf="otpExpired" class="expired-banner">
            <i class="bx bx-time-five"></i> Code expired. Click <strong>Send Again</strong> to get a new one.
          </div>
          <div *ngIf="errorMsg" class="error-msg"><i class="bx bx-error-circle"></i> {{ errorMsg }}</div>

          <div class="otp-row">
            <input id="otp0" class="otp-input" [class.filled]="digits[0]" type="text" inputmode="numeric" maxlength="1" [disabled]="otpExpired" (input)="onInput($event,0)" (keydown)="onKey($event,0)">
            <input id="otp1" class="otp-input" [class.filled]="digits[1]" type="text" inputmode="numeric" maxlength="1" [disabled]="otpExpired" (input)="onInput($event,1)" (keydown)="onKey($event,1)">
            <input id="otp2" class="otp-input" [class.filled]="digits[2]" type="text" inputmode="numeric" maxlength="1" [disabled]="otpExpired" (input)="onInput($event,2)" (keydown)="onKey($event,2)">
            <input id="otp3" class="otp-input" [class.filled]="digits[3]" type="text" inputmode="numeric" maxlength="1" [disabled]="otpExpired" (input)="onInput($event,3)" (keydown)="onKey($event,3)">
            <input id="otp4" class="otp-input" [class.filled]="digits[4]" type="text" inputmode="numeric" maxlength="1" [disabled]="otpExpired" (input)="onInput($event,4)" (keydown)="onKey($event,4)">
            <input id="otp5" class="otp-input" [class.filled]="digits[5]" type="text" inputmode="numeric" maxlength="1" [disabled]="otpExpired" (input)="onInput($event,5)" (keydown)="onKey($event,5)">
          </div>

          <div class="resend-row">
            <ng-container *ngIf="!otpExpired">
              Code expires in <span class="resend-timer">{{ timerDisplay }}</span>
              &nbsp;·&nbsp;
            </ng-container>
            <span class="resend-link" (click)="sendCode()">Send Again</span>
          </div>

          <button class="btn-main" (click)="confirmOtp()" [disabled]="loading || otpExpired || !otpComplete">
            <span class="spinner" *ngIf="loading"></span>
            <span>{{ loading ? 'Verifying…' : 'Confirm' }}</span>
          </button>
          <button class="btn-back" (click)="step=1; errorMsg=''; stopTimer()"><i class="bx bx-arrow-back"></i> Back</button>
        </ng-container>

        <!-- Step 3: New Password -->
        <ng-container *ngIf="step===3">
          <div class="step-icon"><i class="bx bx-key"></i></div>
          <h2 class="auth-title">Reset your password</h2>
          <p class="auth-sub">Choose a strong new password for your account.</p>
          <div *ngIf="errorMsg" class="error-msg"><i class="bx bx-error-circle"></i> {{ errorMsg }}</div>
          <div class="form-group">
            <label class="form-label">New Password</label>
            <div class="input-wrap">
              <i class="bx bx-lock-alt input-icon"></i>
              <input [type]="showPwd?'text':'password'" class="form-input" [(ngModel)]="newPassword" placeholder="Min. 8 characters">
              <button type="button" class="eye-btn" (click)="showPwd=!showPwd"><i class="bx" [ngClass]="showPwd?'bx-hide':'bx-show'"></i></button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Confirm New Password</label>
            <div class="input-wrap">
              <i class="bx bx-lock-alt input-icon"></i>
              <input [type]="showConfirm?'text':'password'" class="form-input" [(ngModel)]="confirmPassword" placeholder="Repeat password">
              <button type="button" class="eye-btn" (click)="showConfirm=!showConfirm"><i class="bx" [ngClass]="showConfirm?'bx-hide':'bx-show'"></i></button>
            </div>
          </div>
          <button class="btn-main" (click)="doReset()" [disabled]="loading || !newPassword || newPassword !== confirmPassword">
            <span class="spinner" *ngIf="loading"></span>
            <span>{{ loading ? 'Resetting…' : 'Reset Password' }}</span>
          </button>
          <button class="btn-back" (click)="step=2; errorMsg=''"><i class="bx bx-arrow-back"></i> Back</button>
        </ng-container>
      </div>
    </div>

    <div class="auth-hero-panel">
      <div class="deco deco-1"></div>
      <div class="deco deco-2"></div>
    </div>
  </div>
  `
})
export class ForgotPasswordComponent implements OnDestroy {
  step = 1;
  email = '';
  digits: string[] = ['', '', '', '', '', ''];
  newPassword = '';
  confirmPassword = '';
  showPwd = false;
  showConfirm = false;
  loading = false;
  errorMsg = '';
  otpExpired = false;

  private timerSec = 0;
  private timerRef: any = null;

  get maskedEmail(): string {
    if (!this.email) return '';
    const [user, domain] = this.email.split('@');
    return user.slice(0, 2) + '***@' + domain;
  }

  get otpString(): string { return this.digits.join(''); }

  get otpComplete(): boolean { return this.digits.every(d => d !== ''); }

  get timerDisplay(): string {
    const m = Math.floor(this.timerSec / 60);
    const s = this.timerSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  constructor(private router: Router, private authService: AuthenticationService, private cdr: ChangeDetectorRef) {}

  ngOnDestroy(): void { this.stopTimer(); }

  // ── Send / Resend ──────────────────────────────────────────────────────────

  sendCode(): void {
    if (!this.email.trim()) return;
    this.loading = true;
    this.errorMsg = '';
    this.authService.forgotPassword(this.email.trim()).subscribe({
      next: () => {
        this.loading = false;
        this.otpExpired = false;
        this.digits = ['', '', '', '', '', ''];
        this.step = 2;
        this.startTimer(120);
        setTimeout(() => {
          this.clearInputDoms();
          (document.getElementById('otp0') as HTMLInputElement)?.focus();
        }, 50);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Could not send code. Check your email and try again.';
      }
    });
  }

  // ── Confirm OTP ────────────────────────────────────────────────────────────

  confirmOtp(): void {
    if (this.otpExpired || !this.otpComplete) return;
    this.loading = true;
    this.errorMsg = '';
    this.authService.verifyOtp(this.email, this.otpString).subscribe({
      next: () => {
        this.loading = false;
        this.stopTimer();
        this.step = 3;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Invalid code. Please try again.';
      }
    });
  }

  // ── Reset Password ─────────────────────────────────────────────────────────

  doReset(): void {
    if (this.newPassword !== this.confirmPassword) { this.errorMsg = 'Passwords do not match.'; return; }
    if (this.newPassword.length < 8) { this.errorMsg = 'Password must be at least 8 characters.'; return; }
    this.loading = true;
    this.errorMsg = '';
    this.authService.resetPassword(this.email, this.otpString, this.newPassword).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/account/auth/login']); },
      error: (err) => { this.loading = false; this.errorMsg = err?.error?.message || 'Could not reset password. Please start over.'; }
    });
  }

  // ── Timer ──────────────────────────────────────────────────────────────────

  startTimer(seconds: number): void {
    this.stopTimer();
    this.timerSec = seconds;
    this.otpExpired = false;
    this.timerRef = setInterval(() => {
      this.timerSec--;
      if (this.timerSec <= 0) { this.stopTimer(); this.otpExpired = true; }
      this.cdr.detectChanges();
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerRef) { clearInterval(this.timerRef); this.timerRef = null; }
  }

  // ── OTP Input Handlers ─────────────────────────────────────────────────────

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').slice(-1);
    input.value = digit;
    this.digits[index] = digit;
    this.cdr.detectChanges();
    if (digit && index < 5) {
      (document.getElementById('otp' + (index + 1)) as HTMLInputElement)?.focus();
    }
  }

  onKey(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      const input = event.target as HTMLInputElement;
      if (!input.value && index > 0) {
        this.digits[index - 1] = '';
        const prev = document.getElementById('otp' + (index - 1)) as HTMLInputElement;
        if (prev) { prev.value = ''; prev.focus(); }
        this.cdr.detectChanges();
      }
    }
  }

  private clearInputDoms(): void {
    for (let i = 0; i < 6; i++) {
      const el = document.getElementById('otp' + i) as HTMLInputElement;
      if (el) el.value = '';
    }
  }

  goLogin(): void { this.router.navigate(['/account/auth/login']); }
}
