import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { TranslateService, _ } from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ReceivableService } from '../../services/receivable.service';

interface Column {
  field: string,
  header: string
}

@Component({
  selector: 'app-list-demands',
  standalone: false,
  templateUrl: './list-demands.component.html',
  styleUrl: './list-demands.component.scss'
})
export class ListDemandsComponent implements OnInit, OnDestroy {

  public cols!: Column[];

  private langSubscription!: Subscription;

  public demands!: any[];

  public customer!: string;

  @ViewChild('dt2') dt2!: Table;

  public selectedColumns!: Column[];

  constructor(
    private readonly translate: TranslateService,
    private readonly receivableService: ReceivableService,
    public router: Router
  ){}

  ngOnInit(): void {
    this.loadColHeaders();
    this.selectedColumns = this.cols;

    this.customer = 'Joe Doe'

    this.demands = this.receivableService.list();

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
    });
  }

  loadColHeaders(): void {
    this.cols = [
      { field: 'idClaim', header: this.translate.instant(_('RECEIVABLES.TABLE.CLAIM_NUMBER')) },
      { field: 'idOrder', header: this.translate.instant(_('RECEIVABLES.TABLE.ORDER_NUMBER')) },
      { field: 'orderTitle', header: this.translate.instant(_('RECEIVABLES.TABLE.ORDER_TITLE')) },
      { field: 'fundingProgram', header: this.translate.instant(_('RECEIVABLES.TABLE.FUNDING_PROGRAM')) },
      { field: 'projectSponsor', header: this.translate.instant(_('RECEIVABLES.TABLE.PROJECT_SPONSOR')) },
      { field: 'fundingConcentration', header: this.translate.instant(_('RECEIVABLES.TABLE.FUNDING_CONCENTRATION')) },
      { field: 'projectStart', header: this.translate.instant(_('RECEIVABLES.TABLE.PROJECT_START_DATE')) },
      { field: 'projectEnd', header: this.translate.instant(_('RECEIVABLES.TABLE.PROJECT_END_DATE')) },
      { field: 'projectCost', header: this.translate.instant(_('RECEIVABLES.TABLE.PROJECT_COST')) },
      { field: 'abrStart', header: this.translate.instant(_('RECEIVABLES.TABLE.BILLING_START_DATE')) },
      { field: 'abrEnd', header: this.translate.instant(_('RECEIVABLES.TABLE.BILLING_END_DATE')) },
      { field: 'forNet', header: this.translate.instant(_('RECEIVABLES.TABLE.NET_AMOUNT')) },
      { field: 'ofSt', header: this.translate.instant(_('RECEIVABLES.TABLE.GROSS_AMOUNT')) },
      { field: 'zaGross', header: this.translate.instant(_('RECEIVABLES.TABLE.VAT_AMOUNT')) },
      { field: 'zaReceived', header: this.translate.instant(_('RECEIVABLES.TABLE.RECEIVED_AMOUNT')) },
      { field: 'zaOffen', header: this.translate.instant(_('RECEIVABLES.TABLE.OPEN_AMOUNT')) },
      { field: 'iwsPercent', header: this.translate.instant(_('RECEIVABLES.TABLE.IWS_PERCENT')) }
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
