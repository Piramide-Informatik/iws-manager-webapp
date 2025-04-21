//Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

//Modules
import { MasterDataRoutingModule } from './master-data-routing.module';

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
import { AbsenceTypesComponent } from './components/absence-types/absence-types.component';
import { AbsenceTypesTableComponent } from './components/absence-types/components/absence-types-table/absence-types-table.component';
import { EditProjectCarrierComponent } from './components/absence-types/components/edit-project-carrier/edit-project-carrier.component';

@NgModule({
  declarations: [
    AbsenceTypesComponent,
    AbsenceTypesTableComponent,
    EditProjectCarrierComponent
  ],
  imports: [
    ButtonModule,
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
    TableModule,
    ToastModule,
    ToolbarModule,
    TranslateModule,
    MessageModule,
    SelectModule,
    FormsModule
  ],
})
export class MasterDataModule {}
