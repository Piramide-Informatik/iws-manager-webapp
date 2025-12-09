import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeAbsencesComponent } from './components/employee-absences/employee-absences.component';

const routes: Routes = [
  { path: '', component: EmployeeAbsencesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AbsencesRoutingModule {}