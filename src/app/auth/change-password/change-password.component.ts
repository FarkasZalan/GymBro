import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { SuccessFullDialogText } from '../../successfull-dialog/sucessfull-dialog-text';
import { SuccessfullDialogComponent } from '../../successfull-dialog/successfull-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { async, firstValueFrom } from 'rxjs';
import { Verification } from '../verification.model';
import { Timestamp } from 'firebase/firestore';
import { User } from '../../profile/user.model';
import { trigger, transition, style, animate } from '@angular/animations';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { LoadingService } from '../../loading-spinner/loading.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  animations: [
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ]
})
export class ChangePasswordComponent implements OnInit {
  @ViewChild('form') changePasswordForm: NgForm;
  token: string = '';
  tokenExists: boolean = true;
  verrifiedUser: User;

  userId: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  email: string = '';

  errorMessagePassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    public loadingService: LoadingService,
    private router: Router,
    private db: AngularFirestore,
    private route: ActivatedRoute,
    private authService: AuthService,
    private dialog: MatDialog,
    private functions: AngularFireFunctions
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (this.token) {
      this.verifyToken(this.token);
    }
  }

  async verifyToken(token: string) {
    try {
      // Step 1: Fetch the verification token from Firestore
      const verification = await firstValueFrom(this.authService.getUserToken(token)) as Verification;

      if (verification) {
        this.email = verification.email;
        // Check if the token is expired
        const isExpired = verification.expiresAt <= Timestamp.now().toMillis();

        // Step 4: Delete the token
        await this.db.collection('emailTokens').doc(verification.token).delete();

        // Step 5: Set the final email verification state
        this.tokenExists = !isExpired;
      } else {
        // Verification token not found
        this.tokenExists = false;
      }
    } catch (error) {
      this.tokenExists = false;
    }
  }

  async onChangePassword() {
    this.newPassword = this.changePasswordForm.value.newPassword;
    this.confirmPassword = this.changePasswordForm.value.confirmPassword;
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessagePassword = true;
      return;
    }

    try {
      // Fetch user by email to get userId
      const user = await this.authService.getUserByEmail(this.email);
      if (user) {
        this.userId = user.id; // Assuming 'id' is the field for user ID
      } else {
        this.errorMessagePassword = true; // Handle case where user is not found
        return;
      }

      // Start loading
      await this.loadingService.withLoading(async () => {
        const result = await this.functions.httpsCallable('changePassword')({
          userId: this.userId,
          newPassword: this.newPassword
        }).toPromise();

        if (!result) {
          this.errorMessagePassword = true;
          return;
        }
      });

      // Open success dialog with a message
      this.dialog.open(SuccessfullDialogComponent, {
        data: {
          text: SuccessFullDialogText.MODIFIED_TEXT,
          needToGoPrevoiusPage: false
        }
      });

      // Optionally navigate to login or another page
      this.goToLogin();
    } catch (error) {
      this.errorMessagePassword = true;
    }
  }

  toggleNewPassword(isHolding: boolean) {
    this.showNewPassword = isHolding;
  }

  toggleConfirmPassword(isHolding: boolean) {
    this.showConfirmPassword = isHolding;
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
