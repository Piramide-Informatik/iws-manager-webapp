import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../../../../shared/services/page-title.service';

@Component({
  selector: 'app-project-status',
  standalone: false,
  templateUrl: './project-status.component.html',
  styles: ``
})
export class ProjectStatusComponent implements OnInit{
  constructor(private readonly pageTitleService: PageTitleService) { }
  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.MASTER_DATA.PROJECT_STATUS');
  }
}
