//Angular
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClient, provideHttpClient  } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import {
  TranslateModule,
  TranslateLoader,
  TranslateDirective,
  TranslatePipe,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

//Modules
import { AppRoutingModule } from './app-routing.module';
import { CustomerModule } from './modules/customer/customer.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { LayoutModule } from './core/layout/layout.module';
import { MasterDataModule } from './modules/master-data/master-data.module';
import { ProjectModule } from './modules/projects/project.module';
import { FrameworkAgreementsModule } from './modules/framework-agreements/framework-agreements.module';
import { SubcontractsModule } from './modules/subcontracts/subcontracts.module';
import { WorkContractsModule } from './modules/work-contracts/work-contracts.module';

//Prime NG
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara';
import { MenubarModule } from 'primeng/menubar';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MessageModule } from 'primeng/message'

//Components
import { AppComponent } from './app.component';
import { OrdersModule } from './modules/orders/orders.module';
import { ContractorModule } from './modules/contractor/contractor.module';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    ButtonModule,
    CustomerModule,
    EmployeeModule,
    WorkContractsModule,
    ProjectModule,
    FrameworkAgreementsModule,
    MatButtonModule,
    LayoutModule,
    MatButtonModule,
    MasterDataModule,
    OrdersModule,
    OverlayPanelModule,
    ProjectModule,
    SplitButtonModule,
    SubcontractsModule,
    WorkContractsModule,
    ContractorModule,
    MenubarModule,
    MenuModule,
    MessageModule,
    AvatarModule,
    TranslatePipe,
    TranslateDirective,
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
    provideHttpClient(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
