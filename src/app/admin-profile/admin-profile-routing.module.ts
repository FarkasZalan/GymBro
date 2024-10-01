import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from '../pages/pages.component';
import { AdminProfileComponent } from './admin-profile.component';
import { ProductsListComponent } from './products-categories/products-list/products-list.component';
import { CreateProductComponent } from './products-categories/create-product/create-product.component';

export const routes: Routes = [
    {
        path: '',
        component: PagesComponent,
        children: [
            {
                path: '',
                component: AdminProfileComponent
            },
            {
                path: 'pruducts',
                redirectTo: '',
                component: AdminProfileComponent
            },
            {
                path: 'pruducts/:productCategory',
                component: ProductsListComponent
            },
            {
                path: 'create-product',
                redirectTo: '',
                component: AdminProfileComponent
            },
            {
                path: 'create-product/:productCategory',
                component: CreateProductComponent
            }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminRoutingModule {
}