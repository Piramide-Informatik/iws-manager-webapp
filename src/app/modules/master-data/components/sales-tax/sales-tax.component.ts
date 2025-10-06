import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../../../../shared/services/page-title.service';

@Component({
  selector: 'app-sales-tax',
  standalone: false,
  templateUrl: './sales-tax.component.html',
  styleUrl: './sales-tax.component.scss'
})
export class SalesTaxComponent implements OnInit {
  constructor(private readonly pageTitleService: PageTitleService) { }

  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.MASTER_DATA.SALES_TAX');
  }

  vatEdited: boolean = false;

  vatRateEdited: boolean = false;
}
