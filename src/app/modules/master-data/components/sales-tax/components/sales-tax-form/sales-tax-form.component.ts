import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';

import { Table } from 'primeng/table';

import { SalesTaxService } from '../../services/sales-tax.service';
import { SalesTax } from '../../../../../../Entities/salesTax';
import { SalesTaxRate } from '../../../../../../Entities/salesTaxRate';
import { SALES_TAX_RATES } from '../../sales.tax.rate.data';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';

@Component({
  selector: 'app-sales-tax-form',
  standalone: false,
  templateUrl: './sales-tax-form.component.html',
  styleUrl: './sales-tax-form.component.scss'
})
export class SalesTaxFormComponent implements OnInit, OnDestroy {

  salesTax!: SalesTax;
  salesTaxRatesValues!: SalesTaxRate[];
  editSalesTaxForm!: FormGroup;
  salesTaxRatesColumns: any[] = [];
  salesTaxId!: number;
  userSalesTaxFormPreferences: UserPreference = {};
  tableKey: string = 'SalesTaxForm'
  dataKeys = ['fromDate', 'rate'];

  private langSalesTaxRateSubscription!: Subscription;

  @ViewChild('dt') dt!: Table;

  constructor( private readonly salesTaxService: SalesTaxService,
               private readonly userPreferenceService: UserPreferenceService, 
               private readonly translate: TranslateService ){ }

  ngOnInit(): void {
    this.editSalesTaxForm = new FormGroup({
      vatlabel: new FormControl('', [Validators.required])
    });
    this.loadSalesTaxRateHeadersAndColumns();
    this.userSalesTaxFormPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.salesTaxRatesColumns);
    this.langSalesTaxRateSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadSalesTaxRateHeadersAndColumns();
      this.userSalesTaxFormPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.salesTaxRatesColumns);
    });
    this.salesTaxId = 1;
    this.salesTaxRatesValues = SALES_TAX_RATES.filter((element: any) => element.salesTaxId === this.salesTaxId);
  }

  onUserSalesTaxFormPreferencesChanges(userSalesTaxFormPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userSalesTaxFormPreferences));
  }

  ngOnDestroy() : void {
    if (this.langSalesTaxRateSubscription) {
      this.langSalesTaxRateSubscription.unsubscribe();
    }
  }


  loadSalesTaxRateHeadersAndColumns() {
    this.salesTaxRatesColumns = this.generateSalesTaxColumns();
  }

  generateSalesTaxColumns() {
    return [
      {
        field: 'fromDate',
        minWidth: 110,
        header: this.translate.instant(_('SALES_TAX.TABLE_SALES_TAX_FORM.FROM_DATE')),
        type: 'date',
        format: 'ddMMYYYY'
      },
      {
        field: 'rate',
        minWidth: 110,
        header: this.translate.instant(_('SALES_TAX.TABLE_SALES_TAX_FORM.SENTENCE'))
      }
    ]
  }

  onSubmit(): void {
    if (this.editSalesTaxForm.valid) {
      console.log(this.editSalesTaxForm);
    }
  }
}