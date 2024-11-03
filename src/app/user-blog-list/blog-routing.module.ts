import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PagesComponent } from '../pages/pages.component';
import { UserBlogListComponent } from './user-blog-list.component';
import { BlogPageViewComponent } from './blog-page-view/blog-page-view.component';

const routes: Routes = [{
    path: '',
    component: PagesComponent, // Main component for the Pages module
    children: [
        {
            path: '',
            component: UserBlogListComponent
        },
        {
            path: 'blog-view/:blogId',
            component: BlogPageViewComponent
        },
    ],
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class BlogRoutingModule {
}
