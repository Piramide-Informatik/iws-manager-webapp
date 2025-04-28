import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { SYSTEM_CONSTANT } from './system.constants.data';

@Component({
  selector: 'app-system-constant-table',
  standalone: false,
  templateUrl: './system-constant-table.component.html',
  styleUrl: './system-constant-table.component.scss'
})
export class SystemConstantTableComponent implements OnInit, OnDestroy {

  systemConstants = [...SYSTEM_CONSTANT];
  cols: any[] = [];
  selectedColumns: any[] = [];
  paginationMessage = '';
  @ViewChild('dt') dt!: Table;

  private langSubscription!: Subscription;

  constructor(private readonly router: Router, private readonly translate: TranslateService ) { }

  ngOnInit() {
    this.updateHeadersAndColumns();
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateHeadersAndColumns();
    });
  }

  updateHeadersAndColumns() {
    this.loadColumnHeaders();
    this.selectedColumns = [...this.cols];
  }

  loadColumnHeaders(): void {
    this.cols = [
      {
        field: 'constant',
        minWidth: 110,
        header: this.translate.instant(_('SYSTEM_CONSTANT.TABLE_SYSTEM_CONSTANT.CONSTANT'))
      },
      {
        field: 'value',
        minWidth: 110,
        header: this.translate.instant(_('SYSTEM_CONSTANT.TABLE_SYSTEM_CONSTANT.VALUE'))
      }
    ];
  }

  ngOnDestroy() : void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  applyFilter(event: any, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt.filter(inputElement.value, field, 'contains');
    }
  }
}
