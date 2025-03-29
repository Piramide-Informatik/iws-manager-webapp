// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

//Modulos
import { CustomerRoutingModule } from './customer-routing.module';

//PrimeNG
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabel } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';

//Componentes
import { ListCustomersComponent } from './components/list-customers/list-customers.component';
import { ContactComponent } from './components/contact/contact.component';
import { DetailCustomerComponent } from './components/detail-customer/detail-customer.component';
import { EmployeeDetailsComponent } from './components/employee-details/employee-details.component';



@NgModule({
  declarations: [
    ListCustomersComponent,
    DetailCustomerComponent,
    EmployeeDetailsComponent,
    ContactComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    CustomerRoutingModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    MultiSelectModule,
    SelectModule,
    ButtonModule
    ReactiveFormsModule,
    TableModule,
    TextareaModule,
    FloatLabel,
    Dialog
    SelectModule,
    TagModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    DatePickerModule
  ]
})
export class CustomerModule {
 }
