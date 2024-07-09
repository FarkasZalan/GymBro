import { Component } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrl: './pages.component.scss'
})
export class PagesComponent {
  translatedMenu: NbMenuItem[];

  constructor() {
    this.translateMenu();
  }

  private translateMenu() {
    this.translatedMenu = [
      {
        title: 'Főoldal',
        icon: 'home-outline',
        link: '/home',
        home: true
      },
      {
        title: 'Étrend kiegészítők',
        icon: 'clipboard-outline',
        link: '/worksheets',
        expanded: false,
        children: [
          {
            title: 'Fehérjék',
            link: '/users/list',
            icon: 'cube-outline'
          },
          {
            title: 'Zsírégetők',
            link: '/work-processes/list',
            icon: 'flash-outline'
          }
        ]
      },
      {
        title: 'Egészséges élelmiszerek',
        icon: 'award-outline',  // closest available icon
        expanded: false,
        children: [
          {
            title: 'Fitnesz élelmiszerek',
            link: '/users/list',
            icon: 'heart-outline' // closest available icon
          },
          {
            title: 'Gabonafélék',
            link: '/work-processes/list',
            icon: 'book-outline'  // closest available icon
          }
        ]
      },
      {
        title: 'Fitnesz ruházat',
        icon: 'shopping-bag-outline',  // closest available icon
        link: '/statements',
        expanded: false,
        children: [
          {
            title: 'Női ruházat',
            link: '/users/list',
            icon: 'person-outline'
          },
          {
            title: 'Férfi ruházat',
            link: '/work-processes/list',
            icon: 'paper-plane-outline'  // closest available icon
          }
        ]
      },
      {
        title: 'Blog',
        icon: 'book-outline',
        link: '/statements'
      }
    ];
  }
}
