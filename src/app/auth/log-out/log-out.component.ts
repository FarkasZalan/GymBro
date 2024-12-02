import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-log-out',
  templateUrl: './log-out.component.html',
  styleUrl: './log-out.component.scss'
})
export class LogOutComponent {
  constructor(private authService: AuthService, private dialog: MatDialog, private router: Router, public dialogRef: MatDialogRef<LogOutComponent>) {
    dialogRef.disableClose = true;
  }

  // Handle logout and navigate to home
  logOut() {
    this.authService.logOut();
    this.cancel();
    this.router.navigate(['/']);
  }

  cancel() {
    this.dialog.closeAll();
  }
}
