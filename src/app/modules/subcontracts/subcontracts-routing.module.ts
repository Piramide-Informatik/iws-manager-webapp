import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListSubcontractsComponent } from './components/list-subcontracts/list-subcontracts.component';
import { SubcontractsDetailsComponent } from './components/subcontracts-detail/subcontracts-details.component';

const routes: Routes = [
  { path: '', component: ListSubcontractsComponent },
  { path: 'list-subcontracts', component: ListSubcontractsComponent },
  { path: 'subcontracts-details', component: SubcontractsDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubcontractsRoutingModule {}
