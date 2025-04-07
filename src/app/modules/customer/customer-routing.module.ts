import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCustomersComponent } from './components/list-customers/list-customers.component';
import { DetailCustomerComponent } from './components/detail-customer/detail-customer.component';
import { ContactComponent } from './components/contact/contact.component';
import { EmployeeDetailsComponent } from './components/employee-details/employee-details.component';
import { EmployeeOverviewComponent } from './components/employee-overview/employee-overview.component';
import { ProjectsOverviewComponent } from './components/projects-overview/projects-overview.component';
import { ListWorkContractsComponent } from './components/list-work-contracts/list-work-contracts.component';

const routes: Routes = [
  {path: 'customer-overview', component: ListCustomersComponent},
  {path: 'employee-overview', component: EmployeeOverviewComponent},
  {path: 'employee-details', component: EmployeeDetailsComponent},
  {path: 'employment-contracts-overview', component: ListWorkContractsComponent},
  {path: 'projects-overview', component: ProjectsOverviewComponent},
  {path: 'customer-details/:id', component: DetailCustomerComponent},
  {path: 'projects-overview', component: ProjectsOverviewComponent},

  {path: 'contact', component: ContactComponent},
  {path: 'roles', component: EmployeeOverviewComponent}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
