import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ProjectDetailsComponent } from "./components/project-details/project-details.component";
import { ProjectsOverviewComponent } from "./components/projects-overview/projects-overview.component";
import { PageProjectComponent } from "./components/page-project/page-project.component";
import { EmployeeProjectComponent } from "./components/employee-project/employee-project.component";

const routes: Routes = [
    { path: '', component: ProjectsOverviewComponent },
    { path: 'create', component: ProjectDetailsComponent },
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
        {
          path: 'employees-project/:idProject',
          component: EmployeeProjectComponent
        }
      ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectRoutingModule { }
