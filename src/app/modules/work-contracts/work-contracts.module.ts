import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkContractsRoutingModule } from './work-contracts-routing.module';
import { ListWorkContractsComponent } from './components/list-work-contracts/list-work-contracts.component';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';

import { Dialog } from 'primeng/dialog';
import { Ripple } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FileUpload } from 'primeng/fileupload';
import { SelectModule } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { RadioButton } from 'primeng/radiobutton';
import { Rating } from 'primeng/rating';

import { InputNumber } from 'primeng/inputnumber';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Table } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [ListWorkContractsComponent],
  imports: [
    CommonModule,
    WorkContractsRoutingModule,
    TableModule,
    ButtonModule,
    Dialog,
    Ripple,
    SelectModule,
    ToastModule,
    ToolbarModule,
    ConfirmDialog,
    InputTextModule,
    TextareaModule,
    CommonModule,
    FileUpload,
    DropdownModule,
    Tag,
    RadioButton,
    Rating,
    InputTextModule,
    FormsModule,
    InputNumber,
    IconFieldModule,
    InputIconModule,
    HttpClientModule,
  ],
})
export class WorkContractsModule {}
