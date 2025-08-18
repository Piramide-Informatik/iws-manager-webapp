import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { Table } from 'primeng/table';
import { TranslateService, _ } from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { ReceivableUtils } from '../../utils/receivable-utils';

interface Column {
  field: string,
  header: string,
  customClasses?: string[],
  routerLink?: (row: any) => string,
  type?: string
}

@Component({
  selector: 'app-list-demands',
  standalone: false,
  templateUrl: './list-demands.component.html',
  styleUrl: './list-demands.component.scss'
})
export class ListDemandsComponent implements OnInit, OnDestroy {

  receivableUtils = inject(ReceivableUtils);

  public cols!: Column[];

  private langSubscription!: Subscription;

  public demands!: any[];

  public customer!: string;

  @ViewChild('dt2') dt2!: Table;

  public selectedColumns!: Column[];

  userReceivablePreferences: UserPreference = {};
  
  tableKey: string = 'Receivables'
  
  dataKeys = ['idClaim', 'idOrder', 'orderTitle', 'fundingProgram', 'projectSponsor', 'fundingConcentration', 'projectStart', 'projectEnd', 'abrStart', 'abrEnd', 'forNet', 'ofSt', 'zaGross', 'zaReceived', 'zaOffen', 'iwsPercent']

  constructor(private readonly translate: TranslateService, 
              private readonly userPreferenceService: UserPreferenceService,
              private readonly router: Router,
              private readonly route: ActivatedRoute) { }

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
        this.demands = debts.reduce((acc: any[], curr) => {
          acc.push({
            idClaim: curr.debtno,
            idOrder: curr.order?.orderno,
            orderTitle: curr.order?.orderLabel,
            fundingProgram: curr.fundingProgram?.name,
            projectSponsor: curr.promoter?.promoter,
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

  deleteDemand(idClaim: any) {
    this.demands = this.demands.filter(demand => demand.idClaim !== idClaim);
  }
}
