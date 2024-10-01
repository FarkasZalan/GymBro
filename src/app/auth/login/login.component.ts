import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Location } from '@angular/common';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: '../../../styles/basic-form.scss'
})
export class LoginComponent {
  @ViewChild('form') loginForm: NgForm; // Reference to the login form for validation

  // user data
  email = "";
  password = "";

  // Flag for displaying login error
  public errorMessage = false;

  constructor(private authService: AuthService, private router: Router, private dialog: MatDialog, private location: Location) { }

  // Method to handle user login
  login() {
    this.email = this.loginForm.value.email;
    this.password = this.loginForm.value.password;

    // Authenticate user
    this.authService.login(this.email, this.password)
      .then(success => {
        if (success) {
          this.errorMessage = false;
          this.router.navigate(['/']);
        } else {
          this.errorMessage = true; // Show error message on failure
        }
      });
  }

  // Navigate to registration page
  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  goToItems() {
    this.location.back();
    this.router.navigate(['/']);
  }

  forgotPassword() {
    this.email = this.loginForm.value.email;

    // Pass the email to the dialog for password recovery
    this.dialog.open(ForgotPasswordComponent, {
      data: {
        email: this.email
      }
    });
  }
}
