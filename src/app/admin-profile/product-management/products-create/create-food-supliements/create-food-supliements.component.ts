import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ProductViewText } from '../../../../products/product-view-texts';
import { TranslateService } from '@ngx-translate/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

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
  errorMessage: boolean;
  safeForConsumptionDuringPregnancy: boolean;
  safeForConsumptionDuringBreastfeeding: boolean;
  priceByWeight: boolean;
  male: boolean;

  selectedCategory: string = '';
  isProtein: boolean = false;

  productViewText = ProductViewText;

  productCategories: string[] = [ProductViewText.PROTEINS, ProductViewText.MASS_GAINERS, ProductViewText.AMINO_ACIDS, ProductViewText.CREATINES, ProductViewText.VITAMINS, ProductViewText.MINERALS, ProductViewText.HEALTHY_FATS, ProductViewText.JOIN_SUPPORT, ProductViewText.FAT_BURNERS];
  translatedCategories: string[] = [];

  // Available flavors
  availableFlavors: string[] = ['Vanilla', 'Chocolate', 'Strawberry', 'Mint', 'Peanut Butter'];

  // Selected flavors
  selectedFlavors: string[] = [];

  // Available allergenes
  availableAllergenes: string[] = ['Lactose', 'Gluten', 'Soy', 'Eggs', 'Added Sugars', 'Peanuts', 'Fish'];

  // Selected allergenes
  selectedAllergenes: string[] = [];

  constructor(private location: Location, private translate: TranslateService) { }

  ngOnInit(): void {
    // Subscribe to language change events to re-translate categories
    this.translate.onLangChange.subscribe(() => {
      this.translateAndSortItems();
    });
    this.translateAndSortItems();
  }

  // Method to translate and sort items by name
  translateAndSortItems(): void {
    // Translate each item in the array
    this.translatedCategories = this.productCategories.map(item => this.translate.instant(item));

    // Sort the translated items alphabetically
    this.translatedCategories.sort((a, b) => a.localeCompare(b));
  }

  isProteinSelected() {
    if (this.translate.instant(ProductViewText.PROTEINS) === this.selectedCategory) {
      this.isProtein = true;
    } else {
      this.isProtein = false;
    }
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
    console.log(type, item)
    if (type === ProductViewText.FLAVORS) {
      const index = this.selectedFlavors.indexOf(item);
      if (index > -1) {
        this.selectedFlavors.splice(index, 1); // Remove item
      }
    }

    if (type === ProductViewText.ALLERGENES) {
      const index = this.selectedAllergenes.indexOf(item);
      if (index > -1) {
        this.selectedAllergenes.splice(index, 1); // Remove item
      }
    }
  }

  addNewFoodSupplement() {

  }

  back() {
    this.location.back();
  }
}
