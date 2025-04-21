import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterDataRoutingModule } from './master-data-routing.module';
import { UserComponent } from './components/user/user.component';
import { RolesComponent } from './components/roles/roles.component';
import { AbsenceTypesComponent } from './components/absence-types/absence-types.component';


@NgModule({
  declarations: [
    UserComponent,
    RolesComponent,
    AbsenceTypesComponent
  ],
  imports: [
    CommonModule,
    MasterDataRoutingModule
  ]
})
export class MasterDataModule { }
