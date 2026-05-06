import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

    /* OTP inputs */
    .otp-row { display:flex; gap:10px; margin-bottom:20px; }
    .otp-input { width:52px; height:60px; border:1.5px solid #E8EDF2; border-radius:10px; text-align:center; font-family:'Inter',sans-serif; font-size:22px; font-weight:700; color:#1A2B3C; outline:none; transition:border .15s; }
    .otp-input:focus { border-color:#2FA8A0; }
    .otp-input.filled { border-color:#2FA8A0; background:#E8F7F6; }

    .resend-row { font-size:13px; color:#8FA3B8; margin-bottom:24px; }
    .resend-row strong { color:#1A2B3C; }
    .resend-link { color:#2FA8A0; font-weight:600; cursor:pointer; }
    .resend-timer { color:#F87171; font-weight:700; }

    .btn-main { width:100%; background:#2FA8A0; color:#fff; border:none; border-radius:9px; padding:13px; font-size:14px; font-weight:700; font-family:'Inter',sans-serif; cursor:pointer; transition:background .15s; margin-bottom:12px; }
    .btn-main:hover { background:#228880; }
    .btn-back { width:100%; background:#fff; color:#4A6080; border:1.5px solid #E8EDF2; border-radius:9px; padding:11px; font-size:14px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; transition:all .15s; }
    .btn-back:hover { border-color:#2FA8A0; color:#2FA8A0; }

    /* Hero */
    .auth-hero-panel { background:linear-gradient(145deg,#162233 0%,#1E3249 60%,#0F1C2A 100%); display:flex; align-items:center; justify-content:center; padding:48px 52px; position:relative; overflow:hidden; }
    .hero-content { position:relative; z-index:2; max-width:420px; }
    .hero-badge { display:inline-block; background:rgba(47,168,160,.2); color:#2FA8A0; border:1px solid rgba(47,168,160,.4); border-radius:999px; padding:5px 16px; font-size:12px; font-weight:600; letter-spacing:.04em; margin-bottom:24px; }
    .hero-title { font-family:'Inter',sans-serif; font-size:36px; font-weight:800; color:#fff; line-height:1.15; margin:0 0 16px; letter-spacing:-1px; }
    .hero-desc { font-size:14px; color:#8FA3B8; line-height:1.7; margin:0 0 28px; }
    .hero-stats { display:flex; gap:28px; margin-bottom:28px; }
    .hero-stat .stat-num { font-family:'Inter',sans-serif; font-size:24px; font-weight:800; color:#fff; }
    .hero-stat .stat-lbl { font-size:11px; color:#8FA3B8; margin-top:3px; }
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
          <p class="auth-sub">Don't worry, it happens to the best of us. Enter your email address below and we'll send you a link to reset your password. Simply follow the provided link to access your account.</p>
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <div class="input-wrap">
              <i class="bx bx-envelope input-icon"></i>
              <input class="form-input" type="email" [(ngModel)]="email" placeholder="you@company.com">
            </div>
          </div>
          <p style="font-size:12px;color:#8FA3B8;margin-bottom:24px;">We will send a notification through your email address, so please ensure that your email is valid.</p>
          <button class="btn-main" (click)="step=2">Send Code</button>
          <button class="btn-back" (click)="goLogin()"><i class="bx bx-arrow-back"></i> Back to Login</button>
        </ng-container>

        <!-- Step 2: OTP -->
        <ng-container *ngIf="step===2">
          <div class="step-icon"><i class="bx bx-message-dots"></i></div>
          <h2 class="auth-title">Enter the Code We've Sent</h2>
          <p class="auth-sub">We have sent you the code to your email account (<strong>{{ maskedEmail }}</strong>), please enter the code below.</p>
          <div class="otp-row">
            <input *ngFor="let v of otp; let i=index" class="otp-input" [class.filled]="otp[i]" type="text" maxlength="1"
              [(ngModel)]="otp[i]" (input)="onOtpInput($event,i)" (keydown)="onOtpKey($event,i)" [id]="'otp'+i">
          </div>
          <div class="resend-row">
            Didn't get the code? click <span class="resend-link">Send Again</span> after <span class="resend-timer">{{ timerDisplay }}</span>
          </div>
          <button class="btn-main" (click)="step=3">Confirm</button>
          <button class="btn-back" (click)="step=1"><i class="bx bx-arrow-back"></i> Back</button>
        </ng-container>

        <!-- Step 3: New Password -->
        <ng-container *ngIf="step===3">
          <div class="step-icon"><i class="bx bx-key"></i></div>
          <h2 class="auth-title">Reset your password</h2>
          <p class="auth-sub">One more step to get your account back, let's reset your password!</p>
          <div class="form-group">
            <label class="form-label">New Password</label>
            <div class="input-wrap">
              <i class="bx bx-lock-alt input-icon"></i>
              <input [type]="showPwd?'text':'password'" class="form-input" [(ngModel)]="newPassword" placeholder="Enter your new password">
              <button type="button" class="eye-btn" (click)="showPwd=!showPwd"><i class="bx" [ngClass]="showPwd?'bx-hide':'bx-show'"></i></button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Confirm New Password</label>
            <div class="input-wrap">
              <i class="bx bx-lock-alt input-icon"></i>
              <input [type]="showConfirm?'text':'password'" class="form-input" [(ngModel)]="confirmPassword" placeholder="Confirm your new password">
              <button type="button" class="eye-btn" (click)="showConfirm=!showConfirm"><i class="bx" [ngClass]="showConfirm?'bx-hide':'bx-show'"></i></button>
            </div>
          </div>
          <button class="btn-main" (click)="goLogin()">Reset Password</button>
          <button class="btn-back" (click)="step=2"><i class="bx bx-arrow-back"></i> Back</button>
        </ng-container>
      </div>
    </div>

    <div class="auth-hero-panel">
      <div class="hero-content">
        <div class="hero-badge">HR Management Platform</div>
        <h1 class="hero-title">{{ heroTitle }}</h1>
        <p class="hero-desc">{{ heroDesc }}</p>
        <div class="hero-stats">
          <div class="hero-stat"><div class="stat-num">125K</div><div class="stat-lbl">Has been used by</div></div>
          <div class="hero-stat"><div class="stat-num">79K</div><div class="stat-lbl">Reviewed by</div></div>
          <div class="hero-stat"><div class="stat-num">53K</div><div class="stat-lbl">Subscribe Company</div></div>
        </div>
      </div>
      <div class="deco deco-1"></div>
      <div class="deco deco-2"></div>
    </div>
  </div>
  `
})
export class ForgotPasswordComponent {
  step = 1;
  email = '';
  otp: string[] = ['1', '6', '9', '', '', ''];
  newPassword = '';
  confirmPassword = '';
  showPwd = false;
  showConfirm = false;
  timerDisplay = '03:59';

  get maskedEmail() {
    if (!this.email) return 'wiko@examplae.com';
    const [user, domain] = this.email.split('@');
    return user.slice(0, 2) + '***@' + domain;
  }

  get heroTitle(): string {
    if (this.step === 1) return 'Revolutionize Your HR Management';
    if (this.step === 2) return 'Empower Your HR Workflow';
    return 'Elevate Your HR Efficiency';
  }

  get heroDesc(): string {
    if (this.step === 1) return 'Step into the future of HR with our state-of-the-art HR Dashboard. Experience the convenience of centralised HR operations, where you can effortlessly oversee every aspect of your workforce.';
    if (this.step === 2) return 'Discover the transformative capabilities of our cutting-edge HR Dashboard. Dive into a world where you can effortlessly manage every aspect of your workforce\'s journey.';
    return 'Unleash the power of our advanced HR Dashboard and unlock a new level of efficiency for your team. With intuitive design and powerful features, our platform empowers you to streamline your HR processes effortlessly.';
  }

  onOtpInput(event: any, index: number) {
    const val = event.target.value;
    if (val && index < 5) {
      const next = document.getElementById('otp' + (index + 1)) as HTMLInputElement;
      if (next) next.focus();
    }
  }

  onOtpKey(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.otp[index] && index > 0) {
      const prev = document.getElementById('otp' + (index - 1)) as HTMLInputElement;
      if (prev) prev.focus();
    }
  }

  constructor(private router: Router) {}

  goLogin() {
    this.router.navigate(['/account/auth/login']);
  }
}
