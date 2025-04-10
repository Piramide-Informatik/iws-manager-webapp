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


//Componentes
import { ContactComponent } from './components/contact/contact.component';
import { DetailCustomerComponent } from './components/detail-customer/detail-customer.component';
import { ListCustomersComponent } from './components/list-customers/list-customers.component';

@NgModule({
  declarations: [
    ContactComponent,
    ListCustomersComponent,
    DetailCustomerComponent,
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
  ]
})
export class CustomerModule {}
