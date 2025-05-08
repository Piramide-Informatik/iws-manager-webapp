// Angular
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

//Modulos
import { CustomerRoutingModule } from './customer-routing.module';

//PrimeNG
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

//Components
import { ContactComponent } from './components/contact/contact.component';
import { DetailCustomerComponent } from './components/detail-customer/detail-customer.component';
import { ListCustomersComponent } from './components/list-customers/list-customers.component';
import { TranslateDirective, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { PageCustomerComponent } from './components/page-customer/page-customer.component';
import { SubMenuComponent } from './components/sub-menu/sub-menu.component';

@NgModule({
  declarations: [
    ContactComponent,
    ListCustomersComponent,
    DetailCustomerComponent,
    PageCustomerComponent,
    SubMenuComponent,
  ],
  imports: [
    ButtonModule,
    CommonModule,
    CustomerRoutingModule,
    FloatLabel,
    FormsModule,
    InputTextModule,
    MessageModule,
    MultiSelectModule,
    ReactiveFormsModule,
    SelectModule,
    TableModule,
    TextareaModule,
    ToolbarModule,
    TranslateModule,
    TranslatePipe,
    TranslateDirective,
    DialogModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
  ]
})
export class CustomerModule {}
