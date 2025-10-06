import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../../../../shared/services/page-title.service';

@Component({
  selector: 'app-states',
  standalone: false,
  templateUrl: './states.component.html',
  styleUrl: './states.component.scss'
})
export class StatesComponent implements OnInit{
   constructor(private readonly pageTitleService: PageTitleService) {}

  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.MASTER_DATA.STATES');
  }
}
