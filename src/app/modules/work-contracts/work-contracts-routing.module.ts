import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListWorkContractsComponent } from './components/list-work-contracts/list-work-contracts.component';
import { ContractDetailsComponent } from './components/ContractDetails/contract-details.component';

const routes: Routes = [
  { path: '', component: ListWorkContractsComponent },
    {path: 'contractDetails', component: ContractDetailsComponent},
    {path: 'contractDetails/:employeeId', component: ContractDetailsComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkContractsRoutingModule {}
