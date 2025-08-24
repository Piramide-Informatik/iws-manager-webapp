//Angular
import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
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
import { PickListModule } from 'primeng/picklist';

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
import { SalutationComponent } from './components/salutation/salutation.component';
import { SalutationTableComponent } from './components/salutation/components/salutation-table/salutation-table.component';
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
import { FundingProgramFormComponent } from './components/funding-programs/components/funding-program-form/funding-program-form.component';
import { FundingProgramsComponent } from './components/funding-programs/funding-programs.component';
import { DunningLevelsComponent } from './components/dunning-levels/dunning-levels.component';
import { GenaralTableComponent } from './genaral-table/genaral-table.component';
import { EditDunningLevelComponent } from './components/dunning-levels/components/edit-dunning-level/edit-dunning-level.component';
import { SystemConstantsComponent } from './components/system-constants/system-constants.component';
import { SystemConstantTableComponent } from './components/system-constants/components/system-constant-table/system-constant-table.component';
import { SystemConstantFormComponent } from './components/system-constants/components/system-constant-form/system-constant-form.component';
import { EmployeeQualificationComponent } from './components/employee-qualification/employee-qualification.component';
import { EditQualificationComponent } from './components/employee-qualification/components/edit-qualification/edit-qualification.component';
import { IwsStaffComponent } from './components/iws-staff/iws-staff.component';
import { IwsStaffTableComponent } from './components/iws-staff/components/iws-staff-table/iws-staff-table.component';
import { EditIwsStaffComponent } from './components/iws-staff/components/edit-iws-staff/edit-iws-staff.component';
import { IwsCommissionsComponent } from './components/iws-commissions/iws-commissions.component';
import { IwsCommissionsTableComponent } from './components/iws-commissions/components/iws-commissions-table/iws-commissions-table.component';
import { EditIwsCommissionsComponent } from './components/iws-commissions/components/edit-iws-commissions/edit-iws-commissions.component';
import { IwsTeamsComponent } from './components/iws-teams/iws-teams.component';
import { IwsTeamsTableComponent } from './components/iws-teams/components/iws-teams-table/iws-teams-table.component';
import { EditIwsTeamComponent } from './components/iws-teams/components/edit-iws-team/edit-iws-team.component';
import { CountriesComponent } from './components/countries/countries.component';
import { CountriesTableComponent } from './components/countries/components/countries-table/countries-table.component';
import { EditCountryComponent } from './components/countries/components/edit-country/edit-country.component';
import { CostsTableComponent } from './components/cost/components/costs-table/costs-table.component';
import { EditCostComponent } from './components/cost/components/edit-cost/edit-cost.component';
import { CostsComponent } from './components/cost/costs.component';
import { TextComponent } from './components/text/text.component';
import { TextTableComponent } from './components/text/components/text-table/text-table.component';
import { TextFormComponent } from './components/text/components/text-form/text-form.component';
import { ProjectFunnelsComponent } from './components/project-funnels/project-funnels.component';
import { EditProjectFunnelComponent } from './components/project-funnels/components/edit-project-funnel/edit-project-funnel.component';
import { ProjectStatusComponent } from './components/project-status/project-status.component';
import { EditProjectStatusComponent } from './components/project-status/components/edit-project-status/edit-project-status.component';
import { NetworksComponent } from './components/networks/networks.component';
import { EditNetworkComponent } from './components/networks/components/edit-network/edit-network.component';
import { SalesTaxComponent } from './components/sales-tax/sales-tax.component';
import { SalesTaxFormComponent } from './components/sales-tax/components/sales-tax-form/sales-tax-form.component';
import { SalesTaxTableComponent } from './components/sales-tax/components/sales-tax-table/sales-tax-table.component';
import { TermsPaymentComponent } from './components/terms-payment/terms-payment.component';
import { EditTermPaymentComponent } from './components/terms-payment/components/edit-term-payment/edit-term-payment.component';
import { BillersComponent } from './components/billers/billers.component';
import { EditBillerComponent } from './components/billers/components/edit-biller/edit-biller.component';
import { RealitationProbabilitiesComponent } from './components/realitation-probabilities/realitation-probabilities.component';
import { EditRealizationProbabilitiesComponent } from './components/realitation-probabilities/components/edit-realization-probabilities/edit-realization-probabilities.component';
import { TypesOfCompaniesComponent } from './components/types-of-companies/types-of-companies.component';
import { TypesOfCompaniesFormComponent } from './components/types-of-companies/components/types-of-companies-form/types-of-companies-form.component';
import { TypesOfCompaniesTableComponent } from './components/types-of-companies/components/types-of-companies-table/types-of-companies-table.component';
import { TitleComponent } from './components/title/title.component';
import { TitleTableComponent } from './components/title/components/title-table/title-table.component';
import { TitleFormComponent } from './components/title/components/title-form/title-form.component';
import { BillingMethodsComponent } from './components/billing-methods/billing-methods.component';
import { BillingMethodsFormComponent } from './components/billing-methods/components/billing-methods-form/billing-methods-form.component';
import { BillingMethodsTableComponent } from './components/billing-methods/components/billing-methods-table/billing-methods-table.component';
import { ContractStatusComponent } from './components/contract-status/contract-status.component';
import { ContractStatusFormComponent } from './components/contract-status/components/contract-status-form/contract-status-form.component';
import { ContractStatusTableComponent } from './components/contract-status/components/contract-status-table/contract-status-table.component';
import { UserPreferenceService } from '../../Services/user-preferences.service';
import { TitleModalComponent } from './components/title/components/title-modal/title-modal.component';
import { TitleUtils } from './components/title/utils/title-utils';
import { MessageService } from 'primeng/api';
import { CountryModalComponent } from './components/countries/components/country-modal/country-modal.component';
import { CountryUtils } from './components/countries/utils/country-util';
import { SalutationModalComponent } from './components/salutation/components/salutation-modal/salutation-modal.component'
import { SalutationFormComponent } from './components/salutation/components/salutation-form/salutation-form.component';
import { TypeOfCompaniesModalComponent } from './components/types-of-companies/components/company-types-modal/company-types-modal.component';
import { StateModalComponent } from './components/states/components/state-modal/state-modal.component';
import { SharedModule } from '../shared/shared.module';
import localeDe from '@angular/common/locales/de';
import { ModelProjectStatusComponent } from './components/project-status/components/model-project-status/model-project-status.component';
import { TableProjectStatusComponent } from './components/project-status/components/table-project-status/table-project-status.component';
import { ModalApprovalStatusComponent } from './components/approval-status/components/approval-status-project/modal-approval-status/modal-approval-status.component';
import { RolModalComponent } from './components/roles/components/rol-modal/rol-modal.component';
import { UserModalComponent } from './components/user/components/user-modal/user-modal.component';
import { CdkDragPlaceholder } from "@angular/cdk/drag-drop";
import { ModalFundingProgramComponent } from './components/funding-programs/components/modal-funding-program/modal-funding-program.component';

registerLocaleData(localeDe, 'de-DE');

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
    SalutationComponent,
    SalutationTableComponent,
    SalutationFormComponent,
    RolesComponent,
    RolTableComponent,
    RolFormComponent,
    HolidaysComponent,
    HolidaysTableComponent,
    EditHolidayComponent,
    FundingProgramsTableComponent,
    FundingProgramFormComponent,
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
    IwsTeamsComponent,
    IwsTeamsTableComponent,
    EditIwsTeamComponent,
    CountriesComponent,
    CountriesTableComponent,
    EditCountryComponent,
    CostsTableComponent,
    EditCostComponent,
    CostsComponent,
    TextComponent,
    TextTableComponent,
    TextFormComponent,
    ProjectFunnelsComponent,
    EditProjectFunnelComponent,
    ProjectStatusComponent,
    EditProjectStatusComponent,
    NetworksComponent,
    EditNetworkComponent,
    SalesTaxComponent,
    SalesTaxFormComponent,
    SalesTaxTableComponent,
    TermsPaymentComponent,
    EditTermPaymentComponent,
    BillersComponent,
    EditBillerComponent,
    RealitationProbabilitiesComponent,
    EditRealizationProbabilitiesComponent,
    TypesOfCompaniesComponent,
    TypesOfCompaniesFormComponent,
    TypesOfCompaniesTableComponent,
    TitleComponent,
    TitleTableComponent,
    TitleFormComponent,
    BillingMethodsComponent,
    BillingMethodsFormComponent,
    BillingMethodsTableComponent,
    ContractStatusComponent,
    ContractStatusFormComponent,
    ContractStatusTableComponent,
    TitleModalComponent,
    CountryModalComponent,
    SalutationModalComponent,
    TypeOfCompaniesModalComponent,
    StateModalComponent,
    ModelProjectStatusComponent,
    TableProjectStatusComponent,
    ModalApprovalStatusComponent,
    RolModalComponent,
    UserModalComponent,
    ModalFundingProgramComponent
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
    PickListModule,
    SharedModule,
    CdkDragPlaceholder
],
  exports: [
    GenaralTableComponent
  ],
  providers: [
    UserPreferenceService, 
    TitleUtils, 
    CountryUtils, 
    MessageService,
    { provide: LOCALE_ID, useValue: 'de-DE' }
  ]
})
export class MasterDataModule {}
