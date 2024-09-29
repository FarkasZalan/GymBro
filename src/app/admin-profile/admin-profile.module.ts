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
import { ProductsListComponent } from './products-list/products-list.component';
import { BlogListComponent } from './blog-list/blog-list.component';
import { OrderListComponent } from './order-list/order-list.component';
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
        OrderListComponent
    ],
})
export class AdminProfileModule {
}