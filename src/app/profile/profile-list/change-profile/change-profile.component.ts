import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { SuccessfullDialogComponent } from '../../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../../successfull-dialog/sucessfull-dialog-text';
import { User } from '../../user.model';
import { DocumentHandlerService } from '../../../document.handler.service';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-change-profile',
  templateUrl: './change-profile.component.html',
  styleUrl: '../../../../styles/basic-form.scss'
})
export class ChangeProfileComponent {
  @ViewChild('form') modifyUserForm: NgForm;
  modifyUserId: string = "";
  modifyUser: User;
  userIsAdmin: boolean;
  password: string;
  passwordAgain: string;

  // for error handleing
  errorMessage: boolean = false;

  constructor(
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data,
    private documentumHandler: DocumentHandlerService,
    private userService: UserService
  ) {
    this.modifyUserId = data.userId;

    // Fetch user details by ID when the component initializes
    this.documentumHandler.getDocumentByID("users", this.modifyUserId).subscribe((user: User) => {
      this.modifyUser = user;
      this.userIsAdmin = this.modifyUser.isAdmin;
    });
  }

  async changeData() {
    // Retrieve password and confirmation from the form
    this.password = this.modifyUserForm.value.password;
    this.passwordAgain = this.modifyUserForm.value.passwordAgain;

    if (this.password !== this.passwordAgain) {
      this.errorMessage = true;
    }

    // Update password in the backend if valid
    if (this.password !== "" && this.password !== null && this.password === this.passwordAgain) {
      await this.userService.updatePassword(this.password);
    }

    // Create an updated user object
    this.modifyUser = {
      id: this.modifyUserId,
      firstName: this.modifyUserForm.value.firstName,
      lastName: this.modifyUserForm.value.lastName,
      email: this.modifyUser.email,
      phone: this.modifyUserForm.value.phone,
      isAdmin: this.userIsAdmin,
      deleted: false
    }

    // Update user details and handle response
    this.userService.updateUser(this.modifyUser).then((modified) => {
      if (modified) {
        this.errorMessage = false;
        this.goToBack();

        // Open success dialog with a message
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
