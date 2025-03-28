// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

//Modulos
import { CustomerRoutingModule } from './customer-routing.module';

//PrimeNG
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabel } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

//Componentes
import { ListCustomersComponent } from './components/list-customers/list-customers.component';
import { ContactComponent } from './components/contact/contact.component';
import { DetailCustomerComponent } from './components/detail-customer/detail-customer.component';


@NgModule({
  declarations: [
    ListCustomersComponent,
    DetailCustomerComponent,
    ContactComponent
  ],
  imports: [
    CommonModule,
    CustomerRoutingModule,
    ReactiveFormsModule,
    TableModule,
    DropdownModule,
    SelectModule,
    InputTextModule,
    TextareaModule,
    FloatLabel,
    ButtonModule,
    Dialog
  ]
})
export class CustomerModule {
 }
