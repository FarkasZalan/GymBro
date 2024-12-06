import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { SuccessfullDialogComponent } from '../../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../../successfull-dialog/sucessfull-dialog-text';
import { User } from '../../user.model';
import { DocumentHandlerService } from '../../../document.handler.service';
import { UserService } from '../../user.service';
import { LoadingService } from '../../../loading-spinner/loading.service';

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

  // save the user loyalty points data
  loyaltyPoints: number;
  is10PercentDiscountActive: boolean;
  is20PercentDiscountActive: boolean;
  is30PercentDiscountActive: boolean;
  isFreeShippingActive: boolean;
  is5000HufDiscountActive: boolean;

  // for error handleing
  errorMessage: boolean = false;

  showPassword: boolean = false; // For password visibility
  showConfirmPassword: boolean = false; // For confirm password visibility

  constructor(
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data,
    private documentumHandler: DocumentHandlerService,
    private userService: UserService,
    public loadingService: LoadingService
  ) {
    this.initializeComponent();
  }

  private async initializeComponent() {
    await this.loadingService.withLoading(async () => {
      this.modifyUserId = this.data.userId;

      // Fetch user details by ID when the component initializes
      this.documentumHandler.getDocumentByID("users", this.modifyUserId).subscribe((user: User) => {
        this.modifyUser = user;
        this.loyaltyPoints = this.modifyUser.loyaltyPoints;
        this.is10PercentDiscountActive = this.modifyUser.is10PercentDiscountActive;
        this.is20PercentDiscountActive = this.modifyUser.is20PercentDiscountActive;
        this.is30PercentDiscountActive = this.modifyUser.is30PercentDiscountActive;
        this.is5000HufDiscountActive = this.modifyUser.is5000HufDiscountActive;
        this.isFreeShippingActive = this.modifyUser.isFreeShippingActive;
        this.userIsAdmin = this.modifyUser.isAdmin;
      });
    });
  }

  async changeData() {
    await this.loadingService.withLoading(async () => {
      // Retrieve password and confirmation from the form
      this.password = this.modifyUserForm.value.password;
      this.passwordAgain = this.modifyUserForm.value.passwordAgain;

      if (this.password !== this.passwordAgain) {
        this.errorMessage = true;
        return;
      }

      // Update password if valid
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
        loyaltyPoints: this.loyaltyPoints,
        is10PercentDiscountActive: this.is10PercentDiscountActive,
        is20PercentDiscountActive: this.is20PercentDiscountActive,
        is30PercentDiscountActive: this.is30PercentDiscountActive,
        is5000HufDiscountActive: this.is5000HufDiscountActive,
        isFreeShippingActive: this.isFreeShippingActive,
        emailVerified: false
      }

      // Update user details and handle response
      const modified = await this.userService.updateUser(this.modifyUser);

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

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
