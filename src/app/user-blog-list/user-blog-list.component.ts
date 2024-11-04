import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Blog } from '../admin-profile/blog/blog.model';
import { MatDialog } from '@angular/material/dialog';
import { FilterPageComponent } from '../filter-page/filter-page.component';
import { ProductViewText } from '../admin-profile/product-management/product-view-texts';
import { Filter } from '../filter-page/filter.model';
import { AdminService } from '../admin-profile/admin.service';

@Component({
  selector: 'app-user-blog-list',
  templateUrl: './user-blog-list.component.html',
  styleUrl: '../../styles/products.scss'
})
export class UserBlogListComponent {
  blogId: string;
  blogList: Blog[];
  originalBlogList: Blog[] = []; // original, unfiltered blog list
  filterObject: Filter = {
    language: '',
    orderBy: ProductViewText.ORDER_BY_LATEST
  };

  constructor(private db: AngularFirestore, private router: Router, private location: Location, private dialog: MatDialog, private adminService: AdminService) { }

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
    this.blogList = this.adminService.sortByDateASC(this.blogList);
    this.originalBlogList = this.adminService.sortByDateASC(this.originalBlogList);
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
          orderBy: ProductViewText.ORDER_BY_LATEST
        }
      } else if (filterObject && typeof filterObject === 'object') {
        this.filterObject = filterObject;
        // Reset blogList to the original unfiltered list
        this.blogList = [...this.originalBlogList];
        // Apply the selected filter on the reset list
        if (filterObject.language !== '') {
          this.blogList = this.adminService.filterBlogByLanguage(this.blogList, filterObject.language);
        }
        if (filterObject.orderBy === ProductViewText.ORDER_BY_OLDEST) {
          this.blogList = this.adminService.sortByDateDESC(this.blogList);
        } else if (filterObject.orderBy === ProductViewText.ORDER_BY_LATEST) {
          this.blogList = this.adminService.sortByDateASC(this.blogList);
        }
      }
    });
  }
}
