import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { SuccessFullDialogText } from './sucessfull-dialog-text';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-successfull-dialog',
  templateUrl: './successfull-dialog.component.html',
  styleUrl: './successfull-dialog.component.scss'
})
export class SuccessfullDialogComponent {

  operation: string = "";
  text: string = "";
  buttonText: string = "";

  constructor(private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data, private translate: TranslateService, private location: Location) {
    this.operation = data.text;
  }

  ngOnInit(): void {
    this.operation = this.data.text;
    this.translate.onLangChange.subscribe(() => {
      this.translateText();
    });
    this.translateText();
  }

  translateText() {
    if (this.operation === SuccessFullDialogText.PASSWORD_EMAIL_SENT) {
      this.text = this.translate.instant("succesfullDialog.passwordEmailSent");
      this.buttonText = this.translate.instant("succesfullDialog.backToLogin");
    }
    if (this.operation === SuccessFullDialogText.VERRIFY_EMAIL_SENT) {
      this.text = this.translate.instant("succesfullDialog.verrifyEmail");
      console.log(this.text)
      this.buttonText = this.translate.instant("succesfullDialog.backToLogin");
    }
    if (this.operation === SuccessFullDialogText.MODIFIED_TEXT) {
      this.text = this.translate.instant("succesfullDialog.modificationSuccessfull");
      this.buttonText = this.translate.instant("succesfullDialog.ok");
    }
    if (this.operation === SuccessFullDialogText.DELETED_TEXT) {
      this.text = this.translate.instant("succesfullDialog.deletionSuccessfull");
      this.buttonText = this.translate.instant("succesfullDialog.ok");
    }
    if (this.operation === SuccessFullDialogText.CREATED_TEXT) {
      this.text = this.translate.instant("succesfullDialog.creationSuccessfull");
      this.buttonText = this.translate.instant("succesfullDialog.ok");
    }
  }

  hideDialog() {
    this.dialog.closeAll();
    if (this.data.needToGoPrevoiusPage === true) {
      this.location.back();
    }
  }
}
