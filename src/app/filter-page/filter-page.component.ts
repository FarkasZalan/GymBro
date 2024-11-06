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

  filterObject: Filter;

  // page from
  isBlog: boolean = false;
  isFoodSupliments: boolean = false;
  isOrganicFood: boolean = false;
  isClothes: boolean = false;
  isAccessories: boolean = false;

  // order by
  availableOrders: string[] = [
    ProductViewText.ORDER_BY_LATEST,
    ProductViewText.ORDER_BY_OLDEST
  ];
  selectedOrder: string = ProductViewText.ORDER_BY_LATEST;
  isOrderByDropdownOpen: boolean = false;

  // language
  availableLanguage: string[] = [
    ProductViewText.HUNGARIAN,
    ProductViewText.ENGLISH
  ];
  selectedLanguage: string = '';
  isLanguageDropdownOpen: boolean = false;

  // category
  availableCategories: string[] = [];
  selectedCategory: string = '';
  isCategoryDropdownOpen: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data, public dialog: MatDialog, public dialogRef: MatDialogRef<ForgotPasswordComponent>) {
    this.filterObject = data.filter;
    if (this.filterObject.language !== '' || this.filterObject.orderBy !== '') {
      this.editFilter = true;
    }
    this.selectedLanguage = this.filterObject.language;
    this.selectedOrder = this.filterObject.orderBy;

    if (data.fromPage === ProductViewText.BLOG) {
      this.isBlog = true;
    } else if (data.fromPage === ProductViewText.FOOD_SUPLIMENTS) {
      this.isFoodSupliments = true;
      this.availableCategories = [
        ProductViewText.PROTEINS,
        ProductViewText.MASS_GAINERS,
        ProductViewText.AMINO_ACIDS,
        ProductViewText.CREATINES,
        ProductViewText.VITAMINS_AND_MINERALS,
        ProductViewText.JOIN_SUPPORT,
        ProductViewText.FAT_BURNERS
      ];
    } else if (data.fromPage === ProductViewText.ORGANIC_FOOD) {
      this.isOrganicFood = true;
      this.availableCategories = [
        ProductViewText.CEREALS,
        ProductViewText.HEALTHY_SNACKS,
        ProductViewText.COOKING_iNGREDIENTS,
        ProductViewText.DRINKS
      ];
    } else if (data.fromPage === ProductViewText.CLOTHES) {
      this.isClothes = true;
      this.availableCategories = [
        ProductViewText.MAN_CLOTHES,
        ProductViewText.WOMEN_CLOTHES,
      ];
    } else if (data.fromPage === ProductViewText.ACCESSORIES) {
      this.isAccessories = true;
      this.availableCategories = [
        ProductViewText.SHAKERS_AND_SPORTS_EQUIPMENTS
      ];
      this.selectedCategory = ProductViewText.SHAKERS_AND_SPORTS_EQUIPMENTS
    }
  }

  toggleOrderDropdown() {
    this.isOrderByDropdownOpen = !this.isOrderByDropdownOpen;
  }

  toggleLanguageDropdown() {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
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
