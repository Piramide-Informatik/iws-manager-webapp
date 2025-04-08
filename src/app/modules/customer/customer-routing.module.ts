import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCustomersComponent } from './components/list-customers/list-customers.component';
import { DetailCustomerComponent } from './components/detail-customer/detail-customer.component';
import { ContactComponent } from './components/contact/contact.component';
import { EmployeeOverviewComponent } from '../employee/components/employee-overview/employee-overview.component';
import { EmployeeDetailsComponent } from '../employee/components/employee-details/employee-details.component';
import { ListWorkContractsComponent } from '../work-contracts/components/list-work-contracts/list-work-contracts.component';
import { ProjectsOverviewComponent } from '../projects/components/projects-overview/projects-overview.component';


const routes: Routes = [
  {path: '', component: ListCustomersComponent},
  {path: 'customer-overview', component: ListCustomersComponent},
  {path: 'customer-details', component: DetailCustomerComponent},
  {path: 'customer-details/:id', component: DetailCustomerComponent},
  {path: 'employee-overview', component: EmployeeOverviewComponent},
  {path: 'employee-details', component: EmployeeDetailsComponent},
  {path: 'employment-contracts-overview', component: ListWorkContractsComponent},
  {path: 'projects-overview', component: ProjectsOverviewComponent},
  {path: 'contact', component: ContactComponent},
  {path: 'contact/:id', component: ContactComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
