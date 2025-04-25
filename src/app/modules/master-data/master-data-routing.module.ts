import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AbsenceTypesComponent } from './components/absence-types/absence-types.component';
import { RolesComponent } from './components/roles/roles.component';
import { StatesComponent } from './components/states/states.component';
import { ApprovalStatusProjectComponent } from './components/approval-status/components/approval-status-project/approval-status-project.component';
import { UserComponent } from './components/user/user.component';
import { AddressComponent } from './components/address/address.component';
import { HolidaysComponent } from './components/holidays/holidays.component';
import { FundingProgramsComponent } from './components/funding-programs/funding-programs.component';

const routes: Routes = [
  { path: 'absence-types', component: AbsenceTypesComponent },
  { path: 'address', component: AddressComponent },
  { path: 'user', component: UserComponent },
  { path: 'roles', component: RolesComponent },
  { path: 'approval-status', component: ApprovalStatusProjectComponent },
  { path: 'states', component: StatesComponent },
  { path: 'holidays', component: HolidaysComponent },
  { path: 'funding-programs', component: FundingProgramsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterDataRoutingModule {}
