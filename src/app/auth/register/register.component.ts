import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
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
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { TranslateService } from '@ngx-translate/core';
import { DefaultImageUrl } from '../../admin-profile/default-image-url';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase/firestore';
import { Verification } from '../verification.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';

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
export class RegisterComponent implements OnInit {
  @ViewChild('form') createUserForm: NgForm;  // Access the form for validation
  newUser: User;
  password: string = "";
  passwordAgain: string = "";
  showPassword: boolean = false; // For password visibility
  showConfirmPassword: boolean = false; // For confirm password visibility
  termsAccepted: boolean = false;

  verificationObject: Verification;

  verificationLinkSentText = this.translate.instant('register.welcomeText');
  welcome = this.translate.instant('register.welcome');
  emailVerificationFromRegisterText = this.translate.instant('register.emailVerificationFromRegisterText');
  verifyEmailButtonText = this.translate.instant('register.verifyEmailButtonText');
  ignoreEmailVerification = this.translate.instant('register.ignoreEmailVerification');
  thankYouText = this.translate.instant('register.thankYouText');
  dear = this.translate.instant('register.dear');

  // error handleing
  public errorMessage = false;
  errorMessagePassword: boolean = false;

  // responsibility
  isLargeScreen: boolean = false;

  constructor(
    private authService: AuthService,
    public loadingService: LoadingService,
    private router: Router,
    private dialog: MatDialog,
    private documentHandler: DocumentHandlerService,
    private location: Location,
    private translate: TranslateService,
    private functions: AngularFireFunctions,
    private db: AngularFirestore
  ) { }

  ngOnInit(): void {
    this.checkScreenSize();
  }

  // display in 1 column the form fields on smaller screens and 2 columns on larger screens
  @HostListener('window:resize', [])
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isLargeScreen = window.innerWidth > 850;
  }

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
          emailVerified: false
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

          const dialogRef = this.dialog.open(SuccessfullDialogComponent, {
            data: {
              text: SuccessFullDialogText.VERRIFY_EMAIL_SENT,
              needToGoPrevoiusPage: true
            }
          });

          dialogRef.afterClosed().subscribe(async result => {
            // verification url
            const generatedToken = uuidv4();
            this.saveToken(generatedToken);
            const verificationUrl = `${window.location.origin}/auth/verify/${generatedToken}`;
            // send the confirmation email to order status changed
            return await this.sendEmail({
              userEmail: this.newUser.email,
              subject: this.verificationLinkSentText,
              template: `
                <table style="width: 100%; max-width: 800px; margin: auto; border-collapse: collapse; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px;">
                  <tr>
                    <td style="padding: 20px; text-align: center;">
                      <h2 style="color: #0b8e92;">${this.welcome}</h2>
                      <p style="color: #000000;">${this.dear} ${this.newUser.firstName} ${this.newUser.lastName},</p>
                      <p style="color: #000000; margin-bottom: 30px;">${this.emailVerificationFromRegisterText}</p>
                      <p>
                        <a href="${verificationUrl}"style="background-color: #0b8e92; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">${this.verifyEmailButtonText}</a>
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
        } else {
          this.errorMessagePassword = false;
          this.errorMessage = true;
        }
      }
    });
  }

  // Save the token to Firestore
  async saveToken(token?: string) {

    this.verificationObject = {
      email: this.newUser.email,
      token: token,
      expiresAt: Timestamp.now().toMillis() + 5 * 60 * 1000 // 5 minutes from now
    };

    // Add the email verification token to Firestore
    await this.db.collection('emailTokens').doc(token).set(this.verificationObject);
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

  // Method to toggle password visibility
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
