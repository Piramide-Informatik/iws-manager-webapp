import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';

import { Table } from 'primeng/table';

import { SALES_TAXES } from '../../sales.tax.data';
import { SALES_TAX_RATES } from '../../sales.tax.rate.data';
import { SalesTaxRate } from '../../../../../../Entities/salesTaxRate';
import { SalesTax } from '../../../../../../Entities/salesTax';

@Component({
  selector: 'app-sales-tax-table',
  standalone: false,
  templateUrl: './sales-tax-table.component.html',
  styleUrl: './sales-tax-table.component.scss'
})
export class SalesTaxTableComponent implements OnInit, OnDestroy {

  salesTaxesValues: any[] = [...SALES_TAXES];
  salesTaxesColumns: any[] = [];
  isSalesTaxesChipVisible = false;
  @ViewChild('dt') dt!: Table;

  private langSalesTaxSubscription!: Subscription;

  constructor(private readonly router: Router, private readonly translate: TranslateService ) { }

  ngOnInit() {
    this.loadSalesTaxHeadersAndColumns();
    this.langSalesTaxSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadSalesTaxHeadersAndColumns();
    });
    const salesTaxesRatesData: SalesTaxRate[] = SALES_TAX_RATES;
    const salesTaxesData: SalesTax[] = SALES_TAXES;
    this.salesTaxesValues = salesTaxesData.map( (sales: SalesTax) => {
        return {
          vatlabel: sales.vatlabel,
          rate: salesTaxesRatesData.filter( (salesTaxRate: SalesTaxRate) => salesTaxRate.salesTaxId === sales.id)
                .reduce((actual: any, current: SalesTaxRate) => {
                    if (actual.fromDate < new Date() && actual.fromDate > current.fromDate) return actual;
                    else if (actual.fromDate < new Date() && actual.fromDate < current.fromDate) return current;
                    return actual;  
                }, {fromDate: new Date('01-01-1900')}).rate
        }
    })
  }

  loadSalesTaxHeadersAndColumns() {
    this.salesTaxesColumns = this.loadColumnSalesTaxHeaders();
  }

  loadColumnSalesTaxHeaders(): any [] {
    return [
      {
        field: 'vatlabel',
        minWidth: 110,
        header: this.translate.instant(_('SALES_TAX.TABLE_SALES_TAX.SALES_TAX'))
      },
      {
        field: 'rate',
        minWidth: 110,
        header: this.translate.instant(_('SALES_TAX.TABLE_SALES_TAX.CURRENT_TAX_RATE'))
      }
    ];
  }

  ngOnDestroy() : void {
    if (this.langSalesTaxSubscription) {
      this.langSalesTaxSubscription.unsubscribe();
    }
  }
}
