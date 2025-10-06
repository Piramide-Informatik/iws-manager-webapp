import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../../../../shared/services/page-title.service';

@Component({
  selector: 'app-iws-teams',
  standalone: false,
  templateUrl: './iws-teams.component.html',
  styleUrl: './iws-teams.component.scss'
})
export class IwsTeamsComponent implements OnInit {
  constructor(private readonly pageTitleService: PageTitleService) { }

  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.MASTER_DATA.IWS_TEAMS');
  }

}
