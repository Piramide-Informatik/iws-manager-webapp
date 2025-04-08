import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkContractsRoutingModule } from './work-contracts-routing.module';
import { ListWorkContractsComponent } from './components/list-work-contracts/list-work-contracts.component';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Dialog } from 'primeng/dialog';
import { Ripple } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FileUpload } from 'primeng/fileupload';
import { SelectModule } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { RadioButton } from 'primeng/radiobutton';
import { Rating } from 'primeng/rating';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';

import { InputNumber } from 'primeng/inputnumber';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Table } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { HttpClientModule } from '@angular/common/http';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
@NgModule({
  declarations: [
    ListWorkContractsComponent
  ],
  imports: [
    CommonModule,
    WorkContractsRoutingModule,
    TableModule,
    ButtonModule,
    InputNumberModule,
    CalendarModule,
    DialogModule,
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
    ReactiveFormsModule,
    InputNumber,
    IconFieldModule,
    InputIconModule,
    HttpClientModule,
    CheckboxModule,
    DatePickerModule,
  ],
})
export class WorkContractsModule {}
