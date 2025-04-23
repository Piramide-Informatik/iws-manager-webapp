import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { TranslateService } from "@ngx-translate/core";
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
    this.cols = this.subcontractsService.getSubcontractsColums();
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  reloadComponent(self:boolean,urlToNavigateTo ?:string){
   const url=self ? this.router.url :urlToNavigateTo;
   this.router.navigateByUrl('/',{skipLocationChange:true}).then(()=>{
     this.router.navigate([`/${url}`]).then(()=>{
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
