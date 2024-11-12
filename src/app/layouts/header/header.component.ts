import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { NbMenuService, NbSidebarService } from '@nebular/theme';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../user/user.model';
import { filter, tap } from 'rxjs';
import { LogOutComponent } from '../../auth/log-out/log-out.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from '../../app.component';
import { Product } from '../../admin-profile/product-management/product-models/product.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ProductViewText } from '../../admin-profile/product-management/product-view-texts';
import { FoodSupliment } from '../../admin-profile/product-management/product-models/food-supliment.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef;
  userLoggedIn: boolean = false;
  userMenu = [];
  user: User;
  language: string = "";
  languageSwithButtonText: string = "";

  searchExpanded: boolean = false;
  searcForProductText: string = '';
  searchResults: Product[] = []; // Store search results

  constructor(private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private appComponent: AppComponent
  ) { }

  ngOnInit(): void {
    //load the current user
    this.auth.authState.subscribe((userAuth) => {
      if (userAuth) {
        this.userLoggedIn = true;
        this.authService.getCurrentUser(userAuth.uid).subscribe((currentUser: User) => {
          this.user = currentUser;
          if (this.user === undefined) {
            this.authService.logOut();
            this.userLoggedIn = false; // User is logged out
          }
        })
      } else {
        this.userLoggedIn = false; // User is logged out
      }
    })



    // Get the current language
    this.language = this.appComponent.getBrowserLanguage();
    if (this.language === 'en') {
      this.languageSwithButtonText = 'hu';
    } else {
      this.languageSwithButtonText = 'en';
    }


    // Translate userMenu items
    this.translate.onLangChange.subscribe(() => {
      //this method call when the languaage is changed
      this.translateMenu();
    });
    //this is for the first time when we need to load in the items based on the default language
    this.translateMenu();

    // Handle menu item clicks
    this.menuService.onItemClick()
      .pipe(
        //the 'header-menu' tag is for the html to the nbContextMenuTag, this is a click listener for this menu
        filter(({ tag }) => tag === 'header-menu'),
        tap(({ item }) => {
          if (item.title === this.translate.instant('header.logOut')) {
            this.logOut();
          } else {
            if (this.user.isAdmin) {
              this.router.navigate(['admin-profile']);
            } else {
              this.router.navigate(['profile']);
            }
          }
        })
      ).subscribe()
  }

  translateMenu() {
    this.userMenu = [
      { title: this.translate.instant('header.profile') },
      { title: this.translate.instant('header.logOut') }
    ];
  }

  // Toggle between languages
  switchLanguage() {
    if (this.language === 'en') {
      this.language = 'hu';
      this.languageSwithButtonText = 'en';
    } else {
      this.language = 'en';
      this.languageSwithButtonText = 'hu';
    }

    this.appComponent.switchLanguage(this.language);
  }

  // Toggle the sidebar visibility
  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');

    return false;
  }

  openSearch() {
    this.searchExpanded = true;

    this.searchInput.nativeElement.focus();
  }

  // Search Function
  onSearchChange() {
    const searchText = this.searcForProductText.toLowerCase();
    console.log("Search text:", searchText);  // Check search text

    if (searchText) {
      const categories = [ProductViewText.FOOD_SUPLIMENTS, ProductViewText.ORGANIC_FOOD, ProductViewText.CLOTHES, ProductViewText.ACCESSORIES];
      this.searchResults = []; // Clear previous results

      // Iterate through each category and fetch all products once
      categories.forEach(category => {
        this.db.collection('products').doc(category).collection('allProduct').valueChanges().subscribe((results: Product[]) => {

          // Use front-end filtering for substring match on name
          const filteredResults = results.filter(product =>
            product.productName.toLowerCase().includes(searchText)
          );

          // Add filtered results to searchResults array with category tracking
          this.searchResults.push(...filteredResults.map(product => ({
            ...product,
            category // Track product category if needed
          })));
        });
      });
    } else {
      this.searchResults = []; // Clear results if search is empty
    }
  }

  closeSearch() {
    this.searchExpanded = false;
    this.searcForProductText
    this.searchResults = []; // Clear results on close
  }

  // Method to get the default price for a the products
  getDefaultPrice(foodSupliment: FoodSupliment) {
    return foodSupliment.prices.find(price => price.setAsDefaultPrice);
  }

  onProductSelected(selectedProduct: Product) {
    this.router.navigate(['product/' + selectedProduct.category + '/' + selectedProduct.id])
  }

  //click to logo and then navigate home
  navigateHome() {
    this.router.navigate(['/home']);
  }

  //go to login
  navigateToLogin() {
    this.router.navigate(['/auth']);
  }

  // Open logout confirmation dialog
  logOut() {
    this.dialog.open(LogOutComponent);
  }
}
