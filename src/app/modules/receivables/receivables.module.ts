//Angular 
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

//Modulos
import { ReceivablesRoutingModule } from './receivables-routing.module';

//PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';

//Components
import { ListDemandsComponent } from './components/list-demands/list-demands.component';

import { TranslateDirective, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { MasterDataModule } from '../master-data/master-data.module';

@NgModule({
  declarations: [
    ListDemandsComponent
  ],
  imports: [
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    CommonModule,
    FormsModule,
    InputTextModule,
    MessageModule,
    MultiSelectModule,
    ReceivablesRoutingModule,
    TableModule,
    ToolbarModule,
    TranslateModule,
    TranslatePipe,
    TranslateDirective,
    MasterDataModule
  ]
})
export class ReceivablesModule { }
