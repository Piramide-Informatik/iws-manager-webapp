import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../../../../shared/services/page-title.service';

@Component({
  selector: 'app-iws-commissions',
  standalone: false,
  templateUrl: './iws-commissions.component.html',
  styleUrl: './iws-commissions.component.scss'
})
export class IwsCommissionsComponent implements OnInit {
  constructor(private readonly pageTitleService: PageTitleService) { }
  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.MASTER_DATA.IWS_COMMISSIONS');
  }
}
