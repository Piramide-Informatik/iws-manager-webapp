import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';

import { TranslateDirective, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { MasterDataModule } from '../master-data/master-data.module';
import { SharedModule } from '../shared/shared.module';

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
    ToolbarModule,
    TranslateModule,
    TranslatePipe,
    TranslateDirective,
    MasterDataModule,
    ConfirmDialog,
    Dialog,
    SelectModule,
    ReactiveFormsModule,
    SharedModule
]
})
export class ContractorModule { }
