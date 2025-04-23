import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { EmployeeDetailsComponent } from './components/employee-details/employee-details.component';
import { EmployeeOverviewComponent } from './components/employee-overview/employee-overview.component';

const routes: Routes = [
    {path: '', component: EmployeeOverviewComponent},
    {path: 'employee-details', component: EmployeeDetailsComponent},
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmployeeRountingModule {}