import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../shared/confirm.service';

@Component({
  selector: 'app-login-v2',
  templateUrl: './login_v2.component.html',
  styleUrls: ['./login_v2.component.scss']
})
export class LoginComponent1 implements OnInit {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPwd: boolean = false;
  isLoading: boolean = false;

  constructor(
    private authService: AuthenticationService,
    private confirmSvc: ConfirmService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedEmail && savedPassword) {
      this.email = savedEmail;
      this.password = savedPassword;
      this.rememberMe = true;
    }
  }

  async login(): Promise<void> {
    if (!this.email || !this.password) {
      await this.confirmSvc.alert(
        'Please enter your email and password.',
        'Missing Fields',
        'info'
      );
      return;
    }

    this.isLoading = true;

    this.authService.loginUser(this.email, this.password).subscribe({
      next: async (user) => {
        this.isLoading = false;

        if (this.rememberMe) {
          localStorage.setItem('rememberedEmail', this.email);
          localStorage.setItem('rememberedPassword', this.password);
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberedPassword');
        }

        const name = [user.firstname, user.lastname].filter(Boolean).join(' ');
        await this.confirmSvc.alert(
          name ? `Welcome back, ${name}. Redirecting you to your dashboard...` : 'Login successful. Redirecting you to your dashboard...',
          'Login Successful',
          'success',
          1500
        );
        this.router.navigate(['/dashboard']);
      },
      error: async (error) => {
        this.isLoading = false;
        const status = error?.status;
        const msg = (status === 401 || status === 403)
          ? 'Invalid email or password. Please try again.'
          : 'An error occurred. Please check your connection and try again.';
        await this.confirmSvc.alert(msg, 'Login Failed', 'error');
      }
    });
  }
}
