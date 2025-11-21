import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageProjectComponent } from './components/page-project/page-project.component';
import { ToastModule } from 'primeng/toast';
import { LayoutModule } from '../../core/layout/layout.module';
import { UserPreferenceService } from '../../Services/user-preferences.service';
import { ProjectsOverviewComponent } from './components/projects-overview/projects-overview.component';
import { ProjectDetailsComponent } from './components/project-details/project-details.component';
import { ProjectsRoutingModule } from './projects-routing.module';


@NgModule({
  declarations: [
    PageProjectComponent,
    ProjectsOverviewComponent,
    ProjectDetailsComponent
  ],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    ToastModule,
    LayoutModule
  ],
  providers: [ 
    UserPreferenceService
  ]
})
export class ProjectsModule { }
