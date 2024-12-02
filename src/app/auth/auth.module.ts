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
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LogOutComponent } from './log-out/log-out.component';
import { SuccessfullDialogComponent } from '../successfull-dialog/successfull-dialog.component';
import { RegisterComponent } from './register/register.component';
import { TranslateModule } from '@ngx-translate/core';
import { TermsComponent } from './register/terms/terms.component';
import { SharedModule } from '../loading-spinner/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        NbCardModule,
        NbInputModule,
        NbButtonModule,
        NbCheckboxModule,
        AuthRoutingModule,
        NbAuthModule,
        TranslateModule,
        SharedModule
    ],
    declarations: [
        LoginComponent,
        ForgotPasswordComponent,
        LogOutComponent,
        SuccessfullDialogComponent,
        RegisterComponent,
        TermsComponent,
    ],
})
export class AuthModule {
}