import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../../../../shared/services/page-title.service';

@Component({
  selector: 'app-billing-methods',
  standalone: false,
  templateUrl: './billing-methods.component.html',
  styleUrl: './billing-methods.component.scss'
})
export class BillingMethodsComponent implements OnInit{
  constructor(private readonly pageTitleService: PageTitleService) { }

  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.MASTER_DATA.BILLING_METHODS');
  }

}
