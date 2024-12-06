import { trigger, transition, style, animate } from "@angular/animations";
import { Component, ViewChild, Inject } from "@angular/core";
import { AngularFireFunctions } from "@angular/fire/compat/functions";
import { NgForm } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { LoadingService } from "../../loading-spinner/loading.service";
import { SuccessfullDialogComponent } from "../../successfull-dialog/successfull-dialog.component";
import { SuccessFullDialogText } from "../../successfull-dialog/sucessfull-dialog-text";
import { AuthService } from "../auth.service";
import { DefaultImageUrl } from "../../admin-profile/default-image-url";
import { Timestamp } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Verification } from "../verification.model";


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  animations: [
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ]
})
export class ForgotPasswordComponent {
  @ViewChild('form') loginForm: NgForm;  // Reference to the form for validation
  forgotPasswordText = this.translate.instant('register.forgotPasswordSent');

  passwordResetRequestText = this.translate.instant('register.passwordResetRequestText');
  passwordResetEmailText = this.translate.instant('register.passwordResetEmailText');
  resetPasswordButtonText = this.translate.instant('register.resetPasswordButtonText');
  ignoreEMailForgotPassword = this.translate.instant('register.ignoreEMailForgotPassword');
  thankYouText = this.translate.instant('register.thankYouText');

  // error handleing
  public errorMessage = false;

  emailToForgotPassword: string;
  emailSent = false;

  verificationObject: Verification;

  constructor(
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ForgotPasswordComponent>,
    public loadingService: LoadingService,
    private functions: AngularFireFunctions,
    private db: AngularFirestore,
    private translate: TranslateService
  ) {
    this.emailToForgotPassword = data.email; // Initialize email from injected data
  }

  // Method to initiate password recovery
  async forgotPassword() {
    await this.loadingService.withLoading(async () => {
      this.authService.logOut();

      // Open dialog to notify user about email verification
      const dialogRef = this.dialog.open(SuccessfullDialogComponent, {
        data: {
          text: SuccessFullDialogText.PASSWORD_EMAIL_SENT,
          needToGoPrevoiusPage: false
        }
      });

      dialogRef.afterClosed().subscribe(async result => {
        // verification url
        const generatedToken = uuidv4();
        this.saveToken(generatedToken);
        const changePasswordUrl = `${window.location.origin}/auth/change-password/${generatedToken}`;
        // send the confirmation email to order status changed
        return await this.sendEmail({
          userEmail: this.emailToForgotPassword,
          subject: this.forgotPasswordText,
          template: `
              <table style="width: 100%; max-width: 800px; margin: auto; border-collapse: collapse; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <h2 style="color: #0b8e92;">${this.passwordResetRequestText}</h2>
                    <p style="color: #000000; margin-bottom: 30px;"">${this.passwordResetEmailText}</p>
                    <p>
                      <a href="${changePasswordUrl}" style="background-color: #0b8e92; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">${this.resetPasswordButtonText}</a>
                    </p>
                    <p style="color: #000000;  margin-top: 50px;">${this.ignoreEMailForgotPassword}</p>
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

  // Save the token to Firestore
  async saveToken(token?: string) {

    this.verificationObject = {
      email: this.emailToForgotPassword,
      token: token,
      expiresAt: Timestamp.now().toMillis() + 5 * 60 * 1000 // 5 minutes from now
    };

    // Add the email verification token to Firestore
    await this.db.collection('emailTokens').doc(token).set(this.verificationObject);
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

  // Close all dialogs
  back() {
    this.dialog.closeAll();
  }
}
