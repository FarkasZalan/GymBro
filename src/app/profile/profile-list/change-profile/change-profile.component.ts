import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { SuccessfullDialogComponent } from '../../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../../successfull-dialog/sucessfull-dialog-text';
import { User } from '../../../user/user.model';
import { DocumentHandlerService } from '../../../document.handler.service';
import { UserService } from '../../../user/user.service';

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
  errorMessage: boolean = false;

  constructor(private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data,
    private documentumHandler: DocumentHandlerService,
    private userService: UserService) {
    this.modifyUserId = data.userId;
    this.documentumHandler.getDocumentByID("users", this.modifyUserId).subscribe((user: User) => {
      this.modifyUser = user;
    });
  }

  async changeData() {
    this.password = this.modifyUserForm.value.password;
    this.passwordAgain = this.modifyUserForm.value.passwordAgain;

    if (this.password !== this.passwordAgain) {
      this.errorMessage = true;
    }

    if (this.password !== "" && this.password !== null && this.password === this.passwordAgain) {
      await this.userService.updatePassword(this.password);
    }

    this.modifyUser = {
      id: this.modifyUserId,
      firstName: this.modifyUserForm.value.firstName,
      lastName: this.modifyUserForm.value.lastName,
      email: this.modifyUser.email,
      phone: this.modifyUserForm.value.phone,
      deleted: false
    }

    this.userService.updateUser(this.modifyUser).then((modified) => {
      if (modified) {
        this.errorMessage = false;
        this.goToBack();
        console.log("why")
        this.dialog.open(SuccessfullDialogComponent, {
          data: {
            text: SuccessFullDialogText.MODIFIED_TEXT,
            needToGoPrevoiusPage: false
          }
        });
      } else {
        this.errorMessage = true;
      }
    });
  }

  goToBack() {
    this.dialog.closeAll();
  }
}
