//Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

//Modulos
import { WorkContractsRoutingModule } from './work-contracts-routing.module';

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


//Components
import { ListWorkContractsComponent } from './components/list-work-contracts/list-work-contracts.component';

@NgModule({
  declarations: [
    ListWorkContractsComponent
  ],
  imports: [
    ButtonModule,
    CommonModule,
    ConfirmDialog,
    DatePickerModule,
    Dialog,
    FileUpload,
    FormsModule,
    HttpClientModule,
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
  ],
})
export class WorkContractsModule {}
