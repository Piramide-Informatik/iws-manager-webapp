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
          import('./modules/customer/customer.module').then(
            (c) => c.CustomerModule
          ),
      },
      {
        path: 'employees',
        loadChildren: () =>
          import('./modules/employee/employee.module').then(
            (e) => e.EmployeeModule
          ),
      },
      {
        path: 'work-contracts',
        loadChildren: () =>
          import('./modules/work-contracts/work-contracts.module').then(
            (w) => w.WorkContractsModule
          ),
      },
      {
        path: 'projects',
        loadChildren: () =>
          import('./modules/projects/project-routing.module').then(
            (w) => w.ProjectRoutingModule
          ),
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('./modules/orders/order-routing.module').then(
            (o) => o.OrderRountingModule
          ),
      },
      {
        path: 'demands',
        loadChildren: () =>
          import('./modules/receivables/receivables.module').then(
            (r) => r.ReceivablesModule
          ),
      },

      {
        path: 'invoices',
        loadChildren: () =>
          import('./modules/invoices/invoices.module').then(
            (m) => m.InvoicesModule
          ),
      },
      {
        path: 'framework-agreements',
        loadChildren: () =>
          import(
            './modules/framework-agreements/framework-agreements.module'
          ).then((f) => f.FrameworkAgreementsModule),
      },
      {
        path: 'contractors',
        loadChildren: () =>
          import('./modules/contractor/contractor-routing.module').then(
            (c) => c.ContractorRoutingModule
          ),
      },
      {
        path: 'subcontracts',
        loadChildren: () =>
          import('./modules/subcontracts/subcontracts.module').then(
            (s) => s.SubcontractsModule
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
