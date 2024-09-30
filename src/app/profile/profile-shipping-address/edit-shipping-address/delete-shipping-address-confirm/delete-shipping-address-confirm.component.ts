import { Component } from '@angular/core';
import { EditShippingAddressComponent } from '../edit-shipping-address.component';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-shipping-address-confirm',
  templateUrl: './delete-shipping-address-confirm.component.html',
  styleUrl: './delete-shipping-address-confirm.component.scss'
})
export class DeleteShippingAddressConfirmComponent {
  constructor(public dialogRef: MatDialogRef<EditShippingAddressComponent>) {
    dialogRef.disableClose = true;
  }

  // Handle user actions, 
  // if true then delete the current shipping address
  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
