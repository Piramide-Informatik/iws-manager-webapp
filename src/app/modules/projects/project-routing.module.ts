import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ProjectsOverviewComponent } from "./components/projects-overview/projects-overview.component";
import { ProjectDetailsComponent } from "./components/project-details/project-details.component";

const routes: Routes = [
    { path: '', component: ProjectsOverviewComponent },
    { path: 'create', component: ProjectDetailsComponent },
    // { path: 'projects-overview', component: ProjectsOverviewComponent },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectRoutingModule { }