import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { SuccessfullDialogComponent } from '../../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../../successfull-dialog/sucessfull-dialog-text';
import { User } from '../../../user/user.model';
import { DocumentHandlerService } from '../../../document.handler.service';

@Component({
  selector: 'app-change-profile',
  templateUrl: './change-profile.component.html',
  styleUrl: '../../../../styles/basic-form.scss'
})
export class ChangeProfileComponent {
  @ViewChild('form') modifyUserForm: NgForm;
  modifyUserId: string = "";
  modifyUser: User;
  password: string;
  passwordAgain: string;
  firstName: string;
  lastName: string;
  phone: string;
  errorMessage: boolean = false;

  constructor(private authService: AuthService, private router: Router,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data,
    private documentumHandler: DocumentHandlerService) {
    this.modifyUserId = data.userId;
    this.documentumHandler.getDocumentByID("users", this.modifyUserId).subscribe((user: User) => {
      this.modifyUser = user;
    });
  }

  changeData() {
    this.password = this.modifyUserForm.value.password;
    this.passwordAgain = this.modifyUserForm.value.passwordAgain;
    this.firstName = this.modifyUserForm.value.firstName;
    this.lastName = this.modifyUserForm.value.lastName;
    this.phone = this.modifyUserForm.value.phone;

    if (this.password !== this.passwordAgain) {
      this.errorMessage = true;
      console.log(this.password, "asd", this.passwordAgain)
    }
  }

  goToBack() {
    this.dialog.closeAll();
  }
}
