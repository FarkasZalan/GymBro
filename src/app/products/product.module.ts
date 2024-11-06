import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NbAuthModule } from '@nebular/auth';
import {
    NbButtonModule,
    NbCardModule,
    NbCheckboxModule,
    NbIconModule,
    NbInputModule,
    NbMenuModule
} from '@nebular/theme';

// Importing profile components for the Profile module
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxEditorModule } from 'ngx-editor';
import { ProductRoutingModule } from './product-routing.module';
import { ProductsListComponent } from '../admin-profile/product-management/products-categories/products-list/products-list.component';
import { ProductSiteComponent } from './product-site/product-site.component';
import { FoodSuplimentsListComponent } from './food-supliments-list/food-supliments-list.component';
import { OrganicFoodListComponent } from './organic-food-list/organic-food-list.component';
import { AccessoriesListComponent } from './accessories-list/accessories-list.component';
import { ClothesListComponent } from './clothes-list/clothes-list.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        NbCardModule,
        NbMenuModule,
        NbInputModule,
        NbButtonModule,
        NbCheckboxModule,
        NbIconModule,
        ReactiveFormsModule,
        NbAuthModule,
        TranslateModule,
        ProductRoutingModule,
        // Import Angular Material modules
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        NgxEditorModule
    ],
    declarations: [
        ProductsListComponent,
        ProductSiteComponent,
        FoodSuplimentsListComponent,
        OrganicFoodListComponent,
        AccessoriesListComponent,
        ClothesListComponent
    ],
})
export class ProductModule {
}