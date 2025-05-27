//Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//Modulos
import { WorkContractsRoutingModule } from './work-contracts-routing.module';
import { MasterDataModule } from '../master-data/master-data.module';

//Prime NG
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { FileUpload } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageModule } from 'primeng/message';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FloatLabel } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';


//Components
import { ListWorkContractsComponent } from './components/list-work-contracts/list-work-contracts.component';
import { ContractDetailsComponent } from './components/ContractDetails/contract-details.component';

import { TranslateDirective, TranslateModule, TranslatePipe } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ListWorkContractsComponent,
    ContractDetailsComponent,
  ],
  imports: [
    ButtonModule,
    CommonModule,
    ConfirmDialog,
    DatePickerModule,
    Dialog,
    FileUpload,
    FormsModule,
    IconFieldModule,
    InputNumber,
    InputIconModule,
    InputTextModule,
    ReactiveFormsModule,
    TableModule,
    ToastModule,
    ToolbarModule,
    MultiSelectModule,
    MessageModule,
    WorkContractsRoutingModule,
    DropdownModule,
    AutoCompleteModule,
    FloatLabel,
    SelectModule,
    TranslateModule,
    TranslatePipe,
    MasterDataModule,
    TranslateDirective
  ],
})
export class WorkContractsModule {}
