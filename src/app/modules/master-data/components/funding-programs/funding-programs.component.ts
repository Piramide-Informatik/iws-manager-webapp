import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../../../../shared/services/page-title.service';

@Component({
  selector: 'app-funding-programs',
  standalone: false,
  templateUrl: './funding-programs.component.html',
  styleUrl: './funding-programs.component.scss'
})
export class FundingProgramsComponent implements OnInit {
  constructor(private readonly pageTitleService: PageTitleService) { }

  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.MASTER_DATA.FUNDING_PROGRAMS');
  }

}
