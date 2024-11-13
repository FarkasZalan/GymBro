import { Component, Inject, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../auth.service';
import { SuccessfullDialogComponent } from '../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../successfull-dialog/sucessfull-dialog-text';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  animations: [
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ]
})
export class ForgotPasswordComponent {
  @ViewChild('form') loginForm: NgForm;  // Reference to the form for validation

  // error handleing
  public errorMessage = false;

  emailToForgotPassword: string;
  emailSent = false;

  constructor(private authService: AuthService, @Inject(MAT_DIALOG_DATA) public data, public dialog: MatDialog, public dialogRef: MatDialogRef<ForgotPasswordComponent>) {
    this.emailToForgotPassword = data.email; // Initialize email from injected data
  }

  // Method to initiate password recovery
  forgotPassword() {
    this.emailToForgotPassword = this.loginForm.value.email;

    // send the password recovry email to the given email
    this.authService.forgotPassword(this.emailToForgotPassword)
      .then(success => {
        console.log(success)
        if (success) {
          this.errorMessage = false;
          this.dialog.closeAll();

          // Open success dialog to inform user
          this.dialog.open(SuccessfullDialogComponent, {
            data: {
              text: SuccessFullDialogText.PASSWORD_EMAIL_SENT,
              needToGoPrevoiusPage: false
            }
          })
        } else {
          this.errorMessage = true;
        }
      });
  }

  // Close all dialogs
  back() {
    this.dialog.closeAll();
  }
}
