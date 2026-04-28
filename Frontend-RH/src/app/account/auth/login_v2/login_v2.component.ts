import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthenticationService } from '../../../../app/core/services/auth.service';

@Component({
  selector: 'app-login-v2',
  templateUrl: './login_v2.component.html',
  styleUrls: ['./login_v2.component.scss']
})
export class LoginComponent1 implements OnInit {
  email: string;
  password: string;
  rememberMe: boolean = false;

  constructor(private authService: AuthenticationService) {}

  ngOnInit(): void {

    // Load saved credentials if "Remember Me" was checked
    const savedEmail = localStorage.getItem('email');
    const savedPassword = localStorage.getItem('password');
    if (savedEmail && savedPassword) {
      this.email = savedEmail;
      this.password = savedPassword;
      this.rememberMe = true;
    }

  }

  async login(): Promise<void> {
    try {
      const user = await this.authService.loginUser(this.email, this.password);
      console.log('Login successful', user);

      // Save credentials if "Remember Me" is checked
      if (this.rememberMe) {
        localStorage.setItem('email', this.email);
        localStorage.setItem('password', this.password);
      } else {
        localStorage.removeItem('email');
        localStorage.removeItem('password');
      }

      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'You have successfully logged in!'
      });
    } catch (error) {
      console.error('Login failed', error);
      if (error.response && error.response.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Unauthorized. Check your credentials.'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'An error occurred. Please try again.'
        });
      }
    }
  }

}
