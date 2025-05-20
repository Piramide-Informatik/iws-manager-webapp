import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { BILLING_METHODS } from './billing-methods.data';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';

@Component({
  selector: 'app-billing-methods-table',
  standalone: false,
  templateUrl: './billing-methods-table.component.html',
  styleUrl: './billing-methods-table.component.scss'
})
export class BillingMethodsTableComponent implements OnInit, OnDestroy {

  billingMethodsValues = [...BILLING_METHODS];
  billingMethodColumns: any[] = [];
  userBillingMethodsPreferences: UserPreference = {};
  tableKey: string = 'BillingMethods'
  dataKeys = ['invoiceType'];

  @ViewChild('dt') dt!: Table;

  private langBillingMethodsSubscription!: Subscription;

  constructor(private readonly router: Router,
              private readonly userPreferenceService: UserPreferenceService, 
              private readonly translate: TranslateService ) { }

  ngOnInit() {
    this.loadBillingMethodsHeadersAndColumns();
    this.userBillingMethodsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.billingMethodColumns);
    this.langBillingMethodsSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadBillingMethodsHeadersAndColumns();
      this.userBillingMethodsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.billingMethodColumns);
    });
  }

  onUserBillingMethodsPreferencesChanges(userBillingMethodsPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userBillingMethodsPreferences));
  }

  loadBillingMethodsHeadersAndColumns() {
    this.billingMethodColumns = this.loadBillingMethodsHeaders();;
  }

  loadBillingMethodsHeaders(): any[] {
    return [
      {
        field: 'invoiceType',
        minWidth: 110,
        header: this.translate.instant(_('BILLING_METHODS.TABLE_BILLING_METHODS.BILLING_TYPE'))
      }
    ];
  }

  ngOnDestroy() : void {
    if (this.langBillingMethodsSubscription) {
      this.langBillingMethodsSubscription.unsubscribe();
    }
  }
}
