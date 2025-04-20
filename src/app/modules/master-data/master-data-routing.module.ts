import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AbsenceTypesComponent } from './components/absence-types/absence-types.component';

const routes: Routes = [
  { path: '', component: AbsenceTypesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterDataRoutingModule {}
