import { inject, NgModule } from '@angular/core';
import { ResolveFn, RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { BlankComponent } from './core/components/blank/blank.component';
import { authGuard } from './core/guards/auth.guard';
import { PageTitleService } from './shared/services/page-title.service';
import { TranslateService } from '@ngx-translate/core';
import { Error403Component } from './modules/shared/components/error403/error403.component';

export const titleResolver: ResolveFn<string> = (route, state) => {
  const value = route.data['titleValue'] || '';
  const pageTitleService = inject(PageTitleService);
  const translateService = inject(TranslateService)
  pageTitleService.setTranslatedTitle(value);
  return translateService.instant(value);
};

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
    title: titleResolver,
    data: { 
      titleValue: 'DASHBOARD.TITLE',
    },
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
  {
    path: '403',
    component: Error403Component
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
