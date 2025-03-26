import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';
import { ListCustomersComponent } from './components/list-customers/list-customers.component';
import { TableModule } from 'primeng/table';
import { ContactComponent } from './components/contact/contact.component';


@NgModule({
  declarations: [
    ListCustomersComponent,
    ContactComponent
  ],
  imports: [
    CommonModule,
    CustomerRoutingModule,
    TableModule
  ]
})
export class CustomerModule { }
