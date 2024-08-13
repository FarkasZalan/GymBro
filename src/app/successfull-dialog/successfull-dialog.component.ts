import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { SuccessFullDialogText } from './sucessfull-dialog-text';

@Component({
  selector: 'ngx-successfull-dialog',
  templateUrl: './successfull-dialog.component.html',
  styleUrl: './successfull-dialog.component.scss'
})
export class SuccessfullDialogComponent {
  text: string = "";
  buttonText: string = "";

  constructor(private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data, private location: Location) {
    this.text = data.text;
    if (data.buttonText !== null) {
      this.buttonText = data.buttonText;
    }
  }

  hideDialog() {
    this.dialog.closeAll();
    if (this.data.needToGoPrevoiusPage === true) {
      this.location.back();
    }
  }
}
