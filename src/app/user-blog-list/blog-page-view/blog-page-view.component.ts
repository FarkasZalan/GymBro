import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentHandlerService } from '../../document.handler.service';
import { Blog } from '../../admin-profile/blog/blog.model';
import { Location } from '@angular/common';
import { Timestamp } from 'firebase/firestore';
import { ProductService } from '../../products/product.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-blog-page-view',
  templateUrl: './blog-page-view.component.html',
  styleUrl: './blog-page-view.component.scss',
  animations: [
    trigger('zoomIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ]
})
export class BlogPageViewComponent implements OnInit {

  blogObject: Blog;
  blogTags: string[] = [];
  blogCreatedDate: Timestamp;
  blogImage: string = '';
  blogHtmlText: string = '';
  blogNormalText: string = '';
  relatedBlogs: Blog[] = [];

  // responsibility
  isLargeScreen: boolean = false;

  constructor(private route: ActivatedRoute, private productService: ProductService, private documentHandler: DocumentHandlerService, private location: Location, private router: Router) { }

  ngOnInit(): void {
    this.checkScreenSize();
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

  @HostListener('window:resize', [])
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isLargeScreen = window.innerWidth > 1400;
  }

  // get related blog list
  loadRelatedBlogs(currentBlogId: string): void {
    // Fetch related blogs based on tags and language
    this.productService.getRelatedBlogs(this.blogTags, currentBlogId, this.blogObject.language).subscribe((relatedBlogs: Blog[]) => {
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

          this.productService.getRandomBlogs(currentBlogId, remainingCount, this.blogObject.language).subscribe((randomBlogs: Blog[]) => {
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
        this.productService.getRandomBlogs(currentBlogId, 6, this.blogObject.language).subscribe((randomBlogs: Blog[]) => {
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
