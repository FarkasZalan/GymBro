import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PagesComponent } from '../pages/pages.component';
import { ReceiptComponent } from './receipt.component';

const routes: Routes = [{
    path: '',
    component: PagesComponent, // Main component for the Pages module
    children: [
        {
            path: ':id',
            component: ReceiptComponent
        },
    ],
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ReceiptRoutingModule {
}
