import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContractorOverviewComponent } from './components/contractor-overview/contractor-overview.component';
import { ContractorDetailsComponent } from './components/contractor-details/contractor-details.component';

const routes: Routes = [
    {path: '', component: ContractorOverviewComponent},
    {path: 'contracts-overview', component: ContractorOverviewComponent},
    {path: 'contract-details', component: ContractorDetailsComponent}
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractorRoutingModule { }
