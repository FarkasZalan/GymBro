import { Component } from '@angular/core';
import { CreateShippingAddressComponent } from '../create-shipping-address/create-shipping-address.component';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-change-default-address-confirm-dialog',
  templateUrl: './change-default-address-confirm-dialog.component.html',
  styleUrl: '../../../../styles/confirm-dialog.scss'
})
export class ChangeDefaultAddressConfirmDialogComponent {

  constructor(public dialogRef: MatDialogRef<CreateShippingAddressComponent>) { }

  // Handle user actions, 
  // if true then can override the old default address 
  // and the curremt address will be the new default
  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
