import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CONTRACT_STATUS } from './contract-status.data';

@Component({
  selector: 'app-contract-status-table',
  standalone: false,
  templateUrl: './contract-status-table.component.html',
  styleUrl: './contract-status-table.component.scss'
})
export class ContractStatusTableComponent implements OnInit, OnDestroy {

  contractStatusValues = [...CONTRACT_STATUS];
  contractStatusColumns: any[] = [];
  isContractStatusChipsVisible = false;
  @ViewChild('dt') dt!: Table;

  private langContractStatusSubscription!: Subscription;

  constructor(private readonly router: Router, private readonly translate: TranslateService ) { }

  ngOnInit() {
    this.loadContractStatusHeadersAndColumns();
    this.langContractStatusSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadContractStatusHeadersAndColumns();
    });
  }

  loadContractStatusHeadersAndColumns() {
    this.contractStatusColumns = this.loadContractStatusHeaders();;
  }

  loadContractStatusHeaders(): any[] {
    return [
      {
        field: 'contractStatus',
        minWidth: 110,
        header: this.translate.instant(_('CONTRACT_STATUS.TABLE_CONTRACT_STATUS.CONTRACT_STATUS'))
      }
    ];
  }

  ngOnDestroy() : void {
    if (this.langContractStatusSubscription) {
      this.langContractStatusSubscription.unsubscribe();
    }
  }
}
