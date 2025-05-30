import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCustomersComponent } from './components/list-customers/list-customers.component';
import { DetailCustomerComponent } from './components/detail-customer/detail-customer.component';
import { ContactComponent } from './components/contact/contact.component';
import { PageCustomerComponent } from './components/page-customer/page-customer.component';


const routes: Routes = [
  { path: '', component: ListCustomersComponent },
  { path: 'customer-details', component: DetailCustomerComponent },
  { path: 'customer-details/:id', component: DetailCustomerComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'contact/:id', component: ContactComponent },
  { 
    path: ':id', 
    component: PageCustomerComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'employees'
      },
      { 
        path: 'employees', 
        loadChildren: () =>
          import('../../modules/employee/employee.module').then(
            (e) => e.EmployeeModule
          ),
      },
      {
        path: 'work-contracts',
        loadChildren: () =>
          import('../../modules/work-contracts/work-contracts.module').then(
            (w) => w.WorkContractsModule
          ),
      },
      {
        path: 'projects',
        loadChildren: () =>
          import('../../modules/projects/project-routing.module').then(
            (w) => w.ProjectRoutingModule
          ),
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('../../modules/orders/order-routing.module').then(
            (o) => o.OrderRountingModule
          ),
      },
      {
        path: 'demands',
        loadChildren: () =>
          import('../../modules/receivables/receivables.module').then(
            (r) => r.ReceivablesModule
          ),
      },
      {
        path: 'invoices',
        loadChildren: () =>
          import('../../modules/invoices/invoices.module').then(
            (m) => m.InvoicesModule
          ),
      },
      {
        path: 'framework-agreements',
        loadChildren: () =>
          import('../../modules/framework-agreements/framework-agreements.module'
          ).then((f) => f.FrameworkAgreementsModule),
      },
      {
        path: 'contractors',
        loadChildren: () =>
          import('../../modules/contractor/contractor-routing.module').then(
            (c) => c.ContractorRoutingModule
          ),
      },
      {
        path: 'subcontracts',
        loadChildren: () =>
          import('../../modules/subcontracts/subcontracts.module').then(
            (s) => s.SubcontractsModule
          ),
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
