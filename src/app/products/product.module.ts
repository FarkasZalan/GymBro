import { CommonModule, CurrencyPipe } from '@angular/common';
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
import { FoodSuplimentsListComponent } from './food-supliments/food-supliments-list/food-supliments-list.component';
import { OrganicFoodListComponent } from './organic-food/organic-food-list/organic-food-list.component';
import { AccessoriesListComponent } from './accessories/accessories-list/accessories-list.component';
import { ClothesListComponent } from './clothes/clothes-list/clothes-list.component';
import { FoodSuplimentPageComponent } from './food-supliments/food-supliment-page/food-supliment-page.component';
import { OrganicFoodPageComponent } from './organic-food/organic-food-page/organic-food-page.component';
import { AccessoriesPageComponent } from './accessories/accessories-page/accessories-page.component';
import { ClothesPageComponent } from './clothes/clothes-page/clothes-page.component';
import { ReviewHandleComponent } from './review-handle/review-handle.component';
import { DiscountedProductsComponent } from './discounted-products/discounted-products.component';
import { MatIconModule } from '@angular/material/icon';
import { AdminProfileModule } from '../admin-profile/admin-profile.module';
import { FilterPageComponent } from '../filter-page/filter-page.component';
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
        NgxEditorModule,
        MatIconModule,

        AdminProfileModule
    ],
    declarations: [
        ProductsListComponent,
        FoodSuplimentsListComponent,
        OrganicFoodListComponent,
        AccessoriesListComponent,
        ClothesListComponent,
        FoodSuplimentPageComponent,
        OrganicFoodPageComponent,
        AccessoriesPageComponent,
        ClothesPageComponent,
        ReviewHandleComponent,
        DiscountedProductsComponent,
        FilterPageComponent
    ],
    providers: [
        CurrencyPipe
    ],

})
export class ProductModule {
}