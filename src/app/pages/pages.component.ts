import { Component } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrl: './pages.component.scss'
})
export class PagesComponent {
  translatedMenu: NbMenuItem[];

  constructor(private translate: TranslateService) {
    this.translate.onLangChange.subscribe(() => {
      this.translateMenu();
    });
    this.translateMenu();
  }

  private translateMenu() {
    this.translatedMenu = [
      {
        title: this.translate.instant('menu.mainPage'),
        icon: 'home-outline',
        link: '/home',
        home: true
      },
      {
        title: this.translate.instant('menu.foodSuplimentsMenu.foodSupliments'),
        icon: 'clipboard-outline',
        link: '/worksheets',
        expanded: false,
        children: [
          {
            title: this.translate.instant('menu.foodSuplimentsMenu.proteins'),
            link: '/users/list',
            icon: 'cube-outline'
          },
          {
            title: this.translate.instant('menu.foodSuplimentsMenu.massGainers'),
            link: '/work-processes/list',
            icon: 'flash-outline'
          },
          {
            title: this.translate.instant('menu.foodSuplimentsMenu.aminoAcids'),
            link: '/work-processes/list',
            icon: 'flash-outline'
          },
          {
            title: this.translate.instant('menu.foodSuplimentsMenu.creatines'),
            link: '/work-processes/list',
            icon: 'flash-outline'
          },
          {
            title: this.translate.instant('menu.foodSuplimentsMenu.vitamins'),
            link: '/work-processes/list',
            icon: 'flash-outline'
          },
          {
            title: this.translate.instant('menu.foodSuplimentsMenu.minerals'),
            link: '/work-processes/list',
            icon: 'flash-outline'
          },
          {
            title: this.translate.instant('menu.foodSuplimentsMenu.healthyFats'),
            link: '/work-processes/list',
            icon: 'flash-outline'
          },
          {
            title: this.translate.instant('menu.foodSuplimentsMenu.joinSupport'),
            link: '/work-processes/list',
            icon: 'flash-outline'
          },
          {
            title: this.translate.instant('menu.foodSuplimentsMenu.fatBurners'),
            link: '/work-processes/list',
            icon: 'flash-outline'
          }
        ]
      },
      {
        title: this.translate.instant('menu.healthyFoodsMenu.healthyFoods'),
        icon: 'award-outline',  // closest available icon
        expanded: false,
        children: [
          {
            title: this.translate.instant('menu.healthyFoodsMenu.cereals'),
            link: '/users/list',
            icon: 'heart-outline' // closest available icon
          },
          {
            title: this.translate.instant('menu.healthyFoodsMenu.healthySnacks'),
            link: '/work-processes/list',
            icon: 'book-outline'  // closest available icon
          },
          {
            title: this.translate.instant('menu.healthyFoodsMenu.flavorsAndSweeteners'),
            link: '/work-processes/list',
            icon: 'book-outline'  // closest available icon
          },
          {
            title: this.translate.instant('menu.healthyFoodsMenu.cookingIngredients'),
            link: '/work-processes/list',
            icon: 'book-outline'  // closest available icon
          },
          {
            title: this.translate.instant('menu.healthyFoodsMenu.drinks'),
            link: '/work-processes/list',
            icon: 'book-outline'  // closest available icon
          }
        ]
      },
      {
        title: this.translate.instant('menu.clothingMenu.clothing'),
        icon: 'shopping-bag-outline',  // closest available icon
        link: '/statements',
        expanded: false,
        children: [
          {
            title: this.translate.instant('menu.clothingMenu.womensClothing'),
            link: '/users/list',
            icon: 'person-outline'
          },
          {
            title: this.translate.instant('menu.clothingMenu.mansClothing'),
            link: '/work-processes/list',
            icon: 'paper-plane-outline'  // closest available icon
          }
        ]
      },
      {
        title: this.translate.instant('menu.accessoriesMenu.accessories'),
        icon: 'shopping-bag-outline',  // closest available icon
        link: '/statements',
        expanded: false,
        children: [
          {
            title: this.translate.instant('menu.accessoriesMenu.homeWorkout'),
            link: '/users/list',
            icon: 'person-outline'
          },
          {
            title: this.translate.instant('menu.accessoriesMenu.workoutGear'),
            link: '/work-processes/list',
            icon: 'paper-plane-outline'  // closest available icon
          },
          {
            title: this.translate.instant('menu.accessoriesMenu.activityBasedTools'),
            link: '/work-processes/list',
            icon: 'paper-plane-outline'  // closest available icon
          },
          {
            title: this.translate.instant('menu.accessoriesMenu.bagsAndBackpacks'),
            link: '/work-processes/list',
            icon: 'paper-plane-outline'  // closest available icon
          },
          {
            title: this.translate.instant('menu.accessoriesMenu.rehabilitationTools'),
            link: '/work-processes/list',
            icon: 'paper-plane-outline'  // closest available icon
          }
        ]
      },
      {
        title: this.translate.instant('menu.blog'),
        icon: 'book-outline',
        link: '/statements'
      }
    ];
  }
}
