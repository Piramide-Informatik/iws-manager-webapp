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
        path: 'admin', 
        loadChildren: () => 
        import('./modules/customer/customer.module')
        .then(
          c => c.CustomerModule
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
