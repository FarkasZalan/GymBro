import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from '../pages/pages.component';
import { AdminProfileComponent } from './admin-profile.component';
import { ProductsListComponent } from './product-management/products-categories/products-list/products-list.component';
import { CreateFoodSuplimentsComponent } from './product-management/products-create/create-food-supliements/create-food-supliements.component';
import { EditHealthyFoodComponent } from './product-management/products-edit/edit-healthy-food/edit-healthy-food.component';
import { EditFoodSupliementsComponent } from './product-management/products-edit/edit-food-supliements/edit-food-supliements.component';
import { EditAccessoriesComponent } from './product-management/products-edit/edit-accessories/edit-accessories.component';
import { EditClothesComponent } from './product-management/products-edit/edit-clothes/edit-clothes.component';
import { CreateAccessoriesComponent } from './product-management/products-create/create-accessories/create-accessories.component';
import { CreateClothesComponent } from './product-management/products-create/create-clothes/create-clothes.component';
import { CreateHealthyFoodComponent } from './product-management/products-create/create-healthy-food/create-healthy-food.component';

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
                component: CreateFoodSuplimentsComponent
            },
            {
                path: 'create-product/healthyProducts',
                component: CreateHealthyFoodComponent
            },
            {
                path: 'create-product/clothes',
                component: CreateClothesComponent
            },
            {
                path: 'create-product/accessories',
                component: CreateAccessoriesComponent
            },

            // edit products
            {
                path: 'edit-product',
                redirectTo: '',
                component: AdminProfileComponent
            },
            {
                path: 'edit-product/foodSupliments/:productId',
                component: CreateFoodSuplimentsComponent
            },
            {
                path: 'edit-product/healthyProducts/:productId',
                component: EditHealthyFoodComponent
            },
            {
                path: 'edit-product/clothes/:productId',
                component: EditClothesComponent
            },
            {
                path: 'edit-product/accessories/:productId',
                component: EditAccessoriesComponent
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