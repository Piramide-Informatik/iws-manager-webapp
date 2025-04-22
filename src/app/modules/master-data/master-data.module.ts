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
import { DropdownModule } from 'primeng/dropdown';

//Components
import { AbsenceTypesComponent } from './components/absence-types/absence-types.component';
import { AbsenceTypesTableComponent } from './components/absence-types/components/absence-types-table/absence-types-table.component';
import { EditProjectCarrierComponent } from './components/absence-types/components/edit-project-carrier/edit-project-carrier.component';
import { StatesComponent } from './components/states/states.component';
import { StateFormComponent } from './components/states/components/state-form/state-form.component';
import { StatesTableComponent } from './components/states/components/states-table/states-table.component';
import { AddressComponent } from './components/address/address.component';
import { AddressTableComponent } from './components/address/components/address-table/address-table.component';
import { EditSalutationComponent } from './components/address/components/edit-salutation/edit-salutation.component';
import { RolesComponent } from './components/roles/roles.component';
import { RolTableComponent } from './components/roles/components/rol-table/rol-table.component';
import { RolFormComponent } from './components/roles/components/rol-form/rol-form.component';
import { CheckboxModule } from 'primeng/checkbox';

@NgModule({
  declarations: [
    AbsenceTypesComponent,
    AbsenceTypesTableComponent,
    EditProjectCarrierComponent,
    StatesComponent,
    StateFormComponent,
    StatesTableComponent,
    AddressComponent,
    AddressTableComponent,
    EditSalutationComponent,
    RolesComponent,
    RolTableComponent,
    RolFormComponent
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
    CheckboxModule,
    DropdownModule
  ],
})
export class MasterDataModule {}
