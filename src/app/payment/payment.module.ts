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
import { CheckoutPageComponent } from './checkout-page/checkout-page.component';
import { PaymentRoutingModule } from './payment-routing.module';
import { ShippingAddressSelectionDialogComponent } from './shipping-address-selection-dialog/shipping-address-selection-dialog.component';
import { SharedModule } from '../shared/shared.module';

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
        PaymentRoutingModule,
        // Import Angular Material modules
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        NgxEditorModule,
        SharedModule
    ],
    declarations: [
        CheckoutPageComponent,
        ShippingAddressSelectionDialogComponent
    ],
    providers: [
        CurrencyPipe
    ]
})
export class PaymentModule {
}