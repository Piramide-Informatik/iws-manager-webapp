import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TYPES_OF_COMPANIES } from './types-of-companies.data';

@Component({
  selector: 'app-types-of-companies-table',
  standalone: false,
  templateUrl: './types-of-companies-table.component.html',
  styleUrl: './types-of-companies-table.component.scss'
})
export class TypesOfCompaniesTableComponent implements OnInit, OnDestroy {

  typeOfCompaniesValues = [...TYPES_OF_COMPANIES];
  typeOfCompaniesColumns: any[] = [];
  isTypeOfCompaniesChipVisible = false;
  @ViewChild('dt') dt!: Table;

  private langTypeOfCompaniesSubscription!: Subscription;

  constructor(private readonly router: Router, private readonly translate: TranslateService ) { }

  ngOnInit() {
    this.loadTypeOfCompaniesHeadersAndColumns();
    this.langTypeOfCompaniesSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadTypeOfCompaniesHeadersAndColumns();
    });
  }

  loadTypeOfCompaniesHeadersAndColumns() {
    this.typeOfCompaniesColumns = this.loadTextHeaders();;
  }

  loadTextHeaders(): any[] {
    return [
      {
        field: 'companyType',
        minWidth: 110,
        header: this.translate.instant(_('TYPE_OF_COMPANIES.TABLE_TYPE_OF_COMPANIES.COMPANY_TYPE'))
      }
    ];
  }

  ngOnDestroy() : void {
    if (this.langTypeOfCompaniesSubscription) {
      this.langTypeOfCompaniesSubscription.unsubscribe();
    }
  }
}
