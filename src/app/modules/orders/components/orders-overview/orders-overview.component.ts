import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { Order } from '../../../../Entities/order';
import { OrderService } from '../../services/order.service';

import { TranslateService, _, TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

interface Column {
  field: string,
  header: string
}

@Component({
  selector: 'app-orders-overview',
  standalone: false,
  templateUrl: './orders-overview.component.html',
  styleUrl: './orders-overview.component.scss'
})
export class OrdersOverviewComponent implements OnInit, OnDestroy {

 public cols!: Column[];

 public orders!: Order[];

  public customer!: string;

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  public selectedColumns!: Column[];

  constructor(private orderService: OrderService, private translate: TranslateService, public router: Router) { }

  ngOnInit():void {
    this.loadColHeaders();
    this.orders = this.orderService.list();

    this.selectedColumns = this.cols;

    this.customer = 'Joe Doe'

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
    });
  }

  loadColHeaders(): void {
    this.cols = [
      { field: 'orderNr', header:  this.translate.instant(_('ORDERS.TABLE.ORDER_ID'))},
      { field: 'orderLabel', header:  this.translate.instant(_('ORDERS.TABLE.ORDER_LABEL'))},
      { field: 'orderType', header:  this.translate.instant(_('ORDERS.TABLE.ORDER_TYPE'))},
      { field: 'orderDate',header:  this.translate.instant(_('ORDERS.TABLE.ORDER_DATE'))},
      { field: 'acronym',  header:  this.translate.instant(_('ORDERS.TABLE.ACRONYM'))},
      { field: 'fundingProgram',  header:  this.translate.instant(_('ORDERS.TABLE.FUNDING_PROGRAM'))},
      { field: 'value',  header:  this.translate.instant(_('ORDERS.TABLE.VALUE'))},
      { field: 'contractStatus',  header:  this.translate.instant(_('ORDERS.TABLE.CONTRACT_STATUS'))},
      { field: 'contractNr', header:  this.translate.instant(_('ORDERS.TABLE.CONTRACT_NRO'))},
      { field: 'contractTitle', header:  this.translate.instant(_('ORDERS.TABLE.CONTRACT_TITLE'))},
      { field: 'iwsPercent', header:  this.translate.instant(_('ORDERS.TABLE.IWS_PERCENT'))},
      { field: 'iwsPercentValue', header:  this.translate.instant(_('ORDERS.TABLE.IWS_PERCENT_VALUE'))},
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    //skipLocationChange:true means dont update the url to / when navigating
    //console.log("Current route I am on:",this.router.url);
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {
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
