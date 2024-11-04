import { NgModule } from '@angular/core';
import { NbActionsModule, NbButtonModule, NbCardModule, NbContextMenuModule, NbIconModule, NbLayoutModule, NbMenuModule, NbSearchModule, NbSelectModule, NbSidebarModule, NbUserModule } from '@nebular/theme';
import { CommonModule } from '@angular/common';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { BlogPageViewComponent } from '../user-blog-list/blog-page-view/blog-page-view.component';
import { BlogRoutingModule } from './blog-routing.module';

@NgModule({
    declarations: [
        // blog page on user site
        BlogPageViewComponent
    ],
    imports: [
        BlogRoutingModule,
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
        MatIconModule,
        TranslateModule
    ]
})
export class BlogModule {
}
