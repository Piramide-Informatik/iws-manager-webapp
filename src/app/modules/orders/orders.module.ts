//Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

//Modulos
import { OrderRountingModule } from './order-routing.module';

//Prime NG
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { TableModule } from 'primeng/table';

import { CalendarModule } from 'primeng/calendar';
import { DatePickerModule } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';

//Components
import { OrderDetailComponent } from './components/order-detail/order-detail.component';
import { OrderComponent } from './components/order-detail/order/order.component';
import { ProjectComponent } from './components/order-detail/project/project.component';
import { IwsProvisionComponent } from './components/order-detail/iws-provision/iws-provision.component';



@NgModule({
  declarations: [
    OrderDetailComponent,
    OrderComponent,
    ProjectComponent,
    IwsProvisionComponent
  ],
  imports: [
    ButtonModule,
    CardModule,
    CommonModule,
    FloatLabel,
    OrderRountingModule,
    ReactiveFormsModule,
    TableModule,

    CalendarModule,
    DatePickerModule,
    Dialog,
    DropdownModule,
    IconFieldModule,
    InputIconModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    MultiSelectModule,
    SelectModule,
    TagModule,
    TextareaModule,
    ToastModule,
    ToolbarModule
  ],
})
export class OrdersModule { }
