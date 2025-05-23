//Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

//Modulos
import { OrderRountingModule } from './order-routing.module';

//Prime NG
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { FieldsetModule } from 'primeng/fieldset';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageModule } from 'primeng/message';


//Components
import { OrderDetailsComponent } from './components/order-detail/order-details.component';
import { OrderComponent } from './components/order-detail/order/order.component';
import { ProjectComponent } from './components/order-detail/project/project.component';
import { IwsProvisionComponent } from './components/order-detail/iws-provision/iws-provision.component';
import { OrdersOverviewComponent } from './components/orders-overview/orders-overview.component';

import { TranslateDirective, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { MasterDataModule } from '../master-data/master-data.module';

@NgModule({
  declarations: [
    OrderDetailsComponent,
    OrderComponent,
    ProjectComponent,
    IwsProvisionComponent,
    OrdersOverviewComponent
  ],
  imports: [
    ButtonModule,
    CardModule,
    CommonModule,
    DatePickerModule,
    DialogModule,
    FloatLabel,
    InputTextModule,
    OrderRountingModule,
    ReactiveFormsModule,
    TableModule,
    SelectModule,
    MultiSelectModule,
    FieldsetModule,
    ToolbarModule,
    IconFieldModule,
    InputIconModule,
    FormsModule,
    MessageModule,
    TranslateModule,
    TranslatePipe,
    TranslateDirective,
    MasterDataModule
  ],
})
export class OrdersModule { }
