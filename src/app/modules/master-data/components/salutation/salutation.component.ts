import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../../../../shared/services/page-title.service';

@Component({
  selector: 'app-salutation',
  standalone: false,
  templateUrl: './salutation.component.html',
  styles: []
})
export class SalutationComponent implements OnInit{
   constructor(private readonly pageTitleService: PageTitleService) {}

  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.MASTER_DATA.SALUTATION');
  }
}
