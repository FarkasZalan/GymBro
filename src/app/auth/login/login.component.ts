import { Component, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: '../../../styles/basic-form.scss'
})
export class LoginComponent {
  @ViewChild('form') loginForm: NgForm;
  private authService: AuthService;
  private router: Router;
  email = "";
  password = "";
  public errorMessage = false;

  constructor(authService: AuthService, router: Router, private dialog: MatDialog) {
    this.authService = authService;
    this.router = router;
  }

  login() {
    this.email = this.loginForm.value.email;
    this.password = this.loginForm.value.password;
    this.authService.login(this.email, this.password)
      .then(success => {
        if (success) {
          this.errorMessage = false;
          this.router.navigate(['/']);
        } else {
          this.errorMessage = true;
        }
      });
  }
  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  goToItems() {
    this.router.navigate(['/']);
  }

  forgotPassword() {
    this.email = this.loginForm.value.email;
    this.dialog.open(ForgotPasswordComponent, {
      data: {
        email: this.email
      }
    });
  }
}
