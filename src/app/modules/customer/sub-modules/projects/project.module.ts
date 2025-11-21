// Angular
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { MasterDataModule } from '../../../master-data/master-data.module';


@NgModule({
    declarations: [
        ProjectsOverviewComponent
    ],
    imports: [
        ButtonModule,
        CommonModule,
        DialogModule,
        FormsModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        MessageModule,
        MultiSelectModule,
        ProjectRoutingModule,
        TableModule,
        ToastModule,
        ToolbarModule,
        TranslateModule,
        TranslatePipe,
        TranslateDirective,
        MasterDataModule
    ]

})
export class ProjectModule {}
