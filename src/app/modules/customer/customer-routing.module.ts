import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCustomersComponent } from './components/list-customers/list-customers.component';
import { DetailCustomerComponent } from './components/detail-customer/detail-customer.component';
import { ContactComponent } from './components/contact/contact.component';
import { PageCustomerComponent } from './components/page-customer/page-customer.component';


const routes: Routes = [
  {path: '', component: ListCustomersComponent},
  {path: 'customer-details', component: DetailCustomerComponent},
  {path: 'customer-details/:id', component: DetailCustomerComponent},
  {path: 'contact', component: ContactComponent},
  {path: 'contact/:id', component: ContactComponent},
  { path: 'pr', component: PageCustomerComponent},
  { 
    path: 'pr/employees', 
    component: PageCustomerComponent,
    loadChildren: () =>
      import('../../modules/employee/employee.module').then(
        (e) => e.EmployeeModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
