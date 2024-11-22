import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChangeProfileComponent } from './change-profile/change-profile.component';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../../auth/auth.service';
import { User } from '../user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-list',
  templateUrl: './profile-list.component.html',
  styleUrl: '../../../styles/basic-form.scss',
})
export class ProfileListComponent implements OnInit {
  // display user details
  user: User;

  // add to the change details dialog
  userId: string = "";

  constructor(private dialog: MatDialog,
    private auth: AngularFireAuth,
    private authService: AuthService,
    private router: Router) { }

  ngOnInit(): void {
    //load the current user
    this.auth.authState.subscribe((userAuth) => {
      if (userAuth) {
        this.authService.getCurrentUser(userAuth.uid).subscribe((currentUser: User) => {
          this.user = currentUser;
          this.userId = this.user.id;

          // if no user logged-in then redirect to home page
          if (this.userId === null) {
            this.authService.logOut();
            this.dialog.closeAll();
            this.router.navigate(['/home']);
          }
        })
      }
    })
  }

  // open the change profile dialog
  goToChangeData() {
    this.dialog.open(ChangeProfileComponent, {
      data: {
        userId: this.userId
      }
    });
  }
}
