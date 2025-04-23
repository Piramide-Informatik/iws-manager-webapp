import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import {TranslateService, _} from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { SubcontractsService } from '../../services/subcontracts.service';

interface Column {
  field: string,
  header: string
}

@Component({
  selector: 'app-list-subcontracts',
  standalone: false,
  templateUrl: './list-subcontracts.component.html',
  styleUrl: './list-subcontracts.component.scss'
})
export class ListSubcontractsComponent implements OnInit, OnDestroy {

  public cols!: Column[];

  public subcontracts!: any[];

  public customer!: string;

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;


  public selectedColumns!: Column[];

  constructor( 
    private readonly translate: TranslateService,
    private readonly subcontractsService: SubcontractsService,
    public router:Router
  ){}

  
  ngOnInit(): void {

    this.loadColHeaders();
    this.selectedColumns = this.cols;

    this.customer = 'Joe Doe';

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
    });

    this.subcontracts = this.subcontractsService.list();
  }

  loadColHeaders(): void {
    this.cols = [
          { field: 'orderTitle', header:  this.translate.instant(_('SUB-CONTRACTS.TABLE.ORDER_TITLE'))},
          { field: 'contractor', header:  this.translate.instant(_('SUB-CONTRACTS.TABLE.CONTRACTOR'))},
          { field: 'project', header:  this.translate.instant(_('SUB-CONTRACTS.TABLE.PROJECT'))},
          { field: 'date', header:  this.translate.instant(_('SUB-CONTRACTS.TABLE.DATE'))},
          { field: 'invoiceNumber', header: this.translate.instant(_('SUB-CONTRACTS.TABLE.INVOICE_NUMBER'))},
          { field: 'net', header: this.translate.instant(_('SUB-CONTRACTS.TABLE.NET_INVOICE'))},
          { field: 'gross', header:   this.translate.instant(_('SUB-CONTRACTS.TABLE.GROSS_INVOICE'))},
          { field: 'share',header:   this.translate.instant(_('SUB-CONTRACTS.TABLE.SHARE'))}
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

  deleteSubcontract(orderTitle: any){
    this.subcontracts = this.subcontracts.filter( subcontract => subcontract.orderTitle !== orderTitle);
  }
}
