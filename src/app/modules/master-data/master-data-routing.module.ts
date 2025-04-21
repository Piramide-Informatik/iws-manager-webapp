import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AbsenceTypesComponent } from './components/absence-types/absence-types.component';
import { StatesComponent } from './components/states/states.component';
import { ApprovalStatusProjectComponent } from './components/approval-status/components/approval-status-project/approval-status-project.component';

const routes: Routes = [
  { path: '', component: AbsenceTypesComponent },
  { path: 'states', component: StatesComponent },
  { path: 'approval-status', component: ApprovalStatusProjectComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterDataRoutingModule {}
