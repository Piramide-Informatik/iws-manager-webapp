import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../../../../../../shared/services/page-title.service';

@Component({
  selector: 'app-approval-status-project',
  standalone: false,
  templateUrl: './approval-status-project.component.html',
  styleUrl: './approval-status-project.component.scss'
})
export class ApprovalStatusProjectComponent implements OnInit {

  constructor(private readonly pageTitleService: PageTitleService) {}

  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.MASTER_DATA.APPROVAL_STATUS');
  }

}
