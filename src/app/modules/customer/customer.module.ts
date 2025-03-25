import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';
import { ListCustomersComponent } from './components/list-customers/list-customers.component';
import { TableModule } from 'primeng/table';


@NgModule({
  declarations: [
    ListCustomersComponent
  ],
  imports: [
    CommonModule,
    CustomerRoutingModule,
    TableModule
  ]
})
export class CustomerModule { }
