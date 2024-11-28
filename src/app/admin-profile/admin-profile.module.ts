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
import { BlogListComponent } from './blog/blog-list/blog-list.component';
import { OrderListComponent } from './orders/order-list/order-list.component';
import { ProductsCategoriesComponent } from './product-management/products-categories/products-categories.component';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { AddPriceDialogComponent } from './product-management/product-actions/add-price-dialog/add-price-dialog.component';
import { HandleFoodSuplimentsComponent } from './product-management/product-actions/handle-food-supliments/handle-food-supliments.component';
import { HandleAccessoriesComponent } from './product-management/product-actions/handle-accessories/handle-accessories.component';
import { HandleClothesComponent } from './product-management/product-actions/handle-clothes/handle-clothes.component';
import { ChangeDefaultPriceConfirmDialogComponent } from './product-management/product-actions/change-default-price-confirm-dialog/change-default-price-confirm-dialog.component';
import { AddColorDialogComponent } from './product-management/product-actions/add-color-dialog/add-color-dialog.component';
import { HandleBlogsComponent } from './blog/blog-list/handle-blogs/handle-blogs.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxEditorModule } from 'ngx-editor';
import { BlogComponent } from './blog/blog.component';
import { UserBlogListComponent } from '../user-blog-list/user-blog-list.component';
import { FilterPageComponent } from '../filter-page/filter-page.component';
import { HandleOrganicFoodComponent } from './product-management/product-actions/handle-organic-food/handle-organic-food.component';
import { HandleReviewsComponent } from './product-management/product-actions/handle-reviews/handle-reviews.component';
import { OrdersComponent } from './orders/orders.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

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
        ProfileModule,
        // Import Angular Material modules
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        NgxEditorModule
    ],
    declarations: [
        // Declaring components that belong to the Profile module
        AdminProfileComponent,
        BlogListComponent,
        OrderListComponent,
        ProductsCategoriesComponent,

        // Delete confirmation
        DeleteConfirmationDialogComponent,

        // to add new weight/pieses, price and image
        AddPriceDialogComponent,
        ChangeDefaultPriceConfirmDialogComponent,
        HandleFoodSuplimentsComponent,
        HandleOrganicFoodComponent,
        HandleAccessoriesComponent,
        HandleClothesComponent,
        AddColorDialogComponent,
        HandleBlogsComponent,
        BlogComponent,
        UserBlogListComponent,
        FilterPageComponent,
        HandleReviewsComponent,
        OrdersComponent,
        LoadingSpinnerComponent
    ],
    exports: [
        LoadingSpinnerComponent
    ]
})
export class AdminProfileModule {
}