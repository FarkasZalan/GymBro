import { Component } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';

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
        expanded: false,
        children: [
          {
            title: this.translate.instant('menu.foodSuplimentsMenu.proteins'),
            icon: ' ',
            link: '/food-supliments/proteins',
          },
          {
            title: this.translate.instant('menu.foodSuplimentsMenu.massGainers'),
            icon: ' ',
            link: '/food-supliments/mass-gainers',
          },
          {
            title: this.translate.instant('menu.foodSuplimentsMenu.aminoAcids'),
            icon: ' ',
            link: '/food-supliments/amino-acids',
          },
          {
            title: this.translate.instant('menu.foodSuplimentsMenu.creatines'),
            icon: ' ',
            link: '/food-supliments/creatines',
          },
          {
            title: this.translate.instant('menu.foodSuplimentsMenu.vitaminsAndMinerals'),
            icon: ' ',
            link: '/food-supliments/vitamins',
          },
          {
            title: this.translate.instant('menu.foodSuplimentsMenu.joinSupport'),
            icon: ' ',
            link: '/food-supliments/join-support',
          },
          {
            title: this.translate.instant('menu.foodSuplimentsMenu.fatBurners'),
            icon: ' ',
            link: '/food-supliments/fat-burners',
          }
        ]
      },
      {
        title: this.translate.instant('menu.healthyFoodsMenu.healthyFoods'),
        icon: 'heart-outline',
        expanded: false,
        children: [
          {
            title: this.translate.instant('menu.healthyFoodsMenu.cereals'),
            icon: ' ',
            link: '/users/list',
          },
          {
            title: this.translate.instant('menu.healthyFoodsMenu.healthySnacks'),
            icon: ' ',
            link: '/work-processes/list',
          },
          {
            title: this.translate.instant('menu.healthyFoodsMenu.flavorsAndSweeteners'),
            icon: ' ',
            link: '/work-processes/list',
          },
          {
            title: this.translate.instant('menu.healthyFoodsMenu.cookingIngredients'),
            icon: ' ',
            link: '/work-processes/list',
          },
          {
            title: this.translate.instant('menu.healthyFoodsMenu.drinks'),
            icon: ' ',
            link: '/work-processes/list',
          }
        ]
      },
      {
        title: this.translate.instant('menu.clothingMenu.clothing'),
        icon: 'pricetags-outline',
        link: '/statements',
        expanded: false,
        children: [
          {
            title: this.translate.instant('menu.clothingMenu.womensClothing'),
            icon: ' ',
            link: '/users/list',
          },
          {
            title: this.translate.instant('menu.clothingMenu.mansClothing'),
            icon: ' ',
            link: '/work-processes/list',
          }
        ]
      },
      {
        title: this.translate.instant('menu.accessoriesMenu.accessories'),
        icon: 'shield-outline',
        link: '/statements',
        expanded: false,
        children: [
          {
            title: this.translate.instant('menu.accessoriesMenu.shakers'),
            icon: ' ',
            link: '/users/list',
          },
          {
            title: this.translate.instant('menu.accessoriesMenu.weightLifting'),
            icon: ' ',
            link: '/work-processes/list',
          },
          {
            title: this.translate.instant('menu.accessoriesMenu.other'),
            icon: ' ',
            link: '/work-processes/list',
          }
        ]
      },
      {
        title: this.translate.instant('menu.blog'),
        icon: 'book-outline',
      }
    ];
  }
}
