import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Blog } from '../admin-profile/blog/blog.model';
import { MatDialog } from '@angular/material/dialog';
import { FilterPageComponent } from '../filter-page/filter-page.component';
import { ProductViewText } from '../admin-profile/product-management/product-view-texts';
import { Filter } from '../filter-page/filter.model';
import { ProductService } from '../products/product.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-user-blog-list',
  templateUrl: './user-blog-list.component.html',
  styleUrl: '../../styles/products.scss',
  animations: [
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ]
})
export class UserBlogListComponent {
  blogId: string;
  blogList: Blog[];
  originalBlogList: Blog[] = []; // original, unfiltered blog list
  filterObject: Filter = {
    language: '',
    category: '',
    orderBy: ProductViewText.ORDER_BY_LATEST,
    flavors: [],
    allergenes: [],
    safeForConsumptionDuringBreastfeeding: true,
    safeForConsumptionDuringPregnancy: true,
    proteinType: '',
    gender: '',
    color: '',
    size: '',
    clothingType: '',
    material: '',
    equipmentType: ''
  };

  constructor(private db: AngularFirestore, private router: Router, private location: Location, private dialog: MatDialog, private productService: ProductService) { }

  ngOnInit(): void {
    //load all the blogs
    this.getAllBlogs();
  }

  // Go to View Blog page
  openBlog(blogId: string) {
    this.router.navigate(['blog/blog-view/', blogId]);
  }

  getAllBlogs() {
    this.db
      .collection("blog")
      .valueChanges()
      .subscribe((blogs: Blog[]) => {
        this.originalBlogList = [...blogs]; // Save the unfiltered list
        this.blogList = blogs;
        this.sortAddresses()
      });
  }

  // Method to sort blogs by date
  sortAddresses() {
    this.blogList = this.productService.sortByDateASC(this.blogList);
    this.originalBlogList = this.productService.sortByDateASC(this.originalBlogList);
  }

  back() {
    this.location.back();
    this.router.navigate(['']);
  }

  openFilterMenu() {
    const dialogRef = this.dialog.open(FilterPageComponent, {
      data: {
        fromPage: ProductViewText.BLOG,
        filter: this.filterObject
      }
    });

    dialogRef.afterClosed().subscribe((filterObject: Filter | boolean) => {
      // If true is returned, delete the filters
      if (filterObject === true) {
        this.blogList = [...this.originalBlogList];
        this.filterObject = {
          language: '',
          category: '',
          orderBy: ProductViewText.ORDER_BY_LATEST,
          flavors: [],
          allergenes: [],
          safeForConsumptionDuringBreastfeeding: true,
          safeForConsumptionDuringPregnancy: true,
          proteinType: '',
          gender: '',
          color: '',
          size: '',
          clothingType: '',
          material: '',
          equipmentType: ''
        }
      } else if (filterObject && typeof filterObject === 'object') {
        this.filterObject = filterObject;
        // Reset blogList to the original unfiltered list
        this.blogList = [...this.originalBlogList];
        // Apply the selected filter on the reset list
        if (filterObject.language !== '') {
          this.blogList = this.productService.filterBlogByLanguage(this.blogList, filterObject.language);
        }
        if (filterObject.orderBy === ProductViewText.ORDER_BY_OLDEST) {
          this.blogList = this.productService.sortByDateDESC(this.blogList);
        } else if (filterObject.orderBy === ProductViewText.ORDER_BY_LATEST) {
          this.blogList = this.productService.sortByDateASC(this.blogList);
        }
      }
    });
  }
}
// ötlet: a blogot megnyitva az első sorban legyen 6 legrissebb, legyen 1 kiemelt
// illetve legyen a blogoknak is kategóriája és mint az admin oldalon is fekete-fehér animációval lehessen választani
// illetve egy összes blog bomb
