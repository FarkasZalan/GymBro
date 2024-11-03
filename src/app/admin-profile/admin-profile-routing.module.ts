import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from '../pages/pages.component';
import { AdminProfileComponent } from './admin-profile.component';
import { ProductsListComponent } from './product-management/products-categories/products-list/products-list.component';
import { HandleFoodSuplimentsComponent } from './product-management/product-actions/handle-food-supliments/handle-food-supliments.component';
import { HandleHealtyProductsComponent } from './product-management/product-actions/handle-healty-products/handle-healty-products.component';
import { HandleClothesComponent } from './product-management/product-actions/handle-clothes/handle-clothes.component';
import { HandleAccessoriesComponent } from './product-management/product-actions/handle-accessories/handle-accessories.component';
import { BlogListComponent } from './blog/blog-list/blog-list.component';
import { HandleBlogsComponent } from './blog/blog-list/handle-blogs/handle-blogs.component';
import { BlogComponent } from './blog/blog.component';

export const routes: Routes = [
    {
        path: '',
        component: PagesComponent,
        children: [
            {
                path: '',
                component: AdminProfileComponent
            },

            // Blog
            {
                path: 'blog',
                redirectTo: '',
                component: BlogComponent
            },

            // list of the blogs
            {
                path: 'blog-list',
                component: BlogListComponent
            },

            // create blog
            {
                path: 'create-blog',
                component: HandleBlogsComponent
            },

            // edit blog posts
            {
                path: 'edit-blog',
                redirectTo: '',
                component: AdminProfileComponent
            },
            {
                path: 'edit-blog/:blogId',
                component: HandleBlogsComponent
            },

            // Products
            {
                path: 'pruducts',
                redirectTo: '',
                component: AdminProfileComponent
            },

            // list of the products
            {
                path: 'pruducts/:productCategory',
                component: ProductsListComponent
            },

            // create products
            {
                path: 'create-product',
                redirectTo: '',
                component: AdminProfileComponent
            },
            {
                path: 'create-product/foodSupliments',
                component: HandleFoodSuplimentsComponent
            },
            {
                path: 'create-product/healthyProducts',
                component: HandleHealtyProductsComponent
            },
            {
                path: 'create-product/clothes',
                component: HandleClothesComponent
            },
            {
                path: 'create-product/accessories',
                component: HandleAccessoriesComponent
            },

            // edit products
            {
                path: 'edit-product',
                redirectTo: '',
                component: AdminProfileComponent
            },
            {
                path: 'edit-product/foodSupliments/:productId',
                component: HandleFoodSuplimentsComponent
            },
            {
                path: 'edit-product/healthyProducts/:productId',
                component: HandleHealtyProductsComponent
            },
            {
                path: 'edit-product/clothes/:productId',
                component: HandleClothesComponent
            },
            {
                path: 'edit-product/accessories/:productId',
                component: HandleAccessoriesComponent
            },

        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminRoutingModule {
}