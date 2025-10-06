import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../../../../shared/services/page-title.service';

@Component({
  selector: 'app-costs',
  standalone: false,
  templateUrl: './costs.component.html',
  styleUrl: './costs.component.scss'
})
export class CostsComponent implements OnInit {

  constructor(private readonly pageTitleService: PageTitleService) { }

  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.MASTER_DATA.COSTS');
  }
}
