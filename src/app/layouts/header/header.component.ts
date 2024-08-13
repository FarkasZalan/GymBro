import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { NbMenuService, NbSidebarService } from '@nebular/theme';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../user/user.model';
import { filter, tap } from 'rxjs';
import { LogOutComponent } from '../../auth/log-out/log-out.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  userLoggedIn: boolean = false;
  userMenu = [];
  user: User;

  constructor(private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private auth: AngularFireAuth,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    //load the current user
    this.auth.authState.subscribe((userAuth) => {
      if (userAuth) {
        this.userLoggedIn = true;
        this.authService.getCurrentUser(userAuth.uid).subscribe((currentUser: User) => {
          this.user = currentUser;
        })
      } else {
        this.userLoggedIn = false;
      }
    })

    this.userMenu = [
      { title: 'Profil' },
      { title: 'Kijelentkezés' }
    ];

    this.menuService.onItemClick()
      .pipe(
        //the 'header-menu' tag is for the html to the nbContextMenuTag, this is a click listener for this menu
        filter(({ tag }) => tag === 'header-menu'),
        tap(({ item }) => {
          if (item.title === 'Kijelentkezés') {
            this.logOut();
          } else {
            this.router.navigate(['profile']);
          }
        })
      ).subscribe()
  }

  //hamburger icon
  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');

    return false;
  }

  //click to logo and then navigate home
  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  //go to login
  navigateToLogin() {
    this.router.navigate(['/auth']);
  }

  //display dialog when click log out in the header
  logOut() {
    this.dialog.open(LogOutComponent);
  }
}
