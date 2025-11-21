import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectsOverviewComponent } from './components/projects-overview/projects-overview.component';
import { PageProjectComponent } from './components/page-project/page-project.component';
import { ProjectDetailsComponent } from './components/project-details/project-details.component';

const routes: Routes = [
  { path: '', component: ProjectsOverviewComponent },
  {
    path: '',
    component: PageProjectComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'project-details/:idProject'
      },
      {
        path: 'project-details/:idProject',
        component: ProjectDetailsComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }