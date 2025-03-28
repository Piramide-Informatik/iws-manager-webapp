import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent, 
    children: [
      { path: 'customer', loadChildren: () => import('./modules/customer/customer.module').then(c => c.CustomerModule) },
      { path: 'admin', loadChildren: () => import('./modules/customer/customer.module').then(c => c.CustomerModule) }
    ]   
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
