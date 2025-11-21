import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { Table } from 'primeng/table';
import { TranslateService, _ } from "@ngx-translate/core";
import { Subscription, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { ReceivableUtils } from '../../utils/receivable-utils';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { Column } from '../../../../../../Entities/column';
import { CustomerUtils } from '../../../../../customer/utils/customer-utils';
import { CustomerStateService } from '../../../../../customer/utils/customer-state.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-list-demands',
  standalone: false,
  templateUrl: './list-demands.component.html',
  styleUrl: './list-demands.component.scss'
})
export class ListDemandsComponent implements OnInit, OnDestroy {

  receivableUtils = inject(ReceivableUtils);
  customerUtils = inject(CustomerUtils);
  customerStateService = inject(CustomerStateService);
  titleService = inject(Title);

  public cols!: Column[];

  private langSubscription!: Subscription;

  public demands!: any[];

  public customer!: string;

  @ViewChild('dt2') dt2!: Table;

  public selectedColumns!: Column[];

  userReceivablePreferences: UserPreference = {};

  tableKey: string = 'Receivables'

  dataKeys = ['idClaim', 'idOrder', 'orderTitle', 'fundingProgram', 'projectSponsor', 'fundingConcentration', 'projectStart', 'projectEnd', 'abrStart', 'abrEnd', 'forNet', 'ofSt', 'zaGross', 'zaReceived', 'zaOffen', 'iwsPercent']

  visibleReceivablesModal = false;

  isReceivablesLoading = false;

  selectedReceivables!: any;

  constructor(private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly commonMessage: CommonMessagesService
  ) { }

  ngOnInit(): void {
    this.loadReceivableColHeaders();
    this.selectedColumns = this.cols;
    this.userReceivablePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadReceivableColHeaders();
      this.reloadComponent(true);
      this.userReceivablePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
    this.route.params.subscribe(params => {
      this.receivableUtils.getAllReceivableByCustomerId(params['id']).subscribe(debts => {
        const customerId = params['id'];
        if (!customerId) {
          this.titleService.setTitle('...');
          return;
        }
        this.customerStateService.currentCustomer$.pipe(take(1)).subscribe(currentCustomer => {
          if (currentCustomer) {
            this.updateTitle();
          }
        })

        this.demands = debts.reduce((acc: any[], curr) => {
          acc.push({
            id: curr.id,
            idClaim: curr.debtNo,
            idOrder: curr.order?.orderNo,
            orderTitle: curr.order?.orderLabel,
            fundingProgram: curr.order?.fundingProgram?.name,
            projectSponsor: curr.promoter?.projectPromoter,
            fundingConcentration: curr.fundinglabel,
            projectStart: curr.project?.startDate,
            projectEnd: curr.project?.endDate,
            abrStart: curr.billingStart,
            abrEnd: curr.billingEnd,
            forNet: curr.netAmount,
            ofSt: curr.grossAmount,
            zaGross: curr.grossAmount,
            zaReceived: curr.payedAmount,
            zaOffen: curr.openAmount,
            iwsPercent: curr.iwsPercent
          })
          return acc
        }, [])
      })
    })
  }

  private updateTitle(): void {
    this.titleService.setTitle(`${this.translate.instant('PAGETITLE.CUSTOMERS.RECEIVABLES')}`);
  }

  openDeleteModal(id: any) {
    this.visibleReceivablesModal = true;
    const receivables = this.demands.find(debts => debts.id == id);
    if (receivables) {
      this.selectedReceivables = receivables;
    }
  }

  onReceivablesDelete() {
    if (this.selectedReceivables) {
      this.isReceivablesLoading = true;
      this.receivableUtils.deleteReceivable(this.selectedReceivables.id).subscribe({
        next: () => {
          this.commonMessage.showDeleteSucessfullMessage();
          this.demands = this.demands.filter(debts => debts.id != this.selectedReceivables.id);
        },
        error: () => {
          this.commonMessage.showErrorDeleteMessage();
        },
        complete: () => {
          this.visibleReceivablesModal = false;
          this.selectedReceivables = undefined;
          this.isReceivablesLoading = false;
        }
      })
    }
  }

  onUserReceivablePreferencesChanges(userReceivablePreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userReceivablePreferences));
  }

  goToReceivableDetails(data: any) {
    this.router.navigate(['receivable-edit', data.idClaim], { relativeTo: this.route })
  }

  loadReceivableColHeaders(): void {
    this.cols = [
      {
        field: 'idClaim',
        routerLink: (row: any) => `./receivable-edit/${row.idClaim}`,
        header: this.translate.instant(_('RECEIVABLES.TABLE.CLAIM_NUMBER'))
      },
      { field: 'idOrder', customClasses: ['align-left'], header: this.translate.instant(_('RECEIVABLES.TABLE.ORDER_NUMBER')) },
      { field: 'orderTitle', header: this.translate.instant(_('RECEIVABLES.TABLE.ORDER_TITLE')) },
      { field: 'fundingProgram', header: this.translate.instant(_('RECEIVABLES.TABLE.FUNDING_PROGRAM')) },
      { field: 'projectSponsor', header: this.translate.instant(_('RECEIVABLES.TABLE.PROJECT_SPONSOR')) },
      { field: 'fundingConcentration', header: this.translate.instant(_('RECEIVABLES.TABLE.FUNDING_CONCENTRATION')) },
      { field: 'projectStart', type: 'date', header: this.translate.instant(_('RECEIVABLES.TABLE.PROJECT_START_DATE')) },
      { field: 'projectEnd', type: 'date', header: this.translate.instant(_('RECEIVABLES.TABLE.PROJECT_END_DATE')) },
      { field: 'abrStart', type: 'date', header: this.translate.instant(_('RECEIVABLES.TABLE.BILLING_START_DATE')) },
      { field: 'abrEnd', type: 'date', header: this.translate.instant(_('RECEIVABLES.TABLE.BILLING_END_DATE')) },
      { field: 'forNet', customClasses: ['align-right'], type: 'double', header: this.translate.instant(_('RECEIVABLES.TABLE.NET_AMOUNT')) },
      { field: 'ofSt', customClasses: ['align-right'], type: 'double', header: this.translate.instant(_('RECEIVABLES.TABLE.GROSS_AMOUNT')) },
      { field: 'zaGross', customClasses: ['align-right'], type: 'double', header: this.translate.instant(_('RECEIVABLES.TABLE.VAT_AMOUNT')) },
      { field: 'zaReceived', customClasses: ['align-right'], type: 'double', header: this.translate.instant(_('RECEIVABLES.TABLE.RECEIVED_AMOUNT')) },
      { field: 'zaOffen', customClasses: ['align-right'], type: 'double', header: this.translate.instant(_('RECEIVABLES.TABLE.OPEN_AMOUNT')) },
      { field: 'iwsPercent', customClasses: ['align-right'], type: 'double', header: this.translate.instant(_('RECEIVABLES.TABLE.IWS_PERCENT')) }
    ];


  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    //skipLocationChange:true means dont update the url to / when navigating
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {
      })
    })
  }

  applyFilter(event: Event, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }

}
