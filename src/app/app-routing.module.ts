import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { BlankComponent } from './core/components/blank/blank.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: BlankComponent
      }
    ]
  },
  {
    path: 'customers',
    component: MainLayoutComponent,
    loadChildren: () =>
      import('./modules/customer/customer.module').then(
        (c) => c.CustomerModule
      ),
  },
  {
    path: 'projects',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: BlankComponent
      }
    ]
  },
  {
    path: 'invoicing',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: BlankComponent
      }
    ]
  },
  {
    path: 'controlling',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: BlankComponent
      }
    ]
  },
  {
    path: 'master-data',
    component: MainLayoutComponent,
    loadChildren: () =>
      import('./modules/master-data/master-data.module').then(
        (md) => md.MasterDataModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
