// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

//Modulos
import { EmployeeRountingModule } from "./employee-routing.module";

//PrimeNG
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { Dialog } from 'primeng/dialog';

//Components
import { EmployeeOverviewComponent } from "./components/employee-overview/employee-overview.component";
import { EmployeeDetailsComponent } from "./components/employee-details/employee-details.component";

import { TranslateDirective, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { MasterDataModule } from '../master-data/master-data.module';
import { EmployeeFormComponent } from './components/employee-details/employee-form/employee-form.component';
import { EmployeeContractsTableComponent } from './components/employee-details/employee-contracts-table/employee-contracts-table.component';

import { SharedModule } from '../shared/shared.module';

@NgModule({
    declarations: [
        EmployeeOverviewComponent,
        EmployeeDetailsComponent,
        EmployeeFormComponent,
        EmployeeContractsTableComponent
    ],
    imports: [
        ButtonModule,
        MultiSelectModule,
        CommonModule,
        DatePickerModule,
        EmployeeRountingModule,
        FormsModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        SelectModule,
        TableModule,
        ToastModule,
        ToolbarModule,
        ReactiveFormsModule,
        ConfirmDialog,
        MessageModule,
        Dialog,
        TranslateModule,
        TranslatePipe,
        TranslateDirective,
        MasterDataModule,
        SharedModule
    ]

})
export class EmployeeModule {}