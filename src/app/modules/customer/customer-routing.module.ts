import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCustomersComponent } from './components/list-customers/list-customers.component';
import { DetailCustomerComponent } from './components/detail-customer/detail-customer.component';
import { ContactComponent } from './components/contact/contact.component';
import { OrderDetailsComponent } from './components/order-details/order-details.component';
import { EmployeeOverviewComponent } from '../employee/components/employee-overview/employee-overview.component';


const routes: Routes = [
  {path: 'list', component: ListCustomersComponent},
  {path: 'detail-customer', component: DetailCustomerComponent},
  {path: 'detail-customer/:id', component: DetailCustomerComponent},
  {path: 'contact', component: ContactComponent},
  {path: 'roles', component: EmployeeOverviewComponent},
  {path: 'order-details', component: OrderDetailsComponent},
  {path: 'contact/:id', component: ContactComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
