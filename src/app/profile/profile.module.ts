import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NbAuthModule } from '@nebular/auth';
import {
    NbButtonModule,
    NbCardModule,
    NbCheckboxModule,
    NbInputModule
} from '@nebular/theme';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileListComponent } from './profile-list/profile-list.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { ChangeProfileComponent } from './profile-list/change-profile/change-profile.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        NbCardModule,
        NbInputModule,
        NbButtonModule,
        NbCheckboxModule,
        ProfileRoutingModule,
        NbAuthModule,
        TranslateModule
    ],
    declarations: [
        ProfileListComponent,
        ChangeProfileComponent
    ],
})
export class ProfileModule {
}