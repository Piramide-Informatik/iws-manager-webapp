//Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

//Modules
import { MasterDataRoutingModule } from './master-data-routing.module';

//Prime NG
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
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
import { ToggleSwitch } from 'primeng/toggleswitch';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';

//Components
import { AbsenceTypesComponent } from './components/absence-types/absence-types.component';
import { AbsenceTypesTableComponent } from './components/absence-types/components/absence-types-table/absence-types-table.component';
import { EditProjectCarrierComponent } from './components/absence-types/components/edit-project-carrier/edit-project-carrier.component';

@NgModule({
  declarations: [
    AbsenceTypesComponent,
    AbsenceTypesTableComponent,
    EditProjectCarrierComponent,
  ],
  imports: [
    ButtonModule,
    CardModule,
    CommonModule,
    ConfirmDialog,
    DatePickerModule,
    Dialog,
    FileUpload,
    IconFieldModule,
    InputIconModule,
    InputNumber,
    InputTextModule,
    MasterDataRoutingModule,
    MultiSelectModule,
    ReactiveFormsModule,
    TableModule,
    ToastModule,
    ToggleSwitch,
    ToolbarModule,
    TranslateModule,
    MessageModule,
    SelectModule,
    FormsModule,
  ],
})
export class MasterDataModule {}
