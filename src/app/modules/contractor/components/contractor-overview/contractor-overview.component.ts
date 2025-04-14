import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { Contractor } from '../../../../Entities/contractor';
import { ContractorService } from '../../services/contractor.service';
import {TranslateService, _} from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

interface Column {
  field: string,
  header: string
}

@Component({
  selector: 'app-contractor-overview',
  standalone: false,
  templateUrl: './contractor-overview.component.html',
  styleUrl: './contractor-overview.component.scss'
})
export class ContractorOverviewComponent implements OnInit, OnDestroy {

  public cols!: Column[];

  public contractors!: Contractor[];

  public customer!: string;

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  public selectedColumns!: Column[];

  constructor(private contractorService: ContractorService, private translate: TranslateService, public router:Router) { }

  ngOnInit():void {
    this.loadColHeaders();
    this.contractors = this.contractorService.list();

    this.selectedColumns = this.cols;

    this.customer = 'Joe Doe'
    
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
    });
  }

  loadColHeaders(): void {
    this.cols = [
          { field: 'contractorLabel', header:  this.translate.instant(_('CONTRACTS.TABLE.CONTRACTOR_LABEL'))},
          { field: 'contractorName', header: this.translate.instant(_('CONTRACTS.TABLE.CONTRACTOR_NAME'))},
          { field: 'countryLabel', header: this.translate.instant(_('CONTRACTS.TABLE.COUNTRY_LABEL'))},
          { field: 'street', header: this.translate.instant(_('CONTRACTS.TABLE.STREET'))},
          { field: 'zipCode', header: this.translate.instant(_('CONTRACTS.TABLE.ZIP_CODE'))},
          { field: 'city', header: this.translate.instant(_('CONTRACTS.TABLE.CITY'))},
          { field: 'taxNro',  header: this.translate.instant(_('CONTRACTS.TABLE.TAX_NUMBER'))}
        ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  reloadComponent(self:boolean,urlToNavigateTo ?:string){
    //skipLocationChange:true means dont update the url to / when navigating
    //console.log("Current route I am on:",this.router.url);
   const url=self ? this.router.url :urlToNavigateTo;
   this.router.navigateByUrl('/',{skipLocationChange:true}).then(()=>{
     this.router.navigate([`/${url}`]).then(()=>{
  //console.log(`After navigation I am on:${this.router.url}`)
     })
   })
 }


  applyFilter(event: Event, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }

  deleteCustomer(id: number) {
    //this.contractors = this.contractors.filter( contractor => contractor.contractorLabel !== id);
  }
}
