import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FrameworkAgreements } from '../../../../Entities/Framework-agreements';
import { FrameworkAgreementsService } from '../../services/framework-agreements.service';
import { Table } from 'primeng/table';
import { TranslateService, _ } from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

interface Column {
  field: string,
  header: string
}

@Component({
  selector: 'app-framework-agreements-summary',
  standalone: false,
  templateUrl: './framework-agreements-summary.component.html',
  styleUrl: './framework-agreements-summary.component.scss'
})
export class FrameworkAgreementsSummaryComponent implements OnInit, OnDestroy {

  public cols!: Column[];
  private langSubscription!: Subscription;
  public frameworkAgreements!: FrameworkAgreements[];
  public customer!: string;
  public selectedColumns!: Column[];
  
  @ViewChild('dt2') dt2!: Table;

  constructor(private readonly FrameworkAgreementsService: FrameworkAgreementsService, private readonly translate: TranslateService, private readonly router: Router) { }

  ngOnInit(): void {
    this.loadColHeaders();
    this.frameworkAgreements = this.FrameworkAgreementsService.list();
    this.customer = 'Joe Doe';
    this.selectedColumns = this.cols;

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
    });
  }

  loadColHeaders(): void {
    this.cols = [
      { field: 'id', header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.CONTRACT_NUMBER')) },
      { field: 'frameworkContract', header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.CONTRACT_LABEL')) },
      { field: 'date', header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.DATE')) },
      { field: 'fundingProgram', header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.FUNDING_PROGRAM')) },
      { field: 'contractStatus', header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.CONTRACT_STATUS')) },
      { field: 'iwsEmployee', header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.IWS_EMPLOYEE')) }
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

  deleteFrameworkAgreement(id: number) {
    this.frameworkAgreements = this.frameworkAgreements.filter(agreement => agreement.id !== id);
  }
}