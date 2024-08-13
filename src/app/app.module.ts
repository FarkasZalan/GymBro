import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NbSidebarModule, NbMenuModule, NbDatepickerModule, NbDialogModule, NbWindowModule, NbThemeModule } from '@nebular/theme';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from '../environments/environment';
import { MatDialogModule } from '@angular/material/dialog';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireFunctionsModule } from '@angular/fire/compat/functions';
import { AuthGuard } from './auth/auth-guard.service';
import { AuthService } from './auth/auth.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    // Nebular theme modules for menu
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbDatepickerModule.forRoot(),
    NbDialogModule.forRoot(),
    NbWindowModule.forRoot(),
    NbThemeModule.forRoot(),
    // Firebase
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    MatDialogModule,
    AngularFirestoreModule,
    AngularFireFunctionsModule
  ],
  providers: [
    AuthService,
    provideAnimationsAsync(),
    AuthGuard,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
