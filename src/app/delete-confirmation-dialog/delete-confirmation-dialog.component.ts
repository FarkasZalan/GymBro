import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EditShippingAddressComponent } from '../profile/profile-shipping-address/edit-shipping-address/edit-shipping-address.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-delete-confirmation-dialog',
  templateUrl: './delete-confirmation-dialog.component.html',
  styleUrl: '../../styles/delete-dialog.scss'
})
export class DeleteConfirmationDialogComponent {
  // e.g., delte product, delete shipping address, etc.
  operation: string = "";

  // the text to display on dialog
  text: string = "";

  constructor(public dialogRef: MatDialogRef<EditShippingAddressComponent>, @Inject(MAT_DIALOG_DATA) public data, private translate: TranslateService) {
    dialogRef.disableClose = true;
    this.operation = data.text;
  }

  ngOnInit(): void {
    this.operation = this.data.text;

    // Subscribe to language change events to re-translate dialog text
    this.translate.onLangChange.subscribe(() => {
      this.text = this.translate.instant(this.operation);
    });
    this.text = this.translate.instant(this.operation);
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
