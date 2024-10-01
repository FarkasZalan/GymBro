import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { User } from '../../user/user.model';
import { SuccessfullDialogComponent } from '../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../successfull-dialog/sucessfull-dialog-text';
import { DocumentHandlerService } from '../../document.handler.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: '../../../styles/basic-form.scss'
})
export class RegisterComponent {
  @ViewChild('form') createUserForm: NgForm;  // Access the form for validation
  newUser: User;
  password: string = "";
  passwordAgain: string = "";

  // error handleing
  public errorMessage = false;
  errorMessagePassword: boolean = false;

  constructor(private authService: AuthService, private router: Router, private dialog: MatDialog, private documentHandler: DocumentHandlerService, private location: Location) { }

  // Method to handle user registration
  register() {
    this.password = this.createUserForm.value.password;
    this.passwordAgain = this.createUserForm.value.passwordAgain;

    // Check if passwords match
    if (this.password !== this.passwordAgain) {
      this.errorMessagePassword = true;
    } else {
      this.errorMessagePassword = false;

      // Construct new user object
      this.newUser = {
        id: "",
        firstName: this.documentHandler.makeUpperCaseUserName(this.createUserForm.value.firstName),
        lastName: this.documentHandler.makeUpperCaseUserName(this.createUserForm.value.lastName),
        email: this.createUserForm.value.email,
        phone: this.createUserForm.value.phone,
        isAdmin: false,
        deleted: false
      }
      this.password = this.createUserForm.value.password;

      // Register the user
      this.authService.register(this.newUser.email,
        this.newUser.firstName,
        this.newUser.lastName,
        this.newUser.phone,
        this.password
      ).then((resolve) => {
        if (resolve) {
          this.authService.logOut();
          this.errorMessage = false;
          this.errorMessagePassword = false;

          // Open dialog to notify user about email verification
          this.dialog.open(SuccessfullDialogComponent, {
            data: {
              text: SuccessFullDialogText.VERRIFY_EMAIL_SENT,
              needToGoPrevoiusPage: true
            }
          })
        } else {
          this.errorMessagePassword = false;
          this.errorMessage = true;
        }
      }).catch(() => {
        this.errorMessagePassword = false;
        this.errorMessage = true;
      })
    }
  }

  // Navigate to login page
  goToLogin() {
    this.location.back();
    this.router.navigate(['/auth/login']);
  }

  goToDataManagement() {

  }
}
