import { Component, OnInit } from '@angular/core';
import { RegisterComponent } from '../register.component';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss'
})
export class TermsComponent implements OnInit {
  termsAccepted: boolean = false;  // Track if terms are accepted
  title: string = '';
  firstParagraphTitle: string = '';
  firstParagraph: string = '';
  secondParagraphTitle: string = '';
  secondParagraph: string = '';

  backButtonText: string = '';
  acceptButtonText: string = '';

  constructor(public dialogRef: MatDialogRef<RegisterComponent>, private translate: TranslateService) { }

  ngOnInit(): void {
    this.title = this.translate.instant('register.terms.title');
    this.firstParagraphTitle = this.translate.instant('register.terms.firstParagraphTitle');
    this.firstParagraph = this.translate.instant('register.terms.firstParagraph');
    this.secondParagraphTitle = this.translate.instant('register.terms.secondParagraphTitle');
    this.secondParagraph = this.translate.instant('register.terms.secondParagraph');
    this.backButtonText = this.translate.instant('register.terms.rejectText');
    this.acceptButtonText = this.translate.instant('register.terms.contiuneText');
  }

  // Method to handle acceptance of Terms of Service
  accept() {
    if (!this.termsAccepted) {
      this.termsAccepted = true;

      this.title = this.translate.instant('register.privacyPolicy.title');
      this.firstParagraphTitle = this.translate.instant('register.privacyPolicy.firstParagraphTitle');
      this.firstParagraph = this.translate.instant('register.privacyPolicy.firstParagraph');
      this.secondParagraphTitle = this.translate.instant('register.privacyPolicy.secondParagraphTitle');
      this.secondParagraph = this.translate.instant('register.privacyPolicy.secondParagraph');
      this.acceptButtonText = this.translate.instant('register.privacyPolicy.acceptText');
      this.backButtonText = this.translate.instant('loginPage.back');
    } else {
      this.dialogRef.close(true);
    }
  }

  // Method to handle rejection
  reject() {
    if (this.termsAccepted) {
      this.termsAccepted = false;
      this.ngOnInit();
    } else {
      this.dialogRef.close(false);
    }
  }
}
