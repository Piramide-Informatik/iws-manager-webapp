//Angular 
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

//Modulos
import { SubcontractsRoutingModule } from './subcontracts-routing.module';

//PrimeNG
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MultiSelect } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';


//Components
import { ListSubcontractsComponent } from './components/list-subcontracts/list-subcontracts.component';


@NgModule({
  declarations: [
    ListSubcontractsComponent
  ],
  imports: [
    ButtonModule,
    CommonModule,
    FormsModule,
    MessageModule,
    MultiSelect,
    InputTextModule,
    SubcontractsRoutingModule,
    TableModule
  ]
})
export class SubcontractsModule { }
