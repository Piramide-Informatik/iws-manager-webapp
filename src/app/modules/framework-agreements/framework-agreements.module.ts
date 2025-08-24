// Angular
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from "@angular/core";

//Modulos

import { FrameworkAgreementsRoutingModule } from './framework-agreements-routing.module';

//PrimeNG
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DatePickerModule } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabel } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';


//Components
import { FrameworkAgreementsSummaryComponent } from './components/framework-agreements-summary/framework-agreements-summary.component';
import { FrameworkAgreementsDetailsComponent } from './components/framework-agreement-details/framework-agreement-details.component';
import { OrderComponent } from './components/framework-agreement-details/order/order.component';
import { IwsProvisionComponent } from './components/framework-agreement-details/iws-provision/iws-provision.component';
import { SharedModule } from '../shared/shared.module';
import { TranslateDirective, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { MasterDataModule } from '../master-data/master-data.module';

@NgModule({
    declarations: [
        FrameworkAgreementsSummaryComponent,
        FrameworkAgreementsDetailsComponent,
        OrderComponent,
        IwsProvisionComponent
    ],
    imports: [
        FrameworkAgreementsRoutingModule,
        ButtonModule,
        CalendarModule,
        CommonModule,
        DatePickerModule,
        Dialog,
        DropdownModule,
        FloatLabel,
        FormsModule,
        IconFieldModule,
        InputIconModule,
        InputNumberModule,
        InputTextModule,
        MessageModule,
        MultiSelectModule,
        SelectModule,
        TableModule,
        TagModule,
        TextareaModule,
        ToastModule,
        ToolbarModule,
        CardModule,
        ReactiveFormsModule,
        TranslateModule,
        TranslatePipe,
        TranslateDirective,
        MasterDataModule,
        SharedModule  
    ]

})
export class FrameworkAgreementsModule {}