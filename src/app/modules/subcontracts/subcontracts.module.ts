import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextarea } from 'primeng/inputtextarea';

import { ToolbarModule } from 'primeng/toolbar';

// Routing
import { SubcontractsRoutingModule } from './subcontracts-routing.module';

// Componentes
import { ListSubcontractsComponent } from './components/list-subcontracts/list-subcontracts.component';
import { SubcontractsDetailsComponent } from './components/subcontracts-detail/subcontracts-details.component';
import { SubcontractComponent } from './components/subcontracts-detail/subcontract/subcontract.component';
import { ProjectAllocationComponent } from './components/subcontracts-detail/project-allocation/project-allocation.component';
import { DepreciationScheduleComponent } from './components/subcontracts-detail/depreciation-schedule/depreciation-schedule.component';

@NgModule({
  declarations: [
    ListSubcontractsComponent,
    SubcontractsDetailsComponent,
    SubcontractComponent,
    ProjectAllocationComponent,
    DepreciationScheduleComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SubcontractsRoutingModule,

    // PrimeNG
    ButtonModule,
    TableModule,
    InputTextModule,
    DialogModule,
    CalendarModule,
    DropdownModule,
    CheckboxModule,
    InputTextarea,
    ToolbarModule,
  ],
})
export class SubcontractsModule {}
