import { NgModule } from '@angular/core';
import { NbActionsModule, NbButtonModule, NbCardModule, NbContextMenuModule, NbIconModule, NbLayoutModule, NbMenuModule, NbSearchModule, NbSelectModule, NbUserModule } from '@nebular/theme';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { CommonModule } from '@angular/common';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { FooterComponent } from '../layouts/footer/footer.component';
import { HeaderComponent } from '../layouts/header/header.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../loading-spinner/shared.module';
import { SidebarComponent } from '../layouts/sidebar/sidebar.component';

@NgModule({
    declarations: [
        PagesComponent,
        FooterComponent,
        HeaderComponent,
        SidebarComponent,
        NotFoundComponent,
    ],
    imports: [
        PagesRoutingModule,
        NbMenuModule,
        CommonModule,
        NbCardModule,
        NbLayoutModule,
        NbUserModule,
        NbActionsModule,
        NbSearchModule,
        NbContextMenuModule,
        NbButtonModule,
        NbSelectModule,
        NbIconModule,
        NbEvaIconsModule,
        MatIconModule,
        TranslateModule,
        FormsModule,
        SharedModule
    ]
})
export class PagesModule {
}
