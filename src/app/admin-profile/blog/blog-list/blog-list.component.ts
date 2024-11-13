import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Blog } from '../blog.model';
import { Location } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrl: '../../../../styles/products.scss',
  animations: [
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ]
})
export class BlogListComponent {
  blogId: string;
  blogList: Blog[];

  constructor(private db: AngularFirestore, private router: Router, private location: Location) { }

  ngOnInit(): void {
    //load all the blogs
    this.getAllBlogs();
  }

  // Open new blog page
  goToAddNewBlog() {
    this.router.navigate(['admin-profile/create-blog']);
  }

  // Go to Edit Blog page
  editBlogs(blogId: string) {
    this.router.navigate(['admin-profile/edit-blog', blogId]);
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
    this.router.navigate(['admin-profile']);
  }
}
