import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { BlankComponent } from './core/components/blank/blank.component';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth'
  },
  {
    path: 'auth',
    loadChildren: () => 
      import('./modules/auth/auth.module').then(
        (a) => a.AuthModule
      )
  },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    canActivate: [authGuard],
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
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/customer/customer.module').then(
        (c) => c.CustomerModule
      ),
  },
  {
    path: 'projects',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/projects/project.module').then(
        (p) => p.ProjectModule
      )
  },
  {
    path: 'invoicing',
    component: MainLayoutComponent,
    canActivate: [authGuard],
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
    canActivate: [authGuard],
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
    canActivate: [authGuard],
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
export class AppRoutingModule { }
