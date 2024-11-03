import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrl: '../../../styles/products.scss'
})
export class BlogComponent implements OnInit {
  blogCount: number = 0;

  constructor(private router: Router, private db: AngularFirestore) { }

  ngOnInit(): void {
    this.db.collection("blog").valueChanges().subscribe(blogCollection => {
      this.blogCount = blogCollection.length;
    })
  }

  // // navigate and pass the products category to the products list component
  goToBlogList() {
    this.router.navigate(['/admin-profile/blog-list']);
  }
}
