import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ProductViewText } from '../../../../products/product-view-texts';
import { TranslateService } from '@ngx-translate/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AddPriceDialogComponent } from './add-price-dialog/add-price-dialog.component';
import { ProductPrice } from '../../../../products/product-models/product-price.model';
import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import { Vitamin } from '../../../../products/product-models/vitamin.model';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-create-food-supliements',
  templateUrl: './create-food-supliements.component.html',
  styleUrl: '../../../../../styles/product-management.scss',
  animations: [
    // name of tha animation what can call in html
    trigger('collapseField', [
      state('void', style({
        height: '0px', // Initially collapsed
        overflow: 'hidden'
      })),
      state('*', style({
        height: '*', // Expands to the full height of the content
        overflow: 'hidden'
      })),
      transition('void => *', [
        animate('250ms ease-out') // Expands smoothly
      ]),
      transition('* => void', [
        animate('250ms ease-in') // Collapses smoothly
      ])
    ])
  ]
})
export class CreateFoodSuplimentsComponent implements OnInit {
  @ViewChild('form') createFoodSuplimentForm: NgForm;  // Reference to the form for validation
  errorMessage: boolean;
  safeForConsumptionDuringPregnancy: boolean;
  safeForConsumptionDuringBreastfeeding: boolean;
  priceByWeight: boolean;
  male: boolean;

  selectedUnit: string = '';

  selectedCategory: string = '';
  selectedVitaminUnit: string = '';
  isProtein: boolean = false;
  isJoinSupport: boolean = false;
  isVitamin: boolean = false;

  vitaminList: Vitamin[] = [];
  vitaminName: string = '';
  vitaminQuantity: number;
  vitaminMissingFieldsError = false;

  productViewText = ProductViewText;

  productCategories: string[] = [ProductViewText.PROTEINS, ProductViewText.MASS_GAINERS, ProductViewText.AMINO_ACIDS, ProductViewText.CREATINES, ProductViewText.VITAMINS_AND_MINERALS, ProductViewText.JOIN_SUPPORT, ProductViewText.FAT_BURNERS];
  translatedCategories: string[] = [];

  // Available flavors
  availableFlavors: string[] = ['Unflavored', 'Vanilla', 'Chocolate', 'Strawberry', 'Mint', 'Peanut Butter'];

  // Selected flavors
  selectedFlavors: string[] = [];

  // Available allergenes
  availableAllergenes: string[] = ['Lactose', 'Gluten', 'Soy', 'Eggs', 'Added Sugars', 'Peanuts', 'Fish'];

  // Selected allergenes
  selectedAllergenes: string[] = [];

  productPrices: ProductPrice[] = [];

  constructor(private location: Location, private translate: TranslateService, public dialog: MatDialog, private changeDetector: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Subscribe to language change events to re-translate categories
    this.translate.onLangChange.subscribe(() => {
      this.translateAndSortItems();
    });
    this.translateAndSortItems();

    this.selectedFlavors = [];
  }

  // Method to translate and sort items by name
  translateAndSortItems(): void {
    // Translate each item in the array
    this.translatedCategories = this.productCategories.map(item => this.translate.instant(item));

    // Sort the translated items alphabetically
    this.translatedCategories.sort((a, b) => a.localeCompare(b));
  }

  isCategorySelected() {
    if (this.translate.instant(ProductViewText.PROTEINS) === this.selectedCategory) {
      this.isProtein = true;
      this.availableFlavors = ['Unflavored', 'Vanilla', 'Chocolate', 'Strawberry', 'Mint', 'Peanut Butter'];
      this.selectedFlavors = [];
      this.isVitamin = false;
      this.isJoinSupport = false;
    } else if (this.translate.instant(ProductViewText.JOIN_SUPPORT) === this.selectedCategory) {
      this.availableFlavors = ['Unflavored'];
      this.selectedFlavors = [this.availableFlavors[0]];
      this.isJoinSupport = true;
      this.isProtein = false;
    } else if (this.translate.instant(ProductViewText.VITAMINS_AND_MINERALS) === this.selectedCategory) {
      this.availableFlavors = ['Unflavored'];
      this.selectedFlavors = [this.availableFlavors[0]];
      this.isVitamin = true;
      this.isProtein = false;
    } else {
      this.isProtein = false;
      this.isJoinSupport = false;
      this.isVitamin = false;
      this.availableFlavors = ['Unflavored', 'Vanilla', 'Chocolate', 'Strawberry', 'Mint', 'Peanut Butter'];
      this.selectedFlavors = [];
    }

    // to detect the changes immidiately on the UI and update the flavors list
    this.changeDetector.detectChanges();
  }

  selectionOfTheList(type: string, item: string): void {
    if (type === ProductViewText.FLAVORS) {
      const index = this.selectedFlavors.indexOf(item);
      if (index > -1) {
        this.selectedFlavors.splice(index, 1); // Remove item if it is selected
      } else {
        this.selectedFlavors.push(item); // Add item if it is not selected
      }
    }

    if (type === ProductViewText.ALLERGENES) {
      const index = this.selectedAllergenes.indexOf(item);
      if (index > -1) {
        this.selectedAllergenes.splice(index, 1); // Remove item if it is selected
      } else {
        this.selectedAllergenes.push(item); // Add item if it is not selected
      }
    }
  }

  // Function to remove selected item
  removeItemFromTheList(type: string, item: string): void {
    if ((this.translate.instant(ProductViewText.JOIN_SUPPORT) !== this.selectedCategory) && (this.translate.instant(ProductViewText.VITAMINS_AND_MINERALS) !== this.selectedCategory)) {
      if (type === ProductViewText.FLAVORS) {
        const index = this.selectedFlavors.indexOf(item);
        if (index > -1) {
          this.selectedFlavors.splice(index, 1); // Remove item
        }
      }
    }

    if (type === ProductViewText.ALLERGENES) {
      const index = this.selectedAllergenes.indexOf(item);
      if (index > -1) {
        this.selectedAllergenes.splice(index, 1); // Remove item
      }
    }
  }

  addNewPrice() {
    const dialogRef = this.dialog.open(AddPriceDialogComponent, {
      data: {
        unit: this.selectedUnit
      }
    });

    dialogRef.afterClosed().subscribe((newPrice: ProductPrice) => {
      if (newPrice) {
        if (newPrice.productImage === null || newPrice.productImage === undefined) {
          newPrice.productImage = "";
        }
        this.productPrices.push(newPrice);
      }
    });
  }

  addVitamin() {
    // Validate inputs
    if (!this.vitaminName || !this.vitaminQuantity || !this.selectedVitaminUnit) {
      this.vitaminMissingFieldsError = true;
      return;
    }

    // Check if the vitamin already exists in the list
    const existingVitaminIndex = this.vitaminList.findIndex(vitamin => vitamin.name.toLowerCase() === this.vitaminName.toLowerCase());

    if (existingVitaminIndex !== -1) {
      // If it exists, update the existing vitamin entry
      this.vitaminList[existingVitaminIndex] = {
        name: this.vitaminName,
        quantity: this.vitaminQuantity,
        unit: this.selectedVitaminUnit,
      };
    } else {
      // If it does not exist, push a new vitamin object
      this.vitaminList.push({
        name: this.vitaminName,
        quantity: this.vitaminQuantity,
        unit: this.selectedVitaminUnit,
      });
    }

    // Reset inputs
    this.vitaminName = '';
    this.vitaminQuantity = null;
    this.selectedVitaminUnit = '';
    this.vitaminMissingFieldsError = false;
  }

  editVitamin(index: number) {
    const vitamin = this.vitaminList[index];
    this.vitaminName = vitamin.name;
    this.vitaminQuantity = vitamin.quantity;
    this.selectedVitaminUnit = vitamin.unit;
  }

  deleteVitamin(index: number) {
    this.vitaminList.splice(index, 1);
  }

  addNewFoodSupplement() {

  }

  back() {
    this.location.back();
  }
}
