import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PagesComponent } from '../pages/pages.component';

export const routes: Routes = [
    {
        path: '',
        component: PagesComponent, // Wrap all child routes under PagesComponent
        children: [
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            },
            {
                path: 'login',
                component: LoginComponent
            },
            {
                path: 'register',
                component: RegisterComponent
            }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)], // Register the routes in the RouterModule
    exports: [RouterModule], // Export RouterModule for use in other modules
})
export class AuthRoutingModule {
}