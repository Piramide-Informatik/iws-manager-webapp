import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';

const routes: Routes = [
  {
    path: '',

    component: MainLayoutComponent,
    children: [
      {
        path: 'customers',
        loadChildren: () =>
          import('./modules/customers/customer/customer.module').then(
            (c) => c.CustomerModule
          ),
      },
      {
        path: 'employees',
        loadChildren: () =>
          import('./modules/customers/employee/employee.module').then(
            (e) => e.EmployeeModule
          ),
      },
      {
        path: 'work-contracts',
        loadChildren: () =>
          import('./modules/customers/work-contracts/work-contracts.module').then(
            (w) => w.WorkContractsModule
          ),
      },
      {
        path: 'projects',
        loadChildren: () =>
          import('./modules/customers/projects/project-routing.module').then(
            (w) => w.ProjectRoutingModule
          ),
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('./modules/customers/orders/order-routing.module').then(
            (o) => o.OrderRountingModule
          ),
      },
      {
        path: 'demands',
        loadChildren: () =>
          import('./modules/customers/receivables/receivables.module').then(
            (r) => r.ReceivablesModule
          ),
      },

      {
        path: 'invoices',
        loadChildren: () =>
          import('./modules/customers/invoices/invoices.module').then(
            (m) => m.InvoicesModule
          ),
      },
      {
        path: 'framework-agreements',
        loadChildren: () =>
          import(
            './modules/customers/framework-agreements/framework-agreements.module'
          ).then((f) => f.FrameworkAgreementsModule),
      },
      {
        path: 'contractors',
        loadChildren: () =>
          import('./modules/customers/contractor/contractor-routing.module').then(
            (c) => c.ContractorRoutingModule
          ),
      },
      {
        path: 'subcontracts',
        loadChildren: () =>
          import('./modules/customers/subcontracts/subcontracts.module').then(
            (s) => s.SubcontractsModule
          ),
      },
      {
        path: 'master-data',
        loadChildren: () =>
          import('./modules/master-data/master-data.module').then(
            (md) => md.MasterDataModule
          ),
      },      
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
