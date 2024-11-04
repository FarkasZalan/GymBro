import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ForgotPasswordComponent } from '../auth/forgot-password/forgot-password.component';
import { ProductViewText } from '../admin-profile/product-management/product-view-texts';
import { Filter } from './filter.model';

@Component({
  selector: 'app-filter-page',
  templateUrl: './filter-page.component.html',
  styleUrl: './filter-page.component.scss'
})
export class FilterPageComponent {
  errorMessage: boolean = false;

  editFilter: boolean = false;

  isBlogFilter: boolean = false;

  filterObject: Filter;

  // order by
  availableOrders: string[] = [];
  selectedOrder: string = ProductViewText.ORDER_BY_LATEST;
  isOrderByDropdownOpen: boolean = false;

  // language
  availableLanguage: string[] = [];
  selectedLanguage: string = '';
  isLanguageDropdownOpen: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data, public dialog: MatDialog, public dialogRef: MatDialogRef<ForgotPasswordComponent>) {
    this.filterObject = data.filter;
    if (this.filterObject.language !== '' || this.filterObject.orderBy !== '') {
      this.editFilter = true;
    }
    this.selectedLanguage = this.filterObject.language;
    this.selectedOrder = this.filterObject.orderBy;

    if (data.fromPage === ProductViewText.BLOG) {
      this.isBlogFilter = true;
      this.availableOrders = [
        ProductViewText.ORDER_BY_LATEST,
        ProductViewText.ORDER_BY_OLDEST
      ];

      this.availableLanguage = [
        ProductViewText.HUNGARIAN,
        ProductViewText.ENGLISH
      ];
    }
  }

  toggleOrderDropdown() {
    this.isOrderByDropdownOpen = !this.isOrderByDropdownOpen;
  }

  toggleLanguageDropdown() {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  filter() {
    this.filterObject = {
      orderBy: this.selectedOrder,
      language: this.selectedLanguage
    }
    this.dialogRef.close(this.filterObject);
  }

  deleteFilter() {
    this.dialogRef.close(true);
  }

  back() {
    this.dialog.closeAll();
  }
}
