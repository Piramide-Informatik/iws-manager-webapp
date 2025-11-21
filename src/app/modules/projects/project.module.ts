// Angular
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from "@angular/core";

//Modulos
import { ProjectRoutingModule } from './project-routing.module';

//PrimeNG
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';

//Components
import { ProjectsOverviewComponent } from './components/projects-overview/projects-overview.component';

import { TranslateDirective, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { MasterDataModule } from '../master-data/master-data.module';
import { ProjectDetailsComponent } from './components/project-details/project-details.component';
import { WorkPackagesComponent } from './components/project-details/work-packages/work-packages.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SharedModule } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';


@NgModule({
    declarations: [
        ProjectsOverviewComponent,
        ProjectDetailsComponent,
        WorkPackagesComponent
    ],
    imports: [
        ButtonModule,
        CommonModule,
        CalendarModule,
        DatePickerModule,
        DialogModule,
        FormsModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        InputNumberModule,
        MasterDataModule,
        MessageModule,
        MultiSelectModule,
        ProjectRoutingModule,
        ReactiveFormsModule,
        SelectModule,
        TableModule,
        ToastModule,
        ToolbarModule,
        TranslateModule,
        TranslatePipe,
        TranslateDirective,
        ProgressSpinnerModule,
        SharedModule
    ]

})
export class ProjectModule { }