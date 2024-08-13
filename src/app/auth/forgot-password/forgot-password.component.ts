import { Component, Inject, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../auth.service';
import { SuccessfullDialogComponent } from '../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../successfull-dialog/sucessfull-dialog-text';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  @ViewChild('form') loginForm: NgForm;
  public errorMessage = false;
  emailToForgotPassword: string;
  emailSent = false;

  constructor(private authService: AuthService, @Inject(MAT_DIALOG_DATA) public data, public dialog: MatDialog, public dialogRef: MatDialogRef<ForgotPasswordComponent>) {
    this.emailToForgotPassword = data.email;
  }

  forgotPassword() {
    this.emailToForgotPassword = this.loginForm.value.email;

    this.authService.forgotPassword(this.emailToForgotPassword)
      .then(success => {
        console.log(success)
        if (success) {
          this.errorMessage = false;
          this.dialog.closeAll();
          this.dialog.open(SuccessfullDialogComponent, {
            data: {
              text: "A link elküldve a megadott email címre!",
              buttonText: "Vissza a bejelentkezéshez",
              needToGoPrevoiusPage: true
            }
          })
        } else {
          this.errorMessage = true;
        }
      });
  }
}
