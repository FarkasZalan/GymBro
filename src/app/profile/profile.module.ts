import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NbAuthModule } from '@nebular/auth';
import {
    NbButtonModule,
    NbCardModule,
    NbCheckboxModule,
    NbInputModule,
    NbMenuModule
} from '@nebular/theme';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileListComponent } from './profile-list/profile-list.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { ChangeProfileComponent } from './profile-list/change-profile/change-profile.component';
import { ProfileShippingAddressComponent } from './profile-shipping-address/profile-shipping-address.component';
import { ProfileComponent } from './/profile.component';
import { ProfilePayementMethodsComponent } from './profile-payement-methods/profile-payement-methods.component';
import { ProfileLoyaltyProgramComponent } from './profile-loyalty-program/profile-loyalty-program.component';

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
        ReactiveFormsModule,
        ProfileRoutingModule,
        NbAuthModule,
        TranslateModule
    ],
    declarations: [
        ProfileListComponent,
        ChangeProfileComponent,
        ProfileShippingAddressComponent,
        ProfileComponent,
        ProfilePayementMethodsComponent,
        ProfileLoyaltyProgramComponent
    ],
})
export class ProfileModule {
}