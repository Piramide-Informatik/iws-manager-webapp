// Angular
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from "@angular/core";

//Modulos
import { EmployeeRountingModule } from "./employee-routing.module";

//PrimeNG
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';

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
        CommonModule,
        DatePickerModule,
        DropdownModule,//cambiar por select
        EmployeeRountingModule,
        FormsModule,
        IconFieldModule,
        InputIconModule,
        // SelectModule,
        TableModule,
        ToastModule,
        ToolbarModule
    ]

})
export class EmployeeModule {}