import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentHandlerService } from '../../document.handler.service';
import { Blog } from '../../admin-profile/blog/blog.model';
import { Location } from '@angular/common';

@Component({
  selector: 'app-blog-page-view',
  templateUrl: './blog-page-view.component.html',
  styleUrl: './blog-page-view.component.scss'
})
export class BlogPageViewComponent implements OnInit {

  blogObject: Blog;
  blogTags: string[] = [];
  blogCreatedDate: string = '';
  blogImage: string = '';
  blogHtmlText: string = '';
  blogNormalText: string = '';

  constructor(private route: ActivatedRoute, private documentHandler: DocumentHandlerService, private location: Location, private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      // get the food supliment product by id
      this.documentHandler.getDocumentByID("blog", params['blogId']).subscribe((blog: Blog) => {
        // make a copy from the object
        this.blogObject = { ...blog };

        // if it's not undefinied (so the user want to edit a specified product not create a new)
        if (this.blogObject.title !== undefined) {
          // tags, image, description and blog text
          this.blogTags = this.blogObject.blogTags;
          this.blogCreatedDate = this.blogObject.date;
          this.blogImage = this.blogObject.headerImageUrl;
          this.blogHtmlText = this.blogObject.htmlText;
        }
      });
    });
  }

  back() {
    this.location.back();
    this.router.navigate(['blog']);
  }
}
