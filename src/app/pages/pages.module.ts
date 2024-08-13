import { NgModule } from '@angular/core';
import { NbActionsModule, NbButtonModule, NbCardModule, NbContextMenuModule, NbIconModule, NbLayoutModule, NbMenuModule, NbSearchModule, NbSelectModule, NbSidebarModule, NbUserModule } from '@nebular/theme';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { CommonModule } from '@angular/common';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { FooterComponent } from '../layouts/footer/footer.component';
import { HeaderComponent } from '../layouts/header/header.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        PagesComponent,
        FooterComponent,
        HeaderComponent,
        NotFoundComponent
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
        NbSidebarModule,
        NbContextMenuModule,
        NbButtonModule,
        NbSelectModule,
        NbIconModule,
        NbEvaIconsModule,
        TranslateModule
    ]
})
export class PagesModule {
}
