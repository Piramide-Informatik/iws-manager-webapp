import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCustomersComponent } from './components/list-customers/list-customers.component';
import { DetailCustomerComponent } from './components/detail-customer/detail-customer.component';
import { ContactComponent } from './components/contact/contact.component';
import { EmployeeDetailsComponent } from './components/employee-details/employee-details.component';
import { EmployeeOverviewComponent } from './components/employee-overview/employee-overview.component';
import { OrderDetailsComponent } from './components/order-details/order-details.component';

const routes: Routes = [
  {path: 'list-customers', component: ListCustomersComponent},
  {path: 'employee-details', component: EmployeeDetailsComponent},
  {path: 'detail-customer', component: DetailCustomerComponent},
  {path: 'detail-customer/:id', component: DetailCustomerComponent},
  {path: 'contact', component: ContactComponent},
  {path: 'roles', component: EmployeeOverviewComponent},
  {path: 'order-details', component: OrderDetailsComponent}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
