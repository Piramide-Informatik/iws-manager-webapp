import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ProjectDetailsComponent } from "./components/project-details/project-details.component";
import { BlankComponent } from "../../core/components/blank/blank.component";

const routes: Routes = [
    { path: '', component: BlankComponent }, // ← Sin redirección
    { path: 'create', component: ProjectDetailsComponent },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectRoutingModule { }
