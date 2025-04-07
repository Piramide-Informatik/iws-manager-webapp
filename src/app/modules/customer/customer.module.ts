// Angular
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

//Modulos
import { CustomerRoutingModule } from './customer-routing.module';

//PrimeNG
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DatePickerModule } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabel } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';


//Componentes
import { ContactComponent } from './components/contact/contact.component';
import { DetailCustomerComponent } from './components/detail-customer/detail-customer.component';
import { EmployeeDetailsComponent } from './components/employee-details/employee-details.component';
import { ListCustomersComponent } from './components/list-customers/list-customers.component';
import { EmployeeOverviewComponent } from './components/employee-overview/employee-overview.component';
import { OrderDetailsComponent } from './components/order-details/order-details.component';


@NgModule({
  declarations: [
    ContactComponent,
    ListCustomersComponent,
    EmployeeOverviewComponent,
    DetailCustomerComponent,
    EmployeeDetailsComponent,
    OrderDetailsComponent,
  ],
  imports: [
    ButtonModule,
    CalendarModule,
    CommonModule,
    CustomerRoutingModule,
    DatePickerModule,
    Dialog,
    DropdownModule,
    FloatLabel,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputNumberModule,
    InputTextModule,
    MultiSelectModule,
    ReactiveFormsModule,
    SelectModule,
    TableModule,
    TagModule,
    TextareaModule,
    ToastModule,
    ToolbarModule
  ]
})
export class CustomerModule {}
