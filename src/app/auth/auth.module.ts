import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NbAuthModule } from '@nebular/auth';
import {
    NbButtonModule,
    NbCardModule,
    NbCheckboxModule,
    NbIconModule,
    NbInputModule
} from '@nebular/theme';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { LogOutComponent } from './log-out/log-out.component';
import { SuccessfullDialogComponent } from '../successfull-dialog/successfull-dialog.component';
import { RegisterComponent } from './register/register.component';
import { TranslateModule } from '@ngx-translate/core';
import { TermsComponent } from './register/terms/terms.component';
import { SharedModule } from '../loading-spinner/shared.module';
import { AngularFireFunctionsModule, REGION } from '@angular/fire/compat/functions';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VerifiedComponent } from './verified/verified.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        NbCardModule,
        NbInputModule,
        NbIconModule,
        NbButtonModule,
        NbCheckboxModule,
        AuthRoutingModule,
        NbAuthModule,
        TranslateModule,
        SharedModule,

        // Firebase functions
        AngularFireFunctionsModule
    ],
    declarations: [
        LoginComponent,
        LogOutComponent,
        ForgotPasswordComponent,
        SuccessfullDialogComponent,
        RegisterComponent,
        TermsComponent,
        VerifiedComponent,
        ChangePasswordComponent,
    ],
    providers: [
        // Firebase functions region
        { provide: REGION, useValue: 'europe-central2' }
    ],
})
export class AuthModule {
}