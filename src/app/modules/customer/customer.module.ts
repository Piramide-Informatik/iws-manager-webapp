import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { CustomerRoutingModule } from './customer-routing.module';
import { ListCustomersComponent } from './components/list-customers/list-customers.component';
import { TableModule } from 'primeng/table';
import { DetailCustomerComponent } from './components/detail-customer/detail-customer.component';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabel } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';


@NgModule({
  declarations: [
    ListCustomersComponent,
    DetailCustomerComponent
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
export class CustomerModule { }
