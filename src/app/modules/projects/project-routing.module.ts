import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ProjectDetailsComponent } from "./components/project-details/project-details.component";
import { ProjectsOverviewComponent } from "./components/projects-overview/projects-overview.component";

const routes: Routes = [
    { path: '', component: ProjectsOverviewComponent },
    { path: 'create', component: ProjectDetailsComponent },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectRoutingModule { }
