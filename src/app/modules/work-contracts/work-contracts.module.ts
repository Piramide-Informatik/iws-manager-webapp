import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkContractsRoutingModule } from './work-contracts-routing.module';
import { ListWorkContractsComponent } from './components/list-work-contracts/list-work-contracts.component';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ListWorkContractsComponent],
  imports: [CommonModule, WorkContractsRoutingModule, TableModule, FormsModule],
})
export class WorkContractsModule {}
