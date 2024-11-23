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
export class SuccessfullDialogComponent implements OnInit {

  // e.g., email sent, modification, etc.
  operation: string = "";

  // Text to display on the UI
  text: string = "";
  buttonText: string = "";

  constructor(private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data, private translate: TranslateService, private location: Location) {
    this.operation = data.text;
  }

  ngOnInit(): void {
    this.operation = this.data.text;

    // Subscribe to language change events to re-translate dialog text
    this.translate.onLangChange.subscribe(() => {
      this.translateText();
    });
    this.translateText();
  }

  // Method to translate dialog text based on the operation type
  translateText() {
    if (this.operation === SuccessFullDialogText.PASSWORD_EMAIL_SENT) {
      this.text = this.translate.instant("succesfullDialog.passwordEmailSent");
      this.buttonText = this.translate.instant("succesfullDialog.backToLogin");
    }
    if (this.operation === SuccessFullDialogText.VERRIFY_EMAIL_SENT) {
      this.text = this.translate.instant("succesfullDialog.verrifyEmail");
      this.buttonText = this.translate.instant("succesfullDialog.backToLogin");
    }
    if (this.operation === SuccessFullDialogText.RE_SEND_VERIFY_EMAIL) {
      this.text = this.translate.instant("succesfullDialog.reSendVerifyEmail");
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
    if (this.operation === SuccessFullDialogText.REVIEW_CREATED) {
      this.text = this.translate.instant("succesfullDialog.reviewCreated");
      this.buttonText = this.translate.instant("succesfullDialog.ok");
    }
    if (this.operation === SuccessFullDialogText.REVIEW_EDITED) {
      this.text = this.translate.instant("succesfullDialog.reviewEdited");
      this.buttonText = this.translate.instant("succesfullDialog.ok");
    }
    if (this.operation === SuccessFullDialogText.REVIEW_DELETED) {
      this.text = this.translate.instant("succesfullDialog.reviewDeleted");
      this.buttonText = this.translate.instant("succesfullDialog.ok");
    }
    if (this.operation === SuccessFullDialogText.RESPONSE_CREATED) {
      this.text = this.translate.instant("succesfullDialog.responseCreated");
      this.buttonText = this.translate.instant("succesfullDialog.ok");
    }
    if (this.operation === SuccessFullDialogText.RESPONSE_EDITED) {
      this.text = this.translate.instant("succesfullDialog.responseEdited");
      this.buttonText = this.translate.instant("succesfullDialog.ok");
    }
    if (this.operation === SuccessFullDialogText.RESPONSE_DELETED) {
      this.text = this.translate.instant("succesfullDialog.responseDeleted");
      this.buttonText = this.translate.instant("succesfullDialog.ok");
    }
    if (this.operation === SuccessFullDialogText.REWARD_REDEEMED) {
      this.text = this.translate.instant("succesfullDialog.rewardRedeemed");
      this.buttonText = this.translate.instant("succesfullDialog.ok");
    }
    if (this.operation === SuccessFullDialogText.REWARD_CANCELLED) {
      this.text = this.translate.instant("succesfullDialog.rewardCancelled");
      this.buttonText = this.translate.instant("succesfullDialog.ok");
    }
  }

  // Method to hide the dialog and optionally navigate back to the previous page
  hideDialog() {
    this.dialog.closeAll();
    if (this.data.needToGoPrevoiusPage === true) {
      this.location.back();
    }
  }
}
