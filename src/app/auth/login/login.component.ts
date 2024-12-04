import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Location } from '@angular/common';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { SuccessfullDialogComponent } from '../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../successfull-dialog/sucessfull-dialog-text';
import { trigger, transition, style, animate } from '@angular/animations';
import { LoadingService } from '../../loading-spinner/loading.service';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
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
export class LoginComponent {
  @ViewChild('form') loginForm: NgForm;

  email = "";
  password = "";
  errorMessage: boolean = false;
  notVerrifiedError: boolean = false;
  verificationLinkSentText = this.translate.instant('auth.verificationLinkSent');

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private location: Location,
    public loadingService: LoadingService,
    private translate: TranslateService,
    private functions: AngularFireFunctions
  ) { }

  // Method to handle user login
  async login() {
    await this.loadingService.withLoading(async () => {
      this.email = this.loginForm.value.email;
      this.password = this.loginForm.value.password;

      // Authenticate user
      const success = await this.authService.login(this.email, this.password);

      if (success === true) {
        this.errorMessage = false;
        this.router.navigate(['/']);
      } else if (success === false) {
        this.errorMessage = true;
        this.notVerrifiedError = false;
      } else if (success === null) {
        this.notVerrifiedError = true;
        this.authService.logOut();
        this.errorMessage = false;
      }
    });
  }

  // Navigate to registration page
  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  async reSendVerificationLink() {
    await this.loadingService.withLoading(async () => {
      await this.authService.login(this.email, this.password);
      //await this.authService.sendEmailVerification();
      this.authService.logOut();

      // Open dialog to notify user about email verification
      const dialogRef = this.dialog.open(SuccessfullDialogComponent, {
        data: {
          text: SuccessFullDialogText.RE_SEND_VERIFY_EMAIL,
          needToGoPrevoiusPage: false
        }
      });

      dialogRef.afterClosed().subscribe(async result => {
        // send the confirmation email to order status changed
        return await this.sendEmail({
          userEmail: this.email,
          subject: this.verificationLinkSentText,
          template: `
              // TODO
              `
        });
      });
    });
  }

  // Function to call the sendEmail cloud function
  async sendEmail(
    emailData: {
      userEmail: string;
      subject: string;
      template: string;
    }
  ) {
    const sendEmailFunction = this.functions.httpsCallable('sendEmail');
    await sendEmailFunction(emailData).toPromise();
  }

  goToItems() {
    this.location.back();
    this.router.navigate(['/']);
  }

  forgotPassword() {
    this.email = this.loginForm.value.email;

    // Pass the email to the dialog for password recovery
    this.dialog.open(ForgotPasswordComponent, {
      data: {
        email: this.email
      }
    });
  }
}
