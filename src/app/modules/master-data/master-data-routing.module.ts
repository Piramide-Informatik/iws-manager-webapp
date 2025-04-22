import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AbsenceTypesComponent } from './components/absence-types/absence-types.component';
import { RolesComponent } from './components/roles/roles.component';
import { StatesComponent } from './components/states/states.component';
import { UserComponent } from './components/user/user.component';

const routes: Routes = [
  { path: 'absence-types', component: AbsenceTypesComponent },
  { path: 'states', component: StatesComponent },

  { path: 'user', component: UserComponent },

  { path: 'roles', component: RolesComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterDataRoutingModule {}
