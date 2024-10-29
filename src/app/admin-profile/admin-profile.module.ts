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
import { AdminRoutingModule } from './admin-profile-routing.module';
import { AdminProfileComponent } from './admin-profile.component';
import { ProfileModule } from '../profile/profile.module';
import { StatisticsComponent } from './statistics/statistics.component';
import { ProductsListComponent } from './product-management/products-categories/products-list/products-list.component';
import { BlogListComponent } from './blog-list/blog-list.component';
import { OrderListComponent } from './order-list/order-list.component';
import { ProductsCategoriesComponent } from './product-management/products-categories/products-categories.component';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { AddPriceDialogComponent } from './product-management/product-actions/add-price-dialog/add-price-dialog.component';
import { HandleFoodSuplimentsComponent } from './product-management/product-actions/handle-food-supliments/handle-food-supliments.component';
import { HandleHealtyProductsComponent } from './product-management/product-actions/handle-healty-products/handle-healty-products.component';
import { HandleAccessoriesComponent } from './product-management/product-actions/handle-accessories/handle-accessories.component';
import { HandleClothesComponent } from './product-management/product-actions/handle-clothes/handle-clothes.component';
import { ChangeDefaultPriceConfirmDialogComponent } from './product-management/product-actions/change-default-price-confirm-dialog/change-default-price-confirm-dialog.component';
import { AddColorDialogComponent } from './product-management/product-actions/add-color-dialog/add-color-dialog.component';
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
        AdminRoutingModule,
        NbAuthModule,
        TranslateModule,
        ProfileModule
    ],
    declarations: [
        // Declaring components that belong to the Profile module
        AdminProfileComponent,
        StatisticsComponent,
        ProductsListComponent,
        BlogListComponent,
        OrderListComponent,
        ProductsCategoriesComponent,

        // Delete confirmation
        DeleteConfirmationDialogComponent,

        // to add new weight/pieses, price and image
        AddPriceDialogComponent,
        ChangeDefaultPriceConfirmDialogComponent,
        HandleFoodSuplimentsComponent,
        HandleHealtyProductsComponent,
        HandleAccessoriesComponent,
        HandleClothesComponent,
        AddColorDialogComponent
    ],
})
export class AdminProfileModule {
}