import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Location } from '@angular/common';
import { SuccessfullDialogComponent } from '../../successfull-dialog/successfull-dialog.component';
import { SuccessFullDialogText } from '../../successfull-dialog/sucessfull-dialog-text';
import { trigger, transition, style, animate } from '@angular/animations';
import { LoadingService } from '../../loading-spinner/loading.service';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { TranslateService } from '@ngx-translate/core';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { EmailLink } from '../email-url';
import { DefaultImageUrl } from '../../admin-profile/default-image-url';

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
  verificationLinkSentText = this.translate.instant('register.verificationLinkSent');
  emailVerification = this.translate.instant('register.emailVerification');
  emailVerificationFromLoginText = this.translate.instant('register.emailVerificationFromLoginText');
  verifyEmailButtonText = this.translate.instant('register.verifyEmailButtonText');
  ignoreEmailVerification = this.translate.instant('register.ignoreEmailVerification');
  thankYouText = this.translate.instant('register.thankYouText');

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
            <table style="width: 100%; max-width: 800px; margin: auto; border-collapse: collapse; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px;">
              <tr>
                <td style="padding: 20px; text-align: center;">
                  <h2 style="color: #0b8e92;">${this.emailVerification}</h2>
                  <p style="color: #000000; margin-bottom: 30px;">${this.emailVerificationFromLoginText}</p>
                   <p>
                        <a href="${EmailLink.EMAIL_VERIFICATION}/${encodeURIComponent(this.email)}" style="background-color: #0b8e92; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">${this.verifyEmailButtonText}</a>
                      </p>
                  <p style="color: #000000; margin-top: 50px;">${this.ignoreEmailVerification}</p>
                  <p style="color: #000000;">${this.thankYouText}</p>
                  <img src="${DefaultImageUrl.logo}"
                  style="width: 150px; height: 150px; object-fit: cover; border-radius: 10px;">
                </td>
              </tr>
            </table>
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
