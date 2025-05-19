import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TYPES_OF_COMPANIES } from './types-of-companies.data';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';

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
  userPreferences: UserPreference = {};
  tableKey: string = 'TypesOfCompanies'
  dataKeys = ['companyType'];

  @ViewChild('dt') dt!: Table;

  private langTypeOfCompaniesSubscription!: Subscription;

  constructor(private readonly router: Router,
              private readonly userPreferenceService: UserPreferenceService, 
              private readonly translate: TranslateService ) { }

  ngOnInit() {
    this.loadTypeOfCompaniesHeadersAndColumns();
    this.userPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.typeOfCompaniesColumns);
    this.langTypeOfCompaniesSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadTypeOfCompaniesHeadersAndColumns();
      this.userPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.typeOfCompaniesColumns);
    });
  }

  onUserPreferencesChanges(userPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
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
