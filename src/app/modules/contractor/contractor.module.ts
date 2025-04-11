import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContractorRoutingModule } from './contractor-routing.module';
import { ContractorOverviewComponent } from './components/contractor-overview/contractor-overview.component';


@NgModule({
  declarations: [
    ContractorOverviewComponent
  ],
  imports: [
    CommonModule,
    ContractorRoutingModule
  ]
})
export class ContractorModule { }
