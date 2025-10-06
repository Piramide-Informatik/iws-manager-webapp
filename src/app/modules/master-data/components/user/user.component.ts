import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../../../../shared/services/page-title.service';

@Component({
  selector: 'app-user',
  standalone: false,
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent implements OnInit{
  constructor(private readonly pageTitleService: PageTitleService) {}
  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.MASTER_DATA.USER');
  }
}
