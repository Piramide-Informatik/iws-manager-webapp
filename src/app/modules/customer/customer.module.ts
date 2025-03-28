import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ListCustomersComponent } from './components/list-customers/list-customers.component';
import { EmployeeOverviewComponent } from './components/employee-overview/employee-overview.component';
import { TableModule } from 'primeng/table';


@NgModule({
  declarations: [
    ListCustomersComponent,
    EmployeeOverviewComponent
  ],
  imports: [
    CommonModule,
    CustomerRoutingModule,
    TableModule,
    ReactiveFormsModule
  ]
})
export class CustomerModule { }
