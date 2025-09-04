//Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//Modules
import { InvoicesRoutingModule } from './invoices-routing.module';

//Prime NG
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
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
import { ListInvoicesComponent } from './components/list-invoices-contracts/list-invoices.component';

import { TranslateDirective, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { MasterDataModule } from '../master-data/master-data.module';

@NgModule({
  declarations: [ListInvoicesComponent],
  imports: [
    ButtonModule,
    CommonModule,
    ConfirmDialog,
    DatePickerModule,
    DialogModule,
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
    InvoicesRoutingModule,
    TranslateModule,
    TranslatePipe,
    TranslateDirective,
    MasterDataModule
  ],
})
export class InvoicesModule {}
