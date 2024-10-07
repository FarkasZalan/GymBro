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
import { CreateFoodSuplimentsComponent } from './product-management/products-create/create-food-supliements/create-food-supliements.component';
import { CreateHealthyFoodComponent } from './product-management/products-create/create-healthy-food/create-healthy-food.component';
import { CreateClothesComponent } from './product-management/products-create/create-clothes/create-clothes.component';
import { CreateAccessoriesComponent } from './product-management/products-create/create-accessories/create-accessories.component';
import { EditAccessoriesComponent } from './product-management/products-edit/edit-accessories/edit-accessories.component';
import { EditClothesComponent } from './product-management/products-edit/edit-clothes/edit-clothes.component';
import { EditHealthyFoodComponent } from './product-management/products-edit/edit-healthy-food/edit-healthy-food.component';
import { EditFoodSupliementsComponent } from './product-management/products-edit/edit-food-supliements/edit-food-supliements.component';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';
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
        CreateFoodSuplimentsComponent,
        CreateHealthyFoodComponent,
        CreateClothesComponent,
        CreateAccessoriesComponent,
        EditAccessoriesComponent,
        EditClothesComponent,
        EditHealthyFoodComponent,
        EditFoodSupliementsComponent,

        // Delete confirmation
        DeleteConfirmationDialogComponent
    ],
})
export class AdminProfileModule {
}