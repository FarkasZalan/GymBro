import { Component } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { ProductViewText } from '../admin-profile/product-management/product-view-texts';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html'
})
export class PagesComponent {
  // Translated menu items that will be displayed in the component
  translatedMenu: NbMenuItem[];

  constructor(private translate: TranslateService) {
    // Subscribe to language change events to re-translate menu items
    this.translate.onLangChange.subscribe(() => {
      this.translateMenu();
    });
    // Initial translation of menu items
    this.translateMenu();
  }

  // Function to translate menu items based on the current language
  private translateMenu() {
    this.translatedMenu = [
      {
        title: this.translate.instant('menu.foodSuplimentsMenu.foodSupliments'),
        icon: 'flash-outline',
        link: '/product/' + ProductViewText.FOOD_SUPLIMENTS
      },
      {
        title: this.translate.instant('menu.organicFoodMenu.organicFood'),
        icon: 'heart-outline',
        link: '/product/' + ProductViewText.ORGANIC_FOOD,
      },
      {
        title: this.translate.instant('menu.clothingMenu.clothing'),
        icon: 'pricetags-outline',
        link: '/product/' + ProductViewText.CLOTHES,
      },
      {
        title: this.translate.instant('menu.accessoriesMenu.accessories'),
        icon: 'shield-outline',
        link: '/product/' + ProductViewText.ACCESSORIES,
      },
      {
        title: this.translate.instant('menu.blog'),
        icon: 'book-outline',
        link: '/blog'
      }
    ];
  }
}
