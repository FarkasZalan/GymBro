import { Component } from '@angular/core';
import { HandleFoodSuplimentsComponent } from '../handle-food-supliments/handle-food-supliments.component';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-change-default-price-confirm-dialog',
  templateUrl: './change-default-price-confirm-dialog.component.html',
  styleUrl: '../../../../../styles/confirm-dialog.scss'
})
export class ChangeDefaultPriceConfirmDialogComponent {
  openFromColorDialog: boolean = false;
  constructor(public dialogRef: MatDialogRef<HandleFoodSuplimentsComponent>) { }

  // Handle user actions, 
  // if true then can override the old default price/color 
  // and the curremt price/color will be the new default
  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
