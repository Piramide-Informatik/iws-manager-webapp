import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';
import { ListCustomersComponent } from './components/list-customers/list-customers.component';
import { TableModule } from 'primeng/table';
import { EmployeeDetailsComponent } from './components/employee-details/employee-details.component';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DatePickerModule } from 'primeng/datepicker';

@NgModule({
  declarations: [
    ListCustomersComponent,
    EmployeeDetailsComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    CustomerRoutingModule,
    TableModule,
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
export class CustomerModule { }
