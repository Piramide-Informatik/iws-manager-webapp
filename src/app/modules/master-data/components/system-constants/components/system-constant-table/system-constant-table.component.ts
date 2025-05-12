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

  systemConstantsValues = [...SYSTEM_CONSTANT];
  systemConstantsColumns: any[] = [];
  isSystemConstantsChipVisible = false;
  @ViewChild('dt') dt!: Table;

  private langConstantsSubscription!: Subscription;

  constructor(private readonly router: Router, private readonly translate: TranslateService ) { }

  ngOnInit() {
    this.loadHeadersAndColumns();
    this.langConstantsSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadHeadersAndColumns();
    });
  }

  loadHeadersAndColumns() {
    this.systemConstantsColumns = this.loadColumnSystemConstantHeaders();;
  }

  loadColumnSystemConstantHeaders(): any[] {
    return  [
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
    if (this.langConstantsSubscription) {
      this.langConstantsSubscription.unsubscribe();
    }
  }
}
