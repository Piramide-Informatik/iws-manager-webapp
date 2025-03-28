import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCustomersComponent } from './components/list-customers/list-customers.component';
import { EmployeeOverviewComponent } from './components/employee-overview/employee-overview.component';

const routes: Routes = [
  {path: 'list-customers', component: ListCustomersComponent},
  {path: 'roles', component: EmployeeOverviewComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
