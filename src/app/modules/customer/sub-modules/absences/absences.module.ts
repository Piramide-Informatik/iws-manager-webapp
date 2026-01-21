import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeAbsencesComponent } from './components/employee-absences/employee-absences.component';
import { AbsencesRoutingModule } from './absences-routing.module';
import { MasterDataModule } from '../../../master-data/master-data.module';
import { TranslatePipe } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CalendarViewComponent } from './components/calendar-view/calendar-view.component';
import { SharedModule } from '../../../shared/shared.module';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@NgModule({
  declarations: [
    EmployeeAbsencesComponent,
    CalendarViewComponent
  ],
  imports: [
    AbsencesRoutingModule,
    CommonModule,
    MasterDataModule,
    TranslatePipe,
    ReactiveFormsModule,
    SelectModule,
    SharedModule,
    InputText,
    ButtonModule,
    ToastModule,
    ToggleSwitchModule
  ]
})
export class AbsencesModule { }
