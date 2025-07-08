import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListWorkContractsComponent } from './components/list-work-contracts/list-work-contracts.component';

const routes: Routes = [
  { path: '', component: ListWorkContractsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkContractsRoutingModule {}
