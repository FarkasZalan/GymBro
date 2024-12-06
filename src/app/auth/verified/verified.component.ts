import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../auth.service';
import { Verification } from '../verification.model';
import { Timestamp } from 'firebase/firestore';
import { User } from '../../profile/user.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-verified',
  templateUrl: './verified.component.html',
  styleUrl: './verified.component.scss'
})
export class VerifiedComponent {
  token: string = '';
  emailHasBeenVerified = true;

  verificationObject: Verification;

  verrifiedUser: User;

  verificationLinkSentText = this.translate.instant('register.verificationLinkSent');
  emailVerification = this.translate.instant('register.emailVerification');
  emailVerificationFromLoginText = this.translate.instant('register.emailVerificationFromLoginText');
  verifyEmailButtonText = this.translate.instant('register.verifyEmailButtonText');
  ignoreEmailVerification = this.translate.instant('register.ignoreEmailVerification');
  thankYouText = this.translate.instant('register.thankYouText');

  constructor(
    private router: Router,
    private db: AngularFirestore,
    private route: ActivatedRoute,
    private authService: AuthService,
    private translate: TranslateService
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

        // Step 2: Fetch the user by email
        const users = await firstValueFrom(this.authService.getUserByEmail(verification.email));

        if (users && users.length > 0) {
          this.verrifiedUser = users[0];

          // Step 3: Update the user's emailVerified status
          await this.db.collection('users').doc(this.verrifiedUser.id).update({ emailVerified: true });

          // Step 4: Delete the token
          await this.db.collection('emailTokens').doc(verification.token).delete();

          // Step 5: Set the final email verification state
          this.emailHasBeenVerified = !isExpired;
        } else {
          // No user found
          this.emailHasBeenVerified = false;
        }
      } else {
        // Verification token not found
        this.emailHasBeenVerified = false;
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      this.emailHasBeenVerified = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
