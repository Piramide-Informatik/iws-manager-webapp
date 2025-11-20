import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ProjectsOverviewComponent } from "./components/projects-overview/projects-overview.component";

const routes: Routes = [
    {path: '', component: ProjectsOverviewComponent},
    {path: 'projects-overview', component: ProjectsOverviewComponent},
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectRoutingModule {}