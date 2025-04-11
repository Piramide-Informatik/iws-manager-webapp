import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ListSubcontractsComponent } from "./components/list-subcontracts/list-subcontracts.component";


const routes: Routes = [
    { path: '', component: ListSubcontractsComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SubcontractsRoutingModule {}