import { Component, Inject, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../auth.service';
import { SuccessfullDialogComponent } from '../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../successfull-dialog/sucessfull-dialog-text';
import { trigger, transition, style, animate } from '@angular/animations';
import { LoadingService } from '../../loading-spinner/loading.service';

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

  constructor(
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ForgotPasswordComponent>,
    public loadingService: LoadingService
  ) {
    this.emailToForgotPassword = data.email; // Initialize email from injected data
  }

  // Method to initiate password recovery
  async forgotPassword() {
    await this.loadingService.withLoading(async () => {
      this.emailToForgotPassword = this.loginForm.value.email;

      // send the password recovery email to the given email
      const success = await this.authService.forgotPassword(this.emailToForgotPassword);

      if (success) {
        this.errorMessage = false;
        this.dialog.closeAll();

        // Open success dialog to inform user
        this.dialog.open(SuccessfullDialogComponent, {
          data: {
            text: SuccessFullDialogText.PASSWORD_EMAIL_SENT,
            needToGoPrevoiusPage: false
          }
        });
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
