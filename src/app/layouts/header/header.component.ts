import { Component, OnInit } from '@angular/core';
import { NbMenuService, NbSidebarService } from '@nebular/theme';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  userMenu = [];

  constructor(private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
  ) { }

  ngOnInit(): void {
    this.userMenu = [
      { title: 'profil' },
      { title: 'kijelentkezés' }
    ];
  }

  //hamburger icon
  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');

    return false;
  }

  //click to logo and then navigate home
  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }
}
