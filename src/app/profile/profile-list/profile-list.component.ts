import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChangeProfileComponent } from './change-profile/change-profile.component';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../user/user.model';

@Component({
  selector: 'app-profile-list',
  templateUrl: './profile-list.component.html',
  styleUrl: '../../../styles/basic-form.scss',
})
export class ProfileListComponent implements OnInit {

  user: User;
  userId: string = "";
  isCollapsed = true;

  constructor(private dialog: MatDialog,
    private auth: AngularFireAuth,
    private authService: AuthService,) { }

  ngOnInit(): void {
    //load the current user
    this.auth.authState.subscribe((userAuth) => {
      if (userAuth) {
        this.authService.getCurrentUser(userAuth.uid).subscribe((currentUser: User) => {
          this.user = currentUser;
          this.userId = this.user.id;
        })
      }
    })
  }

  goToChangeData() {
    this.dialog.open(ChangeProfileComponent, {
      data: {
        userId: this.userId
      }
    });
  }
}
