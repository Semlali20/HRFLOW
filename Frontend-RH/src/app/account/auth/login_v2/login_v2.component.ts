import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthenticationService } from '../../../core/services/auth.service';

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
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirect to dashboard if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    // Load saved credentials if "Remember Me" was checked
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedEmail && savedPassword) {
      this.email = savedEmail;
      this.password = savedPassword;
      this.rememberMe = true;
    }
  }

  login(): void {
    if (!this.email || !this.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please enter your email and password.'
      });
      return;
    }

    this.isLoading = true;

    this.authService.loginUser(this.email, this.password).subscribe({
      next: (user) => {
        this.isLoading = false;

        // Save or clear remember-me credentials
        if (this.rememberMe) {
          localStorage.setItem('rememberedEmail', this.email);
          localStorage.setItem('rememberedPassword', this.password);
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberedPassword');
        }

        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: `Welcome back, ${user.firstname ?? ''} ${user.lastname ?? ''}!`,
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/']);
        });
      },
      error: (error) => {
        this.isLoading = false;
        const status = error?.status;
        if (status === 401 || status === 403) {
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Invalid email or password. Please try again.'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'An error occurred. Please check your connection and try again.'
          });
        }
      }
    });
  }
}
