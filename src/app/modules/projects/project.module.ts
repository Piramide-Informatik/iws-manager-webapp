// Angular
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from "@angular/core";

//Modulos

import { ProjectRoutingModule } from './project-routing.module';

//PrimeNG
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DatePickerModule } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabel } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';

//Components
import { ProjectsOverviewComponent } from './components/projects-overview/projects-overview.component';


@NgModule({
    declarations: [
        ProjectsOverviewComponent
    ],
    imports: [
        ProjectRoutingModule,
        ButtonModule,
        CalendarModule,
        CommonModule,
        DatePickerModule,
        Dialog,
        DropdownModule,
        FloatLabel,
        FormsModule,
        IconFieldModule,
        InputIconModule,
        InputNumberModule,
        InputTextModule,
        MessageModule,
        MultiSelectModule,
        SelectModule,
        TableModule,
        TagModule,
        TextareaModule,
        ToastModule,
        ToolbarModule
    ]

})
export class ProjectModule {}