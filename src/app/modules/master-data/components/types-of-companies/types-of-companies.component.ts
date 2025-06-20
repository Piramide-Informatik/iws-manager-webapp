import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../../../../shared/services/page-title.service';

@Component({
  selector: 'app-types-of-companies',
  standalone: false,
  templateUrl: './types-of-companies.component.html',
  styleUrl: './types-of-companies.component.scss'
})
export class TypesOfCompaniesComponent implements OnInit{
  constructor(private readonly pageTitleService: PageTitleService) {}

  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.TYPE_OF_COMPANIES');
  }
}
