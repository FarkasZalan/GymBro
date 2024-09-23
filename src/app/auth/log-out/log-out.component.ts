import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-log-out',
  templateUrl: './log-out.component.html',
  styleUrl: './log-out.component.scss'
})
export class LogOutComponent {
  constructor(private authService: AuthService, private dialog: MatDialog, private router: Router) { }

  logOut() {
    this.authService.logOut();
    this.dialog.closeAll();
    this.router.navigate(['/home']);
  }

  cancel() {
    this.dialog.closeAll();
  }
}
