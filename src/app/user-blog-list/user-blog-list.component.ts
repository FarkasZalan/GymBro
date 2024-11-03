import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Blog } from '../admin-profile/blog/blog.model';

@Component({
  selector: 'app-user-blog-list',
  templateUrl: './user-blog-list.component.html',
  styleUrl: '../../styles/products.scss'
})
export class UserBlogListComponent {
  blogId: string;
  blogList: Blog[];

  constructor(private db: AngularFirestore, private router: Router, private location: Location) { }

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
        this.blogList = blogs;
      });
  }

  // Method to sort blogs by name
  sortAddresses() {
    this.blogList.sort((a, b) => a.title.localeCompare(b.title));
  }

  back() {
    this.location.back();
    this.router.navigate(['']);
  }
}
