// Angular
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from "@angular/core";

//Modulos
import { ProjectRoutingModule } from './project-routing.module';

//PrimeNG
import { ButtonModule } from 'primeng/button';
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


@NgModule({
    declarations: [
        ProjectsOverviewComponent
    ],
    imports: [
        ButtonModule,
        CommonModule,
        FormsModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        MessageModule,
        MultiSelectModule,
        ProjectRoutingModule,
        TableModule,
        ToastModule,
        ToolbarModule
    ]

})
export class ProjectModule {}