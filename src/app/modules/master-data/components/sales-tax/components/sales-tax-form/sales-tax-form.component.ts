import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { Vat } from '../../../../../../Entities/vat';
import { VatRate } from '../../../../../../Entities/vatRate';

@Component({
  selector: 'app-sales-tax-form',
  standalone: false,
  templateUrl: './sales-tax-form.component.html',
  styleUrl: './sales-tax-form.component.scss'
})
export class SalesTaxFormComponent implements OnInit, OnDestroy {

  salesTax!: Vat;
  salesTaxRatesValues!: VatRate[];
  editSalesTaxForm!: FormGroup;
  salesTaxRatesColumns: any[] = [];
  userSalesTaxFormPreferences: UserPreference = {};
  tableKey: string = 'SalesTaxForm'
  dataKeys = ['fromDate', 'rate'];

  private langSalesTaxRateSubscription!: Subscription;

  constructor( private readonly userPreferenceService: UserPreferenceService, 
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
    this.salesTaxRatesValues = [];
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