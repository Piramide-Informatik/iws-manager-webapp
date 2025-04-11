import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListSubcontractsComponent } from './components/list-subcontracts/list-subcontracts.component';
import { SubcontractsRoutingModule } from './subcontracts-routing.module';


@NgModule({
  declarations: [
    ListSubcontractsComponent
  ],
  imports: [
    CommonModule,
    SubcontractsRoutingModule
  ]
})
export class SubcontractsModule { }
