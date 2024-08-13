import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-log-out',
  templateUrl: './log-out.component.html',
  styleUrl: './log-out.component.scss'
})
export class LogOutComponent {
  constructor(private authService: AuthService, private dialog: MatDialog) { }

  logOut() {
    this.authService.logOut();
    this.dialog.closeAll();
  }

  cancel() {
    this.dialog.closeAll();
  }
}
