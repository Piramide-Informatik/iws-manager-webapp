import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../../../../shared/services/page-title.service';

@Component({
  selector: 'app-absence-types',
  standalone: false,
  templateUrl: './absence-types.component.html',
  styleUrl: './absence-types.component.scss'
})
export class AbsenceTypesComponent implements OnInit{

  constructor(private readonly pageTitleService: PageTitleService) {}

  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.MASTER_DATA.ABSENCE_TYPES');
  }

}
