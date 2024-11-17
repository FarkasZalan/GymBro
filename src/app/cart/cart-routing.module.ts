import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PagesComponent } from '../pages/pages.component';
import { CartComponent } from './cart-page/cart.component';

const routes: Routes = [{
    path: '',
    component: PagesComponent, // Main component for the Pages module
    children: [
        {
            path: '',
            component: CartComponent
        },
    ],
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CartRoutingModule {
}
