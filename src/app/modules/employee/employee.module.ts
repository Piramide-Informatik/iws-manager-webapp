// Angular
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from '@angular/forms';

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


@NgModule({
    declarations: [
        EmployeeOverviewComponent,
        EmployeeDetailsComponent
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
        Dialog
    ]

})
export class EmployeeModule {}