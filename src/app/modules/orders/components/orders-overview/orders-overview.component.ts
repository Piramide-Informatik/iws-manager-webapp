import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { Table } from 'primeng/table';

import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { OrderUtils } from '../../utils/order-utils';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { Order } from '../../../../Entities/order';

interface Column {
  field: string,
  header: string,
  routerLink?: (row: any) => string
  customClasses?: string[]
  type?: string
}

@Component({
  selector: 'app-orders-overview',
  standalone: false,
  templateUrl: './orders-overview.component.html',
  styleUrl: './orders-overview.component.scss'
})
export class OrdersOverviewComponent implements OnInit, OnDestroy {
  private readonly orderUtils = inject(OrderUtils);

  public orders!: Order[];
  visibleOrderModal = false;
  isOrderLoading = false;
  selectedOrder!: Order | undefined;

  // Configuration Orders Table
  public cols!: Column[];
  @ViewChild('dt2') dt2!: Table;
  private langSubscription!: Subscription;
  public selectedColumns!: Column[];
  userOrdersOverviewPreferences: UserPreference = {};
  tableKey: string = 'OrdersOverview';
  dataKeys = ['orderNr', 'orderLabel', 'orderType', 'orderDate', 'acronym', 'fundingProgram', 'value', 'contractStatus', 'contractNr', 'contractTitle', 'iwsPercent', 'iwsPercentValue'];

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly commonMessage: CommonMessagesService
  ) { }

  ngOnInit():void {
    this.loadOrdersOverviewColHeaders();
    this.selectedColumns = this.cols;
    this.userOrdersOverviewPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadOrdersOverviewColHeaders();
      this.reloadComponent(true);
      this.userOrdersOverviewPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
    this.route.params.subscribe(params => {
      this.orderUtils.getAllOrdersByCustomerId(params['id']).subscribe(orders => {
        this.orders = orders.reduce((acc: any[], curr) => {
          acc.push({
            id: curr.id,
            version: curr.version,
            orderNr: curr.orderNo,
            orderLabel: curr.orderLabel,
            orderType: curr.orderType,
            orderDate: curr.orderDate,
            acronym: curr.acronym,
            fundingProgram: curr.fundingProgram,
            value: curr.orderValue,
            contractStatus: curr.contractStatus,
            contractNr: curr.basiccontract?.contractNo,
            contractTitle: curr.basiccontract?.contractTitle,
            iwsPercent: curr.iwsProvision,
            iwsPercentValue: curr.orderValue ?? 0 * (curr.iwsProvision ?? 0),
          });
          return acc;
        }, [])
      })
    })
  }

  openDeleteModal(id: number) {
    this.visibleOrderModal = true;
    const order = this.orders.find( order => order.id == id);
    if (order) {
      this.selectedOrder = order;
    }
  }

  onOrderDelete() {
    if (this.selectedOrder) {
      this.isOrderLoading = true;
      this.orderUtils.deleteOrder(this.selectedOrder.id).subscribe({
        next: () => {
          this.commonMessage.showDeleteSucessfullMessage();
          this.orders = this.orders.filter( order => order.id != this.selectedOrder?.id);
        },
        error: () => {
          this.commonMessage.showErrorDeleteMessage();
        },
        complete: () => {
          this.visibleOrderModal = false;
          this.selectedOrder = undefined;
          this.isOrderLoading = false; 
        }
      })
    }
  }

  onUserOrdersOverviewPreferencesChanges(userOrdersOverviewPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userOrdersOverviewPreferences));
  }

  loadOrdersOverviewColHeaders(): void {
    this.cols = [
      { 
        field: 'orderNr', 
        customClasses: ['align-right'],
        routerLink: (row: any) => `./order-details/${row.id}`,
        header:  this.translate.instant(_('ORDERS.TABLE.ORDER_ID'))
      },
      { field: 'orderLabel', header:  this.translate.instant(_('ORDERS.TABLE.ORDER_LABEL'))},
      { field: 'orderType.costtype', header:  this.translate.instant(_('ORDERS.TABLE.ORDER_TYPE'))},
      { field: 'orderDate', type: 'date', header:  this.translate.instant(_('ORDERS.TABLE.ORDER_DATE'))},
      { field: 'acronym',  header:  this.translate.instant(_('ORDERS.TABLE.ACRONYM'))},
      { field: 'fundingProgram.name',  header:  this.translate.instant(_('ORDERS.TABLE.FUNDING_PROGRAM'))},
      { field: 'value', customClasses: ['align-right'], type: 'double', header:  this.translate.instant(_('ORDERS.TABLE.VALUE'))},
      { field: 'contractStatus.status',  header:  this.translate.instant(_('ORDERS.TABLE.CONTRACT_STATUS'))},
      { field: 'contractNr', header:  this.translate.instant(_('ORDERS.TABLE.CONTRACT_NRO'))},
      { field: 'contractTitle', header:  this.translate.instant(_('ORDERS.TABLE.CONTRACT_TITLE'))},
      { field: 'iwsPercent', customClasses: ['align-right'], type: 'double', header:  this.translate.instant(_('ORDERS.TABLE.IWS_PERCENT'))},
      { field: 'iwsPercentValue', customClasses: ['align-right'], type: 'double', header:  this.translate.instant(_('ORDERS.TABLE.IWS_PERCENT_VALUE'))},
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
    this.router.navigate(['order-details', data.id], { relativeTo: this.route })
  }

  goToOrderDetails(data: any) {
    this.router.navigate(['order-details'], { relativeTo: this.route })
  }

}
