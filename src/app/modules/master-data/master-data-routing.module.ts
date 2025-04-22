import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AbsenceTypesComponent } from './components/absence-types/absence-types.component';
import { StatesComponent } from './components/states/states.component';
import { AddressComponent } from './components/address/address.component';

const routes: Routes = [
  { path: '', component: AbsenceTypesComponent },
  { path: 'address', component: AddressComponent },
  { path: 'states', component: StatesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterDataRoutingModule {}
