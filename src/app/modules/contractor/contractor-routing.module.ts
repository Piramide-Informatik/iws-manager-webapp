import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContractorOverviewComponent } from './components/contractor-overview/contractor-overview.component';

const routes: Routes = [
    {path: '', component: ContractorOverviewComponent},
    {path: 'projects-overview', component: ContractorOverviewComponent},
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractorRoutingModule { }
