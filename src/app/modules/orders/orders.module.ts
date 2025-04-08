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
  ],
})
export class OrdersModule { }
