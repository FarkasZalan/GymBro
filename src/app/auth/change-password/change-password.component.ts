import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../auth.service';
import { UserService } from '../../profile/user.service';
import { SuccessFullDialogText } from '../../successfull-dialog/sucessfull-dialog-text';
import { SuccessfullDialogComponent } from '../../successfull-dialog/successfull-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { Verification } from '../verification.model';
import { Timestamp } from 'firebase/firestore';
import { User } from '../../profile/user.model';
import { trigger, transition, style, animate } from '@angular/animations';
import { Location } from '@angular/common';

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
  token: string = '';
  tokenExists: boolean = true;
  verrifiedUser: User;

  newPassword: string = '';
  confirmPassword: string = '';

  errorMessagePassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private router: Router,
    private db: AngularFirestore,
    private route: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private dialog: MatDialog,
    private location: Location
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

  async onChangePassword(form: any) {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessagePassword = true
      return;
    }

    try {
      await this.userService.updatePassword(this.newPassword);

      // Open success dialog with a message
      this.dialog.open(SuccessfullDialogComponent, {
        data: {
          text: SuccessFullDialogText.MODIFIED_TEXT,
          needToGoPrevoiusPage: false
        }
      });
    } catch (error) {
      this.errorMessagePassword = true
    }
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
