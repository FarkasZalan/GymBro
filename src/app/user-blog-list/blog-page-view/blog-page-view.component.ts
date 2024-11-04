import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentHandlerService } from '../../document.handler.service';
import { Blog } from '../../admin-profile/blog/blog.model';
import { Location } from '@angular/common';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-blog-page-view',
  templateUrl: './blog-page-view.component.html',
  styleUrl: './blog-page-view.component.scss'
})
export class BlogPageViewComponent implements OnInit {

  blogObject: Blog;
  blogTags: string[] = [];
  blogCreatedDate: Timestamp;
  blogImage: string = '';
  blogHtmlText: string = '';
  blogNormalText: string = '';
  relatedBlogs: Blog[] = [];

  constructor(private route: ActivatedRoute, private documentHandler: DocumentHandlerService, private location: Location, private router: Router) { }

  ngOnInit(): void {
    this.relatedBlogs = [];
    this.route.params.subscribe(params => {
      // get the food supliment product by id
      this.documentHandler.getDocumentByID("blog", params['blogId']).subscribe((blog: Blog) => {
        // make a copy from the object
        this.blogObject = { ...blog };

        // tags, image, description and blog text
        this.blogTags = this.blogObject.blogTags;
        this.blogCreatedDate = this.blogObject.date;
        this.blogImage = this.blogObject.headerImageUrl;
        this.blogHtmlText = this.blogObject.htmlText;

        // related blogs
        this.loadRelatedBlogs(params['blogId']);
      });
    });
  }

  // get related blog list
  loadRelatedBlogs(currentBlogId: string): void {
    // Fetch related blogs based on tags and language
    this.documentHandler.getRelatedBlogs(this.blogTags, currentBlogId, this.blogObject.language).subscribe((relatedBlogs: Blog[]) => {
      // Create a Set to track unique blog id
      const existingIds = new Set<string>();

      // Add IDs of the related blogs to the Set
      relatedBlogs.forEach(blog => existingIds.add(blog.id!));

      // Handle related blogs based on their count
      if (relatedBlogs.length > 0) {
        this.relatedBlogs = relatedBlogs; // Set the found related blogs

        // if there are not found 6 related blogs
        if (relatedBlogs.length < 6) {
          existingIds.add(currentBlogId);

          const remainingCount = 6 - relatedBlogs.length;

          this.documentHandler.getRandomBlogs(remainingCount, this.blogObject.language).subscribe((randomBlogs: Blog[]) => {
            const uniqueRandomBlogs = randomBlogs.filter(blog => !existingIds.has(blog.id));

            // Add unique random blogs to the relatedBlogs array and to existingIds
            uniqueRandomBlogs.forEach(blog => {
              relatedBlogs.push(blog);
              existingIds.add(blog.id);
            });
          });
        }
      }
      else if (relatedBlogs.length === 0) {
        // No related blogs found, fetch six random blogs
        this.documentHandler.getRandomBlogs(6, this.blogObject.language).subscribe((randomBlogs: Blog[]) => {
          this.relatedBlogs = randomBlogs; // Set the random blogs as related
        });
      }
    });
  }

  // Go to View Blog page
  openBlog(blogId: string) {
    this.router.navigate(['blog/blog-view/', blogId]);
  }

  back() {
    this.location.back();
    this.router.navigate(['blog']);
  }
}
