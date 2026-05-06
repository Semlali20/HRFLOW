import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .wiko-auth { display:grid; grid-template-columns:1fr 1fr; min-height:100vh; font-family:'Archivo',sans-serif; }

    /* Form panel */
    .auth-form-panel { display:flex; align-items:center; justify-content:center; background:#fff; padding:48px 40px; }
    .auth-form-inner { width:100%; max-width:420px; }
    .auth-logo { display:flex; align-items:center; gap:10px; margin-bottom:32px; }
    .logo-icon { width:38px; height:38px; background:#162233; border-radius:9px; display:flex; align-items:center; justify-content:center; color:#2FA8A0; font-size:20px; }
    .logo-text { font-family:'Inter',sans-serif; font-size:20px; font-weight:800; color:#1A2B3C; letter-spacing:-.5px; }
    .logo-text span { color:#2FA8A0; }
    .auth-title { font-family:'Inter',sans-serif; font-size:24px; font-weight:800; color:#1A2B3C; margin:0 0 4px; }
    .auth-sub { font-size:13px; color:#8FA3B8; margin:0 0 24px; }

    .social-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px; }
    .btn-social { display:flex; align-items:center; justify-content:center; gap:8px; border:1.5px solid #E8EDF2; border-radius:9px; padding:10px; font-size:13px; font-weight:500; color:#4A6080; background:#fff; cursor:pointer; transition:border .15s; }
    .btn-social:hover { border-color:#2FA8A0; }
    .btn-social img { width:18px; height:18px; }

    .divider { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
    .divider hr { flex:1; border:none; border-top:1px solid #F0F3F6; }
    .divider span { font-size:12px; color:#8FA3B8; white-space:nowrap; }

    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .form-group { display:flex; flex-direction:column; gap:6px; }
    .form-group.full { grid-column:1/-1; }
    .form-label { font-size:12.5px; font-weight:600; color:#4A6080; }
    .input-wrap { position:relative; display:flex; align-items:center; }
    .input-icon { position:absolute; left:14px; color:#8FA3B8; font-size:15px; pointer-events:none; }
    .eye-btn { position:absolute; right:12px; background:none; border:none; color:#8FA3B8; cursor:pointer; font-size:15px; display:flex; align-items:center; padding:0; }
    .form-input { width:100%; border:1.5px solid #E8EDF2; border-radius:9px; padding:11px 38px 11px 40px; font-size:13.5px; color:#1A2B3C; font-family:'Archivo',sans-serif; outline:none; transition:border .15s; }
    .form-input:focus { border-color:#2FA8A0; }
    .form-input::placeholder { color:#C4D0DC; }

    .terms-row { margin-top:6px; }
    .terms-label { display:flex; align-items:flex-start; gap:8px; font-size:12px; color:#8FA3B8; cursor:pointer; line-height:1.5; }
    .terms-label input { width:14px; height:14px; accent-color:#2FA8A0; margin-top:2px; flex-shrink:0; }
    .terms-label a { color:#2FA8A0; text-decoration:none; font-weight:600; }

    .btn-signup { width:100%; background:#2FA8A0; color:#fff; border:none; border-radius:9px; padding:13px; font-size:14px; font-weight:700; font-family:'Inter',sans-serif; cursor:pointer; margin-top:16px; transition:background .15s; }
    .btn-signup:hover { background:#228880; }

    .auth-footer { text-align:center; font-size:13px; color:#8FA3B8; margin-top:20px; }
    .auth-link { color:#2FA8A0; font-weight:600; text-decoration:none; }
    .auth-link:hover { text-decoration:underline; }

    /* Hero panel */
    .auth-hero-panel { background:linear-gradient(145deg,#162233 0%,#1E3249 60%,#0F1C2A 100%); display:flex; align-items:center; justify-content:center; padding:48px 52px; position:relative; overflow:hidden; }
    .hero-content { position:relative; z-index:2; max-width:420px; }
    .hero-badge { display:inline-block; background:rgba(47,168,160,.2); color:#2FA8A0; border:1px solid rgba(47,168,160,.4); border-radius:999px; padding:5px 16px; font-size:12px; font-weight:600; letter-spacing:.04em; margin-bottom:24px; }
    .hero-title { font-family:'Inter',sans-serif; font-size:38px; font-weight:800; color:#fff; line-height:1.15; margin:0 0 18px; letter-spacing:-1px; }
    .hero-desc { font-size:14px; color:#8FA3B8; line-height:1.7; margin:0 0 32px; }
    .hero-stats { display:flex; gap:32px; margin-bottom:32px; }
    .hero-stat .stat-num { font-family:'Inter',sans-serif; font-size:26px; font-weight:800; color:#fff; line-height:1; }
    .hero-stat .stat-lbl { font-size:11.5px; color:#8FA3B8; margin-top:4px; }
    .hero-card { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); border-radius:14px; padding:16px 20px; backdrop-filter:blur(10px); }
    .hero-card-row { display:flex; align-items:center; gap:14px; }
    .hero-card-avatar { width:42px; height:42px; border-radius:9px; background:rgba(47,168,160,.25); color:#2FA8A0; font-family:'Inter',sans-serif; font-weight:700; font-size:15px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .hero-card-info { flex:1; }
    .hero-card-name { font-family:'Inter',sans-serif; font-size:13px; font-weight:600; color:#fff; }
    .hero-card-role { font-size:11px; color:#8FA3B8; margin-top:3px; }
    .hero-card-badge { background:rgba(34,197,94,.2); color:#4ADE80; font-size:11px; font-weight:700; padding:4px 10px; border-radius:999px; white-space:nowrap; }
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
        <h2 class="auth-title">Sign up for an account</h2>
        <p class="auth-sub">Join the future of HR management. Sign up now for WIKO account.</p>

        <div class="social-row">
          <button class="btn-social"><i class="bx bxl-google" style="font-size:17px;color:#4285F4"></i> Sign In With Google</button>
          <button class="btn-social"><i class="bx bxl-apple" style="font-size:17px;color:#1A2B3C"></i> Sign In With Apple</button>
        </div>

        <div class="divider"><hr><span>or</span><hr></div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <div class="input-wrap">
              <i class="bx bx-user input-icon"></i>
              <input class="form-input" type="text" [(ngModel)]="fullName" placeholder="John Doe">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Company Name</label>
            <div class="input-wrap">
              <i class="bx bx-buildings input-icon"></i>
              <input class="form-input" type="text" [(ngModel)]="company" placeholder="WIKO Corp">
            </div>
          </div>
          <div class="form-group full">
            <label class="form-label">Email Address</label>
            <div class="input-wrap">
              <i class="bx bx-envelope input-icon"></i>
              <input class="form-input" type="email" [(ngModel)]="email" placeholder="you@company.com">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="input-wrap">
              <i class="bx bx-lock-alt input-icon"></i>
              <input [type]="showPwd?'text':'password'" class="form-input" [(ngModel)]="password" placeholder="••••••••">
              <button type="button" class="eye-btn" (click)="showPwd=!showPwd"><i class="bx" [ngClass]="showPwd?'bx-hide':'bx-show'"></i></button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Confirm Password</label>
            <div class="input-wrap">
              <i class="bx bx-lock-alt input-icon"></i>
              <input [type]="showConfirm?'text':'password'" class="form-input" [(ngModel)]="confirmPassword" placeholder="••••••••">
              <button type="button" class="eye-btn" (click)="showConfirm=!showConfirm"><i class="bx" [ngClass]="showConfirm?'bx-hide':'bx-show'"></i></button>
            </div>
          </div>
        </div>

        <div class="terms-row">
          <label class="terms-label">
            <input type="checkbox" [(ngModel)]="agreed">
            <span>By creating an account, you agreeing to our <a href="#">Privacy Policy</a> and <a href="#">Terms and Conditions</a></span>
          </label>
        </div>

        <button class="btn-signup" (click)="signup()">Create Account</button>

        <p class="auth-footer">Already have an account? <a href="/account/auth/login" class="auth-link">Sign In</a></p>
      </div>
    </div>

    <div class="auth-hero-panel">
      <div class="hero-content">
        <div class="hero-badge">HR Management Platform</div>
        <h1 class="hero-title">Elevate Your<br>HR Efficiency</h1>
        <p class="hero-desc">Unleash the power of our advanced HR Dashboard and unlock a new level of efficiency for your team. With intuitive design and powerful features, our platform empowers you to streamline your HR processes effortlessly.</p>
        <div class="hero-stats">
          <div class="hero-stat"><div class="stat-num">125K</div><div class="stat-lbl">Has been used by</div></div>
          <div class="hero-stat"><div class="stat-num">79K</div><div class="stat-lbl">Reviewed by</div></div>
          <div class="hero-stat"><div class="stat-num">53K</div><div class="stat-lbl">Subscribe Company</div></div>
        </div>
        <div class="hero-card">
          <div class="hero-card-row">
            <div class="hero-card-avatar">JR</div>
            <div class="hero-card-info">
              <div class="hero-card-name">Julia Roberts</div>
              <div class="hero-card-role">Technology &mdash; 98.3% attendance</div>
            </div>
            <span class="hero-card-badge">Top Performer</span>
          </div>
        </div>
      </div>
      <div class="deco deco-1"></div>
      <div class="deco deco-2"></div>
    </div>
  </div>
  `
})
export class SignupComponent {
  fullName = '';
  company = '';
  email = '';
  password = '';
  confirmPassword = '';
  agreed = false;
  showPwd = false;
  showConfirm = false;

  constructor(private router: Router) {}

  signup() {
    this.router.navigate(['/dashboard']);
  }
}
