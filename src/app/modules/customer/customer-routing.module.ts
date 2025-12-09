import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCustomersComponent } from './components/list-customers/list-customers.component';
import { DetailCustomerComponent } from './components/detail-customer/detail-customer.component';
import { PageCustomerComponent } from './components/page-customer/page-customer.component';


const routes: Routes = [
  { path: '', component: ListCustomersComponent },
  { path: 'create', component: DetailCustomerComponent },
  {
    path: '',
    component: PageCustomerComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'customer-details/:id'
      },
      {
        path: 'customer-details/:id',
        component: DetailCustomerComponent
      },
      {
        path: 'employees/:id',
        loadChildren: () =>
          import('../../modules/customer/sub-modules/employee/employee.module').then(
            (e) => e.EmployeeModule
          ),
      },
      {
        path: 'work-contracts/:id',
        loadChildren: () =>
          import('../../modules/customer/sub-modules/work-contracts/work-contracts.module').then(
            (w) => w.WorkContractsModule
          ),
      },
      {
        path: 'absences/:id',
        loadChildren: () =>
          import('../../modules/customer/sub-modules/absences/absences.module').then(
            (a) => a.AbsencesModule
          )
      },
      {
        path: 'orders/:id',
        loadChildren: () =>
          import('../../modules/customer/sub-modules/orders/orders.module').then(
            (o) => o.OrdersModule
          ),
      },
      {
        path: 'demands/:id',
        loadChildren: () =>
          import('../../modules/customer/sub-modules/receivables/receivables.module').then(
            (r) => r.ReceivablesModule
          ),
      },
      {
        path: 'invoices/:id',
        loadChildren: () =>
          import('../../modules/customer/sub-modules/invoices/invoices.module').then(
            (m) => m.InvoicesModule
          ),
      },
      {
        path: 'framework-agreements/:id',
        loadChildren: () =>
          import('../../modules/customer/sub-modules/framework-agreements/framework-agreements.module'
          ).then((f) => f.FrameworkAgreementsModule),
      },
      {
        path: 'contractors/:id',
        loadChildren: () =>
          import('../../modules/customer/sub-modules/contractor/contractor.module').then(
            (c) => c.ContractorModule
          ),
      },
      {
        path: 'subcontracts/:id',
        loadChildren: () =>
          import('../../modules/customer/sub-modules/subcontracts/subcontracts.module').then(
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
