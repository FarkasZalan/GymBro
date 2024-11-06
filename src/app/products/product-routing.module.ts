import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PagesComponent } from '../pages/pages.component';
import { ProductViewText } from '../admin-profile/product-management/product-view-texts';
import { FoodSuplimentsListComponent } from './food-supliments-list/food-supliments-list.component';
import { OrganicFoodListComponent } from './organic-food-list/organic-food-list.component';
import { ClothesListComponent } from './clothes-list/clothes-list.component';
import { AccessoriesListComponent } from './accessories-list/accessories-list.component';

const routes: Routes = [{
    path: '',
    component: PagesComponent, // Main component for the Pages module
    children: [
        // Fodd supliments
        {
            path: ProductViewText.FOOD_SUPLIMENTS,
            component: FoodSuplimentsListComponent
        },

        // Organic food
        {
            path: ProductViewText.ORGANIC_FOOD,
            component: OrganicFoodListComponent
        },

        // Clothing
        {
            path: ProductViewText.CLOTHES,
            component: ClothesListComponent
        },

        // Accessories
        {
            path: ProductViewText.ACCESSORIES,
            component: AccessoriesListComponent
        },
    ],
}];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProductRoutingModule {
}
