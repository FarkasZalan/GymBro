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
import { ProfileListComponent } from './profile-list/profile-list.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { ChangeProfileComponent } from './profile-list/change-profile/change-profile.component';
import { ProfileShippingAddressComponent } from './profile-shipping-address/profile-shipping-address.component';
import { ProfileComponent } from './/profile.component';
import { ProfilePayementMethodsComponent } from './profile-payement-methods/profile-payement-methods.component';
import { ProfileLoyaltyProgramComponent } from './profile-loyalty-program/profile-loyalty-program.component';
import { ProfileOrdersComponent } from './profile-orders/profile-orders.component';
import { CreateShippingAddressComponent } from './profile-shipping-address/create-shipping-address/create-shipping-address.component';
import { ChangeDefaultAddressConfirmDialogComponent } from './profile-shipping-address/change-default-address-confirm-dialog/change-default-address-confirm-dialog.component';
import { EditShippingAddressComponent } from './profile-shipping-address/edit-shipping-address/edit-shipping-address.component';

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
        ProfileRoutingModule,
        NbAuthModule,
        TranslateModule
    ],
    declarations: [
        // Declaring components that belong to the Profile module
        ProfileListComponent,
        ChangeProfileComponent,
        ProfileShippingAddressComponent,
        ProfileComponent,
        ProfilePayementMethodsComponent,
        ProfileLoyaltyProgramComponent,
        ProfileOrdersComponent,
        CreateShippingAddressComponent,
        ChangeDefaultAddressConfirmDialogComponent,
        EditShippingAddressComponent
    ],
    exports: [
        ProfileListComponent // To the admin profile module
    ]
})
export class ProfileModule {
}