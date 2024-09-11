import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { User } from '../../user/user.model';
import { SuccessfullDialogComponent } from '../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../successfull-dialog/sucessfull-dialog-text';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: '../../../styles/basic-form.scss'
})
export class RegisterComponent {
  @ViewChild('form') createUserForm: NgForm;
  newUser: User;
  password: string = "";
  passwordAgain: string = "";
  public errorMessage = false;
  errorMessagePassword: boolean = false;

  constructor(private authService: AuthService, private router: Router, private dialog: MatDialog) { }

  register() {
    this.password = this.createUserForm.value.password;
    this.passwordAgain = this.createUserForm.value.passwordAgain;

    if (this.password !== this.passwordAgain) {
      this.errorMessagePassword = true;
    } else {
      this.errorMessagePassword = false;
      this.newUser = {
        id: "",
        firstName: this.createUserForm.value.firstName,
        lastName: this.createUserForm.value.lastName,
        email: this.createUserForm.value.email,
        phone: this.createUserForm.value.phone,
        deleted: false
      }
      this.password = this.createUserForm.value.password;
      this.authService.register(this.newUser.email,
        this.newUser.firstName, this.newUser.lastName, this.newUser.phone, this.password
      ).then((resolve) => {
        if (resolve) {
          this.authService.logOut();
          this.errorMessage = false;
          this.errorMessagePassword = false;
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
  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  goToDataManagement() {

  }
}
