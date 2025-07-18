import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { Order } from '../../../../Entities/order';
import { OrderService } from '../../services/order.service';

import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';


interface Column {
  field: string,
  header: string,
  routerLink?: (row: any) => string
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

  userOrdersOverviewPreferences: UserPreference = {};

  tableKey: string = 'OrdersOverview'
  
  dataKeys = ['orderNr', 'orderLabel', 'orderType', 'orderDate', 'acronym', 'fundingProgram', 'value', 'contractStatus', 'contractNr', 'contractTitle', 'iwsPercent', 'iwsPercentValue'];


  constructor(
    private readonly orderService: OrderService,
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit():void {
    this.loadOrdersOverviewColHeaders();
    this.orders = this.orderService.list();

    this.selectedColumns = this.cols;

    this.customer = 'Joe Doe'
    this.userOrdersOverviewPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadOrdersOverviewColHeaders();
      this.reloadComponent(true);
      this.userOrdersOverviewPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
  }

  onUserOrdersOverviewPreferencesChanges(userOrdersOverviewPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userOrdersOverviewPreferences));
  }

  loadOrdersOverviewColHeaders(): void {
    this.cols = [
      { 
        field: 'orderNr', 
        routerLink: (row: any) => `./order-details/${row.orderNr}`,
        header:  this.translate.instant(_('ORDERS.TABLE.ORDER_ID'))
      },
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
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {
      })
    })
  }

  goToEditOrderDetails(data: any) {
    this.router.navigate(['order-details', data.orderNr], { relativeTo: this.route })
  }

  goToOrderDetails(data: any) {
    this.router.navigate(['order-details'], { relativeTo: this.route })
  }

}
