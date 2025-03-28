import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCustomersComponent } from './components/list-customers/list-customers.component';
import { ContactComponent } from './components/contact/contact.component';
import { EmployeeDetailsComponent } from './components/employee-details/employee-details.component';

const routes: Routes = [
  {path: 'list-customers', component: ListCustomersComponent},
  {path: 'employee-details', component: EmployeeDetailsComponent},
  {path: 'contact', component: ContactComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
