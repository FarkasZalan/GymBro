import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { User } from '../../profile/user.model';
import { SuccessfullDialogComponent } from '../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../successfull-dialog/sucessfull-dialog-text';
import { DocumentHandlerService } from '../../document.handler.service';
import { Location } from '@angular/common';
import { TermsComponent } from './terms/terms.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { LoadingService } from '../../loading-spinner/loading.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: '../../../styles/basic-form.scss',
  animations: [
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ]
})
export class RegisterComponent {
  @ViewChild('form') createUserForm: NgForm;  // Access the form for validation
  newUser: User;
  password: string = "";
  passwordAgain: string = "";
  termsAccepted: boolean = false;

  // error handleing
  public errorMessage = false;
  errorMessagePassword: boolean = false;

  constructor(
    private authService: AuthService,
    public loadingService: LoadingService,
    private router: Router,
    private dialog: MatDialog,
    private documentHandler: DocumentHandlerService,
    private location: Location
  ) { }

  // Method to handle user registration
  async register() {
    await this.loadingService.withLoading(async () => {
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
          loyaltyPoints: 0,
          is10PercentDiscountActive: false,
          is20PercentDiscountActive: false,
          is30PercentDiscountActive: false,
          isFreeShippingActive: false,
          is5000HufDiscountActive: false,
          deleted: false
        }
        this.password = this.createUserForm.value.password;

        // Register the user
        const resolve = await this.authService.register(
          this.newUser.email,
          this.newUser.firstName,
          this.newUser.lastName,
          this.newUser.phone,
          this.password
        );

        if (resolve) {
          await this.authService.logOut();
          this.errorMessage = false;
          this.errorMessagePassword = false;

          this.dialog.open(SuccessfullDialogComponent, {
            data: {
              text: SuccessFullDialogText.VERRIFY_EMAIL_SENT,
              needToGoPrevoiusPage: true
            }
          });
        } else {
          this.errorMessagePassword = false;
          this.errorMessage = true;
        }
      }
    });
  }

  // Navigate to login page
  goToLogin() {
    this.location.back();
    this.router.navigate(['/auth/login']);
  }

  goToTermsDialog() {
    const dialogRef = this.dialog.open(TermsComponent);

    dialogRef.afterClosed().subscribe((termsAccepted: boolean) => {
      this.termsAccepted = termsAccepted;
    });
  }
}
