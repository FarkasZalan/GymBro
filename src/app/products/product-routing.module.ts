import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PagesComponent } from '../pages/pages.component';
import { ProductViewText } from '../admin-profile/product-management/product-view-texts';
import { FoodSuplimentsListComponent } from './food-supliments/food-supliments-list/food-supliments-list.component';
import { OrganicFoodListComponent } from './organic-food/organic-food-list/organic-food-list.component';
import { ClothesListComponent } from './clothes/clothes-list/clothes-list.component';
import { AccessoriesListComponent } from './accessories/accessories-list/accessories-list.component';
import { FoodSuplimentPageComponent } from './food-supliments/food-supliment-page/food-supliment-page.component';
import { OrganicFoodPageComponent } from './organic-food/organic-food-page/organic-food-page.component';
import { ClothesPageComponent } from './clothes/clothes-page/clothes-page.component';
import { AccessoriesPageComponent } from './accessories/accessories-page/accessories-page.component';
import { LoyaltyProgramComponent } from '../loyalty-program/loyalty-program.component';
import { DiscountedProductsComponent } from './discounted-products/discounted-products.component';

const routes: Routes = [{
    path: '',
    component: PagesComponent, // Main component for the Pages module
    children: [
        // Fodd supliments
        {
            path: ProductViewText.FOOD_SUPLIMENTS,
            component: FoodSuplimentsListComponent
        },
        {
            path: ProductViewText.FOOD_SUPLIMENTS + '/:productId',
            component: FoodSuplimentPageComponent
        },

        // Organic food
        {
            path: ProductViewText.ORGANIC_FOOD,
            component: OrganicFoodListComponent
        },
        {
            path: ProductViewText.ORGANIC_FOOD + '/:productId',
            component: OrganicFoodPageComponent
        },

        // Clothing
        {
            path: ProductViewText.CLOTHES,
            component: ClothesListComponent
        },
        {
            path: ProductViewText.CLOTHES + '/:productId',
            component: ClothesPageComponent
        },

        // Accessories
        {
            path: ProductViewText.ACCESSORIES,
            component: AccessoriesListComponent
        },
        {
            path: ProductViewText.ACCESSORIES + '/:productId',
            component: AccessoriesPageComponent
        },

        // Loyaltity program
        {
            path: 'loyaltyProgram',
            component: LoyaltyProgramComponent
        },

        // Discounted products
        {
            path: 'discountedProducts',
            component: DiscountedProductsComponent
        }
    ],
}];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProductRoutingModule {
}
