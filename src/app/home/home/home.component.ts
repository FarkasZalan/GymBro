import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../products/product.service';
import { Blog } from '../../admin-profile/blog/blog.model';
import { ProductViewText } from '../../admin-profile/product-management/product-view-texts';
import { trigger, transition, style, animate } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import { Product } from '../../admin-profile/product-management/product-models/product.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
    ]),
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ]
})
export class HomeComponent implements OnInit {
  featuredBlogs: Blog[] = [];
  discountedProducts: Product[] = [];
  newArrivals: Product[] = [];
  categories = [
    {
      name: this.translate.instant('menu.foodSuplimentsMenu.foodSupliments'),
      icon: 'flash-outline',
      route: '/product/' + ProductViewText.FOOD_SUPLIMENTS,
      image: '../../../assets/images/food-supliments-image.jpg'
    },
    {
      name: this.translate.instant('menu.organicFoodMenu.organicFood'),
      icon: 'heart-outline',
      route: '/product/' + ProductViewText.ORGANIC_FOOD,
      image: '../../../assets/images/healthy-food-image.jpg'
    },
    {
      name: this.translate.instant('menu.clothingMenu.clothing'),
      icon: 'pricetags-outline',
      route: '/product/' + ProductViewText.CLOTHES,
      image: '../../../assets/images/clothing-image.jpg'
    },
    {
      name: this.translate.instant('menu.accessoriesMenu.accessories'),
      icon: 'shield-outline',
      route: '/product/' + ProductViewText.ACCESSORIES,
      image: '../../../assets/images/gym-accessories-image.jpg'
    }
  ];

  constructor(
    private router: Router,
    private productService: ProductService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    // Get featured blogs
    this.productService.getLatestBlogs(3).subscribe((blogs: Blog[]) => {
      this.featuredBlogs = blogs;
    });

    // Get discounted products
    this.productService.getDiscountedProducts(3).subscribe((products: Product[]) => {
      this.discountedProducts = products;
      console.log(this.discountedProducts);
    });

    // Get new arrivals
    this.productService.getNewArrivals(3).subscribe((products: Product[]) => {
      this.newArrivals = products;
    });
  }

  navigateToCategory(route: string) {
    this.router.navigate([route]);
  }

  navigateToBlog(blogId: string) {
    this.router.navigate(['/blog', blogId]);
  }
}
