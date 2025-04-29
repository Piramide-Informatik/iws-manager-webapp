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
import { ListboxModule } from 'primeng/listbox';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { TextareaModule } from 'primeng/textarea';
import { PasswordModule } from 'primeng/password';

//Components
import { AbsenceTypesComponent } from './components/absence-types/absence-types.component';
import { AbsenceTypesTableComponent } from './components/absence-types/components/absence-types-table/absence-types-table.component';
import { EditProjectCarrierComponent } from './components/absence-types/components/edit-project-carrier/edit-project-carrier.component';
import { StatesComponent } from './components/states/states.component';
import { StateFormComponent } from './components/states/components/state-form/state-form.component';
import { StatesTableComponent } from './components/states/components/states-table/states-table.component';
import { ApprovalStatusProjectComponent } from './components/approval-status/components/approval-status-project/approval-status-project.component';
import { ApprovalStatusTableComponent } from './components/approval-status/components/approval-status-project/approval-status-table/approval-status-table.component';
import { EditApprovalStatusComponent } from './components/approval-status/components/approval-status-project/edit-approval-status/edit-approval-status.component';
import { AddressComponent } from './components/address/address.component';
import { AddressTableComponent } from './components/address/components/address-table/address-table.component';
import { EditSalutationComponent } from './components/address/components/edit-salutation/edit-salutation.component';
import { RolesComponent } from './components/roles/roles.component';
import { RolTableComponent } from './components/roles/components/rol-table/rol-table.component';
import { RolFormComponent } from './components/roles/components/rol-form/rol-form.component';
import { UserTableComponent } from './components/user/components/user-table/user-table.component';
import { EditUserFormComponent } from './components/user/components/edit-user-form/edit-user-form.component';
import { UserComponent } from './components/user/user.component';
import { HolidaysComponent } from './components/holidays/holidays.component';
import { HolidaysTableComponent } from './components/holidays/components/holidays-table/holidays-table.component';
import { EditHolidayComponent } from './components/holidays/components/edit-holiday/edit-holiday.component';
import { FundingProgramsTableComponent } from './components/funding-programs/components/funding-programs-table/funding-programs-table.component';
import { EditFundingProgramComponent } from './components/funding-programs/components/edit-funding-program/edit-funding-program.component';
import { FundingProgramsComponent } from './components/funding-programs/funding-programs.component';
import { DunningLevelsComponent } from './components/dunning-levels/dunning-levels.component';
import { GenaralTableComponent } from './genaral-table/genaral-table.component';
import { EditDunningLevelComponent } from './components/dunning-levels/components/edit-dunning-level/edit-dunning-level.component';
import { SystemConstantsComponent } from './components/system-constants/system-constants.component';
import { SystemConstantTableComponent } from './components/system-constants/components/system-constant-table/system-constant-table.component';
import { SystemConstantFormComponent } from './components/system-constants/components/system-constant-form/system-constant-form.component';
import { EmployeeQualificationComponent } from './components/employee-qualification/employee-qualification.component';
import { EditQualificationComponent } from './components/employee-qualification/components/edit-qualification/edit-qualification.component';
import { IwsStaffComponent } from './components/iws-staff/iws-staff/iws-staff.component';
import { IwsStaffTableComponent } from './components/iws-staff/components/iws-staff-table/iws-staff-table.component';
import { EditIwsStaffComponent } from './components/iws-staff/components/edit-iws-staff/edit-iws-staff.component';
import { IwsCommissionsComponent } from './components/iws-commissions/iws-commissions.component';
import { IwsCommissionsTableComponent } from './components/iws-commissions/components/iws-commissions-table/iws-commissions-table.component';
import { EditIwsCommissionsComponent } from './components/iws-commissions/components/edit-iws-commissions/edit-iws-commissions.component';

@NgModule({
  declarations: [
    UserComponent,
    AbsenceTypesComponent,
    AbsenceTypesTableComponent,
    EditProjectCarrierComponent,
    StatesComponent,
    StateFormComponent,
    StatesTableComponent,
    ApprovalStatusProjectComponent,
    ApprovalStatusTableComponent,
    EditApprovalStatusComponent,
    UserTableComponent,
    EditUserFormComponent,
    AddressComponent,
    AddressTableComponent,
    EditSalutationComponent,
    RolesComponent,
    RolTableComponent,
    RolFormComponent,
    HolidaysComponent,
    HolidaysTableComponent,
    EditHolidayComponent,
    FundingProgramsTableComponent,
    EditFundingProgramComponent,
    FundingProgramsComponent,
    DunningLevelsComponent,
    GenaralTableComponent,
    EditDunningLevelComponent,
    SystemConstantsComponent,
    SystemConstantTableComponent,
    SystemConstantFormComponent,
    EmployeeQualificationComponent,
    EditQualificationComponent,
    IwsStaffComponent,
    IwsStaffTableComponent,
    EditIwsStaffComponent,
    IwsCommissionsComponent,
    IwsCommissionsTableComponent,
    EditIwsCommissionsComponent,
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
    ListboxModule,
    CheckboxModule,
    DropdownModule,
    TextareaModule,
    PasswordModule,
  ],
})
export class MasterDataModule {}
