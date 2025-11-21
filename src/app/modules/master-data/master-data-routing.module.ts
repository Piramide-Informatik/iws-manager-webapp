import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AbsenceTypesComponent } from './components/absence-types/absence-types.component';
import { RolesComponent } from './components/roles/roles.component';
import { StatesComponent } from './components/states/states.component';
import { ApprovalStatusProjectComponent } from './components/approval-status/components/approval-status-project/approval-status-project.component';
import { UserComponent } from './components/user/user.component';
import { SalutationComponent } from './components/salutation/salutation.component';
import { HolidaysComponent } from './components/holidays/holidays.component';
import { FundingProgramsComponent } from './components/funding-programs/funding-programs.component';
import { DunningLevelsComponent } from './components/dunning-levels/dunning-levels.component';
import { SystemConstantsComponent } from './components/system-constants/system-constants.component';
import { EmployeeQualificationComponent } from './components/employee-qualification/employee-qualification.component';
import { IwsStaffComponent } from './components/iws-staff/iws-staff.component';
import { IwsCommissionsComponent } from './components/iws-commissions/iws-commissions.component';
import { IwsTeamsComponent } from './components/iws-teams/iws-teams.component';
import { CountriesComponent } from './components/countries/countries.component';
import { CostsComponent } from './components/cost/costs.component';
import { TextComponent } from './components/text/text.component';
import { ProjectFunnelsComponent } from './components/project-funnels/project-funnels.component';
import { ProjectStatusComponent } from './components/project-status/project-status.component';
import { NetworksComponent } from './components/networks/networks.component';
import { SalesTaxComponent } from './components/sales-tax/sales-tax.component';
import { TermsPaymentComponent } from './components/terms-payment/terms-payment.component';
import { BillersComponent } from './components/billers/billers.component';
import { RealitationProbabilitiesComponent } from './components/realitation-probabilities/realitation-probabilities.component';
import { TypesOfCompaniesComponent } from './components/types-of-companies/types-of-companies.component';
import { TitleComponent } from './components/title/title.component';
import { BillingMethodsComponent } from './components/billing-methods/billing-methods.component';
import { ContractStatusComponent } from './components/contract-status/contract-status.component';

const routes: Routes = [
  { path: 'absence-types', component: AbsenceTypesComponent },
  { path: 'salutation', component: SalutationComponent },
  { path: 'user', component: UserComponent },
  { path: 'roles', component: RolesComponent },
  { path: 'approval-status', component: ApprovalStatusProjectComponent },
  { path: 'states', component: StatesComponent },
  { path: 'dunning-levels', component: DunningLevelsComponent },
  { path: 'holidays', component: HolidaysComponent },
  { path: 'funding-programs', component: FundingProgramsComponent },
  { path: 'system-constants', component: SystemConstantsComponent },
  { path: 'texts', component: TextComponent },
  { path: 'employee-qualification', component: EmployeeQualificationComponent },
  { path: 'iws-staff', component: IwsStaffComponent },
  { path: 'iws-commissions', component: IwsCommissionsComponent },
  { path: 'project-funnels', component: ProjectFunnelsComponent },
  { path: 'project-status', component: ProjectStatusComponent },
  { path: 'networks', component: NetworksComponent },
  { path: 'sales-tax', component: SalesTaxComponent },
  { path: 'iws-teams', component: IwsTeamsComponent },
  { path: 'countries', component: CountriesComponent },
  { path: 'cost', component: CostsComponent },
  { path: 'terms-payment', component: TermsPaymentComponent },
  { path: 'billers', component: BillersComponent },
  { path: 'realization-probabilities', component: RealitationProbabilitiesComponent },
  { path: 'type-companies', component: TypesOfCompaniesComponent},
  { path: 'title', component: TitleComponent },
  { path: 'billing-methods', component: BillingMethodsComponent},
  { path: 'contract-status', component: ContractStatusComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterDataRoutingModule {}
