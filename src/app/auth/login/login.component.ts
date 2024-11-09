import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Location } from '@angular/common';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { SuccessfullDialogComponent } from '../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../successfull-dialog/sucessfull-dialog-text';

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
  errorMessage: boolean = false;
  notVerrifiedError: boolean = false;

  constructor(private authService: AuthService, private router: Router, private dialog: MatDialog, private location: Location) { }

  // Method to handle user login
  login() {
    this.email = this.loginForm.value.email;
    this.password = this.loginForm.value.password;

    // Authenticate user
    this.authService.login(this.email, this.password)
      .then(async success => {
        if (success === true) {
          this.errorMessage = false;
          this.router.navigate(['/']);
        } else if (success === false) {
          this.errorMessage = true; // Show error message on bad input
          this.notVerrifiedError = false;
        } else if (success === null) {
          this.notVerrifiedError = true; // Show error message on unverrified email
          this.authService.logOut();
          this.errorMessage = false;
        }
      });
  }

  // Navigate to registration page
  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  async reSendVerificationLink() {
    await this.authService.login(this.email, this.password);
    await this.authService.sendEmailVerification();
    this.authService.logOut();

    // Open dialog to notify user about email verification
    this.dialog.open(SuccessfullDialogComponent, {
      data: {
        text: SuccessFullDialogText.RE_SEND_VERIFY_EMAIL,
        needToGoPrevoiusPage: false
      }
    })
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
