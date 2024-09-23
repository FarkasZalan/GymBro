import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from '../pages/pages.component';
import { ProfileComponent } from './profile.component';

export const routes: Routes = [
    {
        path: '',
        component: PagesComponent,
        children: [
            {
                path: '',
                component: ProfileComponent
            },
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProfileRoutingModule {
}