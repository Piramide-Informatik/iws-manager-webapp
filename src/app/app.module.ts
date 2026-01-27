//Angular
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import {
  TranslateModule,
  TranslateLoader,
  TranslateDirective,
  TranslatePipe,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DatePipe, DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';

//Modules
import { AppRoutingModule } from './app-routing.module';
import { LayoutModule } from './core/layout/layout.module';
import { MasterDataModule } from './modules/master-data/master-data.module';

//Prime NG
import { ButtonModule } from 'primeng/button';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara';
import { MenubarModule } from 'primeng/menubar';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MessageModule } from 'primeng/message'
import { ToastModule } from 'primeng/toast';

//Components
import { AppComponent } from './app.component';
import { BlankComponent } from './core/components/blank/blank.component';
import { UserPreferenceService } from './Services/user-preferences.service';

// Interceptors
import { credentialsInterceptor } from './core/interceptors/credentials.interceptor';
import { authErrorInterceptor } from './core/interceptors/auth-error.interceptor';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent, BlankComponent],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    ButtonModule,
    MatButtonModule,
    LayoutModule,
    MatButtonModule,
    MasterDataModule,
    SplitButtonModule,
    MenubarModule,
    MenuModule,
    MessageModule,
    AvatarModule,
    TranslatePipe,
    DatePipe,
    TranslateDirective,
    ToastModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      defaultLanguage: 'de',
    }),
  ],
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Lara,
        options: {
          darkModeSelector: '.my-app-dark',
        },
      },
    }),
    provideHttpClient(
      withInterceptors([
        credentialsInterceptor,
        authErrorInterceptor
      ])
    ),
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { dateFormat: "longDate" }
    },
    UserPreferenceService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
