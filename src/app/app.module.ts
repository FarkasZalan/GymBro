import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NbSidebarModule, NbMenuModule, NbDatepickerModule, NbDialogModule, NbWindowModule, NbThemeModule, NbIconModule, NbToastrModule } from '@nebular/theme';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from '../environments/environment';
import { MatDialogModule } from '@angular/material/dialog';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireFunctionsModule } from '@angular/fire/compat/functions';
import { AuthGuard } from './auth/auth-guard.service';
import { AuthService } from './auth/auth.service';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminGuard } from './admin-profile/admin-guard.service';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NGX_EDITOR_CONFIG_TOKEN, NgxEditorModule } from 'ngx-editor';
import { ngxEditorConfigFactory } from './editor.header';
import { ReceiptComponent } from './receipt/receipt.component';

// Factory function to create an instance of TranslateHttpLoader
// This loader will be used to fetch translation files over HTTP using the provided HttpClient.
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    ReceiptComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    // Nebular theme modules for menu
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    // For the page design
    NbDatepickerModule.forRoot(),
    NbDialogModule.forRoot(),
    NbWindowModule.forRoot(),
    NbThemeModule.forRoot(),
    NbIconModule,
    MatIconModule,
    ReactiveFormsModule,
    // Import Angular Material modules here
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    // text editor module
    NgxEditorModule.forRoot(),
    // Firebase
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    MatDialogModule,
    AngularFirestoreModule,
    AngularFireFunctionsModule,
    AngularFireStorageModule,
    // Translate
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NbToastrModule.forRoot(),
  ],
  providers: [
    AuthService,
    provideAnimationsAsync(),
    provideHttpClient(),

    // To the authentication
    AuthGuard,
    AdminGuard,

    // To the translate
    TranslateService,
    {
      useFactory: ngxEditorConfigFactory,
      provide: NGX_EDITOR_CONFIG_TOKEN,
      deps: [TranslateService],
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
