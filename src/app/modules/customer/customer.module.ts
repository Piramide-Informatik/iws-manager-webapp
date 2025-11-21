// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

//Modulos
import { CustomerRoutingModule } from './customer-routing.module';

//PrimeNG
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

//Components
import { ContactComponent } from './components/contact/contact.component';
import { DetailCustomerComponent } from './components/detail-customer/detail-customer.component';
import { ListCustomersComponent } from './components/list-customers/list-customers.component';
import { TranslateDirective, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { PageCustomerComponent } from './components/page-customer/page-customer.component';

import { UserPreferenceService } from '../../Services/user-preferences.service';
import { MasterDataModule } from '../master-data/master-data.module';
import { SharedModule } from '../shared/shared.module';
import { EmployeeModule } from './sub-modules/employee/employee.module';
import { WorkContractsModule } from './sub-modules/work-contracts/work-contracts.module';
import { ContractorModule } from './sub-modules/contractor/contractor.module';
import { SubcontractsModule } from './sub-modules/subcontracts/subcontracts.module';
import { ReceivablesModule } from './sub-modules/receivables/receivables.module';

import { FrameworkAgreementsModule } from './sub-modules/framework-agreements/framework-agreements.module';
import { OrdersModule } from './sub-modules/orders/orders.module';
import { InvoicesModule } from './sub-modules/invoices/invoices.module';
import { LayoutModule } from '../../core/layout/layout.module';
import { ProjectModule } from './sub-modules/projects/project.module';


@NgModule({
  declarations: [
    ContactComponent,
    ListCustomersComponent,
    DetailCustomerComponent,
    PageCustomerComponent,
  ],
  imports: [
    ButtonModule,
    CommonModule,
    CustomerRoutingModule,
    FloatLabel,
    FormsModule,
    InputTextModule,
    MessageModule,
    MultiSelectModule,
    ReactiveFormsModule,
    SelectModule,
    TableModule,
    TextareaModule,
    ToolbarModule,
    TranslateModule,
    TranslatePipe,
    TranslateDirective,
    DialogModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
    MasterDataModule,
    ToggleSwitchModule,
    InputNumberModule,
    ProgressSpinnerModule,
    SharedModule,
    EmployeeModule,
    WorkContractsModule,
    ContractorModule,
    SubcontractsModule,
    ReceivablesModule,
    ProjectModule,
    FrameworkAgreementsModule,
    OrdersModule,
    InvoicesModule,
    LayoutModule
  ],
  providers: [
    UserPreferenceService
  ]
})
export class CustomerModule {}
