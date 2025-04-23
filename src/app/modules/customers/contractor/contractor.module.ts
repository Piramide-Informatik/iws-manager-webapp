import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ContractorRoutingModule } from './contractor-routing.module';
import { ContractorOverviewComponent } from './components/contractor-overview/contractor-overview.component';

//PrimeNG
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ContractorDetailsComponent } from './components/contractor-details/contractor-details.component';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
  declarations: [
    ContractorOverviewComponent,
    ContractorDetailsComponent
  ],
  imports: [
    ButtonModule,
    CommonModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MessageModule,
    MultiSelectModule,
    ContractorRoutingModule,
    DropdownModule,
    TableModule,
    ToastModule,
    ToolbarModule
]
})
export class ContractorModule { }
